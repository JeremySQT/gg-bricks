import fs from 'node:fs';
import Ajv2020 from 'ajv/dist/2020.js';
import { abs, paths } from './paths.ts';
import type {
  CheckError,
  ChildContract,
  Contract,
  EnumDecl,
  NumberDecl,
  RecordsDecl,
  ResolvedToken,
  SlotPart,
  TokenMap,
  TokenType
} from './types.ts';

const schema = JSON.parse(fs.readFileSync(abs(paths.schemas, 'component-contract.schema.json'), 'utf8'));
const ajv = new Ajv2020({ allErrors: true, strict: true });
const validateSchema = ajv.compile(schema);
const has = (o: object, k: string): boolean => Object.prototype.hasOwnProperty.call(o, k);
const PARAM = /\{([a-z][a-zA-Z0-9]*)\}/g;

export type Params = Record<string, string>;
export interface Combination {
  params: Params;
  path: string;
}
export type CheckState = 'passed' | 'failed' | 'not-run' | 'not-provided' | 'manual-review-required';
export interface ContractReport {
  valid: boolean;
  checks: {
    schema: CheckState;
    consistency: CheckState;
    tokenCoverage: CheckState;
    dependencies: CheckState;
    intrinsicRules: CheckState;
  };
  errors: CheckError[];
  requiredTokenPaths: string[];
  dependencies: string[];
}

/** Enum parameters used by a token template, in order of first appearance. */
export function templateParameters(template: string): string[] {
  return [...new Set([...template.matchAll(PARAM)].map((m) => m[1]))];
}

/** The role name without its child prefix (`item.surface` → `surface`); roles of the parent have no prefix. */
export const roleName = (role: string): string => role.slice(role.lastIndexOf('.') + 1);
/** The child a role belongs to (`item.surface` → `item`), or null for a role of the parent. */
export const roleChild = (role: string): string | null =>
  role.includes('.') ? role.slice(0, role.indexOf('.')) : null;

/** Enum declarations a template parameter may reference: the child's own props and states first, then the parent's. */
function declarationsFor(contract: Contract, child?: ChildContract): Record<string, { values?: string[] }> {
  return { ...contract.props, ...contract.states, ...(child?.props ?? {}), ...(child?.states ?? {}) } as Record<
    string,
    { values?: string[] }
  >;
}

/** Every role of the contract with its template: the parent's by name, each child's as `child.role`. */
export function allRoles(contract: Contract): { role: string; template: string; child?: ChildContract }[] {
  const list: { role: string; template: string; child?: ChildContract }[] = Object.entries(contract.tokens).map(
    ([role, template]) => ({ role, template })
  );
  for (const [name, child] of Object.entries(contract.children ?? {}))
    for (const [role, template] of Object.entries(child.tokens))
      list.push({ role: `${name}.${role}`, template, child });
  return list;
}

/**
 * Expand every token role into its concrete paths, plus the parameter
 * combinations that produced them. Parameters reference enum props or states (a child's, then the parent's).
 */
export function expandCombinations(contract: Contract): Record<string, Combination[]> {
  const result: Record<string, Combination[]> = {};
  for (const { role, template, child } of allRoles(contract)) {
    const declarations = declarationsFor(contract, child);
    const names = templateParameters(template);
    let combinations: Params[] = [{}];
    for (const name of names) {
      const domain = declarations[name]?.values;
      if (!Array.isArray(domain)) throw Error('Token parameter must reference an enum prop or state: ' + name);
      if (combinations.length * domain.length > 10000)
        throw Error('Token expansion exceeds 10000 paths for role: ' + role);
      combinations = combinations.flatMap((c) => domain.map((value) => ({ ...c, [name]: value })));
    }
    result[role] = combinations.map((params) => ({
      params,
      path: template.replace(PARAM, (_, name: string) => params[name])
    }));
  }
  return result;
}

export function expandTokenPaths(contract: Contract): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(expandCombinations(contract)).map(([role, list]) => [role, list.map((x) => x.path)])
  );
}

/** The template of a role of the parent (`surface`) or of a child (`item.surface`). */
export function templateOf(contract: Contract, role: string): string | undefined {
  const child = roleChild(role);
  return child ? contract.children?.[child]?.tokens[roleName(role)] : contract.tokens[role];
}

/** Substitute concrete parameter values into a role template. */
export function resolveTemplate(contract: Contract, role: string, params: Params): string {
  const template = templateOf(contract, role);
  if (template === undefined) throw Error(`Unknown role ${role}`);
  return template.replace(PARAM, (_, name: string) => {
    if (!has(params, name)) throw Error(`Missing parameter ${name} for role ${role}`);
    return params[name];
  });
}

/**
 * Role naming convention used by generic checks (see authoring/contract-format.md):
 * surface / content / border and roles ending in "Color" are colors;
 * roles starting with "typography" are typography; roles ending in "Opacity" are numbers; everything
 * else is a dimension.
 */
export function expectedRoleType(fullRole: string): TokenType {
  const role = roleName(fullRole);
  if (['surface', 'content', 'border'].includes(role) || /Color$/.test(role)) return 'color';
  if (/^typography/.test(role)) return 'typography';
  if (/^(motion|duration)/.test(role)) return 'duration';
  if (/^easing/.test(role)) return 'cubicBezier';
  if (/^shadow/.test(role)) return 'shadow';
  if (/Opacity$/.test(role)) return 'number';
  if (/^(layer|zIndex)$|Layer$/.test(role)) return 'number'; // stacking roles bound to layer.* tokens
  return 'dimension';
}

export function checkContract(
  contract: Contract,
  { tokens, components }: { tokens?: TokenMap; components?: string[] } = {}
): ContractReport {
  const errors: CheckError[] = [];
  const checks: ContractReport['checks'] = {
    schema: 'passed',
    consistency: 'not-run',
    tokenCoverage: tokens ? 'not-run' : 'not-provided',
    dependencies: components ? 'not-run' : 'not-provided',
    intrinsicRules: 'manual-review-required'
  };
  if (!validateSchema(contract)) {
    checks.schema = 'failed';
    return {
      valid: false,
      checks,
      errors: (validateSchema.errors ?? []).map((e) => ({
        code: 'schema',
        path: e.instancePath,
        message: e.message ?? 'schema violation',
        details: e.params
      })),
      requiredTokenPaths: [],
      dependencies: []
    };
  }
  const checkFragment = (fragment: Contract | ChildContract, prefix: string) => {
    for (const group of ['props', 'states'] as const) {
      for (const [name, decl] of Object.entries(fragment[group])) {
        const at = prefix + group + '.' + name;
        const e = decl as EnumDecl;
        if (Array.isArray(e.values) && !e.values.includes(e.default))
          errors.push({ code: 'default', path: at, message: 'Default is not an allowed value.' });
        if ('required' in decl && decl.required === true && has(decl, 'default'))
          errors.push({
            code: 'required-default',
            path: at,
            message: 'Required inputs cannot also have a fallback default in this format.'
          });
        if ('type' in decl && decl.type === 'number') {
          const n = decl as NumberDecl;
          if (
            (n.min !== undefined && n.default < n.min) ||
            (n.max !== undefined && n.default > n.max) ||
            (n.min !== undefined && n.max !== undefined && n.min > n.max)
          )
            errors.push({
              code: 'number-range',
              path: at,
              message: 'Number default must lie within min and max, and min must not exceed max.'
            });
        }
        if ('type' in decl && decl.type === 'records') {
          const r = decl as RecordsDecl;
          for (const field of r.required ?? [])
            if (!has(r.fields, field))
              errors.push({ code: 'records-field', path: at, message: `Required field ${field} is not declared.` });
          r.default.forEach((record, i) => {
            for (const [field, value] of Object.entries(record))
              if (!has(r.fields, field) || typeof value !== r.fields[field])
                errors.push({
                  code: 'records-default',
                  path: `${at}.default[${i}].${field}`,
                  message: 'Default records carry declared fields with their declared types only.'
                });
            for (const field of r.required ?? [])
              if (!has(record, field))
                errors.push({
                  code: 'records-default',
                  path: `${at}.default[${i}]`,
                  message: `Default record lacks the required field ${field}.`
                });
          });
        }
        if (group === 'states' && (decl as EnumDecl).bindable)
          errors.push({ code: 'state-bindable', path: at, message: 'Only props can be bindable.' });
      }
    }
    for (const name of Object.keys(fragment.props))
      if (has(fragment.states, name))
        errors.push({ code: 'ambiguous-name', path: prefix + name, message: 'Prop and state names must be distinct.' });
    for (const [name, part] of Object.entries(fragment.parts ?? {})) {
      const slot = part as SlotPart;
      if (slot.min !== undefined && slot.max !== undefined && slot.min > slot.max)
        errors.push({ code: 'part-cardinality', path: prefix + 'parts.' + name, message: 'min must not exceed max.' });
    }
    for (const [role, ref] of Object.entries(fragment.tokens))
      if (ref.startsWith('primitive.'))
        errors.push({
          code: 'primitive-binding',
          path: prefix + 'tokens.' + role,
          message: 'Bind a semantic or component token, not a primitive.'
        });
  };
  checkFragment(contract, '');
  const childNames = Object.keys(contract.children ?? {});
  for (const name of childNames) {
    checkFragment(contract.children![name], `children.${name}.`);
    if (has(contract.props, name) || has(contract.states, name))
      errors.push({
        code: 'ambiguous-name',
        path: `children.${name}`,
        message: 'A child name must not be a prop or state name.'
      });
  }
  let expanded: Record<string, string[]> = {};
  if (!errors.length) {
    try {
      expanded = expandTokenPaths(contract);
    } catch (e) {
      errors.push({ code: 'token-parameter', message: (e as Error).message });
    }
  }
  // Explicit contrast pairs: roles must exist and be colors; a surface may be a color token path instead.
  for (const [i, pair] of (contract.contrast ?? []).entries()) {
    const at = `contrast[${i}]`;
    if (templateOf(contract, pair.content) === undefined)
      errors.push({ code: 'contrast-role', path: at, message: `Unknown content role ${pair.content}.` });
    else if (expectedRoleType(pair.content) !== 'color')
      errors.push({ code: 'contrast-role', path: at, message: `Content role ${pair.content} is not a color role.` });
    const surfaceIsToken = pair.surface.startsWith('color.');
    if (!surfaceIsToken && templateOf(contract, pair.surface) === undefined)
      errors.push({ code: 'contrast-role', path: at, message: `Unknown surface role ${pair.surface}.` });
    else if (!surfaceIsToken && expectedRoleType(pair.surface) !== 'color')
      errors.push({ code: 'contrast-role', path: at, message: `Surface role ${pair.surface} is not a color role.` });
    if (!surfaceIsToken && templateOf(contract, pair.content) && templateOf(contract, pair.surface)) {
      const extra = templateParameters(templateOf(contract, pair.surface)!).filter(
        (n) => !templateParameters(templateOf(contract, pair.content)!).includes(n)
      );
      if (extra.length)
        errors.push({
          code: 'contrast-parameters',
          path: at,
          message: `The surface role varies by ${extra.join(', ')}, which the content role does not: pair them per value.`
        });
    }
  }
  checks.consistency = errors.length ? 'failed' : 'passed';
  const paths = [...new Set(Object.values(expanded).flat())];
  if (checks.consistency === 'passed' && tokens) {
    if (typeof tokens !== 'object' || Array.isArray(tokens) || tokens === null)
      errors.push({ code: 'token-input', message: 'Expected a flat resolved token map.' });
    else {
      const valid = (t: ResolvedToken | undefined): t is ResolvedToken => !!t && has(t, '$type') && has(t, '$value');
      for (const p of paths)
        if (!valid(tokens[p]))
          errors.push({ code: 'missing-token', path: p, message: 'Missing resolved token with $type and $value.' });
      for (const [role, list] of Object.entries(expanded))
        for (const p of list) {
          const t = tokens[p];
          if (valid(t) && t.$type !== expectedRoleType(role))
            errors.push({
              code: 'role-type',
              path: p,
              message: `Role ${role} expects ${expectedRoleType(role)}, token is ${t.$type}.`
            });
        }
    }
    checks.tokenCoverage = errors.some((e) => ['missing-token', 'token-input', 'role-type'].includes(e.code))
      ? 'failed'
      : 'passed';
  }
  // Accepted content: component ids, minus the contract's own children (internal parts, not dependencies).
  const slots = [
    ...Object.values(contract.parts),
    ...Object.values(contract.children ?? {}).flatMap((child) => Object.values(child.parts ?? {}))
  ];
  const dependencies = [
    ...new Set(slots.flatMap((part) => (part as SlotPart).accepts ?? []).filter((id) => !childNames.includes(id)))
  ];
  if (components) {
    if (!Array.isArray(components) || components.some((id) => typeof id !== 'string'))
      errors.push({ code: 'catalog-input', message: 'Expected an array of available component IDs.' });
    else
      for (const id of dependencies)
        if (!components.includes(id))
          errors.push({
            code: 'missing-component',
            path: id,
            message: 'Accepted content component is not in the supplied catalog.'
          });
    checks.dependencies = errors.some((e) => ['missing-component', 'catalog-input'].includes(e.code))
      ? 'failed'
      : 'passed';
  }
  return { valid: errors.length === 0, checks, errors, requiredTokenPaths: paths, dependencies };
}
