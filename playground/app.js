import {starterCode,examples} from './starters.mjs';
import {createRunner} from './runner.mjs';
import {MAX_CODE} from './protocol.mjs';
import {challenges,validateProject,MAX_POINTS,MAX_STROKES,MAX_BYTES} from './project.mjs';
const $=id=>document.getElementById(id), canvas=$('drawing'), ctx=canvas.getContext('2d');
const ink=document.createElement('canvas'), inkCtx=ink.getContext('2d');
const turtleCanvas=document.createElement('canvas'), turtleCtx=turtleCanvas.getContext('2d'), runner=createRunner();
let turtleDrawing=[],runSequence=0,drawingEnabled=true,showStarter=true;
const defaultCode='# The starter is already visible. Add your own idea below.\nimport turtle as t\n\nt.pencolor("#b65878")\nt.pensize(3)\nt.penup()\nt.goto(0, 0)\nt.pendown()\n\n# Try a line, a circle, a pattern…\nt.forward(60)\n';
$('code').value=defaultCode;
let key='01', strokes=[],redo=[],active=null,tool='pen',base=null,ready=false,dirty=false,loadId=0,points=0;
const status=message=>$('status').textContent=message;
for(const [id,c] of Object.entries(challenges)){const o=document.createElement('option');o.value=id;o.textContent=c.title;$('challenge').append(o);}
$('challenge').value=key;
function stroke(context,s){
 context.save();context.globalCompositeOperation=s.tool==='eraser'?'destination-out':'source-over';context.strokeStyle=s.color;context.fillStyle=s.color;context.lineWidth=s.size;context.lineCap='round';context.lineJoin='round';
 context.beginPath();const [first,...rest]=s.points;context.moveTo(...first);for(const p of rest)context.lineTo(...p);context.stroke();if(!rest.length){context.beginPath();context.arc(...first,s.size/2,0,Math.PI*2);context.fill();}context.restore();
}
function render(){inkCtx.clearRect(0,0,ink.width,ink.height);for(const s of strokes)stroke(inkCtx,s);if(active)stroke(inkCtx,active);ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);if(base&&showStarter)ctx.drawImage(base,0,0,canvas.width,canvas.height);ctx.drawImage(turtleCanvas,0,0);ctx.drawImage(ink,0,0);$('undo').disabled=!strokes.length;$('redo').disabled=!redo.length;}
async function load(){
 const id=++loadId,c=challenges[key];ready=false;base=null;$('download').disabled=true;canvas.width=ink.width=turtleCanvas.width=c.width;canvas.height=ink.height=turtleCanvas.height=c.height;paintTurtle();$('challenge').value=key;$('canvas-label').textContent=c.title;$('prompt').textContent=c.prompt;$('challenge-link').hidden=!c.page;if(c.page)$('challenge-link').href=c.page;render();status('Loading your starting point…');
 try{if(c.image){const img=new Image();await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=c.image;});if(id!==loadId)return;base=img;}if(id!==loadId)return;ready=true;$('download').disabled=false;render();status('Your canvas is ready. Make your first mark.');}catch{if(id===loadId)status('Could not load the starter. Reload the page, or choose a blank canvas.');}
}
function finish(){if(!active)return;strokes.push(active);points+=active.points.length;active=null;redo=[];dirty=true;render();}
function position(e){const r=canvas.getBoundingClientRect();return [Math.max(0,Math.min(canvas.width,(e.clientX-r.left)*canvas.width/r.width)),Math.max(0,Math.min(canvas.height,(e.clientY-r.top)*canvas.height/r.height))];}
canvas.addEventListener('pointerdown',e=>{if(!drawingEnabled||!ready||active||e.button!==0)return;if(points>=MAX_POINTS||strokes.length>=MAX_STROKES){status('Drawing limit reached. Save your work, then start another project.');return;}canvas.setPointerCapture(e.pointerId);active={tool,color:$('color').value,size:Number($('size').value),points:[position(e)],pointer:e.pointerId};render();});
canvas.addEventListener('pointermove',e=>{if(!active||e.pointerId!==active.pointer)return;if(points+active.points.length>=MAX_POINTS){finish();status('Drawing limit reached. Save your project.');return;}const p=position(e),last=active.points.at(-1);if(Math.hypot(p[0]-last[0],p[1]-last[1])<1)return;active.points.push(p);render();});
for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,e=>{if(active?.pointer===e.pointerId)finish();});
for(const mode of ['pen','eraser'])$(mode).onclick=()=>{tool=mode;for(const m of ['pen','eraser'])$(m).setAttribute('aria-pressed',String(m===tool));};
$('size').oninput=()=>{$('size-label').value=$('size').value;};
$('undo').onclick=()=>{finish();if(strokes.length){const s=strokes.pop();points-=s.points.length;redo.push(s);dirty=true;render();}};
$('redo').onclick=()=>{if(redo.length){const s=redo.pop();strokes.push(s);points+=s.points.length;dirty=true;render();}};
$('clear').onclick=()=>{finish();if(!strokes.length||!confirm('Clear your drawing? Save a project first if you want to keep it.'))return;strokes=[];redo=[];points=0;dirty=true;render();status('Your drawing was cleared. The starter is unchanged.');};
$('challenge').onchange=()=>{finish();if(dirty&&!confirm('Change starting point and discard unsaved work?')){$('challenge').value=key;return;}stopCode();key=$('challenge').value;showStarter=key!=='blank';$('show-starter').checked=showStarter;strokes=[];redo=[];points=0;turtleDrawing=[];$('code').value=defaultCode;dirty=false;load();};
function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}
$('download').onclick=()=>{finish();canvas.toBlob(blob=>{if(blob){download(blob,`many-maybes-${key}.png`);status('Image download started. Save a project too if you want to edit later.');}else status('Image export failed. Please try again.');},'image/png');};
$('save').onclick=()=>{try{finish();const project=validateProject({format:'many-maybes-playground',version:3,showStarter,challenge:key,strokes,code:$('code').value,drawing:turtleDrawing});download(new Blob([JSON.stringify(project)],{type:'application/json'}),`many-maybes-${key}.json`);dirty=false;status('Project download started. Keep the file to continue later.');}catch(e){status(e.message);}};
$('open').onclick=()=>$('file').click();
$('file').onchange=async()=>{const f=$('file').files[0];$('file').value='';if(!f)return;try{if(f.size>MAX_BYTES)throw new Error('Project is too large. Maximum size is 8 MB.');const p=validateProject(JSON.parse(await f.text()));finish();if(dirty&&!confirm('Replace your unsaved drawing with this project?'))return;stopCode();key=p.challenge;showStarter=p.showStarter??true;$('show-starter').checked=showStarter;turtleDrawing=p.drawing||[];$('code').value=p.code??defaultCode;strokes=p.strokes;redo=[];points=strokes.reduce((n,s)=>n+s.points.length,0);dirty=false;await load();}catch(e){status(e instanceof SyntaxError?'Could not read this project. Choose a saved Many Maybes JSON file.':e.message);}};
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
load();

function paintTurtle(){
 turtleCtx.clearRect(0,0,turtleCanvas.width,turtleCanvas.height);
 const xy=p=>[p[0]+turtleCanvas.width/2,turtleCanvas.height/2-p[1]];
 for(const c of turtleDrawing){
  turtleCtx.fillStyle='#233f36';turtleCtx.strokeStyle='#233f36';
  turtleCtx.fillStyle=c.color;turtleCtx.strokeStyle=c.color;
  if(c.kind==='line'||c.kind==='fill'){
   turtleCtx.beginPath();turtleCtx.moveTo(...xy(c.points[0]));for(const p of c.points.slice(1))turtleCtx.lineTo(...xy(p));
   turtleCtx.lineWidth=c.width;turtleCtx.lineJoin='round';turtleCtx.lineCap='round';
   if(c.kind==='fill'){turtleCtx.closePath();turtleCtx.fill();}else turtleCtx.stroke();
  }else if(c.kind==='dot'){turtleCtx.beginPath();turtleCtx.arc(...xy([c.x,c.y]),c.size/2,0,Math.PI*2);turtleCtx.fill();}
  else {turtleCtx.font=`${c.size}px sans-serif`;turtleCtx.textAlign=c.align;turtleCtx.fillText(c.text,...xy([c.x,c.y]));}
 }
}
function stopCode(){runSequence++;runner.stop();$('run').disabled=false;$('stop').disabled=true;$('code-status').textContent='Stopped. The previous turtle drawing is kept.';}
$('stop').onclick=stopCode;
$('run').onclick=async()=>{
 if(!ready){$('code-status').textContent='Wait for the canvas to load first.';return;}
 finish();const sequence=++runSequence;$('run').disabled=true;$('stop').disabled=false;$('code-status').textContent='Running Python in your browser…';$('console').hidden=true;
 try{const result=await runner.run($('code').value);if(sequence!==runSequence)return;turtleDrawing=result.commands;dirty=true;paintTurtle();render();$('console').textContent=result.output;$('console').hidden=!result.output;$('code-status').textContent=`Done · ${result.commands.length} drawing commands. Freehand marks were kept.`;}
 catch(error){if(sequence===runSequence)$('code-status').textContent=error.message;}
 finally{if(sequence===runSequence){$('run').disabled=false;$('stop').disabled=true;}}
};
$('code').oninput=()=>{dirty=true;$('code-status').textContent='Code edited. Run to update the turtle layer.';};
$('clear-code').onclick=()=>{if(!turtleDrawing.length)return;if(!confirm('Clear the turtle drawing? Your script and freehand marks will be kept.'))return;stopCode();turtleDrawing=[];dirty=true;paintTurtle();render();$('code-status').textContent='Turtle layer cleared. Run your code to draw again.';};
$('open-code').onclick=()=>$('code-file').click();
$('code-file').onchange=async()=>{const f=$('code-file').files[0];$('code-file').value='';if(!f)return;try{if(f.size>MAX_CODE)throw new Error('Script is too large. Maximum size is 64 KB.');const code=await f.text();if(code.length>MAX_CODE)throw new Error('Script is too large.');if($('code').value!==defaultCode&&!confirm('Replace the script in the editor? Save it first to keep your changes.'))return;stopCode();$('code').value=code;dirty=true;$('code-status').textContent='Script opened locally. Review it, then click Run.';}catch(e){$('code-status').textContent=e.message;}};
$('save-code').onclick=()=>{download(new Blob([$('code').value],{type:'text/x-python'}),'many-maybes-drawing.py');$('code-status').textContent='Script download started. Save a project to keep all drawing layers too.';};

$('drawing-toggle').onclick=()=>{
 finish();drawingEnabled=!drawingEnabled;
 $('drawing-toggle').textContent=drawingEnabled?'Freehand on':'Freehand off';
 for(const attribute of ['aria-pressed','aria-expanded'])$('drawing-toggle').setAttribute(attribute,String(drawingEnabled));
 $('drawing-tools').hidden=!drawingEnabled;canvas.classList.toggle('drawing-disabled',!drawingEnabled);
};
$('show-starter').onchange=()=>{showStarter=$('show-starter').checked;dirty=true;render();};
$('load-starter').onclick=()=>{
 if($('code').value!==defaultCode&&!confirm('Replace the script with the selected starter code? Save your script first to keep it.'))return;
 stopCode();$('code').value=starterCode[key];showStarter=false;$('show-starter').checked=false;
 turtleDrawing=[];dirty=true;paintTurtle();render();
 $('code-status').textContent='Editable starter loaded. Click Run to draw it. Reference image hidden to avoid duplicate marks.';
};
for(const [name,source] of Object.entries(examples))$('example-'+name).onclick=()=>{
 const code=$('code').value+'\n'+source;
 if(code.length>MAX_CODE){$('code-status').textContent='The example would exceed the script size limit.';return;}
 stopCode();$('code').value=code;dirty=true;$('code-status').textContent='Example added at the end. Click Run to draw it.';$('code').focus();
};
