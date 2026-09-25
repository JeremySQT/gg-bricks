import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {checkContract,expandTokenPaths,expandCombinations,expectedRoleType} from '../tooling/lib/contract.mjs';
const source=JSON.parse(fs.readFileSync(new URL('./fixtures/button.contract.json',import.meta.url),'utf8'));
const copy=()=>structuredClone(source);
test('candidate validates without claiming token or rule coverage',()=>{
  const c=copy(),before=JSON.stringify(c),r=checkContract(c);
  assert.equal(r.valid,true);assert.equal(r.checks.tokenCoverage,'not-provided');
  assert.equal(r.checks.intrinsicRules,'manual-review-required');assert.equal(JSON.stringify(c),before);
});
test('rejects misspelled fields and wrong boolean defaults',()=>{
  const c=copy();c.props.disabled.default='false';c.parts.trailing.maximum=2;
  assert.equal(checkContract(c).checks.schema,'failed');
});
test('rejects defaults outside enum values and contradictory required defaults',()=>{
  const c=copy();c.props.intent.default='primary';
  assert.ok(checkContract(c).errors.some(e=>e.code==='default'));
  const d=copy();d.props.label.default='Button';
  assert.ok(checkContract(d).errors.some(e=>e.code==='required-default'));
});
test('rejects ambiguous, unknown and non-enum token parameters',()=>{
  const c=copy();c.states.size=c.props.size;
  assert.ok(checkContract(c).errors.some(e=>e.code==='ambiguous-name'));
  for(const parameter of ['unknown','label','loading']){
    const d=copy();d.tokens.content='color.{'+parameter+'}.content';
    assert.ok(checkContract(d).errors.some(e=>e.code==='token-parameter'));
  }
});
test('expands enum products and repeats a parameter consistently',()=>{
  const c=copy();const e=expandTokenPaths(c);
  assert.equal(e.surface.length,45);
  assert.ok(e.surface.includes('color.action.danger.outline.disabled.surface'));
  c.tokens.repeat='color.{intent}.{intent}';
  assert.deepEqual(expandTokenPaths(c).repeat,['color.accent.accent','color.neutral.neutral','color.danger.danger']);
});
test('requires every expanded path when an inventory is supplied',()=>{
  const r=checkContract(source,{tokens:{}});
  assert.equal(r.valid,false);assert.equal(r.checks.tokenCoverage,'failed');
  // Synthetic presence fixture, not production token validation.
  const tokens={};
  for(const [role,list] of Object.entries(expandCombinations(source)))for(const {path} of list)tokens[path]={$type:expectedRoleType(role),$value:0};
  assert.equal(checkContract(source,{tokens}).checks.tokenCoverage,'passed');
  delete tokens['color.action.neutral.ghost.loading.content'];
  assert.ok(checkContract(source,{tokens}).errors.some(e=>e.path==='color.action.neutral.ghost.loading.content'));
  tokens['color.action.neutral.ghost.loading.content']={$type:'dimension',$value:0};
  assert.ok(checkContract(source,{tokens}).errors.some(e=>e.code==='role-type'));
});
test('rejects invalid slot cardinality and missing accepted components',()=>{
  const c=copy();c.parts.trailing.max=0;
  assert.equal(checkContract(c).checks.schema,'failed');
  const r=checkContract(source,{components:['icon','counter']});
  assert.ok(r.errors.some(e=>e.code==='missing-component'&&e.path==='shortcut'));
});
test('rejects primitive bindings and malformed token templates',()=>{
  const c=copy();c.tokens.radius='primitive.radius.soft';
  assert.ok(checkContract(c).errors.some(e=>e.code==='primitive-binding'));
  const d=copy();d.tokens.radius='radius.{size';
  assert.equal(checkContract(d).checks.schema,'failed');
});
