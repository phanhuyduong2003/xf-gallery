  // ---------------------------------------------------------------------------
  // Video delivery. Video hosts are not the forum, so they can take more than one request at a time, but:
  //   - the forum's own files (attachments, its image proxy) only ever get normal playback;
  //   - every host's speed (time to the first frame) is remembered, and hosts known to be slow start with
  //     the lighter version when there is one;
  //   - if the chosen file shows nothing after VIDEO_RACE_MS, the lighter version starts hidden next to it
  //     and whichever shows a frame first is kept (the other is cancelled);
  //   - the next video is prepared in a hidden element (the browser buffers its start) and moved onto the
  //     stage when you get there; not on data saver, never for the forum's files;
  //   - short clips on hosts known to be slow are downloaded in VIDEO_PARTS parallel ranges;
  //   - a host answering 403 / 429 / 503 gets a VIDEO_TRIP_MS break from races and parallel downloads.
  // ---------------------------------------------------------------------------
  const VIDEO_SLOW_MS = 3000;                 // slower than this to the first frame: the host counts as slow
  const VIDEO_RACE_MS = 1500;                 // head start of the chosen file before the lighter one may race it
  const VIDEO_PARTS = 3;                      // parallel ranges for short clips on slow hosts
  const VIDEO_PARTS_MAX = 30 * 1024 * 1024;   // ... only for files up to this size (they play once complete)
  const VIDEO_TRIP_MS = 30 * 60e3;
  const VIDEO_HOSTS_MAX = 60;

  const vhosts = {
    get: (h) => store.get('vhosts', {})[h] || {},
    set(h, patch) {
      const all = store.get('vhosts', {});
      all[h] = Object.assign(all[h] || {}, patch, { at: Date.now() });
      const keys = Object.keys(all);
      if (keys.length > VIDEO_HOSTS_MAX) keys.sort((a, b) => all[a].at - all[b].at).slice(0, keys.length - VIDEO_HOSTS_MAX).forEach((k) => delete all[k]);
      store.set('vhosts', all);
    },
  };
  const isForumUrl = (u) => {
    const x = abs(u);
    return !x || x.protocol === 'blob:' || bareHost(x.hostname) === bareHost(location.hostname) || /\/proxy\.php$/.test(x.pathname);
  };
  const hostSlow = (u) => (vhosts.get(hostOf(u)).ttff || 0) > VIDEO_SLOW_MS;
  const hostTripped = (u) => (vhosts.get(hostOf(u)).trip || 0) > Date.now();
  function recordTtff(u, ms) {
    if (!u || isForumUrl(u)) return;
    const h = hostOf(u), old = vhosts.get(h).ttff;
    vhosts.set(h, { ttff: Math.round(old ? old * 0.6 + ms * 0.4 : ms) }); // moving average, recent visits weigh more
  }
  function tripHost(u, status) {
    if ([403, 429, 503].includes(status)) vhosts.set(hostOf(u), { trip: Date.now() + VIDEO_TRIP_MS });
  }

  // Order of the files to try: the user's choice (HD / SD), else the lighter one first on a slow connection
  // or a host known to be slow. playUrl: the file picked for this item (race winner, quality button).
  function videoUrls(item) {
    const c = item.candidates;
    let list = c;
    if (item.sd) {
      const sdFirst = S.vquality === 'sd' || (S.vquality === 'auto' && (slowNet() || hostSlow(c[0])));
      list = sdFirst ? uniq([item.sd, ...c]) : uniq([...c.filter((u) => u !== item.sd), item.sd]);
    }
    return item.blob ? uniq([item.blob, ...list]) : item.playUrl ? uniq([item.playUrl, ...list]) : list;
  }

  const killVideo = (v) => {
    if (!v) return;
    v.onerror = null;
    v.pause();
    v.removeAttribute('src');
    try { v.load(); } catch (e) { /* ignore */ }
  };

  // frag '#t=1' makes thumbnails show the frame at 1 s instead of the (often black) first frame.
  // Thumbnails prefer the lighter version. v._xtgFail can be swapped when a prepared element changes owner.
  function loadVideo(v, item, onFail, frag = '', urls = null) {
    let i = 0;
    urls = urls || (frag ? (item.sd ? uniq([item.sd, ...item.candidates]) : item.candidates) : videoUrls(item));
    v._xtgFail = onFail;
    const tryNext = () => {
      if (i < urls.length) { v._xtgUrl = urls[i++]; v.src = v._xtgUrl + frag; } else v._xtgFail();
    };
    v.onerror = tryNext;
    tryNext();
  }

  // Video thumbnails without a poster load one at a time, and only once the video being watched shows a frame
  const thumbVideoQueue = makeQueue(1);
  // (also while the opening item is not picked yet, which takes up to 1.5 s)
  const mainVideoBusy = () => ui && !ui.root.hidden && S.view === 'viewer' && (!S.cur ? S.items.length > 0 : S.cur.type === 'video' && !S.curReady);
  function thumbVideo(v, item, onFail) {
    thumbVideoQueue(async () => {
      while (mainVideoBusy()) await sleep(300);
      if (!v.isConnected) return; // the thumbnail was replaced meanwhile
      await new Promise((done) => {
        const t = setTimeout(done, 8000);
        v.addEventListener('loadeddata', () => { clearTimeout(t); done(); }, { once: true });
        loadVideo(v, item, () => { clearTimeout(t); onFail(); done(); }, '#t=1');
      });
    });
  }

  // Open the connection (DNS, TLS) to the next item's host ahead of time; costs next to nothing
  const preconnected = new Set();
  function preconnect(u) {
    const x = abs(u);
    if (!x || !isHttp(x) || x.origin === location.origin || preconnected.has(x.origin) || preconnected.size >= 40) return;
    preconnected.add(x.origin);
    document.head.appendChild(el('link', { rel: 'preconnect', href: x.origin }));
  }

  function neighbour(item, d) {
    for (let j = S.items.indexOf(item) + d; j >= 0 && j < S.items.length; j += d) {
      const x = S.items[j];
      if (!x.dead && passesFilter(x)) return x;
    }
    return null;
  }

  // The next video, buffering in a hidden element
  const PREP = { item: null, v: null };
  function dropPrepared() {
    killVideo(PREP.v);
    PREP.item = PREP.v = null;
  }
  function prepareNext(item) {
    if (!item || document.hidden || (navigator.connection && navigator.connection.saveData)) return;
    const next = neighbour(item, S.lastDir || 1);
    if (next) preconnect(next.type === 'embed' ? next.url : next.candidates[0]);
    if (PREP.item === next && PREP.v) return;
    dropPrepared();
    if (!next || next.type !== 'video' || next.blob) return;
    const urls = videoUrls(next);
    if (isForumUrl(urls[0])) return; // the forum's own files are never fetched ahead
    const v = mediaEl('video', { muted: true, preload: 'auto' });
    v._xtgPrepared = true;
    // enough to start playing: stop buffering further until the user gets there
    v.addEventListener('canplaythrough', () => { if (PREP.v === v) v.preload = 'metadata'; }, { once: true });
    PREP.item = next;
    PREP.v = v;
    loadVideo(v, next, () => { if (PREP.v === v) dropPrepared(); }, '', urls);
  }

  // Short clip on a slow host: VIDEO_PARTS ranges at once, then one blob: URL. Throws to fall back to normal playback.
  const headerOf = (raw, name) => { const m = (raw || '').match(new RegExp('^' + name + ':\\s*(.+)$', 'im')); return m ? m[1].trim() : ''; };
  const blobItems = []; // items holding a downloaded clip, oldest first (at most 3 kept in memory)
  async function downloadParts(item, url) {
    const probe = await gmGet(url, true, { Range: 'bytes=0-0' }, 10000);
    if (probe.status !== 206) { tripHost(url, probe.status); throw new Error('no ranges'); }
    const total = +(headerOf(probe.headers, 'content-range').split('/')[1] || 0);
    if (!total || total > VIDEO_PARTS_MAX) throw new Error('too big');
    const type = (headerOf(probe.headers, 'content-type') || 'video/mp4').split(';')[0];
    const size = Math.ceil(total / VIDEO_PARTS);
    const parts = await Promise.all([...Array(VIDEO_PARTS)].map(async (_, i) => {
      const a = i * size, b = Math.min(total, a + size) - 1;
      const r = await gmGet(url, true, { Range: `bytes=${a}-${b}` }, 120000);
      if (r.status !== 206 || !r.response || r.response.size !== b - a + 1) { tripHost(url, r.status); throw new Error('range failed'); }
      return r.response;
    }));
    item.blob = URL.createObjectURL(new Blob(parts, { type }));
    item.blobSd = url === item.sd;
    blobItems.push(item);
    while (blobItems.length > 3) {
      const old = blobItems.shift();
      if (old === S.cur) { blobItems.push(old); break; }
      URL.revokeObjectURL(old.blob);
      old.blob = null;
    }
  }
  const usesParts = (item, url) => !item.blob && !isForumUrl(url) && hostSlow(url) && !hostTripped(url);

  // The stage's video element: the prepared one when it is this item, else a fresh one
  function stageVideo(item, rid) {
    const t0 = Date.now();
    let v;
    if (PREP.item === item && PREP.v) {
      v = PREP.v;
      PREP.item = PREP.v = null;
      v._xtgFail = () => videoFail(item);
      v.preload = 'auto';
      v.autoplay = true;
      v.muted = !!S.muted;
      v.play().catch(() => {});
    } else {
      v = mediaEl('video', { autoplay: true, muted: !!S.muted });
      const urls = videoUrls(item);
      if (usesParts(item, urls[0])) {
        downloadParts(item, urls[0]).then(
          () => { if (rid === S.renderId) loadVideo(v, item, () => videoFail(item)); },
          () => { if (rid === S.renderId) loadVideo(v, item, () => videoFail(item), '', urls); },
        );
      } else {
        loadVideo(v, item, () => videoFail(item), '', urls);
        raceLighter(item, v, rid);
      }
    }
    if (item.thumb) v.poster = item.thumb;
    if (S.resumeAt && S.resumeAt.item === item) { // quality switch: carry on where it was
      const at = S.resumeAt.t;
      S.resumeAt = null;
      v.addEventListener('loadedmetadata', () => { v.currentTime = at; }, { once: true });
    }
    const ready = () => {
      if (!v._xtgPrepared && !(v._xtgUrl || '').startsWith('blob:')) recordTtff(v._xtgUrl, Date.now() - t0);
      mediaReady(rid);
    };
    if (v.readyState >= 2) setTimeout(ready, 0);
    else v.addEventListener('loadeddata', ready, { once: true });
    return v;
  }

  // The chosen (bigger) file shows nothing after VIDEO_RACE_MS: start the lighter one hidden; first frame wins
  function raceLighter(item, v, rid) {
    if (S.vquality !== 'auto' || !item.sd) return;
    setTimeout(() => {
      const cur = v._xtgUrl;
      if (rid !== S.renderId || v.readyState >= 2 || cur === item.sd || isForumUrl(cur) || isForumUrl(item.sd) || hostTripped(item.sd)) return;
      const b = mediaEl('video', { muted: true, preload: 'auto' });
      b._xtgPrepared = true;
      const lose = () => killVideo(b);
      v.addEventListener('loadeddata', lose, { once: true });
      b.onerror = lose;
      b.addEventListener('loadeddata', () => {
        if (rid !== S.renderId || v.readyState >= 2) { lose(); return; }
        recordTtff(cur, VIDEO_SLOW_MS * 2); // the bigger file lost: next time this host starts with the lighter one
        item.playUrl = item.sd;
        b._xtgUrl = item.sd;
        PREP.item = item;
        PREP.v = b;
        renderStage(); // moves the winner onto the stage, cancels the loser
      }, { once: true });
      b.src = item.sd;
    }, VIDEO_RACE_MS);
  }

  // Quality button: Auto → HD → SD → Auto, keeping the playback position
  function cycleQuality(item, v) {
    S.vquality = { auto: 'hd', hd: 'sd', sd: 'auto' }[S.vquality];
    store.set('vquality', S.vquality);
    if (item.blob) { // a downloaded clip is one quality: drop it
      URL.revokeObjectURL(item.blob);
      item.blob = null;
      if (blobItems.includes(item)) blobItems.splice(blobItems.indexOf(item), 1);
    }
    item.playUrl = S.vquality === 'auto' ? null : S.vquality === 'sd' ? item.sd : item.candidates.find((u) => u !== item.sd);
    const want = videoUrls(item)[0];
    if (want && want !== v._xtgUrl) {
      S.resumeAt = { item, t: v.currentTime || 0 };
      renderStage();
    } else {
      const qb = ui.stage.querySelector('[data-v="q"]');
      if (qb) qb.textContent = qualityLabel(item, v);
    }
  }
  const qualityLabel = (item, v) => (S.vquality === 'auto' ? 'Auto ' : '') +
    (v._xtgUrl === item.sd || (v._xtgUrl && v._xtgUrl === item.blob && item.blobSd) ? 'SD' : 'HD');

  function mediaEl(tag, props) {
    const node = el(tag, props);
    if (tag === 'video') node.playsInline = true;
    return node;
  }

  function iframeEl(url, lazy) {
    const f = el('iframe', { src: url, allowFullscreen: true });
    if (lazy) f.loading = 'lazy';
    f.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture; encrypted-media');
    return f;
  }

