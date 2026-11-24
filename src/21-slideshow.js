  // ---------------------------------------------------------------------------
  // Slideshow
  // ---------------------------------------------------------------------------
  function nextOrStop() { if (!step(1, false)) stopSlideshow(); }

  // Autoplay timing: the delay starts once the item has loaded (videos advance when they end);
  // an item still loading after LOAD_SKIP_MS is skipped, without being marked broken.
  function scheduleSlide() {
    clearTimeout(S.slideTimer);
    const item = S.cur;
    if (!S.slideshow || !item) return;
    if (!S.curReady) { S.slideTimer = setTimeout(nextOrStop, LOAD_SKIP_MS); return; }
    if (item.type === 'video') return;
    S.slideTimer = setTimeout(nextOrStop, item.type === 'embed' ? SLIDE_EMBED_MS : SLIDE_MS);
  }

  // remember = false: a temporary stop (end of the list) that keeps the saved preference
  function setSlideshow(on, remember = true) {
    S.slideshow = on;
    if (remember) store.set('autoplay', on);
    clearTimeout(S.slideTimer);
    if (!ui) return;
    ui.playBtn.classList.toggle('on', on);
    ui.playBtn.querySelector('.xtg-pi').innerHTML = on ? ic('pause', 16, true) : ic('play', 16, true);
    if (on) scheduleSlide();
  }
  const toggleSlideshow = () => setSlideshow(!S.slideshow);
  const stopSlideshow = () => setSlideshow(false, false);

