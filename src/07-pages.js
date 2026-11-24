  // ---------------------------------------------------------------------------
  // Reading thread pages
  // ---------------------------------------------------------------------------
  function getPosts(doc) {
    const posts = doc.querySelectorAll('article.message--post');
    return [...(posts.length ? posts : doc.querySelectorAll('article.message, li.message'))];
  }

  function postIdOf(post) {
    const m = (post.getAttribute('data-content') || post.id || '').match(/post-(\d+)/);
    return m ? m[1] : null;
  }

  function getTotalPages(doc) {
    let max = 1;
    doc.querySelectorAll('.pageNav a, .PageNav a, .pageNavSimple a').forEach((a) => {
      max = Math.max(max, parseInt(a.textContent.trim(), 10) || 0);
      const m = (a.getAttribute('href') || '').match(/page-(\d+)/);
      if (m) max = Math.max(max, +m[1]);
    });
    const xf1 = doc.querySelector('.PageNav[data-last]');
    if (xf1) max = Math.max(max, parseInt(xf1.getAttribute('data-last'), 10) || 1);
    const jump = doc.querySelector('.js-pageJumpPage[max], input[name="page"][max]');
    if (jump) max = Math.max(max, parseInt(jump.getAttribute('max'), 10) || 1);
    return max;
  }

  function currentPage() {
    const m = location.href.split('#')[0].match(/page-(\d+)/);
    return m ? +m[1] : 1;
  }

  function makePageUrl() {
    const link = document.querySelector('.pageNav a[href*="page-"], .PageNav a[href*="page-"], .pageNavSimple a[href*="page-"]');
    if (link) {
      const tpl = abs(link.getAttribute('href')).href.split('#')[0];
      return (n) => (n === 1 ? tpl.replace(/page-\d+\/?/, '') : tpl.replace(/page-\d+/, 'page-' + n));
    }
    const canon = document.querySelector('link[rel="canonical"]');
    let base = ((canon && canon.href) || location.href.split('#')[0]).replace(/page-\d+\/?$/, '');
    if (!base.endsWith('/')) base += '/';
    return (n) => (n === 1 ? base : base + 'page-' + n);
  }

  // ---------------------------------------------------------------------------
  // Page request scheduler
  // Every thread-page request to the forum goes through here:
  //   - one request at a time per forum, across all tabs (Web Locks API);
  //   - spaced PAGE_INTERVAL_MS ± jitter apart, the timestamp being shared by all tabs (localStorage);
  //   - the gap doubles when the server is slow or failing and shrinks back slowly (AIMD);
  //   - at most SESSION_CAP requests per SESSION_WINDOW_MS, then the user has to press "Continue";
  //   - a captcha / block page (or 403 / 503) stops everything for TRIP_MS, in every tab, with no retry;
  //   - nothing runs while the tab is hidden or the gallery is closed.
  // ---------------------------------------------------------------------------
  const net = {
    read: () => store.get('net', {}),
    write: (patch) => store.set('net', Object.assign(store.get('net', {}), patch)),
  };
  const pageQ = { queue: [], running: false };

  function blockReason() {
    if (document.hidden) return 'hidden';
    if (!ui || ui.root.hidden) return 'closed';
    const n = net.read();
    if (n.trip && Date.now() < n.trip.until) return n.trip.auto ? 'rate' : 'trip';
    if ((n.browse || 0) > Date.now()) return 'browse';
    const from = Math.max(n.capFrom || 0, Date.now() - SESSION_WINDOW_MS);
    if ((n.log || []).filter((t) => t > from).length >= SESSION_CAP) return 'cap';
    return null;
  }

  // AIMD: double the gap after a slow / failed request, shrink it by 15% after a quick one
  function adaptRate(ok) {
    const cur = net.read().interval || PAGE_INTERVAL_MS;
    net.write({ interval: ok ? Math.max(PAGE_INTERVAL_MS, Math.round(cur * 0.85)) : Math.min(PAGE_MAX_INTERVAL_MS, cur * 2) });
  }

  function trip(ms, auto, reason) {
    net.write({ trip: { until: Date.now() + ms, auto, reason } });
    if (auto) setTimeout(pumpPages, ms + 500); // rate limit: resume by itself once the forum's delay has passed
    scheduleStatus();
  }

  // A page that is not the thread but a security check / captcha / block page
  function isChallenge(status, text, doc) {
    if (doc.querySelector('article.message, li.message')) return false;
    if (status === 403 || status === 503) return true;
    return /cf-chl|challenge-platform|cf_chl_opt|cf-turnstile|Just a moment\.\.\.|Attention Required|captcha/i.test(text.slice(0, 60000));
  }

  const netError = (kind, extra) => Object.assign(new Error(kind), { kind }, extra);

  // One request, aborted after PAGE_TIMEOUT_MS. Throws an error whose .kind is
  // 'challenge' | 'ratelimit' | 'transient' (timeout, network, 5xx) | 'final' (404 and the like).
  async function fetchPage(url) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), PAGE_TIMEOUT_MS);
    const t0 = Date.now();
    try {
      const r = await fetch(url, { credentials: 'include', signal: ctrl.signal });
      const text = await r.text();
      const doc = parseHTML(text);
      if (r.status === 429) {
        const ra = parseInt(r.headers.get('Retry-After'), 10);
        throw netError('ratelimit', { wait: (ra > 0 ? Math.min(ra, 600) : 120) * 1000 });
      }
      if (isChallenge(r.status, text, doc)) throw netError('challenge');
      if (r.status >= 500) { adaptRate(false); throw netError('transient'); }
      if (!r.ok) throw netError('final');
      adaptRate(Date.now() - t0 < PAGE_SLOW_MS);
      if (net.read().strikes) net.write({ strikes: 0 });
      return doc;
    } catch (e) {
      if (e.kind) throw e;
      adaptRate(false);
      throw netError('transient'); // timeout or network error
    } finally {
      clearTimeout(timer);
    }
  }

  const pageKey = (p) => `p:${THREAD_ID}:${p}`;

  // Pages loaded without being asked for: Saver none, Balanced WINDOW_PAGES around the page being viewed,
  // Whole thread every page (after a confirmation on big threads).
  const loadsAll = () => S.loadMode === 'all' && (S.totalPages <= BIG_THREAD_PAGES || S.allConfirmed);
  function inWindow(p) {
    if (loadsAll()) return true;
    return Math.abs(p - S.focusPage) <= (S.loadMode === 'saver' ? 0 : WINDOW_PAGES);
  }
  const wanted = (job) => job.explicit || inWindow(job.page);

  function ensureWindow() {
    if (!S.started || !S.pageUrl || browsing()) return;
    // queue everything first, then start, so the nearest page goes first
    if (loadsAll()) for (let p = 1; p <= S.totalPages; p++) requestPage(p, { batch: true });
    else if (S.loadMode !== 'saver') for (let d = 1; d <= WINDOW_PAGES; d++) {
      requestPage(S.focusPage + d, { batch: true });
      requestPage(S.focusPage - d, { batch: true });
    }
    pumpPages();
  }

  function setFocus(p) {
    if (p === S.focusPage) return;
    S.focusPage = p;
    ensureWindow();
    pumpPages(); // drops queued pages that left the window
  }

  // Queue a page (nearest to the page being viewed runs first). explicit: asked for by the user, kept even outside
  // the window. batch: queue only, the caller starts the queue.
  function requestPage(p, opts = {}) {
    if (p < 1 || p > S.totalPages || browsing()) return;
    const st = S.pageState.get(p);
    if (st === 'loaded' || st === 'loading') return;
    if (st === 'failed' && !opts.explicit) return;
    const job = pageQ.queue.find((j) => j.page === p);
    if (job) job.explicit = job.explicit || !!opts.explicit;
    else pageQ.queue.push({ page: p, attempts: 0, explicit: !!opts.explicit });
    S.pageState.set(p, 'queued');
    scheduleDividers();
    if (!opts.batch) pumpPages();
  }

  async function pumpPages() {
    if (pageQ.running || !S.pageUrl) return;
    pageQ.running = true;
    try {
      while (pageQ.queue.length) {
        // pages queued for a window the user has since left are forgotten (asked-for pages are kept)
        pageQ.queue = pageQ.queue.filter((j) => wanted(j) || (S.pageState.set(j.page, 'unloaded'), false));
        scheduleDividers();
        if (!pageQ.queue.length) break;
        const why = blockReason();
        S.netState = why;
        if (why) break; // resumed by: tab visible again, gallery opened, "Continue", or the rate-limit timer
        // pages the user is waiting for first, then the nearest to the page being viewed
        pageQ.queue.sort((a, b) => (b.explicit - a.explicit) || Math.abs(a.page - S.focusPage) - Math.abs(b.page - S.focusPage));
        const job = pageQ.queue.shift();
        await runPageJob(job);
      }
    } finally {
      pageQ.running = false;
      if (!pageQ.queue.length) S.netState = null;
      scheduleStatus();
    }
  }

  async function runPageJob(job) {
    const gen = S.gen, p = job.page, url = S.pageUrl(p);
    S.pageState.set(p, 'loading');
    scheduleStatus();
    const work = async () => {
      // another tab may have loaded this page while we were waiting for the lock
      const hit = !S.noCache && await cache.get(pageKey(p), pageTtl(p));
      if (hit && hit.v === CACHE_SCHEMA) return { posts: hit.posts, cached: true };
      const n = net.read();
      const wait = (n.last || 0) + (n.interval || PAGE_INTERVAL_MS) + (Math.random() * 2 - 1) * PAGE_JITTER_MS - Date.now();
      if (wait > 0) {
        S.netState = 'wait';
        scheduleStatus();
        await sleep(wait);
      }
      // conditions changed while waiting, or the user now waits for another page
      if (blockReason() || gen !== S.gen || !wanted(job) || (!job.explicit && pageQ.queue.some((j) => j.explicit))) return { deferred: true };
      const now = Date.now();
      net.write({ last: now, log: (net.read().log || []).filter((t) => t > now - SESSION_WINDOW_MS).concat(now) });
      S.netState = 'fetching';
      S.fetchingPage = p;
      scheduleStatus();
      return { doc: await fetchPage(url) };
    };
    let out;
    try {
      out = navigator.locks ? await navigator.locks.request('xtg-pages-' + location.host, work) : await work();
    } catch (e) {
      out = { error: e };
    }
    S.fetchingPage = null;
    if (gen !== S.gen) return;
    if (out.deferred) { requeue(job); return; }
    if (out.error) {
      const kind = out.error.kind;
      if (kind === 'challenge') {
        // a security check on a background request: the forum wants pages opened the normal way (voz.vn does
        // this for every background request). Switch to browse mode instead of retrying.
        S.pageState.set(p, 'unloaded');
        enterBrowse();
        const nav = S.pendingNav;
        if (nav && nav.page === p) { S.pendingNav = null; navigateTo(p, nav.intent); }
        return;
      }
      if (kind === 'ratelimit') {
        // repeated 429s: back off twice as long each time, and stop for good on the third one
        const strikes = (net.read().strikes || 0) + 1;
        net.write({ strikes });
        adaptRate(false);
        if (strikes >= RATE_STRIKES) trip(TRIP_MS, false, 'rate');
        else trip(out.error.wait * 2 ** (strikes - 1), true);
        requeue(job);
        return;
      }
      if (kind === 'transient' && ++job.attempts < PAGE_ATTEMPTS) { requeue(job); return; }
      S.pageState.set(p, 'failed');
      S.pageErrors++;
      console.warn('[XenForo Thread Gallery] failed to load page', p, out.error);
      scheduleStatus();
      scheduleDividers();
      pageSettled(p);
      return;
    }
    const posts = out.posts || parsePage(out.doc, url);
    if (out.cached) S.pagesCached++;
    else cache.put(pageKey(p), { posts, v: CACHE_SCHEMA });
    markPageLoaded(p, posts, url);
  }

  function requeue(job) {
    S.pageState.set(job.page, 'queued');
    pageQ.queue.push(job);
  }

  function markPageLoaded(p, posts, url) {
    S.pageState.set(p, 'loaded');
    replayPage(posts, p, url);
    scheduleStatus();
    scheduleDividers();
    // a move waiting for this page runs once its links have resolved (or after SETTLE_MS)
    if (!S.pageLinks.get(p)) pageSettled(p);
    else setTimeout(() => pageSettled(p), SETTLE_MS);
  }

  function pageSettled(p) {
    const nav = S.pendingNav;
    if (!nav || nav.page !== p || !ui) return;
    S.pendingNav = null;
    nav.run();
  }

  function showWait(text) {
    if (S.view !== 'viewer' || !ui) return;
    ui.stage.querySelectorAll('.xtg-wait').forEach((x) => x.remove());
    ui.stage.appendChild(el('div', { className: 'xtg-slow xtg-wait', textContent: text }));
  }

  // Ask for page p because the user is moving there; run() once it has loaded. intent describes the move
  // ({ dir: 1 } first item, { dir: -1 } last item, { key } a given item) for browse mode, where the page is
  // opened the normal way and the gallery picks up there.
  function waitForPage(p, run, intent = { dir: 1 }) {
    if (S.pageState.get(p) === 'loaded') { setTimeout(run, 0); return; }
    if (browsing()) { navigateTo(p, intent); return; }
    S.pendingNav = { page: p, run, intent };
    requestPage(p, { explicit: true, batch: true });
    setFocus(p);
    pumpPages();
    if (S.pageState.get(p) !== 'loaded') showWait(tr('waitPage', p));
  }

  // Go to the first (dir 1) or last (dir -1) item of page p, going on past pages without media
  function goPage(p, dir) {
    if (p < 1 || p > S.totalPages) return;
    waitForPage(p, () => {
      const list = visibleItems().filter((i) => i.page === p);
      const target = dir < 0 ? list[list.length - 1] : list[0];
      if (target) { S.userMoved = true; showItem(target); } else goPage(p + dir, dir);
    }, { dir });
  }

  // ---- Browse mode: the forum blocks background page requests (Cloudflare challenge on fetch), so pages are
  // opened as normal page views. Each one is spaced and counted like a background request, and the gallery
  // reopens on the new page where the move was heading (sessionStorage carries the intent across the reload).
  const browsing = () => (net.read().browse || 0) > Date.now();
  function enterBrowse() {
    net.write({ browse: Date.now() + BROWSE_MS });
    pageQ.queue.forEach((j) => S.pageState.set(j.page, 'unloaded'));
    pageQ.queue = [];
    scheduleStatus();
    scheduleDividers();
  }
  let navTimer = null;
  function navigateTo(p, intent) {
    clearTimeout(navTimer);
    const n = net.read();
    const from = Math.max(n.capFrom || 0, Date.now() - SESSION_WINDOW_MS);
    if ((n.log || []).filter((t) => t > from).length >= SESSION_CAP) { S.netState = 'cap'; scheduleStatus(); return; }
    showWait(tr('navOpening', p));
    navTimer = setTimeout(() => {
      if (!ui || ui.root.hidden) return; // closed meanwhile
      const now = Date.now();
      net.write({ last: now, log: (net.read().log || []).filter((t) => t > now - SESSION_WINDOW_MS).concat(now) });
      try { sessionStorage.setItem('xtg_nav', JSON.stringify({ thread: THREAD_ID, page: p, intent, at: now })); } catch (e) { /* ignore */ }
      location.href = S.pageUrl(p);
    }, Math.max(0, (n.last || 0) + (n.interval || PAGE_INTERVAL_MS) - Date.now()));
  }

  function stopPages() {
    pageQ.queue.forEach((j) => S.pageState.set(j.page, 'unloaded'));
    pageQ.queue = [];
    S.pendingNav = null;
    clearTimeout(navTimer);
    if (ui) ui.stage.querySelectorAll('.xtg-wait').forEach((x) => x.remove());
    scheduleStatus();
    scheduleDividers();
  }

  // First page after `from` (exclusive) in direction d, before `to` (exclusive), that is not loaded yet.
  // Failed pages are skipped: they do not block navigation.
  function firstGap(from, to, d) {
    for (let p = from + d; (to - p) * d > 0 && p >= 1 && p <= S.totalPages; p += d) {
      const st = S.pageState.get(p);
      if (st !== 'loaded' && st !== 'failed') return p;
    }
    return 0;
  }
  const curPage = () => (S.cur ? S.cur.page : S.focusPage);
  const moreIn = (d) => S.totalPages > 1 && !!firstGap(curPage(), d > 0 ? S.totalPages + 1 : 0, d);

  function netContinue() {
    const n = net.read();
    if (n.trip) net.write({ trip: null, strikes: 0 });
    else net.write({ capFrom: Date.now() }); // "Continue" after the session cap: a fresh allowance
    pumpPages();
  }

  document.addEventListener('visibilitychange', () => { if (!document.hidden) pumpPages(); if (ui) scheduleStatus(); });
  window.addEventListener('storage', (e) => { if (e.key === 'xtg_net' && ui) { scheduleStatus(); pumpPages(); } });

  // iframe URL, including lazy embeds from s9e MediaSites and XenForo
  function iframeSrc(node) {
    for (const name of ['src', 'data-src', 'data-s9e-mediaembed-src']) {
      const v = node.getAttribute(name);
      if (v && !/^about:/.test(v)) return v;
    }
    const json = node.getAttribute('data-s9e-mediaembed-iframe');
    if (json) {
      try {
        const arr = JSON.parse(json);
        const i = arr.indexOf('src');
        if (i >= 0) return arr[i + 1];
      } catch (e) { /* malformed attribute */ }
    }
    return null;
  }

  const MEDIA_SITES = {
    youtube: (k) => `https://www.youtube.com/watch?v=${k}`,
    vimeo: (k) => `https://vimeo.com/${k}`,
    streamable: (k) => `https://streamable.com/${k}`,
    imgur: (k) => `https://imgur.com/${k}`,
    redgifs: (k) => `https://www.redgifs.com/watch/${k}`,
    tiktok: (k) => `https://www.tiktok.com/video/${k}`,
  };

