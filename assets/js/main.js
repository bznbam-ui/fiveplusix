/* ── FIVEPLUSIX — SHARED JS ─────────────────────────── */
/* Deploy trigger: Cloudflare Pages rebuild */

/* PRELOADER */
window.addEventListener('DOMContentLoaded', () => {
  const pre  = document.getElementById('preloader');
  const word = document.getElementById('pre-word');
  const line = document.getElementById('pre-line');
  if (!pre) return;
  setTimeout(() => { word.classList.add('vis'); line.classList.add('vis'); }, 60);
  setTimeout(() => pre.classList.add('done'), 1800);
});

/* NAV — scroll state + active link */
(function () {
  const nav = document.getElementById('nav');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', scrollY > 50);
    // Highlight the nav link whose page we're on (data-page attribute on <body>)
    const page = document.body.dataset.page || '';
    document.querySelectorAll('.nav-links a').forEach(a => {
      a.classList.toggle('active', a.dataset.page === page);
    });
  }, { passive: true });

  // Set on load too
  const page = document.body.dataset.page || '';
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === page);
  });
})();

/* MOBILE NAV */
const hbg   = document.getElementById('hbg');
const mNav  = document.getElementById('mNav');
const mClose = document.getElementById('mClose');
if (hbg && mNav && mClose) {
  hbg.addEventListener('click',   () => mNav.classList.add('open'));
  mClose.addEventListener('click', () => mNav.classList.remove('open'));
  mNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mNav.classList.remove('open')));
}

/* CROSSHAIR CURSOR */
(function () {
  const cur = document.getElementById('cur');
  if (!cur) return;

  window.addEventListener('mousemove', e => {
    cur.style.left = e.clientX + 'px';
    cur.style.top  = e.clientY + 'px';
  }, { passive: true });

  document.querySelectorAll('a,button,.w-cell,.net-card,.div-card,.svc-item,.proj-card,.artist-card,.film-card,.team-card,.roster-card').forEach(el => {
    el.addEventListener('mouseenter', () => { cur.classList.add('hover'); cur.classList.remove('link'); });
    el.addEventListener('mouseleave', () => { cur.classList.remove('hover'); cur.classList.remove('link'); });
  });

  document.querySelectorAll('a,.btn-fill,.f-submit').forEach(el => {
    el.addEventListener('mouseenter', () => cur.classList.add('link'));
    el.addEventListener('mouseleave', () => cur.classList.remove('link'));
  });

  document.addEventListener('mouseleave', () => cur.style.opacity = '0');
  document.addEventListener('mouseenter', () => cur.style.opacity = '1');
})();

/* SCROLL REVEAL */
(function () {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis'); });
  }, { threshold: 0.07, rootMargin: '0px 0px -32px 0px' });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
})();

/* PROJECT FILTER (work.html) */
(function () {
  const btns  = document.querySelectorAll('.pf-btn');
  const cards = document.querySelectorAll('.proj-card[data-cat]');
  if (!btns.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;
      cards.forEach(c => {
        const show = cat === 'all' || c.dataset.cat === cat;
        c.classList.toggle('hidden', !show);
      });
    });
  });
})();
