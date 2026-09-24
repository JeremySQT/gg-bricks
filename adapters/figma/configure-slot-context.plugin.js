await figma.setCurrentPageAsync(await figma.getNodeByIdAsync('2:8'));
figma.skipInvisibleInstanceChildren=false;
const vars=await figma.variables.getLocalVariablesAsync();const cols=await figma.variables.getLocalVariableCollectionsAsync();
const paths=Object.fromEntries(vars.map(v=>[v.name,v]));
function collection(name,modes){
 let c=cols.find(c=>c.name===name);
 if(!c){c=figma.variables.createVariableCollection(name);c.renameMode(c.defaultModeId,modes[0]);for(const name of modes.slice(1))c.addMode(name);cols.push(c);}
 return c;
}
const skins=['accent','neutral','danger'].flatMap(i=>['solid','outline','ghost'].map(a=>i+'/'+a));
const states=['default','hover','pressed','loading','disabled'];
const skin=collection('_Button content/Style',skins),state=collection('_Button content/State',states);
function variable(name,col){
 let v=vars.find(v=>v.name===name&&v.variableCollectionId===col.id);
 if(!v){v=figma.variables.createVariable(name,col,'COLOR');vars.push(v);}
 v.scopes=['TEXT_FILL','SHAPE_FILL','STROKE_COLOR'];v.hiddenFromPublishing=true;v.setVariableCodeSyntax('WEB','currentColor');
 v.description='Generated Figma adapter alias. Resolves existing Button content tokens; not an additional source token.';
 return v;
}
const bySkin={};
for(const s of skins){const v=variable('_adapter/button/content/'+s,state);bySkin[s]=v;for(const m of state.modes){const p='color/action/'+s+'/'+m.name+'/content';if(!paths[p])throw Error(p);v.setValueForMode(m.modeId,figma.variables.createVariableAlias(paths[p]));}}
const content=variable('_adapter/button/content',skin);
for(const m of skin.modes)content.setValueForMode(m.modeId,figma.variables.createVariableAlias(bySkin[m.name]));
const ids=[];for(const id of ['20:2','7:9','7:11']){
 const c=await figma.getNodeByIdAsync(id);
 for(const n of c.children){
 if(n.type==='TEXT'){for(const s of n.getStyledTextSegments(['fontName']))await figma.loadFontAsync(s.fontName);n.fills=[figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:1,g:1,b:1}},'color',content)];ids.push(n.id);}
 if(n.type==='VECTOR'){n.strokes=[figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:1,g:1,b:1}},'color',content)];ids.push(n.id);}
 }
}
return {mutatedNodeIds:ids,collections:[skin,state].map(c=>({id:c.id,name:c.name,modes:c.modes})),variables:[content,...Object.values(bySkin)].map(v=>({id:v.id,name:v.name}))};
