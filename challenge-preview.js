'use strict';
(() => {
  const region = document.querySelector('.challenge-preview');
  if (!region) return;
  const slides = [...region.querySelectorAll('.challenge-slide')];
  if (!slides.length) return;
  const previous = document.getElementById('preview-previous');
  const next = document.getElementById('preview-next');
  const input = document.getElementById('preview-number');
  const status = document.getElementById('preview-status');
  let current = 0;
  function show(index, updateURL = true) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => { slide.hidden = i !== current; });
    input.value = slides[current].dataset.number;
    status.textContent = `Challenge ${input.value} of ${slides.length}`;
    if (updateURL) history.replaceState(null, '', '#challenge-' + input.value.padStart(2, '0'));
  }
  function fromHash() {
    const match = /^#challenge-(\d+)$/.exec(location.hash);
    const index = match ? slides.findIndex(s => Number(s.dataset.number) === Number(match[1])) : -1;
    show(index < 0 ? 0 : index, false);
  }
  previous.hidden = next.hidden = false;
  document.getElementById('preview-controls').hidden = false;
  previous.addEventListener('click', () => show(current - 1));
  next.addEventListener('click', () => show(current + 1));
  document.getElementById('preview-jump').addEventListener('submit', event => {
    event.preventDefault();
    if (!input.reportValidity()) return;
    const index = slides.findIndex(s => Number(s.dataset.number) === input.valueAsNumber);
    if (index >= 0) show(index);
  });
  region.addEventListener('keydown', event => {
    if (event.target.matches('input, textarea, select') || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      show(current + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  window.addEventListener('hashchange', fromHash);
  fromHash();
})();
