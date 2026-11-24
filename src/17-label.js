  // ---------------------------------------------------------------------------
  // Poster label
  // ---------------------------------------------------------------------------
  const sameName = (a, b) => !!a && !!b && a.trim().toLowerCase() === b.trim().toLowerCase();
  const showsLabel = (item) => !item.dead && !!(item.meta && item.meta.author) && (item.type === 'image' ? S.infoImages : S.infoVideos);

  function nameColor(name) {
    let h = 0;
    for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 360;
    return `hsl(${h},45%,42%)`;
  }

  function roleTagHTML(item) {
    if (!S.threadStarter || !item.meta || !item.meta.author) return '';
    const op = sameName(item.meta.author, S.threadStarter);
    return `<span class="xtg-tag${op ? ' xtg-tag-op' : ''}">${esc(op ? tr('op') : tr('member'))}</span>`;
  }

  function posterHTML(item, withTag) {
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
    reel.style.left = Math.max(0, Math.min(ml - (w - mw) / 2, sw - w)) + 'px';
    reel.style.width = w + 'px';
    reel.style.bottom = Math.max(0, sh - (mt + mh)) + 'px';
  }

  // Bottom overlay: poster info, plus (for videos) the Reels-style controls
  function addOverlay(item, media) {
    const isVid = media.tagName === 'VIDEO';
    const label = showsLabel(item);
    if (!label && !isVid) return;
    const reel = el('div', { className: 'xtg-reel ' + (isVid ? 'xtg-reel-vid' : 'xtg-reel-img') });
    reel.innerHTML = (label ? `<div class="xtg-reel-info">${posterHTML(item, false)}</div>` : '') + (isVid ? `
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

  // Images: on desktop the info appears while the mouse is over the image; on touch screens a compact
  // line (name + one line of text) is always shown and a tap expands it.
  function wireImageInfo(img, reel) {
    if (!matchMedia('(hover: hover)').matches) {
      reel.classList.add('xtg-touchinfo', 'xtg-compact');
      reel.addEventListener('click', (e) => {
        if (e.target.closest('a, button')) return;
        reel.classList.toggle('xtg-compact');
        positionOverlay();
      });
      return;
    }
    let hovering = false;
    const inside = (node, e) => {
      const r = node.getBoundingClientRect();
      return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    };
    const onMove = (e) => {
      if (e.pointerType !== 'mouse') return;
      const h = inside(img, e) || inside(reel, e);
      if (h !== hovering) { hovering = h; ui.stage.classList.toggle('xtg-show', h); }
    };
    const onLeave = () => { hovering = false; ui.stage.classList.remove('xtg-show'); };
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

