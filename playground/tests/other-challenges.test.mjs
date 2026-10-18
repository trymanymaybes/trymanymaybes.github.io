import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execute} from './runtime-harness.mjs';
import {validateDrawing} from '../protocol.mjs';
import {validateProject} from '../project.mjs';
import {artworkNames,artworkCommands} from './artwork-fixtures.mjs';
for(const name of ['canyon','theatre','photograph'])test('Challenge 02 '+name+' original drawing functions finish',async()=>{
 const source=fs.readFileSync(new URL('../examples/02-'+name+'.py',import.meta.url),'utf8');
 const r=await execute(source+'\nprint("SCENE_COMPLETE")');assert.equal(r.output.trim(),'SCENE_COMPLETE');
 const c=validateDrawing(r.commands);assert.ok(c.length>2000);assert.ok(c.some(x=>x.kind==='fill'));assert.ok(c.some(x=>x.kind==='text'));
});
for(const name of artworkNames)test('published artwork '+name+' validates and round trips without dropping primitives',()=>{
 const source=fs.readFileSync(new URL('../../challenge-'+name+'.svg',import.meta.url),'utf8');
 const drawing=artworkCommands(source);const valid=validateDrawing(drawing);assert.deepEqual(valid,drawing);
 const project={format:'many-maybes-playground',version:3,challenge:name.slice(0,2),showStarter:false,code:'',strokes:[],drawing};
 assert.deepEqual(validateProject(JSON.parse(JSON.stringify(project))).drawing,drawing);
});
