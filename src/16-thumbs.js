  // ---------------------------------------------------------------------------
  // Thumbnails for videos / embeds that have none
  // ---------------------------------------------------------------------------


  async function oembedThumb(endpoint) {
    const { data } = await gmJSON(endpoint);
    return (data && data.thumbnail_url) || null;
  }

  async function ogThumb(pageUrl) {
    const r = await gmGet(pageUrl);
    if (r.status >= 400) return null;
    const c = metaContent(parseHTML(r.response), 'og:image:secure_url', 'og:image', 'twitter:image', 'twitter:image:src');
    const x = c && abs(c, r.finalUrl || pageUrl);
    return x ? x.href : null;
  }

  async function redgifsInfo(id) {
    if (!redgifsToken) redgifsToken = (await gmJSON('https://api.redgifs.com/v2/auth/temporary')).data.token;
    const { status, data } = await gmJSON(`https://api.redgifs.com/v2/gifs/${id.toLowerCase()}`, { Authorization: 'Bearer ' + redgifsToken });
    if (status === 404 || status === 410) return 'DEAD';
    return (data && data.gif) || null;
  }

  async function redgifsThumb(id) {
    const gif = await redgifsInfo(id);
    const urls = (gif && gif !== 'DEAD' && gif.urls) || {};
    return urls.poster || urls.thumbnail || null;
  }

  // Grab one frame as a JPEG (only works for same-origin videos or servers that allow CORS)
  function captureFrame(url) {
    return new Promise((resolve) => {
      const x = abs(url);
      if (!x) { resolve(null); return; }
      // metadata only: the seek below asks for just the part around that frame, not the start of the whole file
      const v = mediaEl('video', { muted: true, preload: 'metadata' });
      let done = false;
      const finish = (res) => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        v.removeAttribute('src');
        try { v.load(); } catch (e) { /* ignore */ }
        resolve(res);
      };
      const timer = setTimeout(() => finish(null), 15000);
      if (x.origin !== location.origin) v.crossOrigin = 'anonymous';
      v.onloadedmetadata = () => { v.currentTime = Math.min(1.5, (v.duration || 10) * 0.1); };
      v.onseeked = () => {
        try {
          const w = Math.min(480, v.videoWidth || 480);
          const c = el('canvas', { width: w, height: Math.round(((v.videoHeight || 270) * w) / (v.videoWidth || 480)) });
          c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
          finish(c.toDataURL('image/jpeg', 0.75));
        } catch (e) { finish(null); } // tainted canvas (no CORS)
      };
      v.onerror = () => finish(null);
      v.src = x.href;
    });
  }

  const OEMBED = [
    [/vimeo\.com\/(?:video\/)?(\d+)/, (id) => `https://vimeo.com/api/oembed.json?url=${encodeURIComponent('https://vimeo.com/' + id)}`],
    [/streamable\.com\/(?:[eos]\/)?(\w{4,})/, (id) => `https://api.streamable.com/oembed.json?url=${encodeURIComponent('https://streamable.com/' + id)}`],
    [/tiktok\.com\/(?:embed\/v2\/|.*\/video\/)(\d+)/, (id) => `https://www.tiktok.com/oembed?url=${encodeURIComponent('https://www.tiktok.com/video/' + id)}`],
  ];

  async function findThumb(item, failed) {
    const text = [item.source, item.url].filter(Boolean).join(' ');
    const ok = (x) => (x && x !== failed ? x : null);
    let t, m;
    try {
      if (item.type === 'video') {
        // the lighter version first, and only once the video being watched has buffered enough
        while (mainVideoBusy()) await sleep(300);
        for (const c of uniq([item.sd, ...item.candidates])) if ((t = ok(await captureFrame(c)))) return t;
      }
      for (const [re, endpoint] of OEMBED) {
        if ((m = text.match(re)) && (t = ok(await oembedThumb(endpoint(m[1]))))) return t;
      }
      if ((m = text.match(/redgifs\.com\/(?:watch|ifr|i)\/(\w+)/)) && (t = ok(await redgifsThumb(m[1])))) return t;
      const u = abs(item.source || item.url || '');
      if (isHttp(u) && u.origin !== location.origin && !VID_EXT.test(u.pathname) && (t = ok(await ogThumb(u.href)))) return t;
    } catch (e) { /* nothing found */ }
    return null;
  }

  function ensureThumb(item, failed) {
    if (item.thumbBusy || (item.thumbTries || 0) >= 2) return;
    item.thumbBusy = true;
    item.thumbTries = (item.thumbTries || 0) + 1;
    (async () => {
      const key = 't:' + item.key;
      const hit = !failed && !S.noCache && await cache.get(key, THUMB_TTL);
      if (hit) return hit.thumb;
      const t = await thumbQueue(() => findThumb(item, failed));
      if (t) cache.put(key, { thumb: t });
      return t;
    })().then((t) => {
      if (t && t !== item.thumb && !item.dead) {
        item.thumb = t;
        replaceTile(item);
        if (item.thumbEl) {
          const fresh = buildThumb(item);
          fresh.classList.toggle('on', item.thumbEl.classList.contains('on'));
          item.thumbEl.replaceWith(fresh);
          item.thumbEl = fresh;
        }
        const v = S.cur === item && ui.stage.querySelector(':scope > video');
        if (v && !v.poster) v.poster = t;
      }
    }).finally(() => { item.thumbBusy = false; });
  }

