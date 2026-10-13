'use strict';
const MM_ORIGIN = 'https://trymanymaybes.github.io';
const MM_EMAIL = 'trymanymaybes@gmail.com';
const MAX_BYTES = 8 * 1024 * 1024;
const MAX_PIXELS = 24 * 1000 * 1000;
// Read dimensions before decoding. Never trust a file extension or MIME label alone.
function imageDimensions(buffer) {
  const b = new Uint8Array(buffer), d = new DataView(buffer);
  const png = [137,80,78,71,13,10,26,10];
  if (b.length >= 33 && png.every((v,i) => b[i] === v)) {
    if (d.getUint32(8) !== 13 || String.fromCharCode(...b.slice(12,16)) !== 'IHDR') throw Error('Invalid PNG header.');
    return {width:d.getUint32(16), height:d.getUint32(20), type:'image/png'};
  }
  if (b.length > 4 && b[0] === 255 && b[1] === 216) {
    let i=2;
    const sof = new Set([192,193,194,195,197,198,199,201,202,203,205,206,207]);
    while (i < b.length) {
      if (b[i++] !== 255) throw Error('Invalid JPEG marker.');
      while (i < b.length && b[i] === 255) i++;
      if (i >= b.length) break;
      const marker=b[i++];
      if (marker === 217 || marker === 218) break;
      if (marker === 1 || (marker >= 208 && marker <= 215)) continue;
      if (i+2>b.length) break;
      const length=d.getUint16(i);
      if (length<2 || i+length>b.length) throw Error('Incomplete JPEG.');
      if (sof.has(marker)) {
        if (length<8) throw Error('Invalid JPEG dimensions.');
        return {height:d.getUint16(i+3),width:d.getUint16(i+5),type:'image/jpeg'};
      }
      i+=length;
    }
  }
  throw Error('Choose a valid JPEG or PNG image. SVG, GIF and other formats are not accepted.');
}
function validateDimensions(dim) {
  if (!Number.isInteger(dim.width) || !Number.isInteger(dim.height) || dim.width<1 || dim.height<1 || dim.width>12000 || dim.height>12000 || dim.width*dim.height>MAX_PIXELS) throw Error('Choose an image up to 24 megapixels and 12,000 pixels per side.');
  return dim;
}
function cleanText(s,max) {return String(s).normalize('NFC').replace(/[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g,' ').trim().slice(0,max);}
function submissionText(title,name,reason) {
 return `Challenge: 01 - A few marks, many possibilities.\nTitle: ${cleanText(title,90)}\nPublic pseudonym: ${cleanText(name,40)||'Anonymous creator'}\nExplanation: ${cleanText(reason,800)||'(none)'}\n\nI am 18 or older. This is my work or I have permission to share it. I permit Many Maybes to publish the reviewed image, title, public pseudonym and explanation on its public gallery. My sender email must not be published.\n\nI have attached the prepared image and checked it for visible personal information.\n\nPlease reply with a gallery link if selected. I can reply to withdraw publication permission.`;
}
if (typeof module !== 'undefined' && module.exports) module.exports={imageDimensions,validateDimensions,cleanText,submissionText};
if (typeof document !== 'undefined') {
 const samplePages = new Set(['orbit-garden.html','maybe-machine.html','worlds-in-conversation.html','cultural-park.html','underwater.html','artists-desk.html']);
 const filename=location.pathname.split('/').pop();
 if(samplePages.has(filename) && new URLSearchParams(location.search).has('embed')) document.body.classList.add('embed');
 const toast=t=>{const el=document.querySelector('.toast');el.textContent=t;clearTimeout(window.mmToastTimer);window.mmToastTimer=setTimeout(()=>{el.textContent='';},6000);};
 async function copy(text){try{await navigator.clipboard.writeText(text);toast('Copied.');}catch{window.prompt('Copy this text:',text);}}
 const canonical=document.querySelector('link[rel="canonical"]')?.href;
 document.querySelector('[data-action="copy-link"]')?.addEventListener('click',()=>copy(canonical));
 document.querySelector('[data-action="embed"]')?.addEventListener('click',()=>{
  const panel=document.querySelector('#embed-panel');panel.hidden=!panel.hidden;
  document.querySelector('#embed-code').value=`<iframe src="${MM_ORIGIN}/${filename}?embed=1" title="Many Maybes interpretation" width="560" height="650" loading="lazy" sandbox="allow-scripts" referrerpolicy="no-referrer"></iframe>`;
 });
 document.querySelector('[data-action="copy-embed"]')?.addEventListener('click',()=>copy(document.querySelector('#embed-code').value));
 const form=document.querySelector('#submission-form');
 if(form){
  let preparedBlob=null, preparedURL=null, message='', version=0;
  const prepared=document.querySelector('#prepared'), status=document.querySelector('#status'), preview=document.querySelector('#preview'), submitButton=form.querySelector('[type="submit"]');
  function reset(){document.dispatchEvent(new CustomEvent('mm-reset'));version++;preparedBlob=null;message='';prepared.hidden=true;document.querySelector('#email-draft').removeAttribute('href');preview.removeAttribute('src');if(preparedURL)URL.revokeObjectURL(preparedURL);preparedURL=null;status.textContent='';submitButton.disabled=false;}
  form.addEventListener('input',reset);
  window.addEventListener('pagehide',reset);
  if(window.self!==window.top){document.querySelector('#submission-panel').hidden=true;const p=document.createElement('p');p.textContent='Open the original Many Maybes submission page directly to prepare an image.';document.querySelector('main').append(p);}
  form.addEventListener('submit',async e=>{
   e.preventDefault();if(window.self!==window.top)return;
   reset();const attempt=version;
   if(!form.reportValidity())return;
   const file=document.querySelector('#file').files[0], title=cleanText(document.querySelector('#title').value,90), name=cleanText(document.querySelector('#name').value,40), reason=cleanText(document.querySelector('#reason').value,800);
   if(!title){status.textContent='Please give your interpretation a title.';return;}
   if(!file || !file.size || file.size>MAX_BYTES){status.textContent='Choose a JPEG or PNG up to 8 MB.';return;}
   submitButton.disabled=true;status.textContent='Preparing your image locally…';
   let bitmap;
   try{
    if(typeof createImageBitmap!=='function')throw Error('This browser cannot prepare images. Use a recent browser, or email a metadata-cleaned image with publication permission.');
    const dim=validateDimensions(imageDimensions(await file.arrayBuffer()));
    if(file.type && file.type!==dim.type)throw Error('The file type does not match its contents. Export a fresh JPEG or PNG.');
    bitmap=await createImageBitmap(file,{imageOrientation:'from-image'});
    validateDimensions({width:bitmap.width,height:bitmap.height});
    if(attempt!==version)return;
    const scale=Math.min(1,2048/Math.max(bitmap.width,bitmap.height));
    const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
    const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)throw Error('Image preparation is unavailable.');
    ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.9));
    canvas.width=1;canvas.height=1;
    if(attempt!==version)return;
    if(!blob)throw Error('Could not prepare this image. Try exporting a fresh JPEG.');
    preparedBlob=blob;preparedURL=URL.createObjectURL(blob);preview.src=preparedURL;
    document.querySelector('#preview-title').textContent=title;
    document.querySelector('#preview-credit').textContent=name||'Anonymous creator';
    document.querySelector('#preview-reason').textContent=reason;
    message=submissionText(title,name,reason);document.dispatchEvent(new CustomEvent('mm-prepared',{detail:{blob,title,name,reason}}));
    document.querySelector('#email-draft').href=`mailto:${MM_EMAIL}?subject=${encodeURIComponent('Many Maybes - Challenge 01 submission')}&body=${encodeURIComponent(message)}`;
    prepared.hidden=false;status.textContent='Prepared locally. Nothing has been sent. Download the image, then attach it to the email draft.';
   }catch(err){if(attempt===version)status.textContent=err instanceof Error?err.message:'Image preparation failed. Try a different JPEG or PNG.';}
   finally{bitmap?.close();if(attempt===version)submitButton.disabled=false;}
  });
  document.querySelector('[data-action="download-prepared"]').addEventListener('click',()=>{if(!preparedBlob||!preparedURL)return;const a=document.createElement('a');a.href=preparedURL;a.download='many-maybes-challenge-01.jpg';a.click();toast('Attach the downloaded JPEG to your email draft.');});
  document.querySelector('[data-action="copy-submission"]').addEventListener('click',()=>{if(message)copy(message);});
 }
}
