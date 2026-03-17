gsap.registerPlugin(ScrollTrigger);

/* ─── LENIS SMOOTH SCROLL ─── */
const lenis = new Lenis({
  duration: 1.2,
  easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
});
function raf(time) {
  lenis.raf(time);
  ScrollTrigger.update();
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

/* ─── PRELOADER ─── */
const preloader  = document.getElementById('preloader');
const preCounter = document.getElementById('preCounter');
const preFill    = document.getElementById('preFill');
let count = 0;
const interval = setInterval(() => {
  count += Math.floor(Math.random() * 12) + 4;
  if (count >= 100) {
    count = 100;
    clearInterval(interval);
    setTimeout(() => {
      preloader.classList.add('done');
      initAnimations();
    }, 200);
  }
  preCounter.textContent = count;
  preFill.style.width = count + '%';
}, 60);

/* ─── CURSOR ─── */
const cursor   = document.getElementById('cursor');
const follower = document.getElementById('cursorFollower');
let mx = 0, my = 0, fx = 0, fy = 0;

window.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx + 'px';
  cursor.style.top  = my + 'px';
});

(function animFollower() {
  fx += (mx - fx) * 0.1;
  fy += (my - fy) * 0.1;
  follower.style.left = fx + 'px';
  follower.style.top  = fy + 'px';
  requestAnimationFrame(animFollower);
})();

document.querySelectorAll('.link-hover, .g-item, .filter-btn, .lb-close, .lb-prev, .lb-next').forEach(el => {
  el.addEventListener('mouseenter', () => follower.classList.add('hover'));
  el.addEventListener('mouseleave', () => follower.classList.remove('hover'));
});

/* ─── SPLIT & ANIMATE TITLES (exact Olha technique) ─── */
function splitAnimationTitle(el) {
  if (el.dataset.split) return;
  const words = el.textContent.trim().split(' ');
  el.textContent = '';
  words.forEach((word, wi) => {
    const wordSpan = document.createElement('span');
    wordSpan.style.display = 'inline-block';
    wordSpan.style.overflow = 'hidden';
    wordSpan.style.verticalAlign = 'bottom';
    word.split('').forEach(char => {
      const letterSpan = document.createElement('span');
      letterSpan.textContent = char;
      letterSpan.classList.add('letter');
      wordSpan.appendChild(letterSpan);
    });
    el.appendChild(wordSpan);
    if (wi < words.length - 1) el.append('\u00A0');
  });
  el.dataset.split = 'true';
}

function animateTitle(el, delay = 0) {
  splitAnimationTitle(el);
  const letters = el.querySelectorAll('.letter');
  gsap.fromTo(letters,
    { y: '-120%' },
    {
      y: '0%',
      duration: 1,
      ease: 'power3.out',
      stagger: { each: 0.05, from: 'center' },
      delay,
      scrollTrigger: {
        trigger: el,
        start: 'top 95%',
        end: 'bottom 30%',
        scrub: 1,
      }
    }
  );
}

/* ─── HEADER SCROLL ─── */
const header = document.getElementById('header');
lenis.on('scroll', ({ scroll }) => {
  header.classList.toggle('scrolled', scroll > 50);
});

/* ─── INIT ALL ANIMATIONS ─── */
function initAnimations() {
  // Animate all .animation-title elements
  document.querySelectorAll('.animation-title').forEach((el, i) => {
    animateTitle(el, i === 0 ? 0.1 : 0);
  });

  // Grid items stagger reveal
  gsap.fromTo('.g-item',
    { opacity: 0, y: 40 },
    {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: 'power3.out',
      stagger: { each: 0.06, from: 'start' },
      scrollTrigger: {
        trigger: '.gallery__grid',
        start: 'top 85%',
      }
    }
  );

  // CTA body reveal
  gsap.fromTo('.cta__body',
    { opacity: 0, x: 40 },
    {
      opacity: 1, x: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.cta', start: 'top 70%' }
    }
  );
}

/* ─── FILTER ─── */
const filterBtns = document.querySelectorAll('.filter-btn');
const gridItems  = document.querySelectorAll('.g-item');
const countEl    = document.getElementById('filterCount');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.cat;
    let n = 0;
    gridItems.forEach(item => {
      const show = cat === 'all' || item.dataset.cat === cat;
      item.classList.toggle('hidden', !show);
      if (show) n++;
    });
    countEl.textContent = n + ' piezas';
    ScrollTrigger.refresh();
  });
});

/* ─── LIGHTBOX ─── */
const lightbox  = document.getElementById('lightbox');
const lbImg     = document.getElementById('lbImg');
const lbCaption = document.getElementById('lbCaption');
const lbClose   = document.getElementById('lbClose');
const lbPrev    = document.getElementById('lbPrev');
const lbNext    = document.getElementById('lbNext');
let currentIdx = 0, visibleList = [];

function getVisible() {
  return [...gridItems].filter(i => !i.classList.contains('hidden'));
}
function openLb(idx) {
  visibleList = getVisible();
  currentIdx  = idx;
  showLb();
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
  lenis.stop();
}
function showLb() {
  const item  = visibleList[currentIdx];
  const img   = item.querySelector('img');
  const cat   = item.querySelector('.g-cat');
  const num   = item.querySelector('.g-num');
  lbImg.src   = img.src;
  lbCaption.textContent = `${cat?.textContent || ''} — ${num?.textContent || ''} / ${visibleList.length}`;
}
function closeLb() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  lenis.start();
}
gridItems.forEach(item => {
  item.addEventListener('click', () => {
    visibleList = getVisible();
    openLb(visibleList.indexOf(item));
  });
});
lbClose.addEventListener('click', closeLb);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLb(); });
lbPrev.addEventListener('click', () => { currentIdx = (currentIdx - 1 + visibleList.length) % visibleList.length; showLb(); });
lbNext.addEventListener('click', () => { currentIdx = (currentIdx + 1) % visibleList.length; showLb(); });
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')      closeLb();
  if (e.key === 'ArrowLeft')  { currentIdx = (currentIdx - 1 + visibleList.length) % visibleList.length; showLb(); }
  if (e.key === 'ArrowRight') { currentIdx = (currentIdx + 1) % visibleList.length; showLb(); }
});
