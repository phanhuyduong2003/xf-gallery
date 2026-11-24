  // ---------------------------------------------------------------------------
  // Link -> media
  // A "spec" is { type: 'image'|'video'|'embed'|'dead', candidates?, url?, thumb?, source }.
  // resolveLink returns: spec[] | { source, run() => Promise<spec[] | 'DEAD'> } | null (not media).
  // Network work only starts when run() is called, and its result is cached per link.
  // ---------------------------------------------------------------------------
  function youtubeId(u) {
    const h = u.hostname.replace(/^www\.|^m\./, '');
    if (h === 'youtu.be') return u.pathname.slice(1).split('/')[0] || null;
    if (/youtube(-nocookie)?\.com$/.test(h)) {
      if (u.searchParams.get('v')) return u.searchParams.get('v');
      const m = u.pathname.match(/\/(embed|shorts|live|v)\/([\w-]{6,})/);
      if (m) return m[2];
    }
    return null;
  }

  const deferred = (source, job) => ({
    source,
    run: async () => {
      const key = 'l:' + keyOf(source);
      const hit = !S.noCache && await cache.get(key);
      if (hit && Date.now() - hit.at < (hit.res === 'DEAD' ? DEAD_LINK_TTL : LINK_TTL)) return hit.res;
      const res = await resolveQueue(job);
      cache.put(key, { res });
      return res;
    },
  });

  function resolveLink(raw, base) {
    let u = abs(raw, base);
    if (!isHttp(u)) return null;
    u = unproxy(u);
    const h = bareHost(u.hostname);
    const p = u.pathname;
    const source = u.href;
    let m;

    if (h === 'i.imgur.com' && /\.gifv$/i.test(p)) {
      return [{ type: 'video', candidates: [u.href.replace(/\.gifv/i, '.mp4')], source }];
    }
    if (h === 'imgur.com' || h === 'm.imgur.com') {
      if ((m = p.match(/^\/(?:a|gallery)\/(?:[^/]*-)?(\w{5,8})/))) return [{ type: 'embed', url: `https://imgur.com/a/${m[1]}/embed?pub=true`, source }];
      if ((m = p.match(/^\/(\w{5,8})(?:\.\w+)?$/))) return [{ type: 'image', candidates: [`https://i.imgur.com/${m[1]}.jpg`], source }];
    }

    if (IMG_EXT.test(p)) return [{ type: 'image', candidates: uniq([stripChevereto(u.href), u.href]), thumb: u.href, source }];
    if (VID_EXT.test(p)) return [{ type: 'video', candidates: [u.href], source }];

    // the forum's own attachments
    if (u.origin === location.origin) {
      return /\/attachments\//.test(p) ? [{ type: 'image', candidates: [u.href], source, attachment: true }] : null;
    }

    const yt = youtubeId(u);
    if (yt) return [{ type: 'embed', url: `https://www.youtube.com/embed/${yt}`, thumb: `https://i.ytimg.com/vi/${yt}/hqdefault.jpg`, source }];
    if (h === 'streamable.com' && (m = p.match(/^\/(?:[eos]\/)?(\w{4,})/))) {
      const id = m[1];
      return deferred(source, () => resolveStreamable(id, source));
    }
    if (/redgifs\.com$/.test(h) && (m = p.match(/\/(?:watch|ifr|i)\/(\w+)/))) {
      const id = m[1];
      return deferred(source, () => resolveRedgifs(id, source));
    }
    if (h === 'vimeo.com' && (m = p.match(/^\/(\d+)/))) return [{ type: 'embed', url: `https://player.vimeo.com/video/${m[1]}`, source }];
    if (h === 'player.vimeo.com') return [{ type: 'embed', url: u.href, source }];
    if (/tiktok\.com$/.test(h) && (m = p.match(/\/video\/(\d+)/))) return [{ type: 'embed', url: `https://www.tiktok.com/embed/v2/${m[1]}`, source }];

    if (hostListed(h)) return deferred(source, () => resolveViewerPage(u.href));
    return null;
  }

  // Cheap check used to drop link text of media links from the post caption
  function isMediaHref(raw) {
    const u = unproxy(abs(raw || ''));
    if (!isHttp(u)) return false;
    const h = bareHost(u.hostname);
    return IMG_EXT.test(u.pathname) || VID_EXT.test(u.pathname) ||
      (u.origin === location.origin && /\/attachments\//.test(u.pathname)) ||
      !!youtubeId(u) || /(^|\.)(imgur|streamable|redgifs|vimeo|tiktok)\.com$/.test(h) || hostListed(h);
  }

  // RedGifs: play the MP4 directly (HD, or SD on slow networks); the embedded player is the fallback
  async function resolveRedgifs(id, source) {
    const embed = `https://www.redgifs.com/ifr/${id}`;
    try {
      const gif = await redgifsInfo(id);
      if (gif === 'DEAD') return 'DEAD';
      const u = (gif && gif.urls) || {};
      if (u.hd || u.sd) return [{ type: 'video', candidates: uniq([u.hd, u.sd]), sd: u.sd, thumb: u.poster || u.thumbnail, fallbackEmbed: embed, source }];
    } catch (e) { /* use the embedded player */ }
    return [{ type: 'embed', url: embed, source }];
  }

  async function resolveStreamable(id, source) {
    try {
      const { status, data } = await gmJSON(`https://api.streamable.com/videos/${id}`);
      if (status === 404) return 'DEAD';
      const file = data && data.files && (data.files.mp4 || data.files['mp4-mobile']);
      const fix = (x) => (x && x.startsWith('//') ? 'https:' + x : x);
      const mobile = data && data.files && data.files['mp4-mobile'];
      if (file && file.url) {
        const sd = mobile && mobile.url && mobile !== file ? fix(mobile.url) : undefined;
        return [{ type: 'video', candidates: uniq([fix(file.url), sd]), sd, thumb: fix(data.thumbnail_url),
          fallbackEmbed: `https://streamable.com/e/${id}`, source }];
      }
    } catch (e) { /* fall back to the embedded player */ }
    return [{ type: 'embed', url: `https://streamable.com/e/${id}`, source }];
  }

  function cheveretoAlbumItems(doc, base) {
    const out = [];
    doc.querySelectorAll('.list-item[data-object], .list-item[data-type="image"]').forEach((li) => {
      let url = null;
      const obj = li.getAttribute('data-object');
      if (obj) {
        try {
          const o = JSON.parse(decodeURIComponent(obj));
          url = (o.image && o.image.url) || o.url || o.display_url;
        } catch (e) { /* malformed data-object */ }
      }
      if (!url) {
        const img = li.querySelector('img');
        if (img) url = stripChevereto(img.getAttribute('src'));
      }
      const x = url && abs(url, base);
      if (x) out.push({ type: VID_EXT.test(x.pathname) ? 'video' : 'image', candidates: [x.href], source: base });
    });
    return out;
  }

  async function resolveViewerPage(href) {
    let r;
    try { r = await gmGet(href); } catch (e) { return 'DEAD'; }
    if (r.status >= 400) return 'DEAD';
    const final = r.finalUrl || href;
    const doc = parseHTML(r.response);

    // Chevereto album (anh.moe, ibb.co…): collect every image, following up to 20 "next" pages
    let list = cheveretoAlbumItems(doc, final);
    if (list.length > 1 || /\/(album|a)\//.test(abs(final).pathname)) {
      let next = doc.querySelector('a[data-pagination="next"][href]');
      for (let i = 0; next && i < 20; i++) {
        try {
          const page = parseHTML((await gmGet(abs(next.getAttribute('href'), final).href)).response);
          list = list.concat(cheveretoAlbumItems(page, final));
          next = page.querySelector('a[data-pagination="next"][href]');
        } catch (e) { break; }
      }
      if (list.length) return list;
    }

    const ogImg = metaContent(doc, 'og:image:secure_url', 'og:image', 'twitter:image', 'twitter:image:src');
    const thumb = ogImg ? abs(ogImg, final).href : undefined;

    const ogVid = metaContent(doc, 'og:video:secure_url', 'og:video:url', 'og:video', 'twitter:player:stream');
    if (ogVid) {
      const vu = abs(ogVid, final);
      const vt = metaContent(doc, 'og:video:type') || '';
      if (vu && (VID_EXT.test(vu.pathname) || /^video\//.test(vt))) return [{ type: 'video', candidates: [vu.href], thumb, source: href }];
      if (vu) return [{ type: 'embed', url: vu.href, thumb, source: href }];
    }
    const vid = doc.querySelector('video[src], video source[src]');
    if (vid) return [{ type: 'video', candidates: [abs(vid.getAttribute('src'), final).href], thumb, source: href }];

    const imgEl = doc.querySelector('#image-viewer-container img, img#image, #image-viewer img, .image-viewer img');
    const imgUrl = ogImg || (doc.querySelector('link[rel="image_src"]') || {}).href || (imgEl && imgEl.getAttribute('src'));
    if (imgUrl) {
      const iu = abs(imgUrl, final).href;
      return [{ type: 'image', candidates: uniq([iu, stripChevereto(iu)]), source: href }];
    }
    return 'DEAD';
  }

