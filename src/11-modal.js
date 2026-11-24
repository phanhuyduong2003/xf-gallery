  // ---------------------------------------------------------------------------
  // Modal
  // ---------------------------------------------------------------------------
  function buildUI() {
    const root = el('div', { id: 'xtg-root', hidden: true });
    // label: always shown; short: replaces the label on narrow screens
    const labels = (label, short) => (short
      ? `<span class="xtg-lbl xtg-long">${esc(label)}</span><span class="xtg-lbl xtg-short">${esc(short)}</span>`
      : (label ? `<span class="xtg-lbl">${esc(label)}</span>` : ''));
    const btn = (attrs, icon, label, tip, short) =>
      `<button class="xtg-ib" ${attrs} title="${esc(tip)}" aria-label="${esc(label || tip)}">${icon}${labels(label, short)}</button>`;
    root.innerHTML = `
      <div class="xtg-modal" role="dialog" aria-label="${esc(tr('dialog'))}">
        <div class="xtg-top">
          <div class="xtg-head">
            <div class="xtg-titleblock">
              <span class="xtg-counter">0 / 0</span>
              <div class="xtg-meta">
                <span class="xtg-pageinfo"></span>
                <span class="xtg-status"></span>
                <button class="xtg-stoplink" data-act="stop" title="${esc(tr('stopTip'))}">${esc(tr('stopShort'))}</button>
              </div>
            </div>
            <div class="xtg-filterwrap">
              <button class="xtg-fbtn" data-act="filter" title="${esc(tr('filterTip'))}" aria-haspopup="true">
                ${ic('filter', 15)}<span class="xtg-fcur"></span><b class="xtg-fcount">0</b>${ic('down', 14)}
              </button>
              <div class="xtg-fmenu" hidden>
                <button data-filter="all">${ic('images', 15)}<span>${esc(tr('fAll'))}</span><b>0</b></button>
                <button data-filter="image">${ic('image', 15)}<span>${esc(tr('fImages'))}</span><b>0</b></button>
                <button data-filter="video">${ic('video', 15)}<span>${esc(tr('fVideos'))}</span><b>0</b></button>
              </div>
            </div>
          </div>
          <div class="xtg-tools">
            <span class="xtg-seg">
              ${btn('data-view="viewer"', ic('image', 16), tr('view'), tr('viewTip'))}
              ${btn('data-view="grid"', ic('grid', 16), tr('grid'), tr('gridTip'))}
              ${btn('data-view="list"', ic('rows', 16), tr('scroll'), tr('scrollTip'))}
            </span>
            <span class="xtg-sep"></span>
            ${btn('data-act="play"', `<span class="xtg-pi">${ic('play', 16, true)}</span>`, tr('slideshow'), tr('slideshowTip'), tr('slideshowShort'))}
            <a class="xtg-ib" data-act="post" target="_blank" rel="noopener" title="${esc(tr('postTip'))}">${ic('post', 16)}<span class="xtg-lbl">${esc(tr('post'))}</span></a>
            <a class="xtg-ib" data-act="src" target="_blank" rel="noopener noreferrer" title="${esc(tr('sourceTip'))}">${ic('link', 16)}<span class="xtg-lbl">${esc(tr('source'))}</span></a>
            ${btn('data-act="menu"', ic('settings', 16), tr('options'), tr('options'))}
          </div>
          <button class="xtg-ib xtg-close" data-act="close" title="${esc(tr('close'))}" aria-label="${esc(tr('close'))}">${ic('x', 20)}</button>
          <div class="xtg-menu" hidden>
            <label><input type="checkbox" data-opt="infoVideos"> ${esc(tr('optInfoVideos'))}</label>
            <label><input type="checkbox" data-opt="infoImages"> ${esc(tr('optInfoImages'))}</label>
            <label><input type="checkbox" data-opt="dead"> ${esc(tr('optDead'))}</label>
            <div class="xtg-mtitle">${esc(tr('modeTitle'))}</div>
            <label><input type="radio" name="xtg-mode" value="saver"> ${esc(tr('modeSaver'))}</label>
            <label><input type="radio" name="xtg-mode" value="balanced"> ${esc(tr('modeBalanced'))}</label>
            <label><input type="radio" name="xtg-mode" value="all"> ${esc(tr('modeAll'))}</label>
            <button data-act="reload">${esc(tr('optReload'))}</button>
            <button data-act="hosts">${esc(tr('optHosts'))}</button>
          </div>
        </div>
        <div class="xtg-banner" hidden></div>
        <div class="xtg-body">
          <div class="xtg-viewer">
            <div class="xtg-stagebox">
              <div class="xtg-stage"></div>
              <button class="xtg-nav xtg-prev" title="${esc(tr('prev'))}" aria-label="${esc(tr('prev'))}">${ic('left', 28)}</button>
              <button class="xtg-nav xtg-next" title="${esc(tr('next'))}" aria-label="${esc(tr('next'))}">${ic('right', 28)}</button>
            </div>
            <div class="xtg-stripbar">
              <button class="xtg-edge xtg-first" title="${esc(tr('first'))}" aria-label="${esc(tr('first'))}">${ic('first', 20)}</button>
              <button class="xtg-snav xtg-sprev" data-nav="-1" title="${esc(tr('prev'))}" aria-label="${esc(tr('prev'))}">${ic('left', 22)}</button>
              <div class="xtg-strip"></div>
              <button class="xtg-snav xtg-snext" data-nav="1" title="${esc(tr('next'))}" aria-label="${esc(tr('next'))}">${ic('right', 22)}</button>
              <button class="xtg-edge xtg-last" title="${esc(tr('last'))}" aria-label="${esc(tr('last'))}">${ic('last', 20)}</button>
            </div>
          </div>
          <div class="xtg-scroll" hidden>
            <div class="xtg-grid xtg-hide-dead"></div>
            <div class="xtg-empty"></div>
          </div>
        </div>
      </div>`;
    document.body.appendChild(root);
    const q = (s) => root.querySelector(s);
    ui = {
      root, modal: q('.xtg-modal'), counter: q('.xtg-counter'), pageInfo: q('.xtg-pageinfo'), status: q('.xtg-status'),
      playBtn: q('[data-act="play"]'), postLink: q('[data-act="post"]'), srcLink: q('[data-act="src"]'),
      stopBtn: q('[data-act="stop"]'), menu: q('.xtg-menu'), fmenu: q('.xtg-fmenu'),
      fcur: q('.xtg-fcur'), fcount: q('.xtg-fcount'),
      prevBtns: root.querySelectorAll('.xtg-prev, .xtg-sprev'), nextBtns: root.querySelectorAll('.xtg-next, .xtg-snext'),
      firstBtn: q('.xtg-first'), lastBtn: q('.xtg-last'),
      viewer: q('.xtg-viewer'), stage: q('.xtg-stage'), strip: q('.xtg-strip'),
      scroll: q('.xtg-scroll'), grid: q('.xtg-grid'), empty: q('.xtg-empty'), banner: q('.xtg-banner'),
    };

    root.addEventListener('click', (e) => {
      const more = e.target.closest('.xtg-more, .xtg-full');
      if (more) {
        const box = more.closest('.xtg-reel-info, .xtg-post');
        if (more.classList.contains('xtg-full')) more.textContent = box.classList.toggle('xtg-showfull') ? tr('less') : tr('fullPost');
        else more.textContent = box.classList.toggle('xtg-expanded') ? tr('less') : tr('more');
        positionOverlay();
        e.stopPropagation();
        return;
      }
      if (e.target === root) { closeGallery(); return; } // click on the backdrop
      if (!e.target.closest('.xtg-menu, [data-act="menu"]')) ui.menu.hidden = true;
      if (!e.target.closest('.xtg-filterwrap')) ui.fmenu.hidden = true;
      const filterBtn = e.target.closest('[data-filter]');
      if (filterBtn) { ui.fmenu.hidden = true; setFilter(filterBtn.getAttribute('data-filter')); return; }
      const viewBtn = e.target.closest('[data-view]');
      if (viewBtn) { setView(viewBtn.getAttribute('data-view')); return; }
      const act = e.target.closest('[data-act]');
      switch (act && act.getAttribute('data-act')) {
        case 'close': closeGallery(); break;
        case 'stop': stopPages(); break;
        case 'play': toggleSlideshow(); break;
        case 'menu': ui.menu.hidden = !ui.menu.hidden; ui.fmenu.hidden = true; break;
        case 'filter': ui.fmenu.hidden = !ui.fmenu.hidden; ui.menu.hidden = true; break;
        case 'hosts': ui.menu.hidden = true; editHosts(); break;
        case 'reload': reloadThread(); break;
        case 'retry': renderStage(); break;
        case 'pin': togglePin(); break;
        case 'netcontinue': netContinue(); break;
        case 'loadall': S.allConfirmed = true; ensureWindow(); scheduleStatus(); break;
        case 'later': S.allDismissed = true; scheduleStatus(); break;
        case 'browseack': store.set('browseAck', true); scheduleStatus(); break;
        case 'browseoff': store.set('browseAck', false); net.write({ browse: 0 }); ensureWindow(); scheduleStatus(); break;
        case 'resume': resumeThere(); break;
        case 'resumeno': S.resumeOffer = null; scheduleStatus(); break;
        default: break;
      }
    });

    const opt = (name) => q(`[data-opt="${name}"]`);
    ['infoVideos', 'infoImages'].forEach((kind) => {
      opt(kind).checked = S[kind];
      opt(kind).addEventListener('change', (e) => setInfo(kind, e.target.checked));
    });
    root.querySelectorAll('[name="xtg-mode"]').forEach((r) => {
      r.checked = r.value === S.loadMode;
      r.addEventListener('change', () => setLoadMode(r.value));
    });
    opt('dead').addEventListener('change', (e) => {
      S.showDead = e.target.checked;
      ui.grid.classList.toggle('xtg-hide-dead', !S.showDead);
    });
    enableDragScroll(ui.strip);
    ui.prevBtns.forEach((b) => { b.onclick = () => step(-1, true); });
    ui.nextBtns.forEach((b) => { b.onclick = () => step(1, true); });
    ui.firstBtn.onclick = () => jumpToEdge(-1);
    ui.lastBtn.onclick = () => jumpToEdge(1);
    new ResizeObserver(positionOverlay).observe(ui.stage);
    setupStageGestures();
    setSlideshow(S.slideshow, false);
    setFilter(S.filter);
    document.addEventListener('keydown', onKey, true);
    applyView();
  }

  function setLoadMode(mode) {
    S.loadMode = mode;
    store.set('loadMode', mode);
    S.allConfirmed = false;
    S.allDismissed = false;
    ensureWindow();
    pumpPages();
    scheduleStatus();
  }

  // Drag the filmstrip sideways with the mouse; a click without dragging still opens the thumbnail.
  // The vertical mouse wheel scrolls it sideways too.
  function enableDragScroll(strip) {
    let down = null, dragged = false;
    strip.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = { x: e.clientX, left: strip.scrollLeft };
      S.stripTouched = Date.now();
      dragged = false;
    });
    window.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - down.x;
      if (!dragged && Math.abs(dx) > 5) { dragged = true; strip.classList.add('xtg-dragging'); }
      if (dragged) { strip.scrollLeft = down.left - dx; e.preventDefault(); }
    });
    window.addEventListener('pointerup', () => {
      if (!down) return;
      down = null;
      strip.classList.remove('xtg-dragging');
      if (dragged) setTimeout(() => { dragged = false; }, 0); // after the click that follows this pointerup
    });
    strip.addEventListener('touchstart', () => { S.stripTouched = Date.now(); }, { passive: true });
    strip.addEventListener('click', (e) => { if (dragged) { e.stopPropagation(); e.preventDefault(); } }, true);
    strip.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      strip.scrollLeft += e.deltaY;
      S.stripTouched = Date.now();
      e.preventDefault();
    }, { passive: false });
  }

  function onKey(e) {
    if (!ui || ui.root.hidden || /^(INPUT|TEXTAREA|SELECT)$/.test((e.target && e.target.tagName) || '')) return;
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (k === 'Escape') {
      if (!ui.menu.hidden || !ui.fmenu.hidden) { ui.menu.hidden = true; ui.fmenu.hidden = true; } else closeGallery();
      e.preventDefault();
      return;
    }
    if (S.view === 'viewer' && S.videoCtl) {
      if (k === 'k') { S.videoCtl.toggle(); return; }
      if (k === 'm') { S.videoCtl.mute(); return; }
      if (k === 'f') { toggleFullscreen(); return; }
    }
    if (k === 'i') { // toggles the info of the kind being viewed
      const kind = S.cur && S.cur.type === 'image' ? 'infoImages' : 'infoVideos';
      setInfo(kind, !S[kind]);
      return;
    }
    if (k === 'p') { togglePin(); return; } // keeps the image info shown, outside the picture
    if (k === 'g') { setView(S.view === 'grid' ? 'viewer' : 'grid'); return; }
    if (k === 'Home' || k === 'End') { jumpToEdge(k === 'Home' ? -1 : 1); e.preventDefault(); return; }
    if (S.view !== 'viewer') return;
    if (k === 'ArrowRight') { step(1, true); e.preventDefault(); }
    else if (k === 'ArrowLeft') { step(-1, true); e.preventDefault(); }
    else if (k === ' ') { toggleSlideshow(); e.preventDefault(); }
  }

  function editHosts() {
    const v = prompt(tr('hostsPrompt'), hosts.join(', '));
    if (v == null) return;
    hosts = v.trim() ? v.split(',').map((s) => s.trim()).filter(Boolean) : DEFAULT_HOSTS.slice();
    store.set('hosts', hosts);
    if (ui && !ui.root.hidden) toast(tr('saved')); else alert(tr('saved'));
  }

  function toast(msg) {
    const node = el('div', { className: 'xtg-toast', textContent: msg });
    ui.modal.appendChild(node);
    setTimeout(() => node.remove(), 3200);
  }

  // ---------------------------------------------------------------------------
  // Status bar (many changes in a row are batched into one update)
  // ---------------------------------------------------------------------------
  const liveItems = () => S.items.filter((i) => !i.dead);
  const kindOf = (item) => (item.type === 'image' ? 'image' : 'video');
  const passesFilter = (item) => S.filter === 'all' || kindOf(item) === S.filter;
  const visibleItems = () => S.items.filter((i) => !i.dead && passesFilter(i));

  function setFilter(f) {
    S.filter = f;
    store.set('filter', f);
    ui.root.classList.toggle('xtg-f-image', f === 'image');
    ui.root.classList.toggle('xtg-f-video', f === 'video');
    ui.root.querySelectorAll('[data-filter]').forEach((b) => b.classList.toggle('on', b.getAttribute('data-filter') === f));
    ui.fcur.textContent = tr({ all: 'fAll', image: 'fImages', video: 'fVideos' }[f]);
    ui.root.querySelector('.xtg-fbtn').classList.toggle('on', f !== 'all');
    if (S.cur && !passesFilter(S.cur)) {
      // jump to the nearest item of the chosen kind, preferring the ones after the current item
      const i = S.items.indexOf(S.cur);
      const pick = S.items.slice(i + 1).find((x) => !x.dead && passesFilter(x)) ||
        S.items.slice(0, i).reverse().find((x) => !x.dead && passesFilter(x));
      S.cur = null;
      if (pick) showItem(pick); else renderStage();
    }
    updateDividers();
    scheduleStatus();
  }
  const loadedPages = () => { let n = 0; S.pageState.forEach((v) => { if (v === 'loaded') n++; }); return n; };
  const isLoading = () => pageQ.queue.length > 0 || pageQ.running || S.pending > 0;

  function renderBanner() {
    const st = S.netState;
    let html = '';
    if (st === 'trip') {
      if (net.read().trip?.reason === 'rate') html = `<span>${esc(tr('bannerRateStop'))}</span><button data-act="netcontinue">${esc(tr('btnContinue'))}</button>`;
      else html = `<span>${esc(tr('bannerTrip'))}</span><a href="${esc(location.href.split('#')[0])}" target="_blank" rel="noopener">${esc(tr('btnOpenPage'))}</a>` +
        `<button data-act="netcontinue">${esc(tr('btnContinue'))}</button>`;
    } else if (st === 'rate') {
      const left = Math.max(1, Math.round(((net.read().trip || {}).until - Date.now()) / 1000));
      html = `<span>${esc(tr('bannerRate', left))}</span>`;
    } else if (st === 'cap') {
      html = `<span>${esc(tr('bannerCap', SESSION_CAP))}</span><button data-act="netcontinue">${esc(tr('btnContinue'))}</button>`;
    } else if (browsing() && !store.get('browseAck', false)) {
      html = `<span>${esc(tr('bannerBrowse'))}</span><button data-act="browseack">${esc(tr('btnGotIt'))}</button>` +
        `<button data-act="browseoff">${esc(tr('btnBgRetry'))}</button>`;
    } else if (S.started && S.loadMode === 'all' && !loadsAll() && !S.allDismissed && !browsing()) {
      const left = S.totalPages - loadedPages();
      const min = Math.max(1, Math.ceil(left * PAGE_INTERVAL_MS / 60e3), Math.floor((left - 1) / SESSION_CAP) * 10);
      html = `<span>${esc(tr('bannerAll', S.totalPages, min))}</span><button data-act="loadall">${esc(tr('btnLoadAll'))}</button>` +
        `<button data-act="later">${esc(tr('btnLater'))}</button>`;
    } else if (S.resumeOffer && !(S.cur && S.cur.page === S.resumeOffer.page)) {
      html = `<span>${esc(tr('resumeAsk', S.resumeOffer.page))}</span><button data-act="resume">${esc(tr('btnResume'))}</button>` +
        `<button data-act="resumeno">${esc(tr('btnSkip'))}</button>`;
    }
    if (ui.banner.dataset.html !== html) {
      ui.banner.dataset.html = html;
      ui.banner.innerHTML = html;
      ui.banner.hidden = !html;
    }
  }
  let statusQueued = false;
  function scheduleStatus() {
    if (statusQueued || !ui) return;
    statusQueued = true;
    setTimeout(() => { statusQueued = false; renderStatus(); }, 16);
  }

  function renderStatus() {
    const all = liveItems();
    let images = 0;
    for (const i of all) if (i.type === 'image') images++;
    const counts = { all: all.length, image: images, video: all.length - images };
    ui.root.querySelectorAll('[data-filter]').forEach((b) => { b.querySelector('b').textContent = counts[b.getAttribute('data-filter')]; });
    ui.fcount.textContent = counts[S.filter];
    const live = visibleItems();
    const dead = S.items.length - all.length;
    const loading = isLoading();
    let st = '';
    if (dead) st += tr('broken', dead);
    const loaded = loadedPages();
    if (S.totalPages > 1 && loaded < S.totalPages) st += tr('pagesLoaded', loaded, S.totalPages);
    if (S.netState === 'wait') st += tr('netWait');
    else if (S.netState === 'fetching') st += tr('netFetching', S.fetchingPage);
    else if (S.netState === 'hidden') st += tr('netHidden');
    else if (browsing()) st += tr('netBrowse');
    else if (S.netState === 'cap' || S.netState === 'trip' || S.netState === 'rate') st += tr('netPaused');
    if (S.pagesCached) st += tr('fromCache', S.pagesCached);
    if (S.pageErrors) st += tr('pageErrors', S.pageErrors);
    ui.status.textContent = st.replace(/^ · /, '');
    renderBanner();
    ui.stopBtn.hidden = !loading;
    const pos = S.cur && !S.cur.dead ? live.indexOf(S.cur) : -1;
    ui.counter.textContent = `${pos + 1} / ${live.length}`;
    ui.pageInfo.textContent = pos >= 0 && S.totalPages > 1 ? tr('pageOf', S.cur.page, S.totalPages) : '';
    const atStart = pos <= 0 && !moreIn(-1), atEnd = (pos < 0 || pos >= live.length - 1) && !moreIn(1);
    ui.prevBtns.forEach((b) => { b.disabled = atStart; });
    ui.nextBtns.forEach((b) => { b.disabled = atEnd; });
    ui.firstBtn.disabled = atStart;
    ui.lastBtn.disabled = atEnd;
    const msg = loading ? tr('searching') : tr('none');
    ui.empty.textContent = msg;
    ui.empty.style.display = live.length ? 'none' : '';
    if (!S.cur && S.view === 'viewer') ui.stage.innerHTML = `<div class="xtg-msg">${esc(live.length ? tr('loading') : msg)}</div>`;
  }

