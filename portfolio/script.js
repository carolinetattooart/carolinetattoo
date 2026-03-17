document.addEventListener('DOMContentLoaded', function() {

  /* ── LENIS SMOOTH SCROLL ── */
  var lenis = null;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      easing: function(t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true
    });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    lenis.on('scroll', function(e) {
      document.getElementById('nav').classList.toggle('scrolled', e.scroll > 40);
    });
  } else {
    window.addEventListener('scroll', function() {
      document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  /* ── HERO REVEAL ── */
  document.querySelector('.hero-quote').classList.add('visible');
  setTimeout(function() {
    document.querySelector('.hero-sub').classList.add('visible');
  }, 120);

  /* ── CASE REVEAL ON SCROLL ── */
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

  document.querySelectorAll('.case').forEach(function(el) {
    observer.observe(el);
  });

  /* ── CAROUSEL ── */
  var carousels = {};

  document.querySelectorAll('.carousel').forEach(function(car) {
    var id = car.id;
    var slides = Array.from(car.querySelectorAll('.slide'));
    carousels[id] = { slides: slides, cur: 0 };
  });

  document.querySelectorAll('.car-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var carId = btn.getAttribute('data-car');
      var dir   = parseInt(btn.getAttribute('data-dir'));
      var c     = carousels[carId];
      if (!c) return;

      var oldIdx = c.cur;
      c.cur = (c.cur + dir + c.slides.length) % c.slides.length;

      // animate out old
      c.slides[oldIdx].classList.add('anim-out');
      var newIdx = c.cur;
      setTimeout(function() {
        c.slides[oldIdx].classList.remove('active', 'anim-out');
        c.slides[newIdx].classList.add('active', 'anim-in');
        setTimeout(function() {
          c.slides[newIdx].classList.remove('anim-in');
        }, 350);
        // update counter
        var cntEl = document.getElementById('cnt-' + carId.replace('car-', ''));
        if (cntEl) cntEl.textContent = (newIdx + 1) + ' / ' + c.slides.length;
      }, 280);
    });
  });

  /* ── LIGHTBOX ── */
  var allImgs = Array.from(document.querySelectorAll('.slide img'));
  var lb      = document.getElementById('lightbox');
  var lbImg   = document.getElementById('lb-img');
  var lbInfo  = document.getElementById('lb-info');
  var lbIdx   = 0;

  allImgs.forEach(function(img, i) {
    img.addEventListener('click', function() {
      lbIdx = i;
      lbImg.src = img.src;
      lbInfo.textContent = (i + 1) + ' / ' + allImgs.length;
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
      if (lenis) lenis.stop();
    });
  });

  function lbClose() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    if (lenis) lenis.start();
  }
  function lbShow(idx) {
    lbImg.src = allImgs[idx].src;
    lbInfo.textContent = (idx + 1) + ' / ' + allImgs.length;
  }

  document.getElementById('lb-close').addEventListener('click', lbClose);
  lb.addEventListener('click', function(e) { if (e.target === lb) lbClose(); });
  document.getElementById('lb-prev').addEventListener('click', function() {
    lbIdx = (lbIdx - 1 + allImgs.length) % allImgs.length; lbShow(lbIdx);
  });
  document.getElementById('lb-next').addEventListener('click', function() {
    lbIdx = (lbIdx + 1) % allImgs.length; lbShow(lbIdx);
  });
  document.addEventListener('keydown', function(e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape')      lbClose();
    if (e.key === 'ArrowLeft')  { lbIdx = (lbIdx - 1 + allImgs.length) % allImgs.length; lbShow(lbIdx); }
    if (e.key === 'ArrowRight') { lbIdx = (lbIdx + 1) % allImgs.length; lbShow(lbIdx); }
  });

});
