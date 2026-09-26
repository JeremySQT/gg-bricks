import fs from 'node:fs';
import Ajv2020 from 'ajv/dist/2020.js';
import { abs, paths } from './paths.ts';
import type {
  CheckError,
  Contract,
  EnumDecl,
  NumberDecl,
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

/**
 * Expand every token role into its concrete paths, plus the parameter
 * combinations that produced them. Parameters reference enum props or states.
 */
export function expandCombinations(contract: Contract): Record<string, Combination[]> {
  const declarations: Record<string, { values?: string[] }> = { ...contract.props, ...contract.states } as Record<
    string,
    { values?: string[] }
  >;
  const result: Record<string, Combination[]> = {};
  for (const [role, template] of Object.entries(contract.tokens)) {
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

/** Substitute concrete parameter values into a role template. */
export function resolveTemplate(contract: Contract, role: string, params: Params): string {
  return contract.tokens[role].replace(PARAM, (_, name: string) => {
    if (!has(params, name)) throw Error(`Missing parameter ${name} for role ${role}`);
    return params[name];
  });
}

/**
 * Role naming convention used by generic checks (see authoring/contract-format.md):
 * surface / content / border and roles ending in "Color" are colors;
 * roles starting with "typography" are typography; everything else is a dimension.
 */
export function expectedRoleType(role: string): TokenType {
  if (['surface', 'content', 'border'].includes(role) || /Color$/.test(role)) return 'color';
  if (/^typography/.test(role)) return 'typography';
  if (/^(motion|duration)/.test(role)) return 'duration';
  if (/^easing/.test(role)) return 'cubicBezier';
  if (/^shadow/.test(role)) return 'shadow';
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
  for (const group of ['props', 'states'] as const) {
    for (const [name, decl] of Object.entries(contract[group])) {
      const e = decl as EnumDecl;
      if (Array.isArray(e.values) && !e.values.includes(e.default))
        errors.push({ code: 'default', path: group + '.' + name, message: 'Default is not an allowed value.' });
      if ('required' in decl && decl.required === true && has(decl, 'default'))
        errors.push({
          code: 'required-default',
          path: group + '.' + name,
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
            path: group + '.' + name,
            message: 'Number default must lie within min and max, and min must not exceed max.'
          });
      }
      if (group === 'states' && (decl as EnumDecl).bindable)
        errors.push({ code: 'state-bindable', path: group + '.' + name, message: 'Only props can be bindable.' });
    }
  }
  for (const name of Object.keys(contract.props))
    if (has(contract.states, name))
      errors.push({ code: 'ambiguous-name', path: name, message: 'Prop and state names must be distinct.' });
  for (const [name, part] of Object.entries(contract.parts)) {
    const slot = part as SlotPart;
    if (slot.min !== undefined && slot.max !== undefined && slot.min > slot.max)
      errors.push({ code: 'part-cardinality', path: 'parts.' + name, message: 'min must not exceed max.' });
  }
  for (const [role, ref] of Object.entries(contract.tokens))
    if (ref.startsWith('primitive.'))
      errors.push({
        code: 'primitive-binding',
        path: 'tokens.' + role,
        message: 'Bind a semantic or component token, not a primitive.'
      });
  let expanded: Record<string, string[]> = {};
  if (!errors.length) {
    try {
      expanded = expandTokenPaths(contract);
    } catch (e) {
      errors.push({ code: 'token-parameter', message: (e as Error).message });
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
  const dependencies = [...new Set(Object.values(contract.parts).flatMap((part) => (part as SlotPart).accepts ?? []))];
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
