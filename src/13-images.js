  // ---------------------------------------------------------------------------
  // Media loading with fallbacks
  // ---------------------------------------------------------------------------
  function isPlaceholder(img) {
    const w = img.naturalWidth, h = img.naturalHeight;
    if (w <= 1 || h <= 1) return true;
    // imgur "removed" image, also through the manager (blob: URL) or the forum's image proxy, which caches it
    const from = unproxy(abs(img._xtgFrom || img.src));
    return w === 161 && h === 81 && !!from && /(^|\.)imgur\.com$/.test(from.hostname);
  }

  // What happened to a file on an earlier visit (cache "m:<key>"): { ok: the candidate that loaded } or { dead: true }.
  // Read once per item, ignored by "Reload (ignore cache)". A dead file is not asked for again for DEAD_MEDIA_TTL,
  // and the file that loaded is tried first, so neither costs failed requests on the next visit.
  function mediaMemo(item) {
    if (!item.memo) {
      item.memo = (S.noCache || !item.key ? Promise.resolve(null) : cache.get('m:' + item.key, MEDIA_OK_TTL).catch(() => null))
        .then((m) => {
          if (m && m.dead && Date.now() - m.at > DEAD_MEDIA_TTL) return null;
          if (m && m.dead) item.memoDead = true;
          if (m && m.ok) item.savedOk = m.ok;
          return m;
        });
    }
    return item.memo;
  }
  // The picture shown in the post (often a small preview of the original) is also kept among the candidates, as a
  // last resort when the original is gone. A thumbnail that loads it must not count as "the file that works",
  // or the viewer would show the small preview instead of the original.
  const isPreview = (item, u) => !!item.thumb && !!u && directUrl(u) === directUrl(item.thumb);
  function rememberOk(item, url) {
    if (!item.key || item.savedOk === url || (!item.savedOk && url === item.candidates[0])) return; // nothing to learn
    item.savedOk = url;
    cache.put('m:' + item.key, { ok: url });
  }
  function rememberDead(item) {
    // offline says nothing about the file; links that resolved to nothing are cached as such already
    if (!item.key || item.key.startsWith('dead:') || item.memoDead || !navigator.onLine) return;
    item.memoDead = true;
    cache.put('m:' + item.key, { dead: true });
  }

  // Hosts whose images only load through the manager (hotlink protection), learnt when a file of theirs failed
  // directly and then showed as a real picture through the manager, kept for MANAGER_HOST_TTL. Their files skip
  // the direct attempts that would fail.
  const MANAGER_HOST_TTL = 7 * DAY;
  const managerHost = (u) => (store.get('mgrHosts', {})[hostOf(u)] || 0) > Date.now();
  function learnManagerHost(u) {
    const all = store.get('mgrHosts', {}), now = Date.now();
    for (const h of Object.keys(all)) if (all[h] < now) delete all[h];
    all[hostOf(u)] = now + MANAGER_HOST_TTL;
    store.set('mgrHosts', all);
  }

  // Images downloaded through the manager are blob: URLs held in memory: the IMAGE_BLOBS_MAX most recent are kept.
  // One download per item and size, shared by its thumbnail, tile and the viewer.
  const IMAGE_BLOBS_MAX = 30;
  const imageBlobs = []; // { item, src, k }, oldest first
  function managerBlob(item, urls) {
    const jobs = item.blobJobs || (item.blobJobs = new Map());
    const k = urls[0];
    if (!jobs.has(k)) {
      jobs.set(k, gmBlobUrl(urls).then((r) => {
        imageBlobs.push({ item, src: r.src, k });
        while (imageBlobs.length > IMAGE_BLOBS_MAX) {
          const at = imageBlobs.findIndex((b) => b.item !== S.cur);
          const old = imageBlobs.splice(at, 1)[0];
          URL.revokeObjectURL(old.src); // pictures already on screen stay; a later view downloads again
          old.item.blobJobs.delete(old.k);
          if (old.item.working === old.src) old.item.working = null;
          if (old.item.shown === old.src) old.item.shown = null;
        }
        return r;
      }, (e) => { jobs.delete(k); throw e; }));
    }
    return jobs.get(k);
  }

  // Small screen or data saver: the host's large size (Imgur 1024 px) instead of the original, which loads on zoom.
  const fitsLarge = () => slowNet() || Math.max(innerWidth, innerHeight) <= 1100;
  const fitUrls = (item) => (item.large && fitsLarge() ? uniq([item.large, ...item.candidates]) : item.candidates);

  // Try each URL; then download through the manager (hotlink protection); retry everything once after 2 s
  // (flaky network) before declaring the item dead. A file known dead fails at once; the file that loaded last
  // time goes first; URLs on hosts known to need the manager go through it first and directly only as a last resort.
  function loadImage(img, item, urls, onFail, onOk) {
    let i = 0, blobTried = false, retried = false, later = [], list = urls;
    const canBlob = !item.attachment && item.candidates.length > 0;
    img.referrerPolicy = 'no-referrer';
    img.decoding = 'async';
    const giveUp = () => {
      if (retried) { onFail(); return; }
      retried = true;
      setTimeout(() => { list = urls; i = 0; later = []; tryNext(); }, 2000);
    };
    const viaManager = () => {
      blobTried = true;
      managerBlob(item, uniq(urls.filter((u) => /^https?:/i.test(u)).concat(item.candidates))).then((r) => {
        img._xtgFrom = r.from;
        img.src = r.src;
      }, tryNext);
    };
    const tryNext = () => {
      while (i < list.length) {
        const u = list[i++];
        if (!blobTried && canBlob && managerHost(u)) { later.push(u); continue; }
        img.src = u;
        return;
      }
      if (!blobTried && canBlob) { viaManager(); return; }
      if (later.length) { list = later; later = []; i = 0; tryNext(); return; }
      giveUp();
    };
    const failedDirect = new Set(); // hosts whose files errored when loaded directly (not placeholders: those are dead)
    img.onerror = () => {
      if (!img.src.startsWith('blob:')) failedDirect.add(hostOf(img.src));
      tryNext();
    };
    img.onload = () => {
      if (isPlaceholder(img)) { tryNext(); return; }
      if (img._xtgFrom && img.src.startsWith('blob:')) {
        if (failedDirect.has(hostOf(img._xtgFrom))) learnManagerHost(img._xtgFrom); // failed directly, fine through the manager
        if (item.candidates.includes(img._xtgFrom) && !isPreview(item, img._xtgFrom)) item.working = img.src;
      } else if (item.candidates.includes(img.src) && !isPreview(item, img.src)) {
        if (!item.working) item.working = img.src;
        rememberOk(item, img.src);
      } else if (img.src === item.large) item.fitted = img.src;
      if (onOk) onOk(img.src);
    };
    mediaMemo(item).then((m) => {
      if (m && m.dead) { onFail(); return; }
      if (m && m.ok && item.candidates.includes(m.ok) && !isPreview(item, m.ok)) { // (3.1.0 may have saved a preview)
        const at = urls.findIndex((u) => item.candidates.includes(u));
        if (at >= 0) urls = uniq([...urls.slice(0, at), m.ok, ...urls.slice(at)]);
      }
      list = urls;
      tryNext();
    });
  }

  // Thumbnails load only when (nearly) visible, at most THUMB_LOADS at a time and THUMB_LOADS_PER_HOST per host.
  // The image being viewed is then not stuck behind dozens of thumbnail downloads, no host gets many requests at
  // once (the forum's attachments included), and a slow host does not hold up thumbnails from the others.
  const THUMB_LOADS = 6;
  const THUMB_LOADS_PER_HOST = 2;
  const MID_DELAY_MS = 800; // wait this long for the full image before asking for a medium size
  const thumbLoadQueue = makeHostQueue(THUMB_LOADS, THUMB_LOADS_PER_HOST);
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
    img.xtgStart = () => thumbLoadQueue(hostOf(urls[0] || ''), () => new Promise((done) => {
      if (!img.isConnected || img.getAttribute('src')) { done(); return; }
      // scrolled out of view while waiting in the queue (autoplay, dragging): wait until it is visible again
      if (!nearView(img)) { lazyObserver.observe(img); done(); return; }
      setTimeout(done, QUEUE_SLOT_MS); // slow host: let the next thumbnail start, this one keeps loading
      loadImage(img, item, urls, () => { onFail(); done(); }, (src) => { if (!item.shown) item.shown = src; done(); });
    }));
    lazyObserver.observe(img);
  }

  // Preload the neighbours of the viewed item one at a time, after the item itself has loaded: two ahead in the
  // direction of travel and one behind (only the next one on data saver)
  const preloadQueue = makeQueue(1);
  function preloadAround(item) {
    const d = S.lastDir || 1;
    const n1 = neighbour(item, d), n2 = n1 && neighbour(n1, d), back = neighbour(item, -d);
    const saver = navigator.connection && navigator.connection.saveData;
    (saver ? [n1] : [n1, n2, back]).filter((x) => x && x.type === 'image' && !x.dead && !x.working && !x.fitted).forEach((x) => {
      preloadQueue(() => new Promise((done) => {
        if (S.cur !== item || x.working || x.fitted) { done(); return; } // the user moved on: skip stale preloads
        const im = new Image();
        im.fetchPriority = 'low';
        setTimeout(done, QUEUE_SLOT_MS);
        loadImage(im, x, fitUrls(x), done, (src) => { fillThumb(x, src); done(); });
      }));
    });
  }

  // Zoomed in on the large size: load the original and swap it in (it becomes the item's working file)
  function upgradeToFull(item, img) {
    if (item.fullLoading || item.working) return;
    item.fullLoading = true;
    const full = new Image();
    full.fetchPriority = 'high';
    loadImage(full, item, item.candidates.slice(), () => { item.fullLoading = false; }, (src) => {
      item.fullLoading = false;
      full.decode().catch(() => {}).then(() => { if (S.cur === item && img.isConnected) img.src = src; });
    });
  }
