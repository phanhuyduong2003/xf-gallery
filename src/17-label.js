  // ---------------------------------------------------------------------------
  // Poster label
  // ---------------------------------------------------------------------------
  const sameName = (a, b) => !!a && !!b && a.trim().toLowerCase() === b.trim().toLowerCase();
  const showsLabel = (item) => !item.dead && !!(item.meta && item.meta.author) && (item.type === 'image' ? S.infoImages : S.infoVideos);
  // Who posted the media: for a copy inside a quote (its own post not loaded), the quoted member
  const authorOf = (item) => (item.quote && item.quote.author) || (item.meta && item.meta.author) || '';

  function nameColor(name) {
    let h = 0;
    for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 360;
    return `hsl(${h},45%,42%)`;
  }

  function roleTagHTML(item) {
    if (!S.threadStarter || !authorOf(item)) return '';
    const op = sameName(authorOf(item), S.threadStarter);
    return `<span class="xtg-tag${op ? ' xtg-tag-op' : ''}">${esc(op ? tr('op') : tr('member'))}</span>`;
  }

  function posterHTML(item, withTag) {
    if (item.quote) return quotedHTML(item, withTag);
    const m = item.meta;
    const avatar = m.avatar
      ? `<img class="xtg-av" src="${esc(m.avatar)}" alt="" referrerpolicy="no-referrer" onerror="this.style.visibility='hidden'">`
      : `<span class="xtg-av xtg-av-txt" style="background:${nameColor(m.author)}">${esc([...m.author][0].toUpperCase())}</span>`;
    const name = m.profile
      ? `<a class="xtg-name" href="${esc(m.profile)}" target="_blank" rel="noopener">${esc(m.author)}</a>`
      : `<span class="xtg-name">${esc(m.author)}</span>`;
    const siblings = S.items.filter((x) => !x.dead && x.page === item.page && x.postId === item.postId);
    const where = siblings.length > 1 ? `<span class="xtg-date">${esc(tr('inPost', siblings.indexOf(item) + 1, siblings.length))}</span>` : '';
    const date = m.date ? `<span class="xtg-date">${esc(m.date)}</span>` : '';
    const shown = item.caption || m.text;
    const hasFull = !!(item.caption && m.text && item.caption !== m.text);
    const long = shown && (shown.length > 110 || shown.includes('\n'));
    const buttons = (long ? `<button class="xtg-more">${esc(tr('more'))}</button>` : '') +
      (hasFull ? `<button class="xtg-full">${esc(tr('fullPost'))}</button>` : '');
    const text = shown
      ? `<div class="xtg-text xtg-cap-text">${esc(shown)}</div>` +
        (hasFull ? `<div class="xtg-text xtg-full-text">${esc(m.text)}</div>` : '') +
        (buttons ? `<div class="xtg-btns">${buttons}</div>` : '')
      : '';
    return `<div class="xtg-who">${avatar}<div class="xtg-line">${name}${withTag ? roleTagHTML(item) : ''}${date}${where}</div></div>${text}`;
  }

  // Media seen only inside a quote: the quoted member (no avatar or profile: the quote does not carry them),
  // "quoted by" the member who quoted it, and the quoted text
  function quotedHTML(item, withTag) {
    const q = item.quote, by = item.meta.author;
    const who = q.author || by;
    const avatar = `<span class="xtg-av xtg-av-txt" style="background:${nameColor(who)}">${esc([...who][0].toUpperCase())}</span>`;
    const via = q.author ? tr('quotedBy', by) : tr('quoted');
    const text = q.text || '';
    const long = text.length > 110 || text.includes('\n');
    return `<div class="xtg-who">${avatar}<div class="xtg-line"><span class="xtg-name">${esc(who)}</span>${withTag ? roleTagHTML(item) : ''}` +
      `<span class="xtg-date xtg-via">${esc(via)}</span></div></div>` +
      (text ? `<div class="xtg-text xtg-cap-text">${esc(text)}</div>` + (long ? `<div class="xtg-btns"><button class="xtg-more">${esc(tr('more'))}</button></div>` : '') : '');
  }

  function setCornerTag(item) {
    const old = ui.stage.querySelector('.xtg-corner');
    if (old) old.remove();
    const html = showsLabel(item) ? roleTagHTML(item) : '';
    if (html) ui.stage.insertAdjacentHTML('beforeend', `<div class="xtg-corner">${html}</div>`);
  }

  // Place the corner tag and the bottom overlay on the media's layout box
  // (offset* ignores CSS transforms, so zooming an image does not move them).
  function positionOverlay() {
    if (!ui) return;
    const media = ui.stage.querySelector(':scope > video, :scope > img');
    if (!media || !media.offsetWidth || !media.offsetHeight) return;
    const sw = ui.stage.clientWidth, sh = ui.stage.clientHeight;
    const ml = media.offsetLeft, mt = media.offsetTop, mw = media.offsetWidth, mh = media.offsetHeight;
    const corner = ui.stage.querySelector('.xtg-corner');
    if (corner) {
      corner.style.left = Math.max(0, ml) + 10 + 'px';
      corner.style.top = Math.max(0, mt) + 10 + 'px';
    }
    const reel = ui.stage.querySelector('.xtg-reel');
    if (!reel) return;
    const w = Math.max(mw, Math.min(320, sw));
    const below = sh - (mt + mh);
    reel.classList.remove('xtg-reel-out');
    reel.style.left = Math.max(0, Math.min(ml - (w - mw) / 2, sw - w)) + 'px';
    reel.style.width = w + 'px';
    reel.style.bottom = Math.max(0, below) + 'px';
    // (not while the blurred preview fills the stage: the real picture decides where the info fits)
    if (!reel.classList.contains('xtg-reel-img') || !S.pinInfo || ui.stage.classList.contains('zoomed') || ui.stage.classList.contains('xtg-loading')) return;

    // Pinned image info goes next to the picture, never over it: below it when there is room (wide pictures),
    // else on its right (tall pictures; the arrows keep their 78 px), else the picture is shrunk to make room
    // below. The compact height counts: hovering expands the info over the picture on purpose, to read it all.
    const h = compactHeight(reel);
    if (below >= h) {
      reel.classList.add('xtg-reel-out');
      reel.style.bottom = below - h + 'px';
      return;
    }
    const right = sw - (ml + mw) - 78;
    if (right >= 200) {
      const rw = Math.min(320, right - 16);
      reel.classList.add('xtg-reel-out');
      reel.style.left = ml + mw + 8 + 'px';
      reel.style.width = rw + 'px';
      return;
    }
    if (media.tagName === 'IMG' && !media.dataset.reserve) { // the observer calls this again once it has shrunk
      media.dataset.reserve = h;
      media.style.maxHeight = `calc(100% - ${h}px)`;
      media.style.marginBottom = h + 'px';
    }
  }
  // Height of the info in its compact, outside-the-picture form, whatever its state now
  function compactHeight(reel) {
    const had = [reel.classList.contains('xtg-compact'), reel.classList.contains('xtg-reel-out')];
    reel.classList.add('xtg-compact', 'xtg-reel-out');
    const h = reel.offsetHeight;
    if (!had[0]) reel.classList.remove('xtg-compact');
    if (!had[1]) reel.classList.remove('xtg-reel-out');
    return h;
  }
  function releaseReserve() {
    const img = ui.stage.querySelector(':scope > img');
    if (!img || !img.dataset.reserve) return;
    delete img.dataset.reserve;
    img.style.maxHeight = img.style.marginBottom = '';
  }

  // Pin button / P key: keep the image info shown (compact, outside the picture) on every image until unpinned
  function togglePin() {
    S.pinInfo = !S.pinInfo;
    store.set('pinInfo', S.pinInfo);
    if (!S.pinInfo) releaseReserve();
    applyPin();
  }
  function applyPin() {
    if (!ui) return;
    ui.stage.classList.toggle('xtg-pinned', S.pinInfo);
    const reel = ui.stage.querySelector('.xtg-reel-img');
    if (reel) {
      const pin = reel.querySelector('.xtg-pin');
      if (pin) { pin.classList.toggle('on', S.pinInfo); pin.title = tr(S.pinInfo ? 'unpinTip' : 'pinTip'); }
      if (!reel.classList.contains('xtg-touchinfo')) reel.classList.toggle('xtg-compact', S.pinInfo && !ui.stage.classList.contains('xtg-show'));
    }
    positionOverlay();
  }

  // Bottom overlay: poster info, plus (for videos) the Reels-style controls
  function addOverlay(item, media) {
    const isVid = media.tagName === 'VIDEO';
    const label = showsLabel(item);
    if (!label && !isVid) return;
    const reel = el('div', { className: 'xtg-reel ' + (isVid ? 'xtg-reel-vid' : 'xtg-reel-img') });
    const pin = isVid ? '' : `<button class="xtg-pin" data-act="pin">${ic('pin', 15)}</button>`;
    reel.innerHTML = (label ? `<div class="xtg-reel-info">${pin}${posterHTML(item, false)}</div>` : '') + (isVid ? `
      <div class="xtg-vbar">
        <div class="xtg-vrow">
          <button class="xtg-vb" data-v="play" title="${esc(tr('playTip'))}"></button>
          <span class="xtg-time">0:00 / 0:00</span>
          <span class="xtg-grow"></span>
          ${item.sd && item.candidates.some((u) => u !== item.sd) ? `<button class="xtg-vb xtg-q" data-v="q" title="${esc(tr('qTip'))}"></button>` : ''}
          <button class="xtg-vb" data-v="mute" title="${esc(tr('muteTip'))}"></button>
          <button class="xtg-vb" data-v="fs" title="${esc(tr('fsTip'))}">${ic('max', 18)}</button>
        </div>
        <div class="xtg-prog"><div class="xtg-track"><div class="xtg-buf"></div><div class="xtg-played"></div></div></div>
      </div>` : '');
    ui.stage.appendChild(reel);
    setCornerTag(item);
    if (isVid) {
      ui.stage.insertAdjacentHTML('beforeend', `<div class="xtg-bigplay">${ic('play', 32, true)}</div>`);
      wireVideo(media, reel);
      const qb = reel.querySelector('[data-v="q"]');
      if (qb) {
        const label = () => { qb.textContent = qualityLabel(item, media); };
        label();
        media.addEventListener('loadstart', label);
        qb.onclick = () => cycleQuality(item, media);
      }
    } else {
      wireImageInfo(media, reel);
    }
    media.addEventListener(isVid ? 'loadedmetadata' : 'load', positionOverlay);
    new ResizeObserver(positionOverlay).observe(media);
    requestAnimationFrame(positionOverlay);
  }

  // Where the mouse last was over the page (null once it left the window): an image that appears under a mouse
  // that did not move (keyboard, the next button, autoplay) shows its info at once instead of after a move.
  let mouseAt = null;
  function trackMouse() {
    if (trackMouse.done) return;
    trackMouse.done = true;
    document.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') mouseAt = { x: e.clientX, y: e.clientY }; }, { capture: true, passive: true });
    document.addEventListener('mouseout', (e) => { if (!e.relatedTarget) mouseAt = null; }, true);
  }

  // Images: on desktop the info appears while the mouse is over the image, or stays (compact) when pinned; on
  // touch screens a compact line (name + one line of text) is always shown and a tap expands it.
  function wireImageInfo(img, reel) {
    applyPin();
    if (!matchMedia('(hover: hover)').matches) {
      reel.classList.add('xtg-touchinfo', 'xtg-compact');
      reel.addEventListener('click', (e) => {
        if (e.target.closest('a, button')) return;
        reel.classList.toggle('xtg-compact');
        positionOverlay();
      });
      return;
    }
    trackMouse();
    let hovering = false;
    const inside = (node, x, y) => {
      const r = node.getBoundingClientRect();
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    };
    const setHover = (h) => {
      if (h === hovering) return;
      hovering = h;
      ui.stage.classList.toggle('xtg-show', h);
      if (S.pinInfo) { reel.classList.toggle('xtg-compact', !h); positionOverlay(); }
    };
    const onMove = (e) => {
      if (e.pointerType !== 'mouse') return;
      setHover(inside(img, e.clientX, e.clientY) || inside(reel, e.clientX, e.clientY));
    };
    const onLeave = () => setHover(false);
    const sync = () => { if (mouseAt && img.isConnected) setHover(inside(img, mouseAt.x, mouseAt.y) || inside(reel, mouseAt.x, mouseAt.y)); };
    img.addEventListener('load', () => requestAnimationFrame(sync));
    requestAnimationFrame(sync);
    ui.stage.addEventListener('pointermove', onMove);
    ui.stage.addEventListener('pointerleave', onLeave);
    S.unwireVideo = () => {
      ui.stage.removeEventListener('pointermove', onMove);
      ui.stage.removeEventListener('pointerleave', onLeave);
      ui.stage.classList.remove('xtg-show');
    };
  }

  function setInfo(kind, on) {
    S[kind] = on;
    store.set(kind, on);
    const cb = ui.root.querySelector(`[data-opt="${kind}"]`);
    if (cb) cb.checked = on;
    refreshLabels();
  }

  // Re-render labels after an option change or once the thread starter is known
  function refreshLabels() {
    if (!ui) return;
    if (S.view === 'viewer' && S.cur && !S.cur.dead) {
      const reel = ui.stage.querySelector(':scope > video') && ui.stage.querySelector('.xtg-reel');
      if (reel) { // keep the playing video, only swap the info
        let info = reel.querySelector('.xtg-reel-info');
        if (showsLabel(S.cur)) {
          if (!info) { info = el('div', { className: 'xtg-reel-info' }); reel.prepend(info); }
          info.innerHTML = posterHTML(S.cur, false);
        } else if (info) info.remove();
        setCornerTag(S.cur);
        positionOverlay();
      } else renderStage();
    }
    for (const item of S.items) if (!item.dead && (item.type !== 'image' || S.view === 'list')) replaceTile(item);
  }

  function setThreadStarter(name, fromHeader) {
    if (!name || (S.starterFromHeader && !fromHeader) || sameName(name, S.threadStarter)) return;
    S.threadStarter = name;
    S.starterFromHeader = fromHeader;
    refreshLabels();
  }

