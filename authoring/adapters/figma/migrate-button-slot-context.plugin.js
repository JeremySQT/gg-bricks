await figma.setCurrentPageAsync(await figma.getNodeByIdAsync('2:7'));figma.skipInvisibleInstanceChildren=false;
await Promise.all(['Regular','Medium','Semi Bold'].map(style=>figma.loadFontAsync({family:'Inter',style})));
const cols=await figma.variables.getLocalVariableCollectionsAsync();
const style=cols.find(c=>c.name==='_Button content/Style'),state=cols.find(c=>c.name==='_Button content/State');
const v=(await figma.variables.getLocalVariablesAsync()).find(v=>v.name==='_adapter/button/content');
const ids=[],sets=['8:156','10:166','10:313','10:460','10:607','10:754','10:901','10:1048','10:1195'];
for(const id of sets){
 const set=await figma.getNodeByIdAsync(id),skin=set.name.replace('.Button/','');
 for(const c of set.children){
  const st=c.variantProperties.state.replace('disabled-loading','disabled');
  c.setExplicitVariableModeForCollection(style,style.modes.find(m=>m.name===skin).modeId);
  c.setExplicitVariableModeForCollection(state,state.modes.find(m=>m.name===st).modeId);ids.push(c.id);
  for(const n of c.findAll(n=>n.type==='INSTANCE'&&['leading','trailing'].includes(n.name))){
   for(const child of n.children){
    if(child.type==='TEXT'){child.fills=[figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:1,g:1,b:1}},'color',v)];ids.push(child.id);}
    if(child.type==='VECTOR'){child.strokes=[figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:1,g:1,b:1}},'color',v)];ids.push(child.id);}
   }
  }
 }
}
return {mutatedNodeIds:ids,bindings:ids.length};
