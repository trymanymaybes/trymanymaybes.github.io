import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execute} from './runtime-harness.mjs';
import {validateDrawing} from '../protocol.mjs';
import {validateProject} from '../project.mjs';
test('background aliases, getter and RGB survive saved projects',async()=>{
 const r=await execute('import turtle as t\nt.bgcolor("pink")\nt.colormode(255)\nt.Screen().bgcolor(10,20,30)\nprint(t.bgcolor())');
 assert.equal(r.output.trim(),'#0a141e');
 const p=validateProject({format:'many-maybes-playground',version:3,challenge:'blank',strokes:[],showStarter:false,code:'',drawing:r.commands});
 assert.deepEqual(p.drawing.at(-1),{kind:'background',color:'#0a141e'});
});
test('world mapping and font metadata survive validation',async()=>{
 const r=await execute('import turtle as t\nt.setworldcoordinates(0,-770,800,0)\nt.write("Title",font=("DejaVu Sans",24,"bold italic"))');
 const c=validateDrawing(r.commands);assert.deepEqual(c[0].bounds,[0,-770,800,0]);assert.equal(c[1].family,'DejaVu Sans');assert.equal(c[1].style,'bold italic');
});
test('invalid screen and font data rejected at trust boundary',async()=>{
 for(const c of [{kind:'world',bounds:[0,0,0,1]},{kind:'world',bounds:[0,0,Infinity,1]},{kind:'background',color:'url(https://example.com)'},{kind:'text',x:0,y:0,size:12,text:'x',align:'left',color:'red',family:'x";url(x)',style:'bold'}])assert.throws(()=>validateDrawing([c]));
 await assert.rejects(()=>execute('import turtle\nturtle.setworldcoordinates(1,0,1,10)'));
});
for(const name of ['park','underwater','desk'])test('complete '+name+' example executes and validates',async()=>{
 const source=fs.readFileSync(new URL('../examples/'+name+'.py',import.meta.url),'utf8');assert.ok(source.length<65536);
 const r=await execute(source+'\nprint("SCENE_COMPLETE")');assert.equal(r.output.trim(),'SCENE_COMPLETE');const c=validateDrawing(r.commands);assert.ok(c.length>500);assert.ok(c.some(x=>x.kind==='fill'));assert.ok(c.some(x=>x.kind==='text'));assert.ok(c.some(x=>x.kind==='background'));assert.ok(c.some(x=>x.kind==='world'));
});
