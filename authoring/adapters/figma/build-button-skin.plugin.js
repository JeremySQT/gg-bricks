// Requires helpers.plugin.js and {intent, appearance, index, fixtures} input.
await figma.setCurrentPageAsync(await figma.getNodeByIdAsync('2:7'));
const setName='.Button/'+intent+'/'+appearance;
if(figma.currentPage.children.some(n=>n.name===setName))throw Error('Already exists: '+setName);
const icon=await figma.getNodeByIdAsync(fixtures.icon); // Current compatible fixture: 20:2; do not use the imported Plus directly.
const counter=await figma.getNodeByIdAsync(fixtures.counter);
const shortcut=await figma.getNodeByIdAsync(fixtures.shortcut);
const slotStyle=collections.find(c=>c.name==='_Button content/Style');
const slotState=collections.find(c=>c.name==='_Button content/State');
if(!slotStyle||!slotState)throw Error('Run configure-slot-context.plugin.js first');
const c=track(figma.createComponent());c.name='size=md, state=default';c.layoutMode='HORIZONTAL';c.primaryAxisSizingMode='AUTO';c.counterAxisSizingMode='AUTO';c.counterAxisAlignItems='CENTER';c.primaryAxisAlignItems='CENTER';c.clipsContent=false;c.strokeAlign='INSIDE';c.strokesIncludedInLayout=false;
const keys={label:c.addComponentProperty('Label','TEXT','Button'),leading:c.addComponentProperty('Show leading','BOOLEAN',false),trailing:c.addComponentProperty('Show trailing','BOOLEAN',false),focus:c.addComponentProperty('Focus','BOOLEAN',false),lead:c.addComponentProperty('Leading','INSTANCE_SWAP',icon.id,{preferredValues:[{type:'COMPONENT',key:icon.key}]}),trail:c.addComponentProperty('Trailing','INSTANCE_SWAP',icon.id,{preferredValues:[icon,counter,shortcut].map(x=>({type:'COMPONENT',key:x.key}))})};
const content=frame('content',c,'HORIZONTAL');content.counterAxisAlignItems='CENTER';
const leading=track(icon.createInstance());leading.name='leading';content.appendChild(leading);leading.componentPropertyReferences={visible:keys.leading,mainComponent:keys.lead};leading.visible=false;
const label=txt(content,'Button',14,true);label.name='label';label.textAutoResize='WIDTH_AND_HEIGHT';label.layoutSizingHorizontal='HUG';label.textTruncation='ENDING';label.maxLines=1;label.componentPropertyReferences={characters:keys.label};
const trailing=track(icon.createInstance());trailing.name='trailing';content.appendChild(trailing);trailing.componentPropertyReferences={visible:keys.trailing,mainComponent:keys.trail};trailing.visible=false;
const overlay=frame('loadingIndicator',c,'HORIZONTAL');overlay.layoutPositioning='ABSOLUTE';overlay.primaryAxisAlignItems='CENTER';overlay.counterAxisAlignItems='CENTER';overlay.constraints={horizontal:'STRETCH',vertical:'STRETCH'};overlay.visible=false;
const spinner=track(figma.createVector());spinner.name='spinner';spinner.resize(20,20);spinner.fills=[];spinner.strokeWeight=2;spinner.vectorPaths=[{windingRule:'NONZERO',data:'M 18 10 C 18 14.42 14.42 18 10 18 C 5.58 18 2 14.42 2 10 C 2 5.58 5.58 2 10 2'}];spinner.resize(20,20);spinner.strokeCap='ROUND';overlay.appendChild(spinner);
const focus=track(figma.createRectangle());focus.name='focus';c.appendChild(focus);focus.layoutPositioning='ABSOLUTE';focus.fills=[];focus.visible=false;focus.strokeAlign='OUTSIDE';focus.constraints={horizontal:'STRETCH',vertical:'STRETCH'};focus.componentPropertyReferences={visible:keys.focus};
function recolor(node,p){for(const n of [node,...('findAll'in node?node.findAll():[])]){if(n.type==='TEXT')n.fills=[paint(p)];else{for(const prop of ['fills','strokes'])if(prop in n&&Array.isArray(n[prop])&&n[prop].length)n[prop]=n[prop].map(x=>x.type==='SOLID'?figma.variables.setBoundVariableForPaint(x,'color',vm[p]):x);}}}
function configure(comp,size,state){const p='color/action/'+intent+'/'+appearance+'/'+(state==='disabled-loading'?'disabled':state);const row=comp.findOne(n=>n.name==='content'),lab=comp.findOne(n=>n.name==='label'),spinbox=comp.findOne(n=>n.name==='loadingIndicator'),sp=comp.findOne(n=>n.name==='spinner'),f=comp.findOne(n=>n.name==='focus');
 comp.name='size='+size+', state='+state;
 comp.setExplicitVariableModeForCollection(slotStyle,slotStyle.modes.find(m=>m.name===intent+'/'+appearance).modeId);
 comp.setExplicitVariableModeForCollection(slotState,slotState.modes.find(m=>m.name===(state==='disabled-loading'?'disabled':state)).modeId);
 comp.fills=[paint(p+'/surface')];comp.strokes=appearance==='outline'?[paint(p+'/border')]:[];
 comp.setBoundVariable('strokeWeight',vm['border/width/default']);comp.setBoundVariable('cornerRadius',vm['radius/control']);comp.setBoundVariable('minHeight',vm['size/control/'+size]);
 for(const prop of ['paddingLeft','paddingRight'])comp.setBoundVariable(prop,vm['space/control/padding-inline/'+size]);
 for(const prop of ['paddingTop','paddingBottom'])comp.setBoundVariable(prop,vm['space/control/padding-block/'+size]);row.setBoundVariable('itemSpacing',vm['space/control/gap/'+size]);
 lab.setBoundVariable('fontSize',vm['typography/label/'+size+'/fontSize']);lab.setBoundVariable('lineHeight',vm['typography/label/'+size+'/lineHeight']);lab.fills=[paint(p+'/content')];
 for(const name of ['leading','trailing']){const n=comp.findOne(x=>x.name===name);n.resize(size==='sm'?16:size==='md'?20:24,size==='sm'?16:size==='md'?20:24);n.setBoundVariable('width',vm['size/icon/'+size]);n.setBoundVariable('height',vm['size/icon/'+size]);recolor(n,'_adapter/button/content');}
 row.opacity=state==='loading'||state==='disabled-loading'?0:1;spinbox.visible=row.opacity===0;
 sp.setBoundVariable('width',vm['size/icon/'+size]);sp.setBoundVariable('height',vm['size/icon/'+size]);sp.strokes=[paint(p+'/content')];
 spinbox.resize(comp.width,comp.height);spinbox.x=0;spinbox.y=0;spinbox.layoutSizingHorizontal='FIXED';spinbox.layoutSizingVertical='FIXED';
 const offset=vm['focus/offset'].resolveForConsumer(comp).value;f.resize(comp.width+2*offset,comp.height+2*offset);f.x=-offset;f.y=-offset;f.strokes=[paint('color/focus/ring')];f.setBoundVariable('strokeWeight',vm['focus/width']);f.setBoundVariable('cornerRadius',vm['radius/control']);
 return comp;
}
configure(c,'md','default');const variants=[c];for(const size of ['md','sm','lg'])for(const state of ['default','hover','pressed','loading','disabled','disabled-loading']){if(size==='md'&&state==='default')continue;const n=c.clone();ids.push(...allIds(n));variants.push(configure(n,size,state));}
const set=track(figma.combineAsVariants(variants,figma.currentPage));set.name=setName;set.description='Internal Button surface. Use the public Button component. Disabled-loading is the combined disabled + loading case.';
set.x=1800;set.y=80+index*400;set.fills=[];set.children.forEach((n,i)=>{n.x=32+(i%6)*220;n.y=48+Math.floor(i/6)*88;});set.resizeWithoutConstraints(1360,340);
return {set:set.id,variants:variants.map(n=>({id:n.id,name:n.name,width:n.width,height:n.height})),keys,createdNodeIds:[...new Set([...ids,...allIds(set)])]};

