// STAR WARS CANON ARCHIVE — INTERACTIVITY

const ICONS = {
  movie: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="currentColor" stroke-width="3" stroke-linecap="round">
      <line x1="14" y1="50" x2="46" y2="14"/>
      <line x1="50" y1="50" x2="18" y2="14"/>
      <circle cx="14" cy="52" r="3" fill="currentColor" stroke="none"/>
      <circle cx="50" cy="52" r="3" fill="currentColor" stroke="none"/>
    </g>
  </svg>`,
  series: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="32" cy="32" r="6" fill="currentColor" stroke="none"/>
      <path d="M20 32a12 12 0 0 1 24 0"/>
      <path d="M12 32a20 20 0 0 1 40 0"/>
      <path d="M32 44v10"/>
    </g>
  </svg>`
};

function iconFor(item) {
  return ICONS[item.type] || ICONS.movie;
}

const grid = document.getElementById('grid');
const filterBar = document.getElementById('filters');
const modalOverlay = document.getElementById('modal-overlay');
const modalContent = document.getElementById('modal-content');
const resultCount = document.getElementById('result-count');

let activeFilter = 'all';

function eraColor(era) {
  return (SW_ERAS[era] && SW_ERAS[era].color) || '#e8c468';
}

function sortedData() {
  return [...SW_DATA].sort((a, b) => a.order - b.order);
}

function buildFilters() {
  const groups = [
    { key: 'all', label: 'Full Archive' },
    { key: 'movie', label: 'Films' },
    { key: 'series', label: 'Series' },
  ];
  Object.entries(SW_ERAS).forEach(([key, val]) => {
    groups.push({ key: `era:${key}`, label: val.label });
  });

  filterBar.innerHTML = '';
  groups.forEach(g => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn' + (g.key === activeFilter ? ' active' : '');
    btn.textContent = g.label;
    btn.dataset.key = g.key;
    btn.addEventListener('click', () => {
      activeFilter = g.key;
      buildFilters();
      renderGrid();
    });
    filterBar.appendChild(btn);
  });
}

function matchesFilter(item) {
  if (activeFilter === 'all') return true;
  if (activeFilter === 'movie' || activeFilter === 'series') return item.type === activeFilter;
  if (activeFilter.startsWith('era:')) return item.era === activeFilter.slice(4);
  return true;
}

function renderGrid() {
  const items = sortedData().filter(matchesFilter);
  grid.innerHTML = '';
  items.forEach(item => grid.appendChild(renderCard(item)));
  resultCount.textContent = `${items.length} chronicle${items.length === 1 ? '' : 's'} found`;
}

function renderCard(item) {
  const color = eraColor(item.era);
  const card = document.createElement('button');
  card.className = 'card';
  card.style.setProperty('--card-color', color);
  card.setAttribute('aria-label', `${item.title} — open details`);
  card.innerHTML = `
    <div class="card-art">
      <span class="card-order">${typeof item.order === 'number' ? '№ ' + item.order.toFixed(1).replace('.0','') : ''}</span>
      <span class="card-type-tag">${item.type}</span>
      <span style="color:${color}">${iconFor(item)}</span>
    </div>
    <div class="card-body">
      <div class="subtitle">${item.subtitle || ''}</div>
      <h3>${item.title}</h3>
      <div class="year">${item.year}${item.seasons ? ' · ' + item.seasons : (item.runtime ? ' · ' + item.runtime : '')}</div>
    </div>
  `;
  card.addEventListener('click', () => openModal(item));
  return card;
}

function openModal(item) {
  const color = eraColor(item.era);
  modalContent.style.setProperty('--card-color', color);
  const metaBits = [];
  if (item.director) metaBits.push(`<b>Director</b> ${item.director}`);
  if (item.creator) metaBits.push(`<b>Creator</b> ${item.creator}`);
  if (item.runtime) metaBits.push(`<b>Runtime</b> ${item.runtime}`);
  if (item.seasons) metaBits.push(`<b>${item.seasons}</b>`);
  metaBits.push(`<b>Year</b> ${item.year}`);
  metaBits.push(`<b>Era</b> ${SW_ERAS[item.era]?.label || ''}`);

  modalContent.innerHTML = `
    <div class="modal-art" style="color:${color}">${iconFor(item)}</div>
    <button id="modal-close" aria-label="Close">&times;</button>
    <div class="modal-body">
      <div class="subtitle">${item.subtitle || ''}</div>
      <h2>${item.title}</h2>
      <div class="modal-meta">${metaBits.map(m => `<span>${m}</span>`).join('')}</div>
      <p class="modal-summary">${item.summary}</p>
      <div class="modal-tags">${(item.tags || []).map(t => `<span>${t}</span>`).join('')}</div>
    </div>
  `;
  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  document.getElementById('modal-close').addEventListener('click', closeModal);
  modalOverlay.focus();
}

function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// ---------------- Opening crawl ----------------
const themeAudio = document.getElementById('theme-audio');

// These must match the CSS: crawl-text has a 3.4s animation-delay
// (text starts scrolling then). Its scroll duration is set to match
// exactly when the music finishes fading out (16s + 3s fade = 19s),
// so the crawl ends right as the fade completes.
const CRAWL_TEXT_START = 3400;
const MUSIC_FADE_DELAY = 16000;  // start fading 16s after the music begins
const FADE_OUT_MS = 3000;        // how long that fade-out takes
const SKIP_FADE_MS = 400;        // quick fade if the user skips
const TARGET_VOLUME = 1;

let fadeRAF = null;
let themeStarted = false;
let crawlActive = true;
function cancelFade() {
  if (fadeRAF) cancelAnimationFrame(fadeRAF);
  fadeRAF = null;
}

function fadeAudio(toVolume, duration, onDone) {
  if (!themeAudio) { if (onDone) onDone(); return; }
  cancelFade();
  const fromVolume = themeAudio.volume;
  const start = performance.now();
  function step(now) {
    const t = Math.min(1, (now - start) / duration);
    themeAudio.volume = fromVolume + (toVolume - fromVolume) * t;
    if (t < 1) {
      fadeRAF = requestAnimationFrame(step);
    } else {
      fadeRAF = null;
      if (onDone) onDone();
    }
  }
  fadeRAF = requestAnimationFrame(step);
}

function playTheme() {
  if (!themeAudio || themeStarted) return;
  themeStarted = true;
  themeAudio.volume = 0;
  const p = themeAudio.play();
  const startFade = () => fadeAudio(TARGET_VOLUME, 800);
  // Browsers may block autoplay with sound until the user has interacted
  // with the page at least once; fail silently if so.
  if (p && p.then) p.then(startFade).catch(() => { themeStarted = false; });
  else startFade();
}

function stopTheme() {
  if (!themeAudio) return;
  cancelFade();
  themeAudio.pause();
  themeAudio.currentTime = 0;
  themeAudio.volume = TARGET_VOLUME;
}

function skipCrawl(quick) {
  crawlActive = false;
  cancelFade();
  const finish = () => {
    const screen = document.getElementById('crawl-screen');
    if (!screen) return;
    screen.classList.add('hidden');
    setTimeout(() => screen.remove(), 900);
  };
  if (quick) {
    // Manual skip: cut the music with a quick fade.
    fadeAudio(0, SKIP_FADE_MS, stopTheme);
  } else {
    // Natural end of crawl: music has already faded itself out.
    stopTheme();
  }
  finish();
}
document.getElementById('skip-crawl').addEventListener('click', (e) => {
  e.stopPropagation(); // don't also trigger the begin-prompt click below
  skipCrawl(true);
});

// The crawl (and its music) stay dormant behind a "Click to Begin"
// prompt. Starting on a real click means the browser always allows the
// audio to play — no autoplay-blocking, no guessing whether it worked.
const beginPrompt = document.getElementById('begin-prompt');
const crawlScreen = document.getElementById('crawl-screen');
let began = false;

function beginCrawl() {
  if (began) return;
  began = true;
  beginPrompt.classList.add('hidden');
  crawlScreen.classList.add('playing');

  // Music starts the moment the text begins scrolling, in sync with the
  // CSS animation-delay. 16 seconds later it starts fading out, and the
  // instant that fade finishes, the intro ends.
  setTimeout(() => { if (crawlActive) playTheme(); }, CRAWL_TEXT_START);
  setTimeout(() => {
    if (!crawlActive) return;
    fadeAudio(0, FADE_OUT_MS, () => { if (crawlActive) skipCrawl(false); });
  }, CRAWL_TEXT_START + MUSIC_FADE_DELAY);
}
beginPrompt.addEventListener('click', beginCrawl);
beginPrompt.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') beginCrawl();
});

// ---------------- Init ----------------
buildFilters();
renderGrid();
