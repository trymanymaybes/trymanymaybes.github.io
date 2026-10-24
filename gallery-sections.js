'use strict';
(() => {
 function revealLinkedSection() {
  let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}
  if(!id)return;
  const target=document.getElementById(id),section=target?.closest('details.challenge-gallery');
  if(!section)return;
  for(let parent=section;parent;parent=parent.parentElement)if(parent.tagName==='DETAILS')parent.open=true;
  requestAnimationFrame(()=>target.scrollIntoView({block:'start'}));
 }
 window.addEventListener('hashchange',revealLinkedSection);
 document.addEventListener('mm-gallery-ready',revealLinkedSection);
 revealLinkedSection();
})();
