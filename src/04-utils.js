  // ---------------------------------------------------------------------------
  // Settings (localStorage of the forum's domain)
  // ---------------------------------------------------------------------------
  const store = {
    get(k, d) { try { const v = localStorage.getItem('xtg_' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('xtg_' + k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } },
  };
  let hosts = store.get('hosts', DEFAULT_HOSTS);

  // ---------------------------------------------------------------------------
  // Utilities
  // ---------------------------------------------------------------------------
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const uniq = (arr) => [...new Set(arr.filter(Boolean))];
  const abs = (u, base) => { try { return new URL(u, base || location.href); } catch (e) { return null; } };
  const bareHost = (h) => h.replace(/^www\./, '').toLowerCase();
  const hostOf = (u) => { const x = abs(u); return x ? bareHost(x.hostname) : ''; };
  const isHttp = (u) => !!u && /^https?:$/.test(u.protocol);
  // Chevereto thumbnails: name.md.jpg / name.th.jpg -> name.jpg
  const stripChevereto = (u) => u && u.replace(/\.(md|th)(\.[a-z0-9]+)(\?.*)?$/i, '$2$3');
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const parseHTML = (html) => new DOMParser().parseFromString(html, 'text/html');
  const el = (tag, props) => Object.assign(document.createElement(tag), props);

  const ICONS = {
    pin: '<path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>',
    play: '<polygon points="6 3 20 12 6 21 6 3"/>',
    pause: '<rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/>',
    post: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    image: '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
    images: '<path d="M18 22H4a2 2 0 0 1-2-2V6"/><path d="m22 13-1.296-1.296a2.41 2.41 0 0 0-3.408 0L11 18"/><circle cx="12" cy="8" r="2"/><rect width="16" height="16" x="6" y="2" rx="2"/>',
    grid: '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
    rows: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M21 9H3"/><path d="M21 15H3"/>',
    stop: '<circle cx="12" cy="12" r="10"/><rect x="9" y="9" width="6" height="6" rx="1"/>',
    settings: '<path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    left: '<path d="m15 18-6-6 6-6"/>',
    filter: '<path d="M3 6h18"/><path d="M7 12h10"/><path d="M10 18h4"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    first: '<path d="m11 17-5-5 5-5"/><path d="m18 17-5-5 5-5"/>',
    last: '<path d="m6 17 5-5-5-5"/><path d="m13 17 5-5-5-5"/>',
    right: '<path d="m9 18 6-6-6-6"/>',
    dead: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
    vol: '<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 18.364a9 9 0 0 0 0-12.728"/>',
    mute: '<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><line x1="22" x2="16" y1="9" y2="15"/><line x1="16" x2="22" y1="9" y2="15"/>',
    max: '<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>',
    video: '<path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
  };
  const ic = (name, size = 18, fill = false) =>
    `<svg class="xtg-i" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fill ? 'currentColor' : 'none'}" stroke="currentColor" ` +
    `stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;

  function hostListed(h) {
    return hosts.some((entry) => {
      const e = entry.trim().toLowerCase();
      if (!e) return false;
      return e.includes('.') ? h === e || h.endsWith('.' + e) : h.includes(e);
    });
  }

  // XenForo image/link proxy: /proxy.php?image=... or ?link=...
  function unproxy(u) {
    if (u && /proxy\.php/.test(u.pathname + u.search)) {
      const x = abs(u.searchParams.get('image') || u.searchParams.get('link') || '');
      if (x && isHttp(x)) return x;
    }
    return u;
  }

  // The host's own URL first, the forum's proxied copy last: a direct load is one hop from the host, costs the
  // forum nothing, and the proxy (which may still hold a copy of a dead original) stays as the last resort.
  function directFirst(urls) {
    const direct = [], proxied = [];
    for (const u of urls) {
      const x = abs(u), inner = x && unproxy(x);
      if (inner && inner !== x) { direct.push(inner.href); proxied.push(u); } else direct.push(u);
    }
    return uniq([...direct, ...proxied]);
  }
  const directUrl = (u) => { const x = abs(u), inner = x && unproxy(x); return inner ? inner.href : u; };

  // Normalised key used to de-duplicate the same media found several times (quotes, thumbnails, proxies)
  function keyOf(u) {
    const x = unproxy(abs(u));
    return x ? (bareHost(x.hostname) + stripChevereto(x.pathname) + x.search).toLowerCase() : String(u);
  }

  // Slow connection or data saver (Network Information API; not available in Firefox, which then counts as fast)
  const slowNet = () => {
    const c = navigator.connection;
    return !!c && (c.saveData || /(^|-)(2g|3g)$/.test(c.effectiveType || ''));
  };

  // Smaller sizes offered by some hosts: Imgur (t = 160 px, l = 640 px, h = 1024 px) and Chevereto (.th / .md).
  // large: a size that still fills a small screen (see fitUrls); only for JPEGs, where nothing is lost but pixels.
  const CHEVERETO_HOST = /(^|\.)(anh\.moe|ibb\.co|imgbb\.com|jpg\.church|jpg\.pet|jpg5\.su|lensdump\.com)$/;
  function imageSizes(item) {
    const out = {};
    if (item.thumb && /\.md\.[a-z0-9]+(\?|$)/i.test(item.thumb)) out.medium = item.thumb; // Chevereto embed: the post shows .md
    const u = abs(item.candidates[0] || '');
    if (!u) return out;
    const h = bareHost(u.hostname);
    let m;
    if (h === 'i.imgur.com' && (m = u.pathname.match(/^\/(\w{5}|\w{7})\.(jpe?g|png|webp)$/i))) {
      return { small: `https://i.imgur.com/${m[1]}t.jpg`, medium: `https://i.imgur.com/${m[1]}l.jpg`,
        large: /^jpe?g$/i.test(m[2]) ? `https://i.imgur.com/${m[1]}h.jpg` : undefined };
    }
    if (CHEVERETO_HOST.test(h) && /\.(jpe?g|png|webp|gif)$/i.test(u.pathname) && !/\.(md|th)\.[a-z0-9]+$/i.test(u.pathname)) {
      const sized = (tag) => u.href.replace(/(\.[a-z0-9]+)(\?.*)?$/i, `.${tag}$1$2`);
      return { small: sized('th'), medium: out.medium || sized('md') };
    }
    return out;
  }

  function makeQueue(limit) {
    let active = 0;
    const waiting = [];
    const next = () => {
      while (active < limit && waiting.length) {
        const { fn, res, rej } = waiting.shift();
        active++;
        Promise.resolve().then(fn).then(res, rej).finally(() => { active--; next(); });
      }
    };
    return (fn) => new Promise((res, rej) => { waiting.push({ fn, res, rej }); next(); });
  }
  // Like makeQueue, with at most perHost jobs at once for the same host: one host is not hit by many requests
  // at once, and a slow host does not hold up the others. Usage: queue(host, fn)
  function makeHostQueue(limit, perHost) {
    let active = 0;
    const busy = new Map();
    const waiting = [];
    const next = () => {
      while (active < limit) {
        const at = waiting.findIndex((w) => (busy.get(w.host) || 0) < perHost);
        if (at < 0) return;
        const { host, fn, res, rej } = waiting.splice(at, 1)[0];
        active++;
        busy.set(host, (busy.get(host) || 0) + 1);
        Promise.resolve().then(fn).then(res, rej).finally(() => {
          active--;
          const n = busy.get(host) - 1;
          if (n) busy.set(host, n); else busy.delete(host);
          next();
        });
      }
    };
    return (host, fn) => new Promise((res, rej) => { waiting.push({ host, fn, res, rej }); next(); });
  }
  const resolveQueue = makeQueue(RESOLVE_CONCURRENCY);
  let redgifsToken = null;
  const thumbQueue = makeQueue(THUMB_CONCURRENCY);

  // Cross-origin GET through the userscript manager (falls back to fetch, which only works with CORS)
  function gmGet(url, binary, headers, timeout = 25000) {
    return new Promise((resolve, reject) => {
      const fn = typeof GM_xmlhttpRequest === 'function' ? GM_xmlhttpRequest
        : (typeof GM !== 'undefined' && GM && GM.xmlHttpRequest) ? GM.xmlHttpRequest.bind(GM) : null;
      if (!fn) {
        fetch(url, { headers })
          .then(async (r) => resolve({
            status: r.status, response: binary ? await r.blob() : await r.text(), finalUrl: r.url,
            headers: [...r.headers].map(([k, v]) => `${k}: ${v}`).join('\n'),
          }), reject);
        return;
      }
      fn({
        method: 'GET', url, headers, timeout,
        responseType: binary ? 'blob' : undefined,
        onload: (r) => resolve({
          status: r.status, response: binary ? r.response : r.responseText, finalUrl: r.finalUrl || url, headers: r.responseHeaders || '',
        }),
        onerror: reject,
        ontimeout: reject,
      });
    });
  }

  async function gmJSON(url, headers) {
    const r = await gmGet(url, false, headers);
    return { status: r.status, data: r.status === 200 ? JSON.parse(r.response) : null };
  }

  // Download an image through the manager (bypasses hotlink protection): { src: its blob: URL, from: the URL used }
  async function gmBlobUrl(urls) {
    for (const u of urls) {
      try {
        const r = await gmGet(u, true);
        const b = r.response;
        if (/\/removed\.(png|jpe?g)$/i.test(r.finalUrl || '')) continue; // imgur redirects deleted images to its "removed" picture
        if (r.status === 200 && b && b.size > 200 && /^(image|video)\//.test(b.type || '')) return { src: URL.createObjectURL(b), from: u };
      } catch (e) { /* try the next URL */ }
    }
    throw new Error('blob download failed');
  }

