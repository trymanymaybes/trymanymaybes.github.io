'use strict';
// Keep the authenticated pilot restricted to Challenge 01. Other entries use email.
(() => {
 const labels=Object.freeze({'01':'Challenge 01','02':'Challenge 02','03':'Challenge 03','04':'Challenge 04','05':'Challenge 05',blank:'Free creation'});
 const requested=new URLSearchParams(location.search).get('challenge');
 const key=Object.hasOwn(labels,requested)?requested:'01', label=labels[key];
 window.MM_SUBMISSION_CONTEXT=Object.freeze({key,label});
 if(key!=='01' && window.MM_SUBMISSION_CONFIG) window.MM_SUBMISSION_CONFIG=Object.freeze({...window.MM_SUBMISSION_CONFIG,enabled:false});
 document.getElementById('submission-challenge').textContent=label+' · Your interpretation';
 const back=document.getElementById('submission-back');
 back.href=key==='blank'?'playground/?challenge=blank':'challenge-'+key+'.html';
 back.textContent=key==='blank'?'← Back to playground':'← Back to '+label.toLowerCase();
 document.title='Submit '+label.toLowerCase()+' · Many Maybes';
 if(window.MM_SUBMISSION_CONFIG?.enabled) document.getElementById('submission-instructions').textContent='Sign in with Google below first. Choose your Google account and return to this page, then select your downloaded playground image, add a title and publication permission, and click Prepare my submission. Confirm you are 18 or older, complete verification and click Submit for private review. Keep the receipt to check your submission status. Signing in alone does not submit anything. You can also use the email option.';
})();
