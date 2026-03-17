// ─── HEADER SCROLL ───
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ─── FILTER ───
const filters = document.querySelectorAll('.filter');
const items   = document.querySelectorAll('.g-item');
const countEl = document.getElementById('galleryCount');

filters.forEach(btn => {
  btn.addEventListener('click', () => {
    filters.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.cat;
    let visible = 0;
    items.forEach(item => {
      const show = cat === 'all' || item.dataset.cat === cat;
      item.classList.toggle('hidden', !show);
      if (show) visible++;
    });
    countEl.textContent = `${visible} piezas`;
  });
});

// ─── LIGHTBOX ───
const lightbox = document.getElementById('lightbox');
const lbImg    = document.getElementById('lbImg');
const lbCaption= document.getElementById('lbCaption');
const lbClose  = document.getElementById('lbClose');
const lbPrev   = document.getElementById('lbPrev');
const lbNext   = document.getElementById('lbNext');

let currentIndex = 0;
let visibleItems  = [];

function openLightbox(index) {
  visibleItems = [...items].filter(i => !i.classList.contains('hidden'));
  currentIndex = index;
  showImage(currentIndex);
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function showImage(index) {
  const item = visibleItems[index];
  if (!item) return;
  const img  = item.querySelector('img');
  const label= item.querySelector('.g-info span');
  lbImg.src  = img.src;
  lbImg.alt  = img.alt;
  lbCaption.textContent = `${label ? label.textContent : ''} — ${index + 1} / ${visibleItems.length}`;
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

items.forEach((item, i) => {
  item.addEventListener('click', () => {
    visibleItems = [...items].filter(it => !it.classList.contains('hidden'));
    const vIndex = visibleItems.indexOf(item);
    openLightbox(vIndex);
  });
});

lbClose.addEventListener('click', closeLightbox);
lbPrev.addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
  showImage(currentIndex);
});
lbNext.addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % visibleItems.length;
  showImage(currentIndex);
});

lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') { currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length; showImage(currentIndex); }
  if (e.key === 'ArrowRight') { currentIndex = (currentIndex + 1) % visibleItems.length; showImage(currentIndex); }
});

// ─── REVEAL ───
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'none';
    }
  });
}, { threshold: 0.05 });

items.forEach(item => {
  item.style.opacity = '0';
  item.style.transform = 'translateY(20px)';
  item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  revealObs.observe(item);
});
