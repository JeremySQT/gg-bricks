import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';

const schema = JSON.parse(fs.readFileSync(new URL('../schemas/component-contract.schema.json', import.meta.url), 'utf8'));
const ajv = new Ajv2020({allErrors: true, strict: true});
const validateSchema = ajv.compile(schema);
const has = (o,k) => Object.prototype.hasOwnProperty.call(o,k);

export function expandTokenPaths(contract) {
  const declarations = {...contract.props, ...contract.states};
  const result = {};
  for (const [role, template] of Object.entries(contract.tokens)) {
    const names = [...new Set([...template.matchAll(/\{([a-z][a-zA-Z0-9]*)\}/g)].map(m => m[1]))];
    let combinations = [{}];
    for (const name of names) {
      const domain = declarations[name]?.values;
      if (!Array.isArray(domain)) throw Error('Token parameter must reference an enum prop or state: ' + name);
      if (combinations.length * domain.length > 10000) throw Error('Token expansion exceeds 10000 paths for role: ' + role);
      combinations = combinations.flatMap(c => domain.map(value => ({...c, [name]: value})));
    }
    result[role] = combinations.map(c => template.replace(/\{([a-z][a-zA-Z0-9]*)\}/g, (_,name) => c[name]));
  }
  return result;
}

export function checkContract(contract, {tokens, components} = {}) {
  const errors = [];
  const checks = {schema:'passed', consistency:'not-run', tokenCoverage:tokens ? 'not-run' : 'not-provided', dependencies:components ? 'not-run' : 'not-provided', intrinsicRules:'manual-review-required'};
  if (!validateSchema(contract)) {
    checks.schema = 'failed';
    return {valid:false, checks, errors:validateSchema.errors.map(e => ({code:'schema', path:e.instancePath, message:e.message, details:e.params}))};
  }
  for (const group of ['props','states']) {
    for (const [name, decl] of Object.entries(contract[group])) {
      if (decl.values && !decl.values.includes(decl.default))
        errors.push({code:'default', path:group+'.'+name, message:'Default is not an allowed value.'});
      if (decl.required === true && has(decl,'default'))
        errors.push({code:'required-default', path:group+'.'+name, message:'Required inputs cannot also have a fallback default in this format.'});
    }
  }
  for (const name of Object.keys(contract.props))
    if (has(contract.states,name)) errors.push({code:'ambiguous-name',path:name,message:'Prop and state names must be distinct.'});
  for (const [role,ref] of Object.entries(contract.tokens))
    if (ref.startsWith('primitive.')) errors.push({code:'primitive-binding',path:'tokens.'+role,message:'Bind a semantic or component token, not a primitive.'});
  let expanded = {};
  if (!errors.length) {
    try {expanded = expandTokenPaths(contract);}
    catch(e) {errors.push({code:'token-parameter',message:e.message});}
  }
  checks.consistency = errors.length ? 'failed' : 'passed';
  const paths = [...new Set(Object.values(expanded).flat())];
  if (checks.consistency === 'passed' && tokens) {
    if (typeof tokens !== 'object' || Array.isArray(tokens) || tokens === null)
      errors.push({code:'token-input',message:'Expected a flat resolved token map.'});
    else for (const p of paths)
      if (!has(tokens,p) || !tokens[p] || !has(tokens[p],'$type') || !has(tokens[p],'$value'))
        errors.push({code:'missing-token',path:p,message:'Missing resolved token with $type and $value.'});
    checks.tokenCoverage = errors.some(e => ['missing-token','token-input'].includes(e.code)) ? 'failed' : 'passed';
  }
  const dependencies = [...new Set(Object.values(contract.parts).flatMap(part => part.accepts ?? []))];
  if (components) {
    if (!Array.isArray(components) || components.some(id => typeof id !== 'string'))
      errors.push({code:'catalog-input',message:'Expected an array of available component IDs.'});
    else for (const id of dependencies)
      if (!components.includes(id)) errors.push({code:'missing-component',path:id,message:'Accepted content component is not in the supplied catalog.'});
    checks.dependencies = errors.some(e => ['missing-component','catalog-input'].includes(e.code)) ? 'failed' : 'passed';
  }
  return {valid:errors.length===0, checks, errors, requiredTokenPaths:paths, dependencies};
}

export function runCli(args) {
  const [file,...rest] = args;
  if (!file || rest.length % 2) throw Error('Usage: node tools/validate-contract.mjs CONTRACT [--tokens RESOLVED_JSON] [--components ID_ARRAY_JSON]');
  const options={};
  for(let i=0;i<rest.length;i+=2){
    const flag=rest[i];
    if (!['--tokens','--components'].includes(flag)) throw Error('Unknown option: '+flag);
    const key=flag.slice(2);
    if(has(options,key))throw Error('Duplicate option: '+flag);
    options[key]=JSON.parse(fs.readFileSync(rest[i+1],'utf8'));
  }
  const report=checkContract(JSON.parse(fs.readFileSync(file,'utf8')),options);
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
  return report.valid ? 0 : 1;
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {process.exitCode=runCli(process.argv.slice(2));}
  catch(e){console.error(e.message);process.exitCode=1;}
}
