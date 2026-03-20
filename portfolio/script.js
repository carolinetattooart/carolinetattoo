document.addEventListener('DOMContentLoaded', function() {

  /* ── LENIS smooth scroll ── */
  var lenis = null;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      easing: function(t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true
    });
    (function tick(t) { lenis.raf(t); requestAnimationFrame(tick); })(0);
    lenis.on('scroll', function(e) {
      document.getElementById('nav').classList.toggle('on', e.scroll > 40);
    });
  } else {
    window.addEventListener('scroll', function() {
      document.getElementById('nav').classList.toggle('on', window.scrollY > 40);
    }, { passive: true });
  }

  /* ━━ SPELL UI — BLUR REVEAL ━━
     Port of blur-reveal.tsx: split into chars, stagger reveal with blur */
  function spellBlur(el) {
    var text = el.textContent;
    el.innerHTML = '';
    el.setAttribute('aria-label', text);
    var stagger = 0.022; // matches spell-ui default stagger
    text.split('').forEach(function(ch, i) {
      var span = document.createElement('span');
      span.className = 'spell-blur-char';
      span.textContent = ch === ' ' ? '\u00A0' : ch;
      span.style.transitionDelay = (i * stagger) + 's';
      el.appendChild(span);
    });
    // Trigger after paint
    requestAnimationFrame(function() {
      el.querySelectorAll('.spell-blur-char').forEach(function(s) {
        s.classList.add('revealed');
      });
    });
  }

  /* ━━ SPELL UI — WORDS STAGGER ━━
     Port of words-stagger.tsx: each word fades+blurs in */
  function spellWords(el) {
    var text = el.textContent;
    el.innerHTML = '';
    el.setAttribute('aria-label', text);
    var words = text.split(' ');
    var stagger = 0.08;
    words.forEach(function(word, i) {
      var span = document.createElement('span');
      span.className = 'spell-word';
      span.textContent = word;
      span.style.transitionDelay = (i * stagger) + 's';
      el.appendChild(span);
      if (i < words.length - 1) el.append(' ');
    });
    requestAnimationFrame(function() {
      el.querySelectorAll('.spell-word').forEach(function(s) {
        s.classList.add('revealed');
      });
    });
  }

  /* ━━ SPELL UI — SLIDE UP ━━
     Port of slide-up transitions: reveal on scroll */
  function spellSlideReveal(el) {
    el.classList.add('revealed');
  }

  /* ── INTERSECTION OBSERVER for scroll-triggered elements ── */
  var io = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (!e.isIntersecting) return;

      var el = e.target;
      var type = el.getAttribute('data-spell');

      if (type === 'blur') {
        spellBlur(el);
      } else if (type === 'words') {
        spellWords(el);
      } else if (type === 'slide' || el.classList.contains('case') || el.classList.contains('spell-slide')) {
        spellSlideReveal(el);
      } else {
        el.classList.add('revealed');
      }

      io.unobserve(el);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

  // Observe all spell elements + cases
  document.querySelectorAll('[data-spell], .case, .spell-slide').forEach(function(el) {
    io.observe(el);
  });

  /* ── CAROUSEL — manual + swipe ── */
  var state = {};
  var cntMap = { c1: 'n1', c2: 'n2', c3: 'n3' };

  document.querySelectorAll('.carousel').forEach(function(car) {
    var id = car.id;
    state[id] = { slides: Array.from(car.querySelectorAll('.sl')), cur: 0, busy: false };
  });

  function go(cid, dir) {
    var s = state[cid];
    if (!s || s.busy || s.slides.length < 2) return;
    s.busy = true;
    var old = s.cur;
    s.cur = (s.cur + dir + s.slides.length) % s.slides.length;
    var next = s.cur;
    s.slides[old].classList.add('out');
    setTimeout(function() {
      s.slides[old].classList.remove('active','out');
      s.slides[next].classList.add('active','in');
      setTimeout(function() { s.slides[next].classList.remove('in'); s.busy = false; }, 320);
      var cnt = document.getElementById(cntMap[cid]);
      if (cnt) cnt.textContent = (next + 1) + ' / ' + s.slides.length;
    }, 260);
  }

  document.querySelectorAll('.cb').forEach(function(btn) {
    btn.addEventListener('click', function() { go(btn.getAttribute('data-c'), parseInt(btn.getAttribute('data-d'))); });
  });

  document.querySelectorAll('.carousel').forEach(function(car) {
    var cid = car.id, startX = 0, startY = 0, tracking = false;
    car.addEventListener('touchstart', function(e) {
      startX = e.touches[0].clientX; startY = e.touches[0].clientY; tracking = true;
    }, { passive: true });
    car.addEventListener('touchmove', function(e) {
      if (!tracking) return;
      var dx = Math.abs(e.touches[0].clientX - startX);
      var dy = Math.abs(e.touches[0].clientY - startY);
      if (dx > dy && dx > 8) e.preventDefault();
    }, { passive: false });
    car.addEventListener('touchend', function(e) {
      if (!tracking) return; tracking = false;
      var diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) < 40) return;
      go(cid, diff > 0 ? 1 : -1);
    }, { passive: true });
  });

  /* ── LIGHTBOX ── */
  var allImgs = Array.from(document.querySelectorAll('.sl img'));
  var lb = document.getElementById('lb');
  var lbi = document.getElementById('lb-i');
  var lbc = document.getElementById('lb-c');
  var idx = 0;

  allImgs.forEach(function(img, i) {
    img.addEventListener('click', function() {
      idx = i; lbi.src = img.src;
      lbc.textContent = (i+1) + ' / ' + allImgs.length;
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
      if (lenis) lenis.stop();
    });
  });
  function lbClose() { lb.classList.remove('open'); document.body.style.overflow = ''; if (lenis) lenis.start(); }
  function lbGo(i) { idx=(i+allImgs.length)%allImgs.length; lbi.src=allImgs[idx].src; lbc.textContent=(idx+1)+' / '+allImgs.length; }
  document.getElementById('lb-x').onclick = lbClose;
  lb.addEventListener('click', function(e) { if (e.target===lb) lbClose(); });
  document.getElementById('lb-p').onclick = function() { lbGo(idx-1); };
  document.getElementById('lb-n').onclick = function() { lbGo(idx+1); };
  document.addEventListener('keydown', function(e) {
    if (!lb.classList.contains('open')) return;
    if (e.key==='Escape') lbClose();
    if (e.key==='ArrowLeft') lbGo(idx-1);
    if (e.key==='ArrowRight') lbGo(idx+1);
  });

});
