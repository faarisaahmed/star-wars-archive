// STAR WARS CANON ARCHIVE — TIMELINE
// A zoomable, pannable in-universe timeline. Each film/series is drawn as
// one or more spans (main story, flashbacks, crossovers, epilogues) with
// its title beside it; stories that don't overlap share a row. Key events
// sit on a single track above.

(function () {
  const scrollEl = document.getElementById('tl-scroll');
  const canvasEl = document.getElementById('tl-canvas');
  const tipEl = document.getElementById('tl-tip');
  const zoomEl = document.getElementById('tl-zoom');
  const presetsEl = document.getElementById('tl-presets');
  const scalesEl = document.getElementById('tl-scales');
  const secondaryEl = document.getElementById('tl-secondary');

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

  const ROW = { era: 26, axis: 30, axis2: 14, events: 30, lane: 30 };

  let ppy = 10;            // pixels per year in the main (uncompressed) region
  let secondary = null;    // optional second reckoning shown under the BBY/ABY labels
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

  // Text width, for deciding where labels fit.
  const measureCtx = document.createElement('canvas').getContext('2d');
  function textWidth(text, font) {
    measureCtx.font = font;
    return measureCtx.measureText(text).width;
  }
  const NAME_FONT = "600 14px 'Barlow Condensed', sans-serif";
  const BAR_FONT = "700 11px 'Barlow', sans-serif";
  const EVENT_FONT = "500 13px 'Barlow Condensed', sans-serif";

  // ---------- Formatting ----------
  // fmtYear / fmtRange / yearIndex are shared from script.js.
  const idx = yearIndex;
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
    return `<br><span class="alt">${a === b ? a : `${a} → ${b}`}</span>`;
  }

  // ---------- Data prep ----------
  // "Star Wars: The Clone Wars" is both a film and a series.
  const laneTitle = d => SW_DATA.some(o => o !== d && o.title === d.title)
    ? `${d.title} (${d.type === 'movie' ? 'film' : 'series'})` : d.title;
  // Shorter names for the timeline itself; the tooltip and modal keep the full title.
  const shortTitle = d => laneTitle(d).replace(/^Star Wars:?\s+/, '').replace(/: A Star Wars Story$/, '');

  const items = SW_DATA.filter(d => SW_SPANS[d.id]).map(d => {
    const span = SW_SPANS[d.id];
    return {
      item: d,
      span,
      start: Math.min(...span.segments.map(g => g.s)),
      end: Math.max(...span.segments.map(g => g.e)),
      isRange: span.segments.every(g => g.kind === 'range'),
    };
  });

  // ---------- Layout ----------
  // Row packing: each story takes the first row where it (and its label)
  // fits. A story with `below` in its span data is placed directly under
  // that story when there's room (Boba Fett under The Mandalorian).
  // Stories that span the whole saga get their own row at the bottom.
  function layoutLanes() {
    const rows = [];
    const fitsIn = (r, a, b) => (rows[r] || []).every(([c, d]) => b + 14 <= c || a >= d + 14);
    const take = (r, a, b) => { (rows[r] = rows[r] || []).push([a, b]); };
    const placed = [];
    const byId = {};
    const measure = it => {
      const l = x(it.start);
      const r = Math.max(x(it.end), l + 6);
      const name = shortTitle(it.item) + (it.span.approx ? ' (c.)' : '');
      const nameW = textWidth(name, NAME_FONT);
      // The name goes inside the bar if it's wide enough, else just after the last segment.
      const main = it.span.segments.find(g => g.kind === 'main');
      const inside = it.span.segments.length === 1 && main && x(main.e) - x(main.s) > nameW + 16;
      return { l, r: inside ? r : r + 8 + nameW, name, inside, nameX: r + 8 };
    };
    const place = (it, row) => {
      const m = measure(it);
      take(row, m.l, m.r);
      byId[it.item.id] = row;
      placed.push({ ...it, ...m, row });
    };
    const stories = items.filter(i => !i.isRange).sort((a, b) => a.start - b.start);
    const deferred = stories.filter(it => it.span.below);
    stories.filter(it => !it.span.below).forEach(it => {
      const m = measure(it);
      let row = 0;
      while (!fitsIn(row, m.l, m.r)) row++;
      place(it, row);
    });
    deferred.forEach(it => {
      const m = measure(it);
      let row = (byId[it.span.below] ?? -1) + 1;
      if (!fitsIn(row, m.l, m.r)) {
        // Make room by pushing everything at or below that row down one.
        placed.forEach(p => { if (p.row >= row) p.row++; });
        Object.keys(byId).forEach(k => { if (byId[k] >= row) byId[k]++; });
        rows.splice(row, 0, []);
      }
      place(it, row);
    });
    const used = rows.length;
    items.filter(i => i.isRange).forEach((it, k) => {
      placed.push({ ...it, row: used + k, name: shortTitle(it.item), inside: false, nameX: x(it.end) + 8 });
    });
    placed.rows = used + items.filter(i => i.isRange).length;
    return placed;
  }

  // One row of events. Major events claim space first and their labels
  // may cover minor diamonds (those are hidden). Minor events get a label
  // only where one fits, otherwise just a diamond with the name in the
  // tooltip. Zoom in and more labels appear.
  function layoutEvents() {
    const limit = totalWidth() - 8;
    const labels = [];
    const clear = (a, b, pts) => labels.every(([c, d]) => b + 12 <= c || a >= d + 12)
      && pts.every(p => p < a - 6 || p > b + 6);
    const all = SW_EVENTS.map((ev, i) => ({ ev, i, px: x(ev.y) }));
    const tryLabel = (e, pts) => {
      const w = textWidth(e.ev.label, EVENT_FONT) + 8;
      const right = [e.px + 8, e.px + 8 + w];
      const left = [e.px - 8 - w, e.px - 8];
      if (right[1] < limit && clear(...right, pts)) { e.side = 'right'; labels.push(right); }
      else if (left[0] > 0 && clear(...left, pts)) { e.side = 'left'; labels.push(left); }
    };
    const majors = all.filter(e => e.ev.major);
    const minors = all.filter(e => !e.ev.major);
    majors.forEach(e => tryLabel(e, majors.filter(o => o !== e).map(o => o.px)));
    minors.forEach(e => { e.hidden = !clear(e.px - 5, e.px + 5, []); });
    const shown = all.filter(e => !e.hidden);
    minors.filter(e => !e.hidden).forEach(e => tryLabel(e, shown.filter(o => o !== e).map(o => o.px)));
    return shown;
  }

  // ---------- Rendering ----------
  function tickStep(rate) {
    for (const s of [1, 2, 5, 10, 20, 25, 50, 100]) if (s * rate >= 64) return s;
    return 100;
  }

  function axisHTML() {
    let out = '';
    const alt = secondary && SW_SCALES[secondary].fmt;
    const seg = (from, to, rate) => {
      const step = tickStep(rate);
      const minor = rate >= 8 ? 1 : step;
      for (let y = Math.ceil(from); y <= to; y++) {
        const isMajor = y % step === 0;
        if (!isMajor && y % minor !== 0) continue;
        const px = x(y);
        out += `<div class="tl-tick${isMajor ? ' major' : ''}" style="left:${px}px"></div>`;
        if (isMajor) {
          out += `<div class="tl-tick-label${y === 0 ? ' zero' : ''}" style="left:${px}px">${SW_SCALES.yavin.fmt(y)}${alt ? `<small>${alt(y)}</small>` : ''}</div>`;
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

  function render() {
    if (!scrollEl.clientWidth) return; // hidden tab
    if (!fitted) { fitted = true; applyPreset(PRESETS[0]); return; }

    const width = totalWidth();
    const lanes = layoutLanes();
    const events = layoutEvents();

    const top = {};
    let y = 0;
    top.era = y; y += ROW.era;
    top.axis = y; y += ROW.axis + (secondary ? ROW.axis2 : 0);
    top.events = y; y += ROW.events;
    top.lanes = y + 6;
    const lanesH = lanes.rows * ROW.lane + 10;
    const height = top.lanes + lanesH;

    let html = gridHTML(top.events, height - top.events);

    // Canon eras
    Object.entries(SW_ERAS).forEach(([key, era]) => {
      const l = x(era.s), r = x(Math.min(era.e, DOMAIN_END));
      html += `<div class="tl-era" style="left:${l}px;width:${r - l}px;top:${top.era + 4}px;--c:${era.color}"
        data-tip-era="${key}"><span>${era.label}</span></div>`;
    });

    // Axis (with the optional second reckoning under each label)
    html += `<div class="tl-axis${secondary ? ' two' : ''}" style="top:${top.axis}px;height:${ROW.axis + (secondary ? ROW.axis2 : 0)}px">${axisHTML()}</div>`;
    html += `<div class="tl-break" style="left:${breakX()}px;top:${top.axis}px;height:${height - top.axis}px" title="Scale changes here"></div>`;

    // Events, with a guide line down through the stories for major ones
    events.forEach(({ ev, i, px, side }) => {
      html += `<div class="tl-event${ev.major ? ' major' : ''}${side === 'left' ? ' flip' : ''}" style="left:${px}px;top:${top.events + 5}px"
        data-tip-event="${i}" tabindex="0" role="img" aria-label="${ev.label}, ${fmtYear(ev.y)}">${side ? `<span>${ev.label}</span>` : ''}</div>`;
      if (ev.major) html += `<div class="tl-guide" style="left:${px}px;top:${top.events + 24}px;height:${height - top.events - 24}px"></div>`;
    });

    // Stories
    lanes.forEach(({ item, span, row, name, inside, nameX, isRange }) => {
      const c = eraColor(item.era);
      const ty = top.lanes + row * ROW.lane;
      html += `<div class="tl-story" style="top:${ty}px;--c:${c}">`;
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
        const text = inside ? name : (span.segments.length > 1 ? seg.label || '' : '');
        const fits = text && room > textWidth(text, inside ? NAME_FONT : BAR_FONT) + 14;
        html += `<button class="tl-bar ${seg.kind}${span.approx ? ' approx' : ''}${inside ? ' named' : ''}" style="left:${l}px;width:${w}px"
          data-id="${item.id}" data-seg="${si}" aria-label="${laneTitle(item)}${seg.label ? ', ' + seg.label : ''}">${fits ? text : ''}</button>`;
      });
      if (!inside) {
        html += `<button class="tl-name${item.type === 'movie' ? ' film' : ''}" style="left:${isRange ? x(span.segments[0].s) : nameX}px${isRange ? ';top:-9px' : ''}"
          data-id="${item.id}" data-seg="0" tabindex="-1">${name}</button>`;
      }
      html += `</div>`;
    });

    canvasEl.style.width = width + 'px';
    canvasEl.style.height = height + 'px';
    canvasEl.innerHTML = html;
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
    { label: 'Skywalker era', from: -42, to: 37 },
    { label: 'High Republic', from: -240, to: -95 },
    { label: 'Prequels & Clone Wars', from: -42, to: -17 },
    { label: 'Empire & Rebellion', from: -19.5, to: 5.5 },
    { label: 'Mandalorian era (9 ABY)', from: 8.9, to: 10.9 },
    { label: 'Sequels', from: 27.5, to: 36.2 },
    { label: 'Everything', from: DOMAIN_START, to: DOMAIN_END },
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

  // ---------- Second reckoning ----------
  secondaryEl.innerHTML = '<option value="">BBY / ABY only</option>' +
    Object.entries(SW_SCALES).filter(([k]) => k !== 'yavin')
      .map(([k, v]) => `<option value="${k}">+ ${v.label}</option>`).join('');
  function renderScales() {
    scalesEl.innerHTML = Object.entries(SW_SCALES).map(([k, v]) => {
      const on = k === 'yavin' || k === secondary;
      const tag = k === 'yavin' ? 'Official · always shown' : on ? 'Shown · click to hide' : 'Click to show';
      return `<button class="tl-scale${on ? ' active' : ''}" data-scale="${k}">
        <h4>${v.label}<span class="tag">${tag}</span></h4>${v.desc}</button>`;
    }).join('');
  }
  function setSecondary(k) {
    secondary = LONG[k] ? k : null;
    secondaryEl.value = secondary || '';
    const left = scrollEl.scrollLeft;
    render();
    scrollEl.scrollLeft = left;
    renderScales();
  }
  secondaryEl.addEventListener('change', () => setSecondary(secondaryEl.value));
  scalesEl.addEventListener('click', e => {
    const card = e.target.closest('[data-scale]');
    if (!card || card.dataset.scale === 'yavin') return;
    setSecondary(card.dataset.scale === secondary ? null : card.dataset.scale);
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
    const bar = e.target.closest('[data-id]');
    if (bar) openModal(SW_DATA.find(d => d.id === bar.dataset.id));
  }, true);

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

  // Tooltip content for whatever is under the pointer (or focused).
  function tipFor(target) {
    const bar = target.closest('[data-id]');
    const ev = target.closest('[data-tip-event]');
    const era = target.closest('[data-tip-era]');
    if (bar) {
      const it = items.find(i => i.item.id === bar.dataset.id);
      const seg = it.span.segments[+bar.dataset.seg];
      const approx = it.span.approx;
      return `<b>${laneTitle(it.item)}</b>
        ${seg.label ? seg.label + '<br>' : ''}
        <span class="when">${seg.kind === 'range' ? 'Spans the saga' : fmtRange(seg.s, seg.e, approx)}</span>
        ${seg.kind === 'range' ? '' : altRange(seg.s, seg.e)}
        ${it.span.note ? `<span class="note">${it.span.note}</span>` : ''}`;
    }
    if (ev) {
      const d = SW_EVENTS[+ev.dataset.tipEvent];
      return `<b>${d.label}</b><span class="when">${d.approx ? 'c. ' : ''}${fmtYear(d.y)}</span>${altRange(d.y, d.y)}`;
    }
    if (era) {
      const d = SW_ERAS[era.dataset.tipEra];
      return `<b>${d.label}</b><span class="when">${d.note || fmtRange(d.s, d.e)}</span>
        <span class="note">One of Lucasfilm's official named eras.</span>`;
    }
    return null;
  }
  canvasEl.addEventListener('pointerover', e => {
    if (drag && drag.moved) return;
    const html = tipFor(e.target);
    if (html) showTip(html, e); else hideTip();
  });
  // Keyboard focus gets the same tooltip, anchored under the element.
  canvasEl.addEventListener('focusin', e => {
    const html = tipFor(e.target);
    if (!html) return;
    const r = e.target.getBoundingClientRect();
    showTip(html, { clientX: r.left, clientY: r.bottom });
  });
  canvasEl.addEventListener('focusout', hideTip);
  canvasEl.addEventListener('pointermove', e => { if (tipEl.classList.contains('show')) moveTip(e); });
  canvasEl.addEventListener('pointerleave', hideTip);
  scrollEl.addEventListener('scroll', hideTip, { passive: true });

  // ---------- Keyboard ----------
  // With the timeline focused: ←/→ pan, +/− zoom, Home/End jump to the ends.
  scrollEl.addEventListener('keydown', e => {
    if (e.target.tagName === 'BUTTON' && (e.key === 'Enter' || e.key === ' ')) return;
    const step = scrollEl.clientWidth * 0.25;
    const actions = {
      ArrowLeft: () => scrollEl.scrollBy({ left: -step, behavior: 'smooth' }),
      ArrowRight: () => scrollEl.scrollBy({ left: step, behavior: 'smooth' }),
      Home: () => { scrollEl.scrollLeft = 0; },
      End: () => { scrollEl.scrollLeft = scrollEl.scrollWidth; },
      '+': () => zoomTo(ppy * 1.6), '=': () => zoomTo(ppy * 1.6),
      '-': () => zoomTo(ppy / 1.6), '_': () => zoomTo(ppy / 1.6),
    };
    if (!actions[e.key]) return;
    e.preventDefault();
    actions[e.key]();
  });

  // ---------- Pinch to zoom (touch) ----------
  let pinch = null;
  const touchMid = t => (t[0].clientX + t[1].clientX) / 2 - scrollEl.getBoundingClientRect().left;
  const touchDist = t => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
  scrollEl.addEventListener('touchstart', e => {
    if (e.touches.length === 2) pinch = { dist: touchDist(e.touches), ppy };
  }, { passive: true });
  scrollEl.addEventListener('touchmove', e => {
    if (!pinch || e.touches.length !== 2) return;
    e.preventDefault();
    zoomTo(pinch.ppy * touchDist(e.touches) / pinch.dist, touchMid(e.touches));
  }, { passive: false });
  scrollEl.addEventListener('touchend', e => { if (e.touches.length < 2) pinch = null; });

  // ---------- Jump to an entry (from the archive's "Show on timeline") ----------
  function focusTimeline(id) {
    const it = items.find(i => i.item.id === id);
    if (!it) return;
    const segs = it.span.segments;
    // Ranges (Forces of Destiny) show the whole saga; anything else is
    // zoomed to fit with some context either side, but never so far in
    // that a one-day film fills the screen.
    let from = it.start, to = it.end;
    if (it.isRange) { from = -42; to = 37; }
    const pad = Math.max(1.5, (to - from) * 0.25);
    const W = scrollEl.clientWidth - 40;
    applyPreset({ from: from - pad, to: to + pad });
    if (W / ppy < 4) { zoomTo(W / 4); }
    const mid = (x(from) + x(to)) / 2;
    scrollEl.scrollLeft = mid - scrollEl.clientWidth / 2;
    document.getElementById('timeline').scrollIntoView({ behavior: 'smooth', block: 'start' });
    const bars = canvasEl.querySelectorAll(`.tl-bar[data-id="${id}"]`);
    bars.forEach(b => b.classList.add('flash'));
    setTimeout(() => bars.forEach(b => b.classList.remove('flash')), 2400);
    if (bars[0]) bars[0].focus({ preventScroll: true });
  }
  window.focusTimeline = focusTimeline;

  // ---------- Init ----------
  let resizeT;
  addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(render, 120); });
  // Label placement depends on text width, so lay out again once the web fonts arrive.
  if (document.fonts) document.fonts.ready.then(() => render());
  window.renderTimeline = render;
  renderScales();
  render();
})();
