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

// The crawl is driven frame by frame rather than by a fixed-length CSS
// animation. The text starts fully below the screen, moves at a steady
// reading pace (about one line a second), and the intro ends as soon
// as the last line has receded into the distance. There's no dead air
// at the end, and the pacing is the same on any screen size.
const CRAWL_TEXT_START = 3400;   // after the title card has faded
const SECONDS_PER_LINE = 1.05;   // reading pace
const END_FADE_MS = 2500;        // music + screen fade once the text is gone
const SKIP_FADE_MS = 400;        // quick fade if the user skips
const TARGET_VOLUME = 1;

let fadeRAF = null;
let crawlRAF = null;
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
  // Fail silently if the file is missing or playback is refused.
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
  if (!crawlActive) return;
  crawlActive = false;
  if (crawlRAF) cancelAnimationFrame(crawlRAF);
  const screen = document.getElementById('crawl-screen');
  const fadeMs = quick ? SKIP_FADE_MS : END_FADE_MS;
  if (screen) {
    screen.style.transitionDuration = fadeMs + 'ms';
    screen.classList.add('hidden');
    setTimeout(() => screen.remove(), fadeMs + 100);
  }
  fadeAudio(0, fadeMs, stopTheme);
}
document.getElementById('skip-crawl').addEventListener('click', (e) => {
  e.stopPropagation(); // don't also trigger the begin-prompt click below
  skipCrawl(true);
});

function runCrawl() {
  const text = document.getElementById('crawl-text');
  const viewport = document.querySelector('.crawl-viewport');
  const para = text.querySelector('p');
  const lineHeight = parseFloat(getComputedStyle(para).lineHeight) || 40;
  const speed = lineHeight / SECONDS_PER_LINE; // px per second
  const lastLine = text.lastElementChild;
  const t0 = performance.now();

  function frame(now) {
    if (!crawlActive) return;
    text.style.transform = `translateY(${-(now - t0) / 1000 * speed}px)`;
    // getBoundingClientRect includes the 3D tilt, so this is where the
    // last line actually appears on screen. Once it's up in the faded-out
    // top band of the viewport, the crawl is over.
    const vp = viewport.getBoundingClientRect();
    const last = lastLine.getBoundingClientRect();
    if (last.bottom < vp.top + vp.height * 0.18) { skipCrawl(false); return; }
    crawlRAF = requestAnimationFrame(frame);
  }
  crawlRAF = requestAnimationFrame(frame);
}

// The crawl (and its music) stay dormant behind a "Click to Begin"
// prompt. Starting on a real click means the browser always allows the
// audio to play.
const beginPrompt = document.getElementById('begin-prompt');
const crawlScreen = document.getElementById('crawl-screen');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let began = false;

function beginCrawl() {
  if (began) return;
  began = true;
  beginPrompt.classList.add('hidden');
  crawlScreen.classList.add('playing');
  if (reducedMotion) return; // text is shown static; Skip enters the archive
  setTimeout(() => {
    if (!crawlActive) return;
    playTheme();
    runCrawl();
  }, CRAWL_TEXT_START);
}
beginPrompt.addEventListener('click', beginCrawl);
beginPrompt.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') beginCrawl();
});

// ---------------- View tabs ----------------
const viewTabs = document.querySelectorAll('.view-tab');
function showView(name) {
  viewTabs.forEach(t => {
    const on = t.dataset.view === name;
    t.classList.toggle('active', on);
    t.setAttribute('aria-selected', on);
  });
  document.querySelectorAll('.view').forEach(v => { v.hidden = v.id !== `view-${name}`; });
  if (name === 'timeline' && window.renderTimeline) window.renderTimeline();
}
viewTabs.forEach(t => t.addEventListener('click', () => {
  history.replaceState(null, '', '#' + t.dataset.view);
  showView(t.dataset.view);
}));

// ---------------- Init ----------------
buildFilters();
renderGrid();
showView(location.hash === '#archive' ? 'archive' : 'timeline');
