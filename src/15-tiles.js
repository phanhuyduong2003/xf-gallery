  // ---------------------------------------------------------------------------
  // Grid / scroll tiles and filmstrip thumbnails
  // ---------------------------------------------------------------------------
  function buildTile(item) {
    const t = el('div', { className: 'xtg-tile' });
    t.dataset.kind = kindOf(item);
    t.dataset.page = item.page;
    const list = S.view === 'list';
    const cap = el('div', { className: 'xtg-cap' });
    cap.innerHTML = list
      ? `${esc(tr('page', item.page))}<a href="${esc(postUrl(item))}" target="_blank" rel="noopener">${esc(tr('postLink'))}</a>` +
        (item.source ? `<a href="${esc(item.source)}" target="_blank" rel="noopener noreferrer">${esc(tr('sourceLink'))}</a>` : '')
      : esc(tr('page', item.page)) + (item.type !== 'image' && item.meta && item.meta.author ? ` · ${esc(item.meta.author)}` : '');
    cap.querySelectorAll('a').forEach((a) => { a.onclick = (e) => e.stopPropagation(); });

    if (item.dead) {
      t.classList.add('xtg-dead');
      t.innerHTML = `<div class="xtg-ph">${ic('dead', 30)}${esc(tr('dead'))}<span>${esc(hostOf(item.source))}</span></div>`;
      t.appendChild(cap);
      if (item.source) t.onclick = () => window.open(item.source, '_blank', 'noopener');
      return t;
    }
    if (list && showsLabel(item)) t.appendChild(el('div', { className: 'xtg-post', innerHTML: posterHTML(item, true) }));

    const fail = () => markDead(item);
    const open = () => { S.userMoved = true; setView('viewer'); showItem(item); };

    if (item.type === 'image') {
      const img = el('img', { alt: '' });
      lazyImage(img, item, uniq(list ? [item.working, ...item.candidates] : [item.medium, item.working, item.thumb, ...item.candidates]), fail, list ? 'auto' : 'low');
      img.onclick = open;
      t.appendChild(img);
    } else if (list && item.type === 'video') {
      const v = mediaEl('video', { controls: true, preload: 'metadata' });
      if (item.thumb) v.poster = item.thumb;
      loadVideo(v, item, () => videoFail(item));
      t.appendChild(v);
    } else if (list) {
      t.appendChild(iframeEl(item.url, true));
    } else {
      if (item.thumb) {
        const img = el('img', { loading: 'lazy', alt: '', referrerPolicy: 'no-referrer', src: item.thumb });
        img.onerror = () => {
          img.replaceWith(el('div', { className: 'xtg-ph', innerHTML: ic('play', 30, true) }));
          ensureThumb(item, img.src);
        };
        t.appendChild(img);
      } else if (item.type === 'video') {
        const v = mediaEl('video', { muted: true, preload: 'metadata' });
        thumbVideo(v, item, () => videoFail(item));
        t.appendChild(v);
      } else {
        t.innerHTML = `<div class="xtg-ph">${ic('play', 30, true)}${esc(hostOf(item.url))}</div>`;
      }
      const isVid = item.type === 'video';
      t.insertAdjacentHTML('beforeend', `<span class="xtg-badge">${ic(isVid ? 'video' : 'play', 13, !isVid)}${esc(isVid ? tr('video') : hostOf(item.url))}</span>`);
      t.onclick = open;
    }
    t.appendChild(cap);
    return t;
  }

  function replaceTile(item) {
    const fresh = buildTile(item);
    item.el.replaceWith(fresh);
    item.el = fresh;
  }

  // Page dividers ("p. 2") in the filmstrip, rebuilt shortly after items arrive
  let dividerTimer = null;
  function scheduleDividers() {
    clearTimeout(dividerTimer);
    dividerTimer = setTimeout(updateDividers, 80);
  }
  function updateDividers() {
    if (!ui) return;
    ui.strip.querySelectorAll('.xtg-pdiv, .xtg-gap').forEach((d) => d.remove());
    ui.grid.querySelectorAll('.xtg-gap').forEach((d) => d.remove());
    gapObserver.disconnect();
    if (S.totalPages > 1) {
      let last = null;
      for (const th of [...ui.strip.children]) {
        if (S.filter !== 'all' && th.dataset.kind !== S.filter) continue;
        if (th.dataset.page === last) continue;
        last = th.dataset.page;
        th.before(el('div', { className: 'xtg-pdiv', textContent: tr('pageShort', last) }));
      }
      const runs = gapRuns();
      placeGaps(ui.strip, '.xtg-th', runs);
      placeGaps(ui.grid, '.xtg-tile', runs).forEach((g) => gapObserver.observe(g));
    }
    centerStrip(false, false);
  }

  // Runs of consecutive pages that are not loaded, by kind: 'unloaded' | 'loading' | 'failed'
  function gapRuns() {
    const runs = [];
    let run = null;
    for (let p = 1; p <= S.totalPages; p++) {
      const st = S.pageState.get(p);
      const kind = st === 'loaded' ? null : st === 'failed' ? 'failed' : st === 'queued' || st === 'loading' ? 'loading' : 'unloaded';
      if (!kind) run = null;
      else if (run && run.kind === kind) run.b = p;
      else runs.push(run = { a: p, b: p, kind });
    }
    return runs;
  }

  // A "p. 4–8 · not loaded" box where those pages would be, among thumbnails / tiles (sorted by page)
  function placeGaps(box, sel, runs) {
    const items = [...box.querySelectorAll(':scope > ' + sel)];
    const made = [];
    let i = 0;
    for (const run of runs) {
      while (i < items.length && +items[i].dataset.page < run.a) i++;
      const g = el('button', { className: 'xtg-gap', title: run.kind === 'loading' ? '' : tr('gapTip') });
      Object.assign(g.dataset, { a: run.a, b: run.b, kind: run.kind });
      const state = tr(run.kind === 'failed' ? 'gapFailed' : run.kind === 'loading' ? 'gapLoading' : 'gapUnloaded');
      g.innerHTML = `<b>${esc(tr('gapPages', run.a, run.b))}</b><span>${esc(state)}</span>`;
      g.onclick = (e) => { e.stopPropagation(); openGap(run); };
      let at = items[i] || null;
      if (at && at.previousElementSibling && at.previousElementSibling.classList.contains('xtg-pdiv')) at = at.previousElementSibling;
      box.insertBefore(g, at && at.parentNode === box ? at : null);
      made.push(g);
    }
    return made;
  }

  // Load the gap's page nearest to what is being viewed and, in the viewer, go to its first (or last) item
  function openGap(run) {
    if (run.kind === 'loading') return;
    const back = run.b < curPage();
    const p = back ? run.b : run.a;
    if (run.kind === 'failed') S.pageState.set(p, 'unloaded');
    waitForPage(p, () => {
      const list = visibleItems().filter((i) => i.page === p);
      const target = back ? list[list.length - 1] : list[0];
      if (target && S.view === 'viewer') { S.userMoved = true; showItem(target); }
      else if (target && target.el) target.el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, { dir: back ? -1 : 1 });
  }

  function resumeThere() {
    const o = S.resumeOffer;
    S.resumeOffer = null;
    if (!o) return;
    waitForPage(o.page, () => {
      const list = visibleItems().filter((i) => i.page === o.page);
      const target = list.find((i) => i.key === o.key) || list[0];
      if (target) { S.userMoved = true; showItem(target); }
    }, { key: o.key, dir: 1 });
    scheduleStatus();
  }

  // Grid / Scroll: a not-loaded gap after the page being viewed that scrolls into view loads its next page,
  // like an endless list (not in Saver mode, and never backwards, so opening the list does not walk to page 1)
  const gapObserver = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const g = e.target;
      if (!e.isIntersecting || S.loadMode === 'saver' || browsing() || g.dataset.kind !== 'unloaded' || ui.scroll.hidden) continue;
      if (+g.dataset.a > curPage()) requestPage(+g.dataset.a, { explicit: true });
    }
  }, { rootMargin: '400px' });

  // Keep the viewed item's thumbnail in the middle of the filmstrip. Items arriving later shift it, so this
  // also runs after insertions, unless the user scrolled the strip themselves in the last few seconds.
  function centerStrip(smooth, force) {
    const th = S.cur && S.cur.thumbEl;
    if (!ui || !th || !th.isConnected || ui.viewer.hidden) return;
    if (!force && Date.now() - S.stripTouched < 3000) return;
    const strip = ui.strip;
    strip.scrollTo({ left: th.offsetLeft - strip.clientWidth / 2 + th.offsetWidth / 2, behavior: smooth ? 'smooth' : 'auto' });
  }

  function buildThumb(item) {
    const th = el('div', { className: 'xtg-th', title: tr('page', item.page) });
    th.dataset.page = item.page;
    th.dataset.kind = kindOf(item);
    if (item.type === 'image') {
      const img = el('img', { alt: '' });
      lazyImage(img, item, uniq([item.small, item.medium, item.thumb, item.working, ...item.candidates]), () => markDead(item));
      th.appendChild(img);
    } else {
      if (item.thumb) {
        const img = el('img', { loading: 'lazy', alt: '', referrerPolicy: 'no-referrer', src: item.thumb });
        img.onerror = () => { img.remove(); ensureThumb(item, img.src); };
        th.appendChild(img);
      } else if (item.type === 'video') {
        const v = mediaEl('video', { muted: true, preload: 'metadata' });
        thumbVideo(v, item, () => v.remove());
        th.appendChild(v);
      }
      th.insertAdjacentHTML('beforeend', `<span>${ic('play', 18, true)}</span>`);
    }
    th.onclick = () => { S.userMoved = true; showItem(item); };
    return th;
  }

