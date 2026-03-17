/* ── NAV ── */
window.addEventListener('scroll', () => {
  document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

/* ── REVEAL ── */
function initReveal() {
  document.querySelector('.hero-title')?.classList.add('visible');
  setTimeout(() => document.querySelector('.hero-sub')?.classList.add('visible'), 120);

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -30px 0px' });

  document.querySelectorAll('.reveal-case').forEach(el => obs.observe(el));
}

/* ── LIGHTBOX ── */
const allImgs  = document.querySelectorAll('.case-img img');
const lightbox = document.getElementById('lightbox');
const lbImg    = document.getElementById('lbImg');
const lbInfo   = document.getElementById('lbInfo');
let idx = 0;

allImgs.forEach((img, i) => {
  img.parentElement.addEventListener('click', () => { idx = i; show(); lightbox.classList.add('open'); document.body.style.overflow = 'hidden'; });
});

function show() {
  lbImg.src = allImgs[idx].src;
  lbInfo.textContent = `${idx + 1} / ${allImgs.length}`;
}
function close() { lightbox.classList.remove('open'); document.body.style.overflow = ''; }

document.getElementById('lbClose').addEventListener('click', close);
lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });
document.getElementById('lbPrev').addEventListener('click', () => { idx = (idx - 1 + allImgs.length) % allImgs.length; show(); });
document.getElementById('lbNext').addEventListener('click', () => { idx = (idx + 1) % allImgs.length; show(); });
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') close();
  if (e.key === 'ArrowLeft')  { idx = (idx - 1 + allImgs.length) % allImgs.length; show(); }
  if (e.key === 'ArrowRight') { idx = (idx + 1) % allImgs.length; show(); }
});

document.addEventListener('DOMContentLoaded', initReveal);
