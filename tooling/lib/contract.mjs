import fs from 'node:fs';
import Ajv2020 from 'ajv/dist/2020.js';
import { abs, paths } from './paths.mjs';

const schema = JSON.parse(fs.readFileSync(abs(paths.schemas, 'component-contract.schema.json'), 'utf8'));
const ajv = new Ajv2020({ allErrors: true, strict: true });
const validateSchema = ajv.compile(schema);
const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const PARAM = /\{([a-z][a-zA-Z0-9]*)\}/g;

/** Enum parameters used by a token template, in order of first appearance. */
export function templateParameters(template) {
  return [...new Set([...template.matchAll(PARAM)].map((m) => m[1]))];
}

/**
 * Expand every token role into its concrete paths, plus the parameter
 * combinations that produced them. Parameters reference enum props or states.
 */
export function expandCombinations(contract) {
  const declarations = { ...contract.props, ...contract.states };
  const result = {};
  for (const [role, template] of Object.entries(contract.tokens)) {
    const names = templateParameters(template);
    let combinations = [{}];
    for (const name of names) {
      const domain = declarations[name]?.values;
      if (!Array.isArray(domain)) throw Error('Token parameter must reference an enum prop or state: ' + name);
      if (combinations.length * domain.length > 10000) throw Error('Token expansion exceeds 10000 paths for role: ' + role);
      combinations = combinations.flatMap((c) => domain.map((value) => ({ ...c, [name]: value })));
    }
    result[role] = combinations.map((params) => ({ params, path: template.replace(PARAM, (_, name) => params[name]) }));
  }
  return result;
}

export function expandTokenPaths(contract) {
  return Object.fromEntries(Object.entries(expandCombinations(contract)).map(([role, list]) => [role, list.map((x) => x.path)]));
}

/** Substitute concrete parameter values into a role template. */
export function resolveTemplate(contract, role, params) {
  return contract.tokens[role].replace(PARAM, (_, name) => {
    if (!has(params, name)) throw Error(`Missing parameter ${name} for role ${role}`);
    return params[name];
  });
}

/**
 * Role naming convention used by generic checks (see authoring/contract-format.md):
 * surface / content / border and roles ending in "Color" are colors;
 * roles starting with "typography" are typography; everything else is a dimension.
 */
export function expectedRoleType(role) {
  if (['surface', 'content', 'border'].includes(role) || /Color$/.test(role)) return 'color';
  if (/^typography/.test(role)) return 'typography';
  if (/^(motion|duration)/.test(role)) return 'duration';
  if (/^easing/.test(role)) return 'cubicBezier';
  if (/^shadow/.test(role)) return 'shadow';
  return 'dimension';
}

export function checkContract(contract, { tokens, components } = {}) {
  const errors = [];
  const checks = {
    schema: 'passed',
    consistency: 'not-run',
    tokenCoverage: tokens ? 'not-run' : 'not-provided',
    dependencies: components ? 'not-run' : 'not-provided',
    intrinsicRules: 'manual-review-required'
  };
  if (!validateSchema(contract)) {
    checks.schema = 'failed';
    return { valid: false, checks, errors: validateSchema.errors.map((e) => ({ code: 'schema', path: e.instancePath, message: e.message, details: e.params })) };
  }
  for (const group of ['props', 'states']) {
    for (const [name, decl] of Object.entries(contract[group])) {
      if (decl.values && !decl.values.includes(decl.default))
        errors.push({ code: 'default', path: group + '.' + name, message: 'Default is not an allowed value.' });
      if (decl.required === true && has(decl, 'default'))
        errors.push({ code: 'required-default', path: group + '.' + name, message: 'Required inputs cannot also have a fallback default in this format.' });
    }
  }
  for (const name of Object.keys(contract.props))
    if (has(contract.states, name)) errors.push({ code: 'ambiguous-name', path: name, message: 'Prop and state names must be distinct.' });
  for (const [role, ref] of Object.entries(contract.tokens))
    if (ref.startsWith('primitive.')) errors.push({ code: 'primitive-binding', path: 'tokens.' + role, message: 'Bind a semantic or component token, not a primitive.' });
  let expanded = {};
  if (!errors.length) {
    try { expanded = expandTokenPaths(contract); }
    catch (e) { errors.push({ code: 'token-parameter', message: e.message }); }
  }
  checks.consistency = errors.length ? 'failed' : 'passed';
  const paths = [...new Set(Object.values(expanded).flat())];
  if (checks.consistency === 'passed' && tokens) {
    if (typeof tokens !== 'object' || Array.isArray(tokens) || tokens === null)
      errors.push({ code: 'token-input', message: 'Expected a flat resolved token map.' });
    else {
      for (const p of paths)
        if (!has(tokens, p) || !tokens[p] || !has(tokens[p], '$type') || !has(tokens[p], '$value'))
          errors.push({ code: 'missing-token', path: p, message: 'Missing resolved token with $type and $value.' });
      for (const [role, list] of Object.entries(expanded))
        for (const p of list)
          if (tokens[p] && has(tokens[p], '$type') && tokens[p].$type !== expectedRoleType(role))
            errors.push({ code: 'role-type', path: p, message: `Role ${role} expects ${expectedRoleType(role)}, token is ${tokens[p].$type}.` });
    }
    checks.tokenCoverage = errors.some((e) => ['missing-token', 'token-input', 'role-type'].includes(e.code)) ? 'failed' : 'passed';
  }
  const dependencies = [...new Set(Object.values(contract.parts).flatMap((part) => part.accepts ?? []))];
  if (components) {
    if (!Array.isArray(components) || components.some((id) => typeof id !== 'string'))
      errors.push({ code: 'catalog-input', message: 'Expected an array of available component IDs.' });
    else for (const id of dependencies)
      if (!components.includes(id)) errors.push({ code: 'missing-component', path: id, message: 'Accepted content component is not in the supplied catalog.' });
    checks.dependencies = errors.some((e) => ['missing-component', 'catalog-input'].includes(e.code)) ? 'failed' : 'passed';
  }
  return { valid: errors.length === 0, checks, errors, requiredTokenPaths: paths, dependencies };
}
