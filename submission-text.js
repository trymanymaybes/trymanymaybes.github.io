'use strict';
// Text is retained verbatim (apart from control characters) in explanation.
// The JPEG is a presentation copy for the existing moderated gallery.
(function(root){
 const LIMIT=800;
 function normalizeText(value){return String(value).normalize('NFC').replace(/\r\n?/g,'\n').replace(/[\u0000-\u0008\u000b-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g,'');}
 function validateText(value){const text=normalizeText(value).trim();if(!text)throw Error('Write your idea, prompt or text first.');if(text.length>LIMIT)throw Error('Keep your text within 800 characters.');return text;}
 function wrapText(ctx,text,width){
  const lines=[];
  for(const paragraph of text.split('\n')){
   let line='';
   // Character-level wrapping also handles long URLs and languages without spaces.
   for(const char of Array.from(paragraph)){
    if(line && ctx.measureText(line+char).width>width){
     const space=line.lastIndexOf(' ');
     if(space>line.length/2){lines.push(line.slice(0,space));line=line.slice(space+1)+char;}
     else{lines.push(line);line=char;}
    }else line+=char;
   }
   lines.push(line);
  }
  return lines;
 }
 async function makeCard(text){
  text=validateText(text);
  const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1440;
  const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)throw Error('Text preview is unavailable in this browser.');
  ctx.fillStyle='#f6f1e7';ctx.fillRect(0,0,1080,1440);
  ctx.fillStyle='#24483e';ctx.font='bold 42px sans-serif';ctx.fillText('many maybes.',80,100);
  ctx.font='24px sans-serif';ctx.fillText('AN IDEA IN WORDS',80,158);
  // Blank lines are retained in stored text; collapse repeated blank lines only on the card.
  const display=text.replace(/\n{3,}/g,'\n\n');let size=48,lines;
  do{ctx.font=size+'px sans-serif';lines=wrapText(ctx,display,920);if(lines.length*size*1.4<=1080)break;size-=2;}while(size>=20);
  if(size<20)throw Error('This text needs too many lines for the preview. Use fewer line breaks.');
  ctx.textBaseline='top';lines.forEach((line,i)=>ctx.fillText(line,80,230+i*size*1.4));
  ctx.font='22px sans-serif';ctx.fillText('One start. Many possibilities.',80,1360);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.92));
  canvas.width=1;canvas.height=1;if(!blob)throw Error('Could not prepare your text card. Please try again.');return blob;
 }
 const api={LIMIT,normalizeText,validateText,wrapText,makeCard};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 root.MM_TEXT_SUBMISSION=api;
})(typeof window==='undefined'?globalThis:window);
