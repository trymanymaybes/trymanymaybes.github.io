import {challenges,validateProject,MAX_POINTS,MAX_STROKES,MAX_BYTES} from './project.mjs';
const $=id=>document.getElementById(id), canvas=$('drawing'), ctx=canvas.getContext('2d');
const ink=document.createElement('canvas'), inkCtx=ink.getContext('2d');
let key='01', strokes=[],redo=[],active=null,tool='pen',base=null,ready=false,dirty=false,loadId=0,points=0;
const status=message=>$('status').textContent=message;
for(const [id,c] of Object.entries(challenges)){const o=document.createElement('option');o.value=id;o.textContent=c.title;$('challenge').append(o);}
$('challenge').value=key;
function stroke(context,s){
 context.save();context.globalCompositeOperation=s.tool==='eraser'?'destination-out':'source-over';context.strokeStyle=s.color;context.fillStyle=s.color;context.lineWidth=s.size;context.lineCap='round';context.lineJoin='round';
 context.beginPath();const [first,...rest]=s.points;context.moveTo(...first);for(const p of rest)context.lineTo(...p);context.stroke();if(!rest.length){context.beginPath();context.arc(...first,s.size/2,0,Math.PI*2);context.fill();}context.restore();
}
function render(){inkCtx.clearRect(0,0,ink.width,ink.height);for(const s of strokes)stroke(inkCtx,s);if(active)stroke(inkCtx,active);ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);if(base)ctx.drawImage(base,0,0,canvas.width,canvas.height);ctx.drawImage(ink,0,0);$('undo').disabled=!strokes.length;$('redo').disabled=!redo.length;}
async function load(){
 const id=++loadId,c=challenges[key];ready=false;base=null;$('download').disabled=true;canvas.width=ink.width=c.width;canvas.height=ink.height=c.height;$('challenge').value=key;$('canvas-label').textContent=c.title;$('prompt').textContent=c.prompt;$('challenge-link').hidden=!c.page;if(c.page)$('challenge-link').href=c.page;render();status('Loading your starting point…');
 try{if(c.image){const img=new Image();await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=c.image;});if(id!==loadId)return;base=img;}if(id!==loadId)return;ready=true;$('download').disabled=false;render();status('Your canvas is ready. Make your first mark.');}catch{if(id===loadId)status('Could not load the starter. Reload the page, or choose a blank canvas.');}
}
function finish(){if(!active)return;strokes.push(active);points+=active.points.length;active=null;redo=[];dirty=true;render();}
function position(e){const r=canvas.getBoundingClientRect();return [Math.max(0,Math.min(canvas.width,(e.clientX-r.left)*canvas.width/r.width)),Math.max(0,Math.min(canvas.height,(e.clientY-r.top)*canvas.height/r.height))];}
canvas.addEventListener('pointerdown',e=>{if(!ready||active||e.button!==0)return;if(points>=MAX_POINTS||strokes.length>=MAX_STROKES){status('Drawing limit reached. Save your work, then start another project.');return;}canvas.setPointerCapture(e.pointerId);active={tool,color:$('color').value,size:Number($('size').value),points:[position(e)],pointer:e.pointerId};render();});
canvas.addEventListener('pointermove',e=>{if(!active||e.pointerId!==active.pointer)return;if(points+active.points.length>=MAX_POINTS){finish();status('Drawing limit reached. Save your project.');return;}const p=position(e),last=active.points.at(-1);if(Math.hypot(p[0]-last[0],p[1]-last[1])<1)return;active.points.push(p);render();});
for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,e=>{if(active?.pointer===e.pointerId)finish();});
for(const mode of ['pen','eraser'])$(mode).onclick=()=>{tool=mode;for(const m of ['pen','eraser'])$(m).setAttribute('aria-pressed',String(m===tool));};
$('size').oninput=()=>{$('size-label').value=$('size').value;};
$('undo').onclick=()=>{finish();if(strokes.length){const s=strokes.pop();points-=s.points.length;redo.push(s);dirty=true;render();}};
$('redo').onclick=()=>{if(redo.length){const s=redo.pop();strokes.push(s);points+=s.points.length;dirty=true;render();}};
$('clear').onclick=()=>{finish();if(!strokes.length||!confirm('Clear your drawing? Save a project first if you want to keep it.'))return;strokes=[];redo=[];points=0;dirty=true;render();status('Your drawing was cleared. The starter is unchanged.');};
$('challenge').onchange=()=>{finish();if(dirty&&!confirm('Change starting point and discard unsaved work?')){$('challenge').value=key;return;}key=$('challenge').value;strokes=[];redo=[];points=0;dirty=false;load();};
function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}
$('download').onclick=()=>{finish();canvas.toBlob(blob=>{if(blob){download(blob,`many-maybes-${key}.png`);status('Image download started. Save a project too if you want to edit later.');}else status('Image export failed. Please try again.');},'image/png');};
$('save').onclick=()=>{finish();const project=validateProject({format:'many-maybes-playground',version:1,challenge:key,strokes});download(new Blob([JSON.stringify(project)],{type:'application/json'}),`many-maybes-${key}.json`);dirty=false;status('Project download started. Keep the file to continue later.');};
$('open').onclick=()=>$('file').click();
$('file').onchange=async()=>{const f=$('file').files[0];$('file').value='';if(!f)return;try{if(f.size>MAX_BYTES)throw new Error('Project is too large. Maximum size is 4 MB.');const p=validateProject(JSON.parse(await f.text()));finish();if(dirty&&!confirm('Replace your unsaved drawing with this project?'))return;key=p.challenge;strokes=p.strokes;redo=[];points=strokes.reduce((n,s)=>n+s.points.length,0);dirty=false;await load();}catch(e){status(e instanceof SyntaxError?'Could not read this project. Choose a saved Many Maybes JSON file.':e.message);}};
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
load();
