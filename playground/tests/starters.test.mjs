import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {starterCode,examples} from '../starters.mjs';
import {challenges,validateProject} from '../project.mjs';
import {validateDrawing} from '../protocol.mjs';
import {execute} from './runtime-harness.mjs';
for(const [id,code] of Object.entries(starterCode))test(`editable starter ${id} matches published marks`,async()=>{
 const commands=validateDrawing((await execute(code)).commands);
 if(id==='blank'){assert.equal(commands.length,0);return;}
 const c=challenges[id],svg=fs.readFileSync(new URL(c.image,new URL('../',import.meta.url)),'utf8');
 if(id==='02'){
  const polygons=[...svg.matchAll(/<polygon\b[^>]*>/g)].map(m=>m[0].match(/points="([^"]+)"/)[1].trim().split(/\s+/).map(p=>p.split(',').map(Number)));
  const fills=commands.filter(c=>c.kind==='fill');assert.equal(fills.length,2);
  for(let i=0;i<2;i++){
   const actual=fills[i].points.map(([x,y])=>[x+400,400-y]);
   // The turtle runtime may repeat the closing vertex; compare each distinct vertex.
   const unique=points=>points.filter((p,j)=>!points.slice(0,j).some(q=>q[0]===p[0]&&q[1]===p[1]));
   assert.deepEqual(unique(actual),unique(polygons[i]));assert.equal(fills[i].color,'#234b43');
  }
  return;
 }
 const expected=[];
 for(const match of svg.matchAll(/<polyline\b[^>]*>/g)){
  if(match[0].includes('#a9c3ae'))continue;
  const points=match[0].match(/points="([^"]+)"/)[1].trim().split(/\s+/).map(p=>p.split(',').map(Number));
  for(let i=1;i<points.length;i++)expected.push([points[i-1],points[i]]);
 }
 const actual=commands.flatMap(command=>command.points.slice(1).map((p,i)=>[command.points[i],p].map(([x,y])=>[x+c.width/2,c.height/2-y])));
 if(id==='01'){
  // Equivalent circles can use different tessellation counts. Check both paths
  // to subpixel precision rather than requiring identical segment counts.
  const distance=(p,[a,b])=>{const dx=b[0]-a[0],dy=b[1]-a[1],l=dx*dx+dy*dy;const t=l?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/l)):0;return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy);};
  for(const [source,target] of [[actual,expected],[expected,actual]])for(const segment of source)for(const point of segment)assert.ok(Math.min(...target.map(s=>distance(point,s)))<0.1,'Challenge 01 geometry differs from published marks');
  return;
 }
 assert.equal(actual.length,expected.length);
 const near=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1])<0.002;
 for(const [a,b] of actual){const index=expected.findIndex(([x,y])=>(near(a,x)&&near(b,y))||(near(a,y)&&near(b,x)));assert.ok(index>=0,`${id}: missing segment ${a} to ${b}`);expected.splice(index,1);}
});
test('all help examples execute with validated output',async()=>{for(const code of Object.values(examples))assert.ok(validateDrawing((await execute(code)).commands).length);});
test('v3 retains reference visibility and rejects non-boolean settings',()=>{
 const p={format:'many-maybes-playground',version:3,challenge:'01',strokes:[],code:starterCode['01'],drawing:[],showStarter:false};
 assert.deepEqual(validateProject(p),p);
 for(const showStarter of [undefined,null,0,'false',{}])assert.throws(()=>validateProject({...p,showStarter}));
 const old={...p,version:2};delete old.showStarter;assert.deepEqual(validateProject(old),old);
});
