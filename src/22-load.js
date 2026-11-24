  // ---------------------------------------------------------------------------
  // Loading the thread
  // ---------------------------------------------------------------------------
  // Page sources, in this order of preference (none of the first two costs a request):
  //   1. the page being read: parsed from the live document;
  //   2. pages already in the cache (old pages are kept a week, recent ones an hour);
  //   3. the forum, through the page request scheduler.
  async function loadThread() {
    S.started = true;
    const gen = S.gen;
    S.totalPages = getTotalPages(document);
    setThreadStarter(detectThreadStarter(document), true);
    const cur = currentPage();
    S.startPage = cur;
    S.focusPage = cur;
    S.pageUrl = makePageUrl();

    const rec = await cache.get('v:' + THREAD_ID);
    if (gen !== S.gen) return;
    const hp = location.hash.match(/^#post-(\d+)/);
    S.startPost = hp ? +hp[1] : 0;
    const recent = !S.noCache && rec && rec.lastPage && Date.now() - rec.at < RESUME_TTL;
    const free = !S.navIntent && !S.startPost; // the user did not arrive here by a move or a post link
    S.resumeKey = recent && free && rec.lastPage === cur ? rec.lastKey : null;
    S.resumeOffer = recent && free && rec.lastPage !== cur && rec.lastPage <= S.totalPages ? { page: rec.lastPage, key: rec.lastKey } : null;
    cache.put('v:' + THREAD_ID, Object.assign({}, rec, { totalPages: S.totalPages })); // marks the thread as recently used
    cache.prune();

    // 1. the page being read
    const curUrl = S.pageUrl(cur);
    const curPosts = parsePage(document, curUrl);
    cache.put(pageKey(cur), { posts: curPosts, v: CACHE_SCHEMA });
    markPageLoaded(cur, curPosts, curUrl);
    S.startReplayed = true;
    maybeLockStart();
    setTimeout(lockStart, 1500);

    // 2. pages already cached
    if (!S.noCache) {
      for (const [key, val] of await cache.entries(`p:${THREAD_ID}:`)) {
        if (gen !== S.gen) return;
        const p = +key.split(':').pop();
        if (p === cur || p > S.totalPages || !val || val.v !== CACHE_SCHEMA || Date.now() - val.at > pageTtl(p)) continue;
        S.pagesCached++;
        markPageLoaded(p, val.posts, S.pageUrl(p));
      }
    }

    // 3. what the loading mode asks for, through the scheduler; the rest when the user gets there
    ensureWindow();
    scheduleStatus();
    scheduleDividers();
  }

  // Start over without the cache (pages, links and thumbnails are fetched again and re-cached)
  async function reloadThread() {
    ui.menu.hidden = true;
    S.gen++;
    clearTimeout(S.slideTimer);
    await cache.dropPrefix(`p:${THREAD_ID}:`);
    pageQ.queue = [];
    Object.assign(S, {
      items: [], keys: new Set(), byKey: new Map(), quotedLinks: new Set(), pending: 0, pagesCached: 0, pageErrors: 0, pageState: new Map(), netState: null,
      pendingNav: null, pageLinks: new Map(),
      cur: null, userMoved: false, resumeKey: null, startLocked: false, startPending: 0, startReplayed: false, noCache: true,
    });
    ui.grid.innerHTML = '';
    ui.strip.innerHTML = '';
    renderStage();
    loadThread();
  }

