import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execute} from './runtime-harness.mjs';
import {validateDrawing} from '../protocol.mjs';
const run=async code=>{const r=await execute(code);return {...r,commands:validateDrawing(r.commands)};};
test('module turtle commands produce a correctly oriented square',async()=>{
 const r=await run('from turtle import *\nfor i in range(4):\n    forward(100)\n    left(90)\nprint(round(xcor()),round(ycor()))');
 assert.equal(r.commands.length,4);assert.equal(r.output.trim(),'0 0');assert.deepEqual(r.commands[0].points,[[0,0],[100,0]]);
 assert.ok(Math.abs(r.commands[1].points[1][1]-100)<1e-6);
});
test('Turtle instances, functions, pen-up and positive/negative circles',async()=>{
 const r=await run('import turtle as t\ndef arc(radius):\n    a=t.Turtle()\n    a.penup()\n    a.goto(10,20)\n    a.pendown()\n    a.circle(radius,90,steps=1)\narc(10)\narc(-10)');
 assert.equal(r.commands.length,2);assert.ok(Math.abs(r.commands[0].points[1][0]-20)<1e-6);assert.ok(Math.abs(r.commands[0].points[1][1]-30)<1e-6);assert.ok(Math.abs(r.commands[1].points[1][1]-10)<1e-6);
});
test('fill, dot, text and RGB colours',async()=>{
 const r=await run('from turtle import *\ncolormode(255)\ncolor(200,10,20)\nbegin_fill()\nfor i in range(3):\n    forward(30)\n    left(120)\nend_fill()\ndot(10,"blue")\nwrite("hello")');
 assert.equal(r.commands[0].color,'#c80a14');assert.ok(r.commands.some(c=>c.kind==='fill'));assert.equal(r.commands.at(-1).text,'hello');
});
test('math and seeded random are supported',async()=>{
 const r=await run('import math, random\nimport turtle\nrandom.seed(1)\nturtle.forward(random.randint(10,20))\nprint(math.sqrt(9))');assert.equal(r.commands.length,1);assert.equal(r.output.trim(),'3.0');
});
test('original challenge drawing function runs unchanged with browser Turtle',async()=>{
 const source=fs.readFileSync(new URL('../../starter_turtle.py',import.meta.url),'utf8');
 const drawing=source.slice(source.indexOf('def draw_starter'),source.indexOf("if __name__"));
 const r=await run('import turtle\n'+drawing+'\ndraw_starter(turtle.Turtle())');assert.equal(r.commands.length,4);assert.equal(r.commands.reduce((n,c)=>n+c.points.length-1,0),371);
});
test('blocks filesystem, browser, network and arbitrary imports',async()=>{
 for(const code of ['import os','import js','import urllib','import document','import sys; sys.setExecutionLimit(999999)','import tkinter','import pathlib','open("/etc/passwd")','input("password")']){
   await assert.rejects(async()=>{await run(code);},undefined,code);
 }
});
test('errors on unsupported turtle features instead of silently ignoring them',async()=>{
 await assert.rejects(()=>run('import turtle\nturtle.Screen().onclick(print)'));
});
test('bounded output and finite coordinates',async()=>{
 const r=await run('print("x"*5000)');assert.equal(r.output.length,4000);
 await assert.rejects(()=>run('import turtle\nturtle.goto(float("inf"),0)'));
 await assert.rejects(()=>run('import turtle\nturtle.circle(10,steps=999999)'));
 await assert.rejects(()=>run('import turtle\nfor i in range(12001):\n    turtle.forward(0)'));
});
test('infinite loop hits the interpreter time limit',async()=>{
 const start=Date.now();await assert.rejects(()=>run('while True:\n    pass'));assert.ok(Date.now()-start<6500);
});
test('new executions do not share mutable interpreter state',async()=>{
 await run('import turtle\nturtle.forward(99)');const r=await run('import turtle\nturtle.forward(1)');assert.deepEqual(r.commands[0].points,[[0,0],[1,0]]);
});

