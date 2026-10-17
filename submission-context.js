'use strict';
(() => {
 const select=document.getElementById('submission-challenge-select'), status=document.getElementById('challenge-status');
 const query=new URLSearchParams(location.search);
 let requested=query.get('challenge');
 if(query.has('code')){try{requested=sessionStorage.getItem('mm-return-challenge')||requested;sessionStorage.removeItem('mm-return-challenge');}catch{}}
 window.MM_SUBMISSION_CONTEXT=null;
 function selectChallenge(){
  const option=select.selectedOptions[0];
  window.MM_SUBMISSION_CONTEXT=option?.value?Object.freeze({key:option.value,label:option.textContent}):null;
  const context=window.MM_SUBMISSION_CONTEXT;
  document.getElementById('submission-challenge').textContent=(context?.label||'Choose a challenge')+' · Your interpretation';
  document.title='Submit '+(context?.label||'your creation')+' · Many Maybes';
  const back=document.getElementById('submission-back');back.href='challenges.html';back.textContent='← All challenges';
  document.getElementById('submission-form').dispatchEvent(new Event('input',{bubbles:true}));
 }
 select.addEventListener('change',selectChallenge);
 async function load(){
  try{
   // Email preparation remains available before the public upload service is launched.
   const url=window.MM_SUBMISSION_CONFIG?.enabled?window.MM_SUBMISSION_CONFIG.gatewayUrl+'/challenges':'submission-challenges.json';
   const response=await fetch(url,{cache:'no-store'});if(!response.ok)throw Error();
   const data=await response.json();if(!Array.isArray(data.items)||data.items.length>1000)throw Error();
   const seen=new Set();
   for(const item of data.items){
    if(!item||typeof item.id!=='string'||!/^[a-z0-9][a-z0-9_-]{0,63}$/.test(item.id)||typeof item.title!=='string'||!item.title.trim()||item.title.length>120||seen.has(item.id))throw Error();
    seen.add(item.id);
   }
   for(const item of data.items){const option=document.createElement('option');option.value=item.id;option.textContent=item.title;select.append(option);}
   select.disabled=false;
   if(seen.has(requested))select.value=requested;
   else if(requested)status.textContent='That challenge is not open for submissions. Choose another starting point.';
   else status.textContent='Choose the challenge you used, or Free creation.';
   if(!data.items.length)status.textContent='No challenges are currently open for submissions.';
   selectChallenge();
  }catch{status.textContent='Could not load challenges. Reload this page to try again. Nothing has been sent.';}
 }
 if(window.MM_SUBMISSION_CONFIG?.enabled)document.getElementById('submission-instructions').textContent='Choose your challenge, then sign in with Google before selecting your image. Add a title and publication permission, prepare your image, complete verification and submit for private review. Keep your receipt to check its status. Up to three attempts per account per UTC day across all challenges.';
 load();
})();
