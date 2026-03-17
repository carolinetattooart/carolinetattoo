/* ─ SCROLL REVEAL (exact Flavio translateY 150px → 0) ─ */
function reveal() {
  // Hero
  document.querySelector('.hero-title')?.classList.add('visible');
  setTimeout(() => document.querySelector('.hero-sub')?.classList.add('visible'), 100);

  // Cards
  const cards = document.querySelectorAll('.reveal-card');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });
  cards.forEach(c => obs.observe(c));

  // About card
  const aboutCard = document.querySelector('.about-card');
  if (aboutCard) obs.observe(aboutCard);
}

/* ─ NAV SCROLL ─ */
window.addEventListener('scroll', () => {
  document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ─ LIGHTBOX ─ */
const allImgs  = document.querySelectorAll('.work-img img, .about-img img');
const lightbox = document.getElementById('lightbox');
const lbImg    = document.getElementById('lbImg');
const lbInfo   = document.getElementById('lbInfo');
const lbClose  = document.getElementById('lbClose');
const lbPrev   = document.getElementById('lbPrev');
const lbNext   = document.getElementById('lbNext');
let idx = 0;

allImgs.forEach((img, i) => {
  img.parentElement.style.cursor = 'zoom-in';
  img.parentElement.addEventListener('click', () => open(i));
});

function open(i) {
  idx = i;
  show();
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function show() {
  lbImg.src = allImgs[idx].src;
  lbInfo.textContent = `${idx + 1} / ${allImgs.length}`;
}
function close() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}
lbClose.addEventListener('click', close);
lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });
lbPrev.addEventListener('click',  () => { idx = (idx - 1 + allImgs.length) % allImgs.length; show(); });
lbNext.addEventListener('click',  () => { idx = (idx + 1) % allImgs.length; show(); });
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')      close();
  if (e.key === 'ArrowLeft')  { idx = (idx - 1 + allImgs.length) % allImgs.length; show(); }
  if (e.key === 'ArrowRight') { idx = (idx + 1) % allImgs.length; show(); }
});

/* ─ INIT ─ */
document.addEventListener('DOMContentLoaded', reveal);
