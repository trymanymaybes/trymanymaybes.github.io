import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {validateDrawing,MAX_COMMANDS} from '../protocol.mjs';
import {validateProject} from '../project.mjs';
const line=()=>({kind:'line',color:'#233f36',width:2,points:[[0,0],[10,20]]});
test('drawing protocol strips extra fields and rejects active content',()=>{
 const c=line();assert.deepEqual(validateDrawing([{...c,script:'alert(1)',url:'https://example.com'}]),[c]);
 for(const patch of [{kind:'script'},{kind:'image'},{color:'url(https://example.com)'},{width:NaN},{width:101},{points:[[0,Infinity],[0,0]]},{points:[[0,-10001],[0,0]]}]) assert.throws(()=>validateDrawing([{...c,...patch}]));
 assert.throws(()=>validateDrawing(Array(MAX_COMMANDS+1).fill(c)));
 assert.throws(()=>validateDrawing([{...c,points:Array(100001).fill([0,0])}]));
});
test('project v2 stores code as data and never executes on load',()=>{
 const data={format:'many-maybes-playground',version:2,challenge:'blank',strokes:[],code:'while True: pass',drawing:[line()]};
 assert.deepEqual(validateProject(data),data);
 assert.throws(()=>validateProject({...data,code:'x'.repeat(65537)}));
 assert.throws(()=>validateProject({...data,drawing:[{kind:'html',text:'<script>'}]}));
});
const html=fs.readFileSync(new URL('../sandbox.html',import.meta.url),'utf8');
const boot=html.match(/<script>([\s\S]*?)<\/script>/)[1];
test('sandbox bootstrap is hash-pinned and denies network and nested frames',()=>{
 const hash=createHash('sha256').update(boot).digest('base64');assert.ok(html.includes(`'sha256-${hash}'`));
 for(const rule of ["connect-src 'none'","img-src 'none'","frame-src 'none'","form-action 'none'","worker-src blob:"])assert.ok(html.includes(rule));
 assert.ok(!html.includes("'unsafe-inline'"));
 const runner=fs.readFileSync(new URL('../runner.mjs',import.meta.url),'utf8');assert.ok(runner.includes("setAttribute('sandbox','allow-scripts')"));assert.ok(!runner.includes('allow-same-origin'));
});
test('runner refuses startup when opened outside an opaque sandbox',()=>{
 for(const origin of ['https://trymanymaybes.github.io','https://other.example']){
  const context={self:{origin},parent:{},addEventListener(){throw Error('must not listen');}};
  vm.runInNewContext(boot,context);
 }
});
test('sandbox accepts only parent handshake and terminates after response',()=>{
 let listener,terminated=0,response,ready;
 const parent={postMessage:m=>ready=m};
 class Worker{constructor(){Worker.instance=this;}postMessage(data){this.source=data.source;}terminate(){terminated++;}}
 const context={self:{origin:'null'},parent,addEventListener:(name,cb)=>listener=cb,Worker,Blob,URL:{createObjectURL:()=> 'blob:null/test',revokeObjectURL(){}},setTimeout:()=>1,clearTimeout(){}};
 vm.runInNewContext(boot,context);assert.equal(ready,'many-maybes-runner-ready');
 listener({source:{},ports:[{}],data:{}});assert.equal(Worker.instance,undefined);
 listener({source:parent,ports:[{postMessage:m=>response=m}],data:{worker:'trusted code',source:'print(1)'}});
 assert.equal(Worker.instance.source,'print(1)');Worker.instance.onmessage({data:{commands:[],output:'1'}});assert.equal(terminated,1);assert.equal(response.output,'1');
});

