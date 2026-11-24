  // ---------------------------------------------------------------------------
  // Open / close
  // ---------------------------------------------------------------------------
  let savedOverflow = '';

  function openGallery() {
    if (!ui) buildUI();
    if (ui.root.hidden) {
      ui.root.hidden = false;
      void ui.root.offsetWidth; // flush layout so the fade-in transition runs
      ui.root.classList.add('xtg-open');
      savedOverflow = docEl.style.overflow;
      docEl.style.overflow = 'hidden';
      applyView();
    }
    if (!S.started) loadThread();
    else pumpPages(); // resume page loading paused while the gallery was closed
  }

  function closeGallery() {
    clearTimeout(S.slideTimer); // pause only: the autoplay setting stays
    clearTimeout(navTimer);
    dropPrepared();
    ui.stage.querySelectorAll('video').forEach((x) => x.pause());
    ui.stage.querySelectorAll('iframe').forEach((x) => x.remove()); // stop embedded players
    ui.root.classList.remove('xtg-open');
    ui.root.hidden = true;
    ui.menu.hidden = true;
    docEl.style.overflow = savedOverflow;
  }

