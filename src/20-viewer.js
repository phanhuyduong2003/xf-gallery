  // ---------------------------------------------------------------------------
  // Viewer: zoom, pan, swipe
  // ---------------------------------------------------------------------------
  let Z = { s: 1, x: 0, y: 0 };
  const stageImg = () => ui.stage.querySelector(':scope > img');

  function applyZoom() {
    const img = stageImg();
    if (!img) return;
    img.style.transform = `translate(${Z.x}px, ${Z.y}px) scale(${Z.s})`;
    img.classList.toggle('zoomed', Z.s > 1);
    ui.stage.classList.toggle('zoomed', Z.s > 1);
    if (Z.s > 1 && S.cur && S.cur.large && img.src === S.cur.large) upgradeToFull(S.cur, img); // zoomed: the details need the original
  }

  function zoomTo(scale, cx, cy) {
    const s = Math.min(6, Math.max(1, scale));
    if (s === 1) { Z = { s: 1, x: 0, y: 0 }; applyZoom(); return; }
    const r = ui.stage.getBoundingClientRect();
    const px = cx - (r.left + r.width / 2), py = cy - (r.top + r.height / 2);
    const k = s / Z.s;
    Z = { s, x: px - (px - Z.x) * k, y: py - (py - Z.y) * k }; // keep the point under the cursor fixed
    applyZoom();
  }

  function setupStageGestures() {
    const st = ui.stage;
    const pointers = new Map();
    let start = null, pinch = null;

    st.addEventListener('wheel', (e) => {
      if (!stageImg()) return;
      e.preventDefault();
      zoomTo(Z.s * (e.deltaY < 0 ? 1.2 : 1 / 1.2), e.clientX, e.clientY);
    }, { passive: false });

    st.addEventListener('pointerdown', (e) => {
      if (e.target.closest('video, iframe, a, .xtg-reel, .xtg-embed')) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return; // right/middle click: leave the context menu alone
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 1) start = { x: e.clientX, y: e.clientY, zx: Z.x, zy: Z.y, t: Date.now(), moved: false, onImg: e.target === stageImg() };
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), s: Z.s };
      }
      try { st.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    });

    st.addEventListener('pointermove', (e) => {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const img = stageImg();
      if (pointers.size === 2 && pinch && img) {
        const [a, b] = [...pointers.values()];
        zoomTo((pinch.s * Math.hypot(a.x - b.x, a.y - b.y)) / pinch.d, (a.x + b.x) / 2, (a.y + b.y) / 2);
        if (start) start.moved = true;
        return;
      }
      if (!start) return;
      const dx = e.clientX - start.x, dy = e.clientY - start.y;
      if (Math.abs(dx) + Math.abs(dy) > 6) start.moved = true;
      if (Z.s > 1 && img) {
        img.classList.add('dragging');
        Z.x = start.zx + dx;
        Z.y = start.zy + dy;
        applyZoom();
      }
    });

    const end = (e) => {
      if (!pointers.has(e.pointerId)) return;
      pointers.delete(e.pointerId);
      const img = stageImg();
      if (img) img.classList.remove('dragging');
      if (pointers.size < 2) pinch = null;
      if (pointers.size || !start) return;
      const dx = e.clientX - start.x;
      if (!start.moved && e.type === 'pointerup' && img && start.onImg) {
        if (Z.s > 1) zoomTo(1); else zoomTo(2.5, e.clientX, e.clientY);   // click to zoom in / out
      } else if (Z.s === 1 && Math.abs(dx) > 60 && Date.now() - start.t < 800) {
        step(dx < 0 ? 1 : -1, true);                                      // horizontal swipe
      }
      start = null;
    };
    st.addEventListener('pointerup', end);
    st.addEventListener('pointercancel', end);
  }

  let viewTimer = null;
  function rememberView() {
    clearTimeout(viewTimer);
    viewTimer = setTimeout(() => {
      if (S.cur && !(S.cur === S.autoPicked && !S.navIntent)) cache.put('v:' + THREAD_ID, { lastKey: S.cur.key, lastPage: S.cur.page, totalPages: S.totalPages });
    }, 800);
  }

  function showItem(item) {
    clearTimeout(navTimer);
    S.cur = item;
    S.pendingNav = null;
    if (item) setFocus(item.page);
    rememberView();
    if (ui.viewer.hidden && S.view === 'viewer') applyView();
    else renderStage();
  }

  // First (-1) or last (+1) item of the current filter. In Grid / Scroll views this scrolls the list.
  function jumpToEdge(dir) {
    const edge = dir < 0 ? 1 : S.totalPages;
    const st = S.pageState.get(edge);
    if (st !== 'loaded' && st !== 'failed') { waitForPage(edge, () => jumpToEdge(dir), { dir: -dir }); return; }
    const list = visibleItems();
    const target = dir < 0 ? list[0] : list[list.length - 1];
    if (S.view !== 'viewer') {
      ui.scroll.scrollTo({ top: dir < 0 ? 0 : ui.scroll.scrollHeight, behavior: 'smooth' });
      if (target) S.cur = target;
      scheduleStatus();
      return;
    }
    if (!target || target === S.cur) return;
    S.userMoved = true;
    S.lastDir = dir;
    showItem(target);
  }

  // Move to the next live item in direction d; returns false at either end
  // Pages not loaded yet in between (or beyond the last loaded item) are loaded first, then the move happens;
  // returns true in that case too, so autoplay waits instead of stopping.
  function step(d, byUser) {
    const from = S.cur ? S.items.indexOf(S.cur) : -1;
    const here = curPage();
    let target = null;
    for (let i = from + d; i >= 0 && i < S.items.length; i += d) {
      if (S.items[i].dead || !passesFilter(S.items[i])) continue;
      target = S.items[i];
      break;
    }
    const gap = firstGap(here, target ? target.page : d > 0 ? S.totalPages + 1 : 0, d);
    if (byUser) S.userMoved = true;
    S.lastDir = d;
    if (gap) { waitForPage(gap, () => step(d, false), { dir: d }); return true; }
    if (!target) return false;
    showItem(target);
    return true;
  }

  // The current item has loaded: drop the spinner / slow notice, show the info, start the autoplay delay.
  // rid ties the call to one render, so a late load from an earlier render (e.g. before "Retry") is ignored.
  function mediaReady(rid) {
    if (rid !== S.renderId) return;
    S.curReady = true;
    clearTimeout(S.slowTimer);
    ui.stage.classList.remove('xtg-loading');
    setTimeout(() => { if (rid === S.renderId) prepareNext(S.cur); }, 300);
    const notice = ui.stage.querySelector('.xtg-slow');
    if (notice) notice.remove();
    if (S.slideshow) scheduleSlide();
  }

  function showSlowNotice(item, rid) {
    if (rid !== S.renderId || S.curReady) return;
    const notice = el('div', { className: 'xtg-slow' });
    notice.innerHTML = `<span>${esc(tr('slowMsg'))}</span><button data-act="retry">${esc(tr('retry'))}</button>` +
      (item.source ? `<a href="${esc(item.source)}" target="_blank" rel="noopener noreferrer">${esc(tr('openOriginal'))}</a>` : '');
    ui.stage.appendChild(notice);
  }

  function renderStage() {
    if (!ui || S.view !== 'viewer') return;
    const item = S.cur;
    const rid = ++S.renderId;
    S.curReady = false;
    clearTimeout(S.slowTimer);
    Z = { s: 1, x: 0, y: 0 };
    // the previous video stops downloading too (the host's bandwidth is not wasted on what is not watched)
    ui.stage.querySelectorAll('video').forEach((x) => { if (x !== PREP.v) killVideo(x); });
    if (PREP.item && item !== PREP.item && (!item || (neighbour(item, 1) !== PREP.item && neighbour(item, -1) !== PREP.item))) dropPrepared();
    ui.stage.innerHTML = '';
    ui.stage.classList.remove('zoomed', 'xtg-loading');
    clearTimeout(S.slideTimer);
    if (S.unwireVideo) { S.unwireVideo(); S.unwireVideo = null; }
    S.videoCtl = null;
    if (!item) { scheduleStatus(); return; }

    ui.postLink.href = postUrl(item);
    ui.srcLink.href = item.source || item.url || item.candidates[0] || '#';

    if (item.dead) {
      ui.stage.innerHTML = `<div class="xtg-msg">${ic('dead', 34)}${esc(tr('deadLong'))}<br>` +
        (item.source ? `<a href="${esc(item.source)}" target="_blank" rel="noopener noreferrer">${esc(tr('openOriginal'))}</a>` : '') + '</div>';
    } else if (item.type === 'image') {
      const img = el('img', { alt: '', draggable: false });
      img.fetchPriority = 'high';
      ui.stage.appendChild(img);
      const known = item.working || (fitsLarge() && item.fitted);
      if (known) {
        // the image has loaded before: it comes straight from the browser cache
        ui.stage.classList.add('xtg-loading');
        loadImage(img, item, uniq([known, ...item.candidates]), () => markDead(item), (src) => {
          mediaReady(rid);
          fillThumb(item, src);
          preloadAround(item);
        });
      } else {
        // show the thumbnail already in the cache (blurred) with a spinner while the full image loads
        if (item.shown) { img.src = item.shown; img.classList.add('xtg-preview'); }
        ui.stage.classList.add('xtg-loading');
        let fullDone = false, mid = null;
        // full image still loading after MID_DELAY_MS and the host has a medium size: show that meanwhile
        const midTimer = item.medium && item.medium !== item.shown && setTimeout(() => {
          if (fullDone || S.cur !== item) return;
          mid = new Image();
          mid.fetchPriority = 'high';
          mid.referrerPolicy = 'no-referrer';
          mid.onload = () => {
            if (fullDone || S.cur !== item || !img.isConnected || isPlaceholder(mid)) return;
            img.src = mid.src;
            img.classList.remove('xtg-preview');
          };
          mid.src = item.medium;
        }, MID_DELAY_MS);
        const full = new Image();
        full.fetchPriority = 'high';
        loadImage(full, item, uniq(fitUrls(item)), () => {
          fullDone = true;
          clearTimeout(midTimer);
          if (S.cur === item) ui.stage.classList.remove('xtg-loading');
          markDead(item);
        }, (src) => {
          fullDone = true;
          clearTimeout(midTimer);
          if (mid && !mid.complete) mid.src = ''; // the full image won: drop the medium request
          fillThumb(item, src); // also when the user has already moved on
          if (rid !== S.renderId) return;
          // decoded before the swap: a big image does not stall the page at the moment it appears
          full.decode().catch(() => {}).then(() => {
            if (rid !== S.renderId) return;
            img.src = src;
            img.classList.remove('xtg-preview');
            mediaReady(rid);
            preloadAround(item);
          });
        });
      }
      addOverlay(item, img);
    } else if (item.type === 'video') {
      ui.stage.classList.add('xtg-loading');
      const v = stageVideo(item, rid);
      v.addEventListener('ended', () => { if (S.slideshow) nextOrStop(); });
      ui.stage.appendChild(v);
      addOverlay(item, v);
    } else {
      const f = iframeEl(item.url, false);
      if (showsLabel(item)) {
        // embedded players have their own controls we cannot change, so the info goes below the frame
        const wrap = el('div', { className: 'xtg-embed' });
        wrap.append(f, el('div', { className: 'xtg-post', innerHTML: posterHTML(item, true) }));
        ui.stage.appendChild(wrap);
      } else {
        ui.stage.appendChild(f);
      }
    }

    S.items.forEach((i) => i.thumbEl && i.thumbEl.classList.toggle('on', i === item));
    centerStrip(true, true);
    scheduleStatus();

    if (item.type !== 'image' && !item.dead) setTimeout(() => { if (S.cur === item) preloadAround(item); }, 1000);
    if (item.type === 'embed' || item.dead) {
      S.curReady = true; // nothing to wait for
      setTimeout(() => { if (rid === S.renderId) prepareNext(item); }, 1000);
    } else if (!S.curReady) {
      S.slowTimer = setTimeout(() => showSlowNotice(item, rid), SLOW_NOTICE_MS);
    }
    if (S.slideshow) scheduleSlide();
  }

