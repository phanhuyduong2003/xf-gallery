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
      // (a frame of the video itself is drawn by videoFrame, when a thumbnail of it comes into view)
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
    const key = 't:' + item.key;
    // videoFrame waits for this, so a thumbnail saved on an earlier visit spares opening the video
    item.thumbCached = failed || S.noCache ? Promise.resolve(null)
      : cache.get(key, THUMB_TTL).then((hit) => (hit && hit.thumb) || null, () => null);
    item.thumbCached.then(async (hit) => {
      if (hit) return hit;
      const t = await thumbQueue(() => findThumb(item, failed));
      if (t) cache.put(key, { thumb: t });
      return t;
    }).then((t) => {
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

