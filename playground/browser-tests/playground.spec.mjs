import {test,expect} from '@playwright/test';
import fs from 'node:fs/promises';
async function open(page){page.on('dialog',d=>d.accept());await page.goto('/playground/');await expect(page.locator('#status')).toContainText('ready');}
async function run(page,source){await page.locator('#code').fill(source);await page.locator('#run').click();await expect(page.locator('#code-status')).toContainText('Done',{timeout:15000});}
const pixels=page=>page.locator('#drawing').evaluate(c=>c.toDataURL());
test('run turtle, preserve hand marks, download and restore project',async({page},testInfo)=>{
 await open(page);await page.locator('#challenge').selectOption('blank');await expect(page.locator('#status')).toContainText('ready');
 await page.locator('#drawing').scrollIntoViewIfNeeded();const box=await page.locator('#drawing').boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+60,box.y+box.height/2+40,{steps:8});await page.mouse.up();await expect(page.locator('#undo')).toBeEnabled();
 const hand=await pixels(page);await run(page,'import turtle as t\nt.pencolor("red")\nt.forward(100)\nprint("hello")');await expect(page.locator('#console')).toHaveText('hello\n');
 const combined=await pixels(page);expect(combined).not.toEqual(hand);
 await page.locator('#clear-code').click();expect(await pixels(page)).toEqual(hand);
 await run(page,'import turtle as t\nt.circle(50)');const restoredExpected=await pixels(page);
 const save=page.waitForEvent('download');await page.locator('#save').click();const file=await save;const json=await fs.readFile(await file.path());const project=JSON.parse(json);expect(project.strokes.length).toBe(1);expect(project.drawing.length).toBeGreaterThan(0);
 await page.locator('#clear').click();await page.locator('#file').setInputFiles({name:'project.json',mimeType:'application/json',buffer:json});await expect(page.locator('#code')).toHaveValue(project.code);expect(await pixels(page)).toEqual(restoredExpected);
 await page.screenshot({path:testInfo.outputPath('playground.png'),fullPage:true});
 const png=page.waitForEvent('download');await page.locator('#download').click();const pngFile=await png;expect((await fs.readFile(await pngFile.path())).subarray(0,8).toString('hex')).toBe('89504e470d0a1a0a');
});
test('script import does not execute, Stop and timeouts preserve last result',async({page})=>{
 await open(page);const activeWorkers=new Set();page.on('worker',w=>{activeWorkers.add(w);w.on('close',()=>activeWorkers.delete(w));});const source='import turtle\nturtle.forward(50)';await page.locator('#code-file').setInputFiles({name:'drawing.py',mimeType:'text/plain',buffer:Buffer.from(source)});await expect(page.locator('#code-status')).toContainText('Review');await run(page,source);const previous=await pixels(page);
 await page.locator('#code').fill('while True:\n    pass');await page.locator('#run').click();await expect(page.locator('iframe')).toHaveCount(1);await page.locator('#stop').click();await expect(page.locator('iframe')).toHaveCount(0);await expect.poll(()=>activeWorkers.size).toBe(0);expect(await pixels(page)).toEqual(previous);
 await page.locator('#run').click();await expect(page.locator('#run')).toBeEnabled({timeout:12000});await expect(page.locator('#code-status')).not.toContainText('Done');await expect(page.locator('iframe')).toHaveCount(0);expect(await pixels(page)).toEqual(previous);
 await run(page,'import turtle\nturtle.forward(25)');
});
test('malformed files and imports are rejected; responsive controls work',async({page,isMobile})=>{
 await open(page);await page.locator('#file').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{"format":"many-maybes-playground","version":2,"challenge":"__proto__","strokes":[],"code":"","drawing":[]}')});await expect(page.locator('#status')).toContainText('not a supported');
 await page.locator('#code').fill('import os');await page.locator('#run').click();await expect(page.locator('#code-status')).toContainText('ImportError',{timeout:12000});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 if(isMobile){await page.locator('#drawing').scrollIntoViewIfNeeded();const b=await page.locator('#drawing').boundingBox();await page.touchscreen.tap(b.x+15,b.y+15);await expect(page.locator('#undo')).toBeEnabled();}
 await page.locator('#eraser').click();await expect(page.locator('#eraser')).toHaveAttribute('aria-pressed','true');
});
// Real opaque iframe and blob worker. Test-only payload is sent from the parent;
// no test/bypass entrypoint is added to application code.
async function probe(page,worker){return page.evaluate(worker=>new Promise((resolve,reject)=>{
 const frame=document.createElement('iframe');frame.sandbox='allow-scripts';frame.src='/playground/sandbox.html';
 const channel=new MessageChannel();const timer=setTimeout(()=>{frame.remove();reject(Error('probe timeout'));},10000);
 const listener=e=>{if(e.source!==frame.contentWindow||e.data!=='many-maybes-runner-ready')return;window.removeEventListener('message',listener);frame.contentWindow.postMessage({worker,source:''},'*',[channel.port2]);};
 channel.port1.onmessage=e=>{clearTimeout(timer);frame.remove();resolve(e.data);};window.addEventListener('message',listener);document.body.append(frame);
}),worker);}
test('real worker denies networking and origin storage',async({page,request})=>{
 await open(page);const before=await (await request.get('/__probes')).text();
 const result=await probe(page,`onmessage=async()=>{const r={origin:self.origin};try{await fetch('http://127.0.0.1:4173/__probe');r.fetch='allowed';}catch(e){r.fetch='blocked';}try{importScripts('http://127.0.0.1:4173/__probe');r.import='allowed';}catch(e){r.import='blocked';}r.ws=await new Promise(resolve=>{try{const socket=new WebSocket('ws://127.0.0.1:4173/__probe');socket.onopen=()=>{socket.close();resolve('allowed');};socket.onerror=()=>resolve('blocked');setTimeout(()=>resolve('no-result'),2000);}catch(e){resolve('blocked');}});r.xhr=await new Promise(resolve=>{try{const x=new XMLHttpRequest();x.open('GET','http://127.0.0.1:4173/__probe');x.onload=()=>resolve('allowed');x.onerror=()=>resolve('blocked');x.send();}catch(e){resolve('blocked');}});try{indexedDB.open('should-not-open');r.storage='allowed';}catch(e){r.storage='blocked';}r.dom=typeof document;r.parent=typeof parent;postMessage(r);}`);
 expect(result).toEqual({origin:'null',fetch:'blocked',import:'blocked',ws:'blocked',xhr:'blocked',storage:'blocked',dom:'undefined',parent:'undefined'});
 expect(await (await request.get('/__probes')).text()).toBe(before);
});
test('real iframe denies parent DOM and storage; direct navigation stays inert',async({page})=>{
 await open(page);await page.evaluate(()=>{const f=document.createElement('iframe');f.id='security-probe';f.sandbox='allow-scripts';f.src='/playground/sandbox.html';document.body.append(f);});
 const frame=await page.locator('#security-probe').contentFrame();
 const result=await frame.locator('body').evaluate(()=>{const r={origin:self.origin};for(const [name,fn]of Object.entries({dom:()=>parent.document.body,cookies:()=>document.cookie,storage:()=>localStorage.getItem('secret')})){try{fn();r[name]='allowed';}catch{r[name]='blocked';}}return r;});
 expect(result).toEqual({origin:'null',dom:'blocked',cookies:'blocked',storage:'blocked'});
 await page.goto('/playground/sandbox.html');expect(await page.evaluate(()=>self.origin)).not.toBe('null');expect(await page.locator('iframe').count()).toBe(0);
});
test('independent watchdog stops a non-yielding worker',async({page})=>{
 await open(page);const result=await probe(page,'onmessage=()=>{while(true){}};');expect(result.error).toContain('6-second limit');
 await expect(page.locator('#run')).toBeEnabled();
});

test('canvas toolbar toggle, editable starter and help examples',async({page},testInfo)=>{
 await open(page);
 expect(await page.locator('#code').evaluate(el=>!!(el.compareDocumentPosition(document.querySelector('#drawing'))&Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
 await page.locator('#drawing-toggle').click();await expect(page.locator('#drawing-tools')).toBeHidden();
 await page.locator('#drawing').scrollIntoViewIfNeeded();let b=await page.locator('#drawing').boundingBox();const original=await pixels(page);
 await page.mouse.click(b.x+20,b.y+20);expect(await pixels(page)).toEqual(original);
 await page.locator('#drawing-toggle').click();await expect(page.locator('#drawing-tools')).toBeVisible();
 await page.locator('#drawing').scrollIntoViewIfNeeded();b=await page.locator('#drawing').boundingBox();await page.mouse.click(b.x+20,b.y+20);expect(await pixels(page)).not.toEqual(original);
 await page.locator('#starter-code').click();await expect(page.locator('#starter-code')).toHaveAttribute('aria-pressed','true');
 expect(await page.locator('#code').inputValue()).toContain('circle_at');
 page.removeAllListeners('dialog');page.once('dialog',d=>d.dismiss());await page.locator('#starter-image').click();await expect(page.locator('#starter-code')).toHaveAttribute('aria-pressed','true');expect(await page.locator('#code').inputValue()).toContain('circle_at');page.on('dialog',d=>d.accept());
 await page.locator('#run').click();await expect(page.locator('#code-status')).toContainText('Done',{timeout:15000});
 const expected=await pixels(page);const saving=page.waitForEvent('download');await page.locator('#save').click();const file=await saving;const json=await fs.readFile(await file.path());expect(JSON.parse(json).showStarter).toBe(false);
 await page.locator('#starter-image').click();await expect(page.locator('#starter-image')).toHaveAttribute('aria-pressed','true');await page.locator('#file').setInputFiles({name:'starter.json',mimeType:'application/json',buffer:json});await expect(page.locator('#status')).toContainText('ready');await expect(page.locator('#starter-code')).toHaveAttribute('aria-pressed','true');expect(await pixels(page)).toEqual(expected);
 await page.screenshot({path:testInfo.outputPath('toolbar.png'),fullPage:true});
 await page.locator('#code-help summary').click();await page.locator('#example-flower').click();expect(await page.locator('#code').inputValue()).toContain('range(12)');
 await page.locator('#run').click();await expect(page.locator('#code-status')).toContainText('Done',{timeout:15000});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test.describe('HTTPS challenge navigation',()=>{
 test.use({ignoreHTTPSErrors:true}); // Local ephemeral certificate only; page CSP remains enforced.
 test('challenge links select the matching starter and reject unknown IDs',async({page})=>{
 for(const id of ['01','02','03','04','05']){
  await page.goto('https://127.0.0.1:4174/challenge-'+id+'.html');await page.getByRole('link',{name:'Draw this challenge'}).click();await expect(page.locator('#status')).toContainText('ready');await expect(page.locator('#challenge')).toHaveValue(id);await expect(page.locator('#challenge-link')).toHaveAttribute('href','../challenge-'+id+'.html');
 }
 await page.goto('/playground/?challenge=__proto__');await expect(page.locator('#challenge')).toHaveValue('01');
});

 test('playground submission keeps challenge context and explains the available route',async({page,context})=>{
  for(const id of ['01','02','03','04','05','blank']){
   await page.goto('https://127.0.0.1:4174/playground/?challenge='+id);
   await expect(page.locator('#status')).toContainText('ready');
   const popup=context.waitForEvent('page');await page.locator('#submit-link').click();const submission=await popup;
   await submission.waitForLoadState();
   await expect(submission.locator('#submission-challenge')).toContainText(id==='blank'?'Free creation':'Challenge '+id);
   await expect(submission.locator('#submission-instructions')).toContainText('No website login is needed');
   await expect(submission.locator('#direct-submissions')).toBeHidden();
   const png=await page.locator('#drawing').evaluate(c=>c.toDataURL().split(',')[1]);
   await submission.locator('#file').setInputFiles({name:'drawing.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')});
   await submission.locator('#title').fill('My maybe');await submission.locator('#permission').check();
   await submission.getByRole('button',{name:'Prepare my submission',exact:true}).click();
   await expect(submission.locator('#prepared')).toBeVisible();
   const href=decodeURIComponent(await submission.locator('#email-draft').getAttribute('href'));
   expect(href).toContain(id==='blank'?'Free creation':'Challenge '+id);
   await expect(page.locator('#challenge')).toHaveValue(id);
   await submission.close();
  }
 });

});
