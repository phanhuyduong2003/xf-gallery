  // ---------------------------------------------------------------------------
  // Media loading with fallbacks
  // ---------------------------------------------------------------------------
  function isPlaceholder(img) {
    const w = img.naturalWidth, h = img.naturalHeight;
    return w <= 1 || h <= 1 || (/imgur\.com/.test(img.src) && w === 161 && h === 81); // imgur "removed" image
  }

  // Try each URL; then download through the manager (hotlink protection); retry everything once
  // after 2 s (flaky network) before declaring the item dead.
  function loadImage(img, item, urls, onFail, onOk) {
    let i = 0, blobTried = false, retried = false;
    img.referrerPolicy = 'no-referrer';
    img.decoding = 'async';
    const giveUp = () => {
      if (retried) { onFail(); return; }
      retried = true;
      setTimeout(() => { i = 0; tryNext(); }, 2000);
    };
    const tryNext = () => {
      if (i < urls.length) { img.src = urls[i++]; return; }
      if (!blobTried && !item.attachment && item.candidates.length) {
        blobTried = true;
        gmBlobUrl(item.candidates).then((b) => { item.working = b; img.src = b; }, giveUp);
        return;
      }
      giveUp();
    };
    img.onerror = tryNext;
    img.onload = () => {
      if (isPlaceholder(img)) { tryNext(); return; }
      if (!item.working && item.candidates.includes(img.src)) item.working = img.src;
      if (onOk) onOk(img.src);
    };
    tryNext();
  }

  // Thumbnails load only when (nearly) visible and at most THUMB_LOADS at a time. The image being viewed
  // is then not stuck behind dozens of thumbnail downloads, and hosts get fewer simultaneous requests.
  const THUMB_LOADS = 4;
  const MID_DELAY_MS = 800; // wait this long for the full image before asking for a medium size
  const thumbLoadQueue = makeQueue(THUMB_LOADS);
  const lazyObserver = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (!en.isIntersecting) continue;
      lazyObserver.unobserve(en.target);
      en.target.xtgStart();
    }
  }, { rootMargin: '300px' });

  function nearView(el, margin = 300) {
    const r = el.getBoundingClientRect();
    const box = (el.closest('.xtg-strip, .xtg-scroll') || document.documentElement).getBoundingClientRect();
    return r.width > 0 && r.right >= box.left - margin && r.left <= box.right + margin &&
      r.bottom >= box.top - margin && r.top <= box.bottom + margin;
  }

  // A full image that has loaded is in the browser cache: show it in the item's filmstrip thumbnail too
  // (no extra request) if that thumbnail has not loaded yet.
  function fillThumb(item, src) {
    const ti = item.thumbEl && item.thumbEl.querySelector('img');
    if (!ti || (ti.complete && ti.naturalWidth > 0)) return;
    lazyObserver.unobserve(ti);
    ti.onerror = null;
    ti.onload = null;
    ti.src = src;
    if (!item.shown) item.shown = src;
  }

  function lazyImage(img, item, urls, onFail, priority = 'low') {
    img.fetchPriority = priority;
    img.draggable = false;
    img.xtgStart = () => thumbLoadQueue(() => new Promise((done) => {
      if (!img.isConnected || img.getAttribute('src')) { done(); return; }
      // scrolled out of view while waiting in the queue (autoplay, dragging): wait until it is visible again
      if (!nearView(img)) { lazyObserver.observe(img); done(); return; }
      setTimeout(done, QUEUE_SLOT_MS); // slow host: let the next thumbnail start, this one keeps loading
      loadImage(img, item, urls, () => { onFail(); done(); }, (src) => { if (!item.shown) item.shown = src; done(); });
    }));
    lazyObserver.observe(img);
  }

  // Preload the neighbours of the viewed item one at a time, after the item itself has loaded
  const preloadQueue = makeQueue(1);
  function preloadAround(item) {
    const i = S.items.indexOf(item);
    [1, 2, -1].map((d) => S.items[i + d]).filter((x) => x && !x.dead && x.type === 'image' && !x.working).forEach((x) => {
      preloadQueue(() => new Promise((done) => {
        if (S.cur !== item || x.working) { done(); return; } // the user moved on: skip stale preloads
        const im = new Image();
        im.fetchPriority = 'low';
        setTimeout(done, QUEUE_SLOT_MS);
        loadImage(im, x, x.candidates.slice(), done, (src) => { fillThumb(x, src); done(); });
      }));
    });
  }

