import fs from 'node:fs';
import path from 'node:path';
import {root,sources,resolveSources,cssValue} from './resolve-tokens.mjs';
import {checkContract} from './validate-contract.mjs';
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const write=(p,o)=>{fs.mkdirSync(path.dirname(path.join(root,p)),{recursive:true});fs.writeFileSync(path.join(root,p),typeof o==='string'?o:JSON.stringify(o,null,2)+'\n')};
const cfg=read('config.json'),contract=read('contracts/actions/button.contract.json');
const records=[],contrast=[],all={};let css='/* Generated from JSON token sources. */\n';
const expected={surface:'color',content:'color',border:'color',typography:'typography',focusColor:'color'};
const lum=c=>c.reduce((sum,x,i)=>sum+[.2126,.7152,.0722][i]*(x<=.04045?x/12.92:((x+.055)/1.055)**2.4),0);
const ratio=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
const blend=(f,b)=>f.components.map((v,i)=>v*(f.alpha??1)+b.components[i]*(1-(f.alpha??1)));
for(const b of cfg.brands)for(const a of cfg.appearances)for(const d of cfg.densities){
 const id=`${b}-${a}-${d}`,r=resolveSources(sources(b,a,d)),t=r.tokens;all[id]=t;
 const check=checkContract(contract,{tokens:t});if(!check.valid)throw Error(JSON.stringify(check.errors));
 for(const [role,template]of Object.entries(contract.tokens))for(const p of check.requiredTokenPaths.filter(p=>new RegExp('^'+template.replaceAll('.','\\.').replaceAll(/\{\w+\}/g,'[^.]+')+'$').test(p)))if(t[p].$type!==(expected[role]??'dimension'))throw Error('Wrong role type '+role+': '+p);
 for(const[p,v]of Object.entries(t)){const x=v.$value;if(v.$type==='dimension'&&(!Number.isFinite(x.value)||x.value<0||x.unit!=='px'))throw Error('Invalid dimension '+p);if(v.$type==='color'&&(x.colorSpace!=='srgb'||x.components.length!==3||x.components.some(c=>c<0||c>1)||x.alpha<0||x.alpha>1))throw Error('Invalid color '+p);}
 for(const size of contract.props.size.values){const type=t['typography.label.'+size].$value,visible=Math.max(t['size.control.'+size].$value.value,type.fontSize.value*type.lineHeight+2*t['space.control.padding-block.'+size].$value.value);if(t['size.target.min'].$value.value<44)throw Error('Target too small');records.push({id,size,visibleHeight:visible,targetHeight:Math.max(44,visible),coverage:check.checks.tokenCoverage});}
 for(const backdrop of ['canvas','subtle']){const bg=t['color.surface.'+backdrop].$value;for(const intent of contract.props.intent.values)for(const app of contract.props.appearance.values)for(const state of contract.states.interaction.values){const p=`color.action.${intent}.${app}.${state}`,surface=blend(t[p+'.surface'].$value,bg),content=t[p+'.content'].$value;const rr=ratio(blend(content,{components:surface}),surface);contrast.push({id,backdrop,intent,appearance:app,state,role:'content',ratio:rr,minimum:state==='disabled'?null:4.5,passed:state==='disabled'||rr>=4.5});if(app==='outline'&&state!=='disabled'){const rr=ratio(t[p+'.border'].$value.components,bg.components);contrast.push({id,backdrop,intent,appearance:app,state,role:'border',ratio:rr,minimum:3,passed:rr>=3});}}
 const rr=ratio(t['color.focus.ring'].$value.components,bg.components);contrast.push({id,backdrop,role:'focus',ratio:rr,minimum:3,passed:rr>=3});}
 write(`dist/resolved/${id}.json`,t);write(`dist/traces/${id}.json`,r.trace);
 const cssTokens={...t};for(const [p,v]of Object.entries(t))if(v.$type==='typography'){cssTokens[p+'.fontSize']={$type:'dimension',$value:v.$value.fontSize};cssTokens[p+'.lineHeight']={$type:'dimension',$value:{value:v.$value.lineHeight*v.$value.fontSize.value,unit:'px'}};}
 css+=`[data-ds-brand="${b}"][data-ds-appearance="${a}"][data-ds-density="${d}"] {\n`+Object.entries(cssTokens).map(([p,v])=>`  --${p.replaceAll('.','-')}: ${cssValue(v)};`).join('\n')+'\n}\n';
}
write('dist/tokens.css',css);write('reports/button-token-coverage.json',{configurations:Object.keys(all).length,requiredPaths:checkContract(contract).requiredTokenPaths.length,records});
write('reports/button-contrast.json',{method:'WCAG relative luminance; alpha composited on canvas and subtle. Disabled informational, not a conformance claim.',checks:contrast.length,failures:contrast.filter(x=>!x.passed),minimumActiveText:Math.min(...contrast.filter(x=>x.role==='content'&&x.state!=='disabled').map(x=>x.ratio)),results:contrast});
// Figma adapter: independent selectors, complete per-brand routing values.
// Compilation detail only; this does not add a semantic tier to source JSON.
const manifest={collections:{Brand:cfg.brands,Appearance:cfg.appearances,Density:['standard','compact','comfortable']},variables:[],typography:[]};
const convert=t=>t.$type==='color'?{r:t.$value.components[0],g:t.$value.components[1],b:t.$value.components[2],a:t.$value.alpha??1}:t.$type==='dimension'?t.$value.value:t.$value;
const flat={};for(const[id,t]of Object.entries(all)){flat[id]={};for(const[p,v]of Object.entries(t)){if(v.$type==='typography'){const x=v.$value;flat[id][p+'.fontSize']={$type:'dimension',$value:x.fontSize};flat[id][p+'.lineHeight']={$type:'dimension',$value:{value:x.lineHeight*x.fontSize.value,unit:'px'}};continue;}if(['color','dimension'].includes(v.$type))flat[id][p]=v;}}
const paths=Object.keys(flat['base-light-standard']);
const scopes=p=>p.startsWith('primitive.')?[]:p.includes('radius')?['CORNER_RADIUS']:p.includes('padding')||p.includes('gap')?['GAP']:p.endsWith('fontSize')?['FONT_SIZE']:p.endsWith('lineHeight')?['LINE_HEIGHT']:p.endsWith('.content')||p.startsWith('color.content')?['TEXT_FILL','SHAPE_FILL','STROKE_COLOR']:p.includes('focus.ring')||p.endsWith('.border')?['STROKE_COLOR']:p.startsWith('color.')?['FRAME_FILL','SHAPE_FILL']:p.includes('width')?['STROKE_FLOAT']:['WIDTH_HEIGHT'];
for(const p of paths){const type=flat['base-light-standard'][p].$type==='color'?'COLOR':'FLOAT';const axis=p.startsWith('color.')?'Appearance':p.startsWith('space.')||p.startsWith('size.control.')?'Density':'Brand';
 if(axis==='Brand'){manifest.variables.push({collection:'Brand',name:p.replaceAll('.','/'),path:p,type,scopes:scopes(p),values:Object.fromEntries(cfg.brands.map(b=>[b,convert(flat[`${b}-light-standard`][p])]))});}
 else{const modes=axis==='Appearance'?cfg.appearances:cfg.densities;for(const mode of modes)manifest.variables.push({collection:'Brand',name:`_resolved/${axis.toLowerCase()}/${mode}/${p.replaceAll('.','/')}`,path:p,type,scopes:[],values:Object.fromEntries(cfg.brands.map(b=>[b,convert(flat[`${b}-${axis==='Appearance'?mode:'light'}-${axis==='Density'?mode:'standard'}`][p])]))});manifest.variables.push({collection:axis,name:p.replaceAll('.','/'),path:p,type,scopes:scopes(p),values:Object.fromEntries(modes.map(m=>[m,{alias:`Brand:_resolved/${axis.toLowerCase()}/${m}/${p.replaceAll('.','/')}`}]))});}}
manifest.typography=['sm','md','lg'].map(s=>({name:'typography/label/'+s,family:'Inter',style:'Semi Bold',size:all['base-light-standard']['typography.label.'+s].$value.fontSize.value,lineHeight:all['base-light-standard']['typography.label.'+s].$value.lineHeight*all['base-light-standard']['typography.label.'+s].$value.fontSize.value}));
write('dist/figma-manifest.json',manifest);write('reports/button-contract-validation.json',checkContract(contract,{tokens:all['base-light-standard']}));write('reports/button-token-requirements.json',checkContract(contract).requiredTokenPaths);
console.log(JSON.stringify({contexts:Object.keys(all).length,paths:paths.length,variables:manifest.variables.length,contrastChecks:contrast.length,failures:contrast.filter(x=>!x.passed).length}));if(contrast.some(x=>!x.passed))process.exitCode=1;
