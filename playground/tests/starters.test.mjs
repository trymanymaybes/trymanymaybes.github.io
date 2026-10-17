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
 const expected=[];
 for(const match of svg.matchAll(/<polyline\b[^>]*>/g)){
  if(match[0].includes('#a9c3ae'))continue;
  const points=match[0].match(/points="([^"]+)"/)[1].trim().split(/\s+/).map(p=>p.split(',').map(Number));
  for(let i=1;i<points.length;i++)expected.push([points[i-1],points[i]]);
 }
 const actual=commands.flatMap(command=>command.points.slice(1).map((p,i)=>[command.points[i],p].map(([x,y])=>[x+c.width/2,c.height/2-y])));
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
