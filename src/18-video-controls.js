  // ---------------------------------------------------------------------------
  // Video controls
  // ---------------------------------------------------------------------------
  const fmtTime = (sec) => {
    const t = Math.floor(isFinite(sec) && sec > 0 ? sec : 0);
    const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = String(t % 60).padStart(2, '0');
    return h ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
  };

  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else if (ui.stage.requestFullscreen) ui.stage.requestFullscreen().catch(() => {});
  }

  // Desktop: info + controls appear while the mouse is over the video and hide as soon as it leaves.
  // Touch: tap pauses and reveals info, controls and seeking; playing again collapses them.
  function wireVideo(v, reel) {
    const q = (s) => reel.querySelector(s);
    const playBtn = q('[data-v="play"]'), muteBtn = q('[data-v="mute"]'), time = q('.xtg-time');
    const prog = q('.xtg-prog'), track = q('.xtg-track'), played = q('.xtg-played'), buf = q('.xtg-buf');
    const touch = !matchMedia('(hover: hover)').matches;
    let hovering = false;

    const toggle = () => { if (v.paused) v.play().catch(() => {}); else v.pause(); };
    const update = () => ui.stage.classList.toggle('xtg-show', hovering || prog.classList.contains('seeking') || (touch && v.paused));
    const inside = (node, e) => {
      const r = node.getBoundingClientRect();
      return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    };
    const onMove = (e) => {
      if (e.pointerType !== 'mouse') return;
      const h = inside(v, e) || inside(reel, e);
      if (h !== hovering) { hovering = h; update(); }
    };
    const onLeave = (e) => { if (e.pointerType === 'mouse') { hovering = false; update(); } };
    const sync = () => {
      playBtn.innerHTML = ic(v.paused ? 'play' : 'pause', 18, true);
      ui.stage.classList.toggle('xtg-paused', v.paused && v.readyState > 0);
      update();
    };
    const tick = () => {
      const d = v.duration || 0;
      played.style.width = d ? (v.currentTime / d) * 100 + '%' : '0';
      time.textContent = `${fmtTime(v.currentTime)} / ${fmtTime(d)}`;
    };
    const buffered = () => {
      try { if (v.duration && v.buffered.length) buf.style.width = (v.buffered.end(v.buffered.length - 1) / v.duration) * 100 + '%'; } catch (e) { /* ignore */ }
    };
    const volIcon = () => { muteBtn.innerHTML = ic(v.muted || v.volume === 0 ? 'mute' : 'vol', 18); };

    ['play', 'pause', 'loadeddata'].forEach((ev) => v.addEventListener(ev, sync));
    ['timeupdate', 'loadedmetadata'].forEach((ev) => v.addEventListener(ev, tick));
    v.addEventListener('progress', buffered);
    v.addEventListener('volumechange', volIcon);
    v.addEventListener('click', toggle);
    v.addEventListener('dblclick', toggleFullscreen);
    playBtn.onclick = toggle;
    muteBtn.onclick = () => { v.muted = !v.muted; S.muted = v.muted; store.set('muted', v.muted); };
    q('[data-v="fs"]').onclick = toggleFullscreen;

    // seek by clicking or dragging the progress bar
    const seekAt = (e) => {
      const r = track.getBoundingClientRect();
      if (v.duration) { v.currentTime = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * v.duration; tick(); }
    };
    prog.addEventListener('pointerdown', (e) => {
      prog.classList.add('seeking');
      try { prog.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      seekAt(e);
    });
    prog.addEventListener('pointermove', (e) => { if (prog.classList.contains('seeking')) seekAt(e); });
    const stopSeek = () => { prog.classList.remove('seeking'); update(); };
    prog.addEventListener('pointerup', stopSeek);
    prog.addEventListener('pointercancel', stopSeek);

    ui.stage.addEventListener('pointermove', onMove);
    ui.stage.addEventListener('pointerleave', onLeave);
    S.unwireVideo = () => {
      ui.stage.removeEventListener('pointermove', onMove);
      ui.stage.removeEventListener('pointerleave', onLeave);
      ui.stage.classList.remove('xtg-show', 'xtg-paused');
    };
    S.videoCtl = { toggle, mute: () => muteBtn.click() };
    volIcon();
    sync();
    tick();
  }

