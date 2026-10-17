// Keep examples closed on arrival; open only a deliberately linked challenge/example.
'use strict';
(() => {
 function revealLinkedSection() {
  let id;try { id=decodeURIComponent(location.hash.slice(1)); } catch { return; }
  if (!id) return;
  const target=document.getElementById(id);
  const section=target?.closest('details.challenge-gallery');
  if (!section) return;
  section.open=true;
  requestAnimationFrame(() => target.scrollIntoView({block:'start'}));
 }
 window.addEventListener('hashchange',revealLinkedSection);
 revealLinkedSection();
})();
