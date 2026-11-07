// STAR WARS CANON ARCHIVE — WATCH ORDER
// Everything in in-universe order (SW_WATCH in data.js), with a checkbox
// for each film, show and episode. Progress is saved in this browser.

(function () {
  const listEl = document.getElementById('watch-list');
  const progressEl = document.getElementById('watch-progress');
  const nextEl = document.getElementById('watch-next');
  const hideEl = document.getElementById('watch-hide');
  const resetEl = document.getElementById('watch-reset');

  // ---------- Saved progress ----------
  const STORE_KEY = 'sw-watched';
  let watched = {};
  try { watched = JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch (e) { watched = {}; }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(watched)); } catch (e) { /* storage blocked: progress lasts for this visit only */ }
  }
  const isOn = k => !!watched[k];
  function setOn(k, on) { if (on) watched[k] = 1; else delete watched[k]; }

  // ---------- Steps ----------
  const byId = Object.fromEntries(SW_DATA.map(d => [d.id, d]));

  function badge(code) {
    const c = code.includes(':') ? code.split(':')[1] : code;
    let m;
    if ((m = c.match(/^S(\d+)E(\d+)$/i))) return `S${m[1]} E${m[2]}`;
    if ((m = c.match(/^E(\d+)$/i))) return `Ep ${m[1]}`;
    if ((m = c.match(/^CH(\d+)$/i))) return `Ch. ${m[1]}`;
    if ((m = c.match(/^S(\d+)$/i))) return `S${m[1]}`;
    return '';
  }

  const steps = SW_WATCH.map((s, i) => {
    const item = byId[s.ref];
    const show = s.show || s.id;
    const eps = (s.eps || []).map(([code, title, note]) => ({
      key: code.includes(':') ? code : `${show}:${code}`,
      badge: badge(code),
      title, note,
    }));
    return {
      ...s, n: i + 1, item, eps,
      title: s.title || item.title,
      when: s.when || settingOf(item),
      color: eraColor(item.era),
      keys: eps.length ? eps.map(e => e.key) : [`w:${s.id}`],
    };
  });

  const doneCount = st => st.keys.filter(isOn).length;
  const isDone = st => doneCount(st) === st.keys.length;
  const expanded = new Set();

  // ---------- Rendering ----------
  function checkbox(on, label, partial) {
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = on;
    cb.indeterminate = !!partial;
    cb.setAttribute('aria-label', label);
    return cb;
  }

  function renderStep(st) {
    const li = document.createElement('li');
    const done = doneCount(st), total = st.keys.length;
    li.className = 'w-step' + (done === total ? ' done' : '') + (st.item.type === 'movie' ? ' film' : '');
    li.style.setProperty('--c', st.color);
    li.dataset.id = st.id;

    const row = document.createElement('div');
    row.className = 'w-row';
    const cb = checkbox(done === total, `Watched ${st.title}${st.part ? ', ' + st.part : ''}`, done > 0 && done < total);
    cb.addEventListener('change', () => {
      st.keys.forEach(k => setOn(k, cb.checked));
      save(); render();
    });

    const main = document.createElement('div');
    main.className = 'w-main';
    const name = document.createElement('button');
    name.className = 'w-title';
    name.textContent = st.title;
    name.title = 'Open details';
    name.addEventListener('click', () => openModal(st.item));
    main.appendChild(name);
    const meta = document.createElement('div');
    meta.className = 'w-meta';
    meta.innerHTML = [
      st.part ? `<span class="w-part">${st.part}</span>` : '',
      `<span>${st.item.type === 'movie' ? 'Film' : 'Series'}</span>`,
      st.when ? `<span>${st.when}</span>` : '',
    ].filter(Boolean).join('');
    main.appendChild(meta);
    if (st.note) {
      const note = document.createElement('p');
      note.className = 'w-note';
      note.textContent = st.note;
      main.appendChild(note);
    }

    const num = document.createElement('span');
    num.className = 'w-num';
    num.textContent = st.n;

    row.append(num, cb, main);

    if (st.eps.length) {
      const open = expanded.has(st.id);
      const tog = document.createElement('button');
      tog.className = 'w-toggle';
      tog.setAttribute('aria-expanded', open);
      tog.innerHTML = `<span class="w-count">${done}/${total}</span><span class="w-chev" aria-hidden="true">▾</span>`;
      tog.setAttribute('aria-label', `${open ? 'Hide' : 'Show'} episodes of ${st.title} (${done} of ${total} watched)`);
      tog.addEventListener('click', () => {
        if (expanded.has(st.id)) expanded.delete(st.id); else expanded.add(st.id);
        render();
      });
      row.appendChild(tog);
    }
    li.appendChild(row);

    if (st.eps.length && expanded.has(st.id)) {
      const ol = document.createElement('ol');
      ol.className = 'w-eps';
      st.eps.forEach(ep => {
        const eli = document.createElement('li');
        const on = isOn(ep.key);
        eli.className = 'w-ep' + (on ? ' done' : '');
        if (hideEl.checked && on) eli.hidden = true;
        const label = document.createElement('label');
        const ecb = checkbox(on, '');
        ecb.addEventListener('change', () => { setOn(ep.key, ecb.checked); save(); render(); });
        label.appendChild(ecb);
        label.insertAdjacentHTML('beforeend',
          `${ep.badge ? `<span class="w-badge">${ep.badge}</span>` : ''}<span class="w-ep-title">${ep.title}</span>${ep.note ? `<span class="w-ep-note">${ep.note}</span>` : ''}`);
        eli.appendChild(label);
        ol.appendChild(eli);
      });
      li.appendChild(ol);
    }
    return li;
  }

  function render() {
    const scrollY = window.scrollY;
    listEl.innerHTML = '';
    steps.forEach(st => {
      const el = renderStep(st);
      if (hideEl.checked && isDone(st)) el.hidden = true;
      listEl.appendChild(el);
    });

    const all = steps.flatMap(st => st.keys);
    const done = all.filter(isOn).length;
    const pct = all.length ? Math.round(done / all.length * 100) : 0;
    progressEl.innerHTML = `
      <div class="w-bar"><i style="width:${pct}%"></i></div>
      <span><b>${done}</b> of ${all.length} watched · ${pct}%</span>`;

    const next = steps.find(st => !isDone(st));
    nextEl.innerHTML = '';
    if (next) {
      const ep = next.eps.find(e => !isOn(e.key));
      const btn = document.createElement('button');
      btn.className = 'w-next-btn';
      btn.innerHTML = `<span>Up next</span> ${next.title}${ep ? ` · ${ep.badge ? ep.badge + ' ' : ''}${ep.title}` : (next.part ? ` · ${next.part}` : '')}`;
      btn.addEventListener('click', () => {
        if (next.eps.length) expanded.add(next.id);
        render();
        const el = listEl.querySelector(`[data-id="${next.id}"]`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      nextEl.appendChild(btn);
    } else {
      nextEl.textContent = 'You\'ve watched the whole saga.';
    }
    window.scrollTo(0, scrollY);
  }

  hideEl.addEventListener('change', render);
  resetEl.addEventListener('click', () => {
    if (!confirm('Clear all of your watch progress?')) return;
    watched = {};
    save(); render();
  });

  render();
})();
