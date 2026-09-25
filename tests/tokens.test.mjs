import {test} from 'node:test';
import assert from 'node:assert/strict';
import {resolveAliases,resolveSources,sources} from '../tooling/lib/tokens.mjs';
test('rejects missing, cyclic and differently typed aliases',()=>{
 assert.throws(()=>resolveAliases({a:{$type:'color',$value:'{missing}'}}),/Missing token/);
 assert.throws(()=>resolveAliases({a:{$type:'color',$value:'{b}'},b:{$type:'color',$value:'{a}'}}),/Circular alias/);
 assert.throws(()=>resolveAliases({a:{$type:'color',$value:'{b}'},b:{$type:'dimension',$value:{value:2,unit:'px'}}}),/type mismatch/);
});
test('sparse brand inherits complete colors while overriding radius',()=>{
 const base=resolveSources(sources('base','dark','compact')).tokens;
 const brand=resolveSources(sources('brand-a','dark','compact')).tokens;
 assert.equal(brand['radius.control'].$value.value,8);
 assert.deepEqual(brand['color.action.danger.ghost.pressed.content'],base['color.action.danger.ghost.pressed.content']);
});
test('density affects spacing without altering typography, icons or target',()=>{
 const a=resolveSources(sources('brand-b','light','compact')).tokens,b=resolveSources(sources('brand-b','light','comfortable')).tokens;
 assert.notDeepEqual(a['size.control.md'],b['size.control.md']);
 for(const p of ['size.target.min','size.icon.md','typography.label.md'])assert.deepEqual(a[p],b[p]);
});
test('loading aliases default and remains independent of disabled values',()=>{
 const t=resolveSources(sources('brand-b','dark','standard')).tokens;
 assert.deepEqual(t['color.action.accent.solid.loading.content'].$value,t['color.action.accent.solid.default.content'].$value);
 assert.notDeepEqual(t['color.action.accent.solid.disabled.content'].$value,t['color.action.accent.solid.default.content'].$value);
});
test('unknown configuration fails before reading overlays',()=>{
 assert.throws(()=>sources('typo-brand','light','standard'),/Unknown configuration/);
});
