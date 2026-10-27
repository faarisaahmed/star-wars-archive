// STAR WARS CANON ARCHIVE — TIMELINE
// A zoomable, pannable in-universe timeline. Every film/series is a lane
// with one or more spans (main story, flashbacks, crossovers, epilogues).
// Key events sit on their own track above the lanes.

(function () {
  const labelsEl = document.getElementById('tl-labels');
  const scrollEl = document.getElementById('tl-scroll');
  const canvasEl = document.getElementById('tl-canvas');
  const tipEl = document.getElementById('tl-tip');
  const zoomEl = document.getElementById('tl-zoom');
  const presetsEl = document.getElementById('tl-presets');
  const scalesEl = document.getElementById('tl-scales');

  // ---------- Scale ----------
  // Everything older than BREAK (the High Republic) is drawn on a
  // compressed scale so two centuries don't swamp the saga itself.
  const DOMAIN_START = -240;
  const DOMAIN_END = 37;
  const BREAK = -45;
  const PAD_L = 24;
  const PAD_R = 60;
  const MIN_PPY = 6;
  const MAX_PPY = 1500;

  const ROW = { era: 32, axis: 34, axis2: 28, event: 22, lane: 30 };
  const MAX_EVENT_ROWS = 5;

  const ERA_COLORS = ['#7dd3fc', '#e8c468', '#a78bfa', '#ff8c42', '#8fd694', '#ff5c5c'];

  let ppy = 10;              // pixels per year in the main (uncompressed) region
  let secondary = 'endor';   // which alternative reckoning the second ruler shows
  let fitted = false;

  const compRate = () => Math.min(5, Math.max(2.5, ppy * 0.12));
  const breakX = () => PAD_L + (BREAK - DOMAIN_START) * compRate();
  function x(y) {
    if (y < BREAK) return PAD_L + (y - DOMAIN_START) * compRate();
    return breakX() + (y - BREAK) * ppy;
  }
  function invX(px) {
    const bx = breakX();
    if (px < bx) return DOMAIN_START + (px - PAD_L) / compRate();
    return BREAK + (px - bx) / ppy;
  }
  const totalWidth = () => x(DOMAIN_END) + PAD_R;

  // ---------- Formatting ----------
  const idx = y => Math.floor(y + 1e-9);
  function fmtYear(y) {
    const i = idx(y);
    return i <= 0 ? `${-i} BBY` : `${i} ABY`;
  }
  function fmtRange(s, e, approx) {
    const c = approx ? 'c. ' : '';
    const a = idx(s), b = idx(e);
    if (a === b) return c + fmtYear(s);
    // Same era suffix: "22–19 BBY"
    if (a <= 0 && b <= 0) return `${c}${-a}–${-b} BBY`;
    if (a > 0 && b > 0) return `${c}${a}–${b} ABY`;
    return `${c}${fmtYear(s)} – ${fmtYear(e)}`;
  }
  // Longer phrasing of the alternative reckonings, for tooltips.
  const LONG = {
    endor: i => { const d = i - 4; return d === 0 ? 'Year of Endor' : d < 0 ? `${-d} yr${d === -1 ? '' : 's'} before Endor` : `${d} yr${d === 1 ? '' : 's'} after Endor`; },
    empire: i => { const d = i + 19; return d === 0 ? 'Year the Empire is founded' : d < 0 ? `${-d} yrs before the Empire` : `Year ${d} of the Empire`; },
    naboo: i => { const d = i + 32; return d === 0 ? 'Year of the Battle of Naboo' : d < 0 ? `${-d} yrs before Naboo` : `${d} yr${d === 1 ? '' : 's'} after Naboo`; },
  };
  function altRange(s, e) {
    const f = LONG[secondary];
    if (!f) return '';
    const a = f(idx(s)), b = f(idx(e));
    return a === b ? a : `${a} → ${b}`;
  }

  // ---------- Data prep ----------
  const items = SW_DATA.filter(d => SW_SPANS[d.id]).map(d => {
    const span = SW_SPANS[d.id];
    const main = span.segments.find(s => s.kind === 'main') || span.segments[0];
    const sortKey = main.kind === 'range' ? Infinity : main.s;
    return { item: d, span, sortKey };
  }).sort((a, b) => a.sortKey - b.sortKey);

  // "Star Wars: The Clone Wars" is both a film and a series.
  const laneTitle = d => SW_DATA.some(o => o !== d && o.title === d.title)
    ? `${d.title} (${d.type === 'movie' ? 'film' : 'series'})` : d.title;

  const eraColor = era => (SW_ERAS[era] && SW_ERAS[era].color) || '#e8c468';

  // ---------- Rendering ----------
  function tickStep(rate) {
    for (const s of [1, 2, 5, 10, 20, 25, 50, 100]) if (s * rate >= 64) return s;
    return 100;
  }

  function axisHTML(fmt, cls) {
    let out = '';
    const seg = (from, to, rate) => {
      const step = tickStep(rate);
      const minor = rate >= 8 ? 1 : step;
      for (let y = Math.ceil(from); y <= to; y++) {
        const isMajor = y % step === 0;
        if (!isMajor && y % minor !== 0) continue;
        const px = x(y);
        out += `<div class="tl-tick${isMajor ? ' major' : ''}" style="left:${px}px"></div>`;
        if (isMajor) {
          const label = fmt(y);
          out += `<div class="tl-tick-label${y === 0 && cls !== 'secondary' ? ' zero' : ''}" style="left:${px}px">${label}</div>`;
        }
      }
    };
    seg(DOMAIN_START, BREAK - 1, compRate());
    seg(BREAK, DOMAIN_END, ppy);
    return out;
  }

  function gridHTML(top, height) {
    const step = tickStep(ppy);
    let out = '';
    for (let y = Math.ceil(BREAK / step) * step; y <= DOMAIN_END; y += step) {
      out += `<div class="tl-grid" style="left:${x(y)}px;top:${top}px;height:${height}px"></div>`;
    }
    return out;
  }

  function layoutEvents() {
    const rowsEnd = [];
    const limit = totalWidth() - 8;
    const placed = SW_EVENTS.slice().sort((a, b) => a.y - b.y).map(ev => {
      const px = x(ev.y);
      const w = ev.label.length * 6.6 + 24;
      // Labels that would run off the end of the timeline point left instead.
      const flip = px + w > limit;
      const from = flip ? px - w : px;
      let row = rowsEnd.findIndex(end => end + 10 < from);
      if (row === -1 && rowsEnd.length < MAX_EVENT_ROWS) row = rowsEnd.length;
      if (row !== -1) {
        rowsEnd[row] = flip ? px + 12 : px + w;
        return { ev, px, row, labeled: true, flip };
      }
      // No room for the label: show just the diamond (label stays in the
      // tooltip) in a row where it won't sit on top of someone else's text.
      row = rowsEnd.findIndex(end => end < px - 6);
      if (row === -1) return null;
      rowsEnd[row] = px + 12;
      return { ev, px, row, labeled: false, flip: false };
    }).filter(Boolean);
    placed.rows = Math.max(1, ...placed.map(p => p.row + 1));
    return placed;
  }

  function render() {
    if (!scrollEl.clientWidth) return; // hidden tab
    if (!fitted) { fitted = true; applyPreset(PRESETS[0]); return; }

    const width = totalWidth();
    const events = layoutEvents();
    const eventRows = events.rows;
    const eventsH = eventRows * ROW.event + 10;

    let y = 0;
    const top = {};
    top.era = y; y += ROW.era;
    top.axis = y; y += ROW.axis;
    top.axis2 = y; y += ROW.axis2;
    top.events = y; y += eventsH;
    top.lanes = y;
    const lanesH = items.length * ROW.lane;
    const height = top.lanes + lanesH;

    let html = '';
    html += gridHTML(top.events, height - top.events);

    // Canon eras
    SW_CANON_ERAS.forEach((era, i) => {
      const l = x(era.s), r = x(Math.min(era.e, DOMAIN_END));
      html += `<div class="tl-era" style="left:${l}px;width:${r - l}px;--c:${ERA_COLORS[i % ERA_COLORS.length]}"
        data-tip-era="${i}">${era.label}${era.note && r - l > 220 ? ` · ${era.note}` : ''}</div>`;
    });

    // Axes
    html += `<div class="tl-axis" style="top:${top.axis}px;height:${ROW.axis}px">${axisHTML(SW_SCALES.yavin.fmt)}</div>`;
    html += `<div class="tl-axis secondary" style="top:${top.axis2}px;height:${ROW.axis2}px">${axisHTML(SW_SCALES[secondary].fmt, 'secondary')}</div>`;
    html += `<div class="tl-break" style="left:${breakX()}px;top:${top.axis}px;height:${height - top.axis}px" title="Scale changes here"></div>`;

    // Events + guide lines through the lanes for major ones
    events.forEach(({ ev, px, row, labeled, flip }) => {
      const ty = top.events + 5 + row * ROW.event;
      html += `<div class="tl-event-stem" style="left:${px}px;top:${ty + 10}px;height:${top.lanes - ty - 10}px"></div>`;
      html += `<div class="tl-event${ev.major ? ' major' : ''}${labeled ? '' : ' nolabel'}${flip ? ' flip' : ''}" style="left:${px}px;top:${ty}px" data-tip-event="${SW_EVENTS.indexOf(ev)}"><span>${ev.label}</span></div>`;
      if (ev.major) html += `<div class="tl-guide" style="left:${px}px;top:${top.lanes}px;height:${lanesH}px"></div>`;
    });

    // Lanes
    html += `<div style="position:absolute;left:0;right:0;top:${top.lanes}px">`;
    items.forEach(({ item, span }, li) => {
      const c = eraColor(item.era);
      html += `<div class="tl-lane" style="top:${li * ROW.lane}px;height:${ROW.lane}px;--c:${c}">`;
      const chain = span.segments.filter(s => s.kind !== 'crossover' && s.kind !== 'range').sort((a, b) => a.s - b.s);
      for (let k = 1; k < chain.length; k++) {
        const l = x(chain[k - 1].e), r = x(chain[k].s);
        if (r - l > 4) html += `<div class="tl-link" style="left:${l}px;width:${r - l}px"></div>`;
      }
      const cross = span.segments.find(g => g.kind === 'crossover');
      span.segments.forEach((seg, si) => {
        const l = x(seg.s);
        const w = Math.max(6, x(seg.e) - l);
        // A crossover drawn on top of this bar hides whatever text is under it.
        const room = cross && seg !== cross && cross.s > seg.s && cross.s < seg.e ? x(cross.s) - l : w;
        const text = seg.label || (span.segments.length === 1 ? item.title : '');
        const fits = text && room > text.length * 6.2 + 14;
        html += `<button class="tl-bar ${seg.kind}${span.approx ? ' approx' : ''}" style="left:${l}px;width:${w}px"
          data-id="${item.id}" data-seg="${si}" aria-label="${item.title}${seg.label ? ', ' + seg.label : ''}">${fits ? text : ''}</button>`;
      });
      html += `</div>`;
    });
    html += `</div>`;

    canvasEl.style.width = width + 'px';
    canvasEl.style.height = height + 'px';
    canvasEl.innerHTML = html;

    // Left label column, row-for-row
    const opts = Object.entries(SW_SCALES).filter(([k]) => k !== 'yavin')
      .map(([k, v]) => `<option value="${k}"${k === secondary ? ' selected' : ''}>${v.label}</option>`).join('');
    let lh = '';
    lh += `<div class="tl-row-label head" style="height:${ROW.era}px">Canon eras</div>`;
    lh += `<div class="tl-row-label head" style="height:${ROW.axis}px">BBY / ABY</div>`;
    lh += `<div class="tl-row-label head" style="height:${ROW.axis2}px"><select id="tl-secondary" aria-label="Second time scale">${opts}</select></div>`;
    lh += `<div class="tl-row-label head" style="height:${eventsH}px">Key events</div>`;
    items.forEach(({ item, span }) => {
      lh += `<button class="tl-row-label" style="height:${ROW.lane}px;--c:${eraColor(item.era)}" data-goto="${item.id}"
        title="Jump to ${laneTitle(item)}"><span class="dot ${item.type}"></span>${laneTitle(item)}</button>`;
    });
    labelsEl.innerHTML = lh;
    document.getElementById('tl-secondary').addEventListener('change', e => setSecondary(e.target.value));

    zoomEl.value = ppyToSlider(ppy);
  }

  // ---------- Zoom ----------
  const sliderToPpy = v => MIN_PPY * Math.pow(MAX_PPY / MIN_PPY, v / 100);
  const ppyToSlider = p => Math.round(100 * Math.log(p / MIN_PPY) / Math.log(MAX_PPY / MIN_PPY));

  function zoomTo(newPpy, anchorPx) {
    const anchor = anchorPx == null ? scrollEl.clientWidth / 2 : anchorPx;
    const yearAtAnchor = invX(scrollEl.scrollLeft + anchor);
    ppy = Math.min(MAX_PPY, Math.max(MIN_PPY, newPpy));
    render();
    scrollEl.scrollLeft = x(yearAtAnchor) - anchor;
  }
  zoomEl.addEventListener('input', () => zoomTo(sliderToPpy(+zoomEl.value)));
  document.getElementById('tl-zoom-in').addEventListener('click', () => zoomTo(ppy * 1.6));
  document.getElementById('tl-zoom-out').addEventListener('click', () => zoomTo(ppy / 1.6));
  scrollEl.addEventListener('wheel', e => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    const rect = scrollEl.getBoundingClientRect();
    zoomTo(ppy * Math.exp(-e.deltaY * 0.0025), e.clientX - rect.left);
  }, { passive: false });

  // ---------- Presets ----------
  const PRESETS = [
    { label: 'Full saga', from: DOMAIN_START, to: DOMAIN_END },
    { label: 'High Republic', from: -240, to: -95 },
    { label: 'Prequels & Clone Wars', from: -42, to: -17 },
    { label: 'Empire & Rebellion', from: -19.5, to: 5.5 },
    { label: 'Mandalorian era (9 ABY)', from: 8.9, to: 10.75 },
    { label: 'Sequels', from: 27.5, to: 36.2 },
  ];
  function applyPreset(p) {
    const W = scrollEl.clientWidth - 20;
    // Solve for the zoom that fits [from, to] into the visible width
    // (bisection, because the compressed region makes it non-linear).
    let lo = MIN_PPY, hi = MAX_PPY;
    for (let i = 0; i < 40; i++) {
      ppy = (lo + hi) / 2;
      if (x(p.to) - x(p.from) > W) hi = ppy; else lo = ppy;
    }
    ppy = lo;
    render();
    scrollEl.scrollLeft = x(p.from) - 10;
  }
  PRESETS.forEach(p => {
    const b = document.createElement('button');
    b.className = 'filter-btn';
    b.textContent = p.label;
    b.addEventListener('click', () => applyPreset(p));
    presetsEl.appendChild(b);
  });

  // ---------- Time scale cards ----------
  function renderScales() {
    scalesEl.innerHTML = Object.entries(SW_SCALES).map(([k, v]) => `
      <button class="tl-scale${k === secondary || k === 'yavin' ? ' active' : ''}" data-scale="${k}">
        <h4>${v.label}<span class="tag">${k === 'yavin' ? 'Official · top ruler' : k === secondary ? 'Second ruler' : 'Show on ruler'}</span></h4>
        ${v.desc}
      </button>`).join('');
  }
  function setSecondary(k) {
    if (!LONG[k]) return;
    secondary = k;
    const left = scrollEl.scrollLeft;
    render();
    scrollEl.scrollLeft = left;
    renderScales();
  }
  scalesEl.addEventListener('click', e => {
    const card = e.target.closest('[data-scale]');
    if (card) setSecondary(card.dataset.scale);
  });

  // ---------- Drag to pan ----------
  let drag = null;
  let suppressClick = false;
  scrollEl.addEventListener('pointerdown', e => {
    if (e.button !== 0 || e.pointerType === 'touch') return; // touch scrolls natively
    drag = { x: e.clientX, left: scrollEl.scrollLeft, moved: false, id: e.pointerId };
  });
  scrollEl.addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (!drag.moved && Math.abs(dx) > 4) {
      drag.moved = true;
      scrollEl.classList.add('dragging');
      scrollEl.setPointerCapture(drag.id);
      hideTip();
    }
    if (drag.moved) scrollEl.scrollLeft = drag.left - dx;
  });
  const endDrag = () => {
    if (drag && drag.moved) suppressClick = true;
    drag = null;
    scrollEl.classList.remove('dragging');
  };
  scrollEl.addEventListener('pointerup', endDrag);
  scrollEl.addEventListener('pointercancel', endDrag);
  scrollEl.addEventListener('click', e => {
    if (suppressClick) { suppressClick = false; e.stopPropagation(); e.preventDefault(); return; }
    const bar = e.target.closest('.tl-bar');
    if (bar) openModal(SW_DATA.find(d => d.id === bar.dataset.id));
  }, true);

  // ---------- Jump from label ----------
  labelsEl.addEventListener('click', e => {
    const btn = e.target.closest('[data-goto]');
    if (!btn) return;
    const { span } = items.find(i => i.item.id === btn.dataset.goto);
    const s = Math.min(...span.segments.map(g => g.s));
    const en = Math.max(...span.segments.map(g => g.e));
    const mid = (x(s) + x(en)) / 2;
    scrollEl.scrollTo({ left: mid - scrollEl.clientWidth / 2, behavior: 'smooth' });
    const bars = canvasEl.querySelectorAll(`.tl-bar[data-id="${btn.dataset.goto}"]`);
    bars.forEach(b => { b.style.filter = 'brightness(1.6)'; setTimeout(() => (b.style.filter = ''), 1200); });
  });

  // ---------- Tooltips ----------
  function showTip(html, e) {
    tipEl.innerHTML = html;
    tipEl.classList.add('show');
    moveTip(e);
  }
  function moveTip(e) {
    const pad = 14;
    const r = tipEl.getBoundingClientRect();
    let left = e.clientX + pad, top = e.clientY + pad;
    if (left + r.width > innerWidth - 8) left = e.clientX - r.width - pad;
    if (top + r.height > innerHeight - 8) top = e.clientY - r.height - pad;
    tipEl.style.left = left + 'px';
    tipEl.style.top = top + 'px';
  }
  function hideTip() { tipEl.classList.remove('show'); }

  canvasEl.addEventListener('pointerover', e => {
    if (drag && drag.moved) return;
    const bar = e.target.closest('.tl-bar');
    const ev = e.target.closest('[data-tip-event]');
    const era = e.target.closest('[data-tip-era]');
    if (bar) {
      const it = items.find(i => i.item.id === bar.dataset.id);
      const seg = it.span.segments[+bar.dataset.seg];
      const approx = it.span.approx;
      showTip(`<b>${laneTitle(it.item)}</b>
        ${seg.label ? seg.label + '<br>' : ''}
        <span class="when">${seg.kind === 'range' ? 'Spans the saga' : fmtRange(seg.s, seg.e, approx)}</span>
        ${seg.kind === 'range' ? '' : `<br><span class="alt">${altRange(seg.s, seg.e)}</span>`}
        ${it.span.note ? `<span class="note">${it.span.note}</span>` : ''}`, e);
    } else if (ev) {
      const d = SW_EVENTS[+ev.dataset.tipEvent];
      showTip(`<b>${d.label}</b><span class="when">${d.approx ? 'c. ' : ''}${fmtYear(d.y)}</span><br>
        <span class="alt">${altRange(d.y, d.y)}</span>`, e);
    } else if (era) {
      const d = SW_CANON_ERAS[+era.dataset.tipEra];
      showTip(`<b>${d.label}</b><span class="when">${d.note || fmtRange(Math.max(d.s, -500), d.e)}</span>
        <span class="note">One of Lucasfilm's official named eras.</span>`, e);
    } else hideTip();
  });
  canvasEl.addEventListener('pointermove', e => { if (tipEl.classList.contains('show')) moveTip(e); });
  canvasEl.addEventListener('pointerleave', hideTip);
  scrollEl.addEventListener('scroll', hideTip, { passive: true });

  // ---------- Init ----------
  let resizeT;
  addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(render, 120); });
  window.renderTimeline = render;
  renderScales();
  render();
})();
