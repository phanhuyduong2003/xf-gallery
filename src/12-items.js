  // ---------------------------------------------------------------------------
  // Items
  // ---------------------------------------------------------------------------
  function comparePos(a, b) {
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      const d = (a[i] || 0) - (b[i] || 0);
      if (d) return d;
    }
    return 0;
  }

  // Opening item: the last viewed one if it is on the page being read, otherwise the first item of that page
  // 0: on the page being read, from the linked post on (/unread and post links end in #post-123); 1: earlier on
  // that page; 2: other pages
  const startRank = (item) => (item.page !== S.startPage ? 2 : S.startPost && +item.postId < S.startPost ? 1 : 0);
  const isBetterStart = (item) => {
    const a = startRank(item), b = startRank(S.cur);
    return a < b || (a === b && comparePos(item.pos, S.cur.pos) < 0);
  };

  // Pick the opening item once the page being read is complete (its links resolved, or after 1.5 s),
  // so the viewer does not jump when a link near the top of the page resolves late.
  function maybeLockStart() { if (S.startReplayed && S.startPending <= 0) lockStart(); }
  function lockStart() {
    if (S.startLocked) return;
    S.startLocked = true;
    if (S.userMoved || S.cur) return;
    let best = null;
    for (const item of S.items) {
      if (item.dead || !passesFilter(item)) continue;
      if (!best || startRank(item) < startRank(best)) best = item;
      if (startRank(best) === 0) break; // items are sorted, so the first one on the page being read is the best
    }
    const intent = S.navIntent;
    if (intent) { // arrived here by a move in browse mode: finish that move
      const onPage = S.items.filter((i) => !i.dead && passesFilter(i) && i.page === S.startPage);
      best = (intent.key && onPage.find((i) => i.key === intent.key)) || (intent.dir < 0 ? onPage[onPage.length - 1] : onPage[0]) || null;
      if (!best && intent.dir) { goPage(S.startPage + intent.dir, intent.dir); return; } // no media here: keep going
    }
    if (best) { S.autoPicked = best; showItem(best); }
  }

  // Media found several times (quotes, thumbnails, proxies) is shown once. A copy inside a quote only stands in
  // until the post it quotes turns up: the item then moves there and takes that post's author, text and link.
  function addItem(spec, pos, ctx) {
    let key;
    if (spec.type === 'dead') {
      key = 'dead:' + keyOf(spec.source);
      if (S.keys.has(key)) return;
      S.keys.add(key);
    } else {
      key = keyOf(spec.type === 'embed' ? spec.url : spec.candidates[0]);
      const keys = [key, ...(spec.candidates || []).slice(1).map(keyOf)];
      const seen = keys.find((k) => S.keys.has(k));
      if (seen) {
        const known = S.byKey.get(seen);
        if (known && known.quote && !ctx.quote && S.items.includes(known)) moveToPost(known, pos, ctx);
        return;
      }
      keys.forEach((k) => S.keys.add(k));
    }
    const item = Object.assign({ candidates: [] }, spec, {
      key, pos, page: ctx.page, postId: ctx.postId, pageUrl: ctx.pageUrl, meta: ctx.meta, caption: ctx.caption || null, dead: spec.type === 'dead',
      quote: ctx.quote || null,
    });
    if (!item.dead) [key, ...(spec.candidates || []).slice(1).map(keyOf)].forEach((k) => S.byKey.set(k, item));
    if (item.dead) item.type = 'image';
    // here rather than when reading the page, so pages already in the cache get the same order
    if (item.candidates.length) item.candidates = directFirst(item.candidates);
    if (item.thumb) item.thumb = directUrl(item.thumb);
    if (item.type === 'image' && !item.dead) Object.assign(item, imageSizes(item));

    placeItem(item);
    if (!item.dead) {
      scheduleDividers();
      if (item.type !== 'image' && !item.thumb) ensureThumb(item);
      // a file found dead on a recent visit is shown as dead straight away, without asking its host again
      if (item.type !== 'embed') mediaMemo(item).then((m) => { if (m && m.dead && !item.dead && S.items.includes(item)) markDead(item); });
      // pick the opening item until the user navigates (results arrive out of order)
      if (!S.userMoved && passesFilter(item)) {
        if (S.resumeKey && key === S.resumeKey) { S.userMoved = true; showItem(item); }
        // the opening item is picked once the page being read is complete (see lockStart); after that only
        // a first item, or a move onto the page being read, can still change it
        else if (S.startLocked && (!S.cur || (S.cur.page !== S.startPage && item.page === S.startPage))) showItem(item);
      }
    }
    scheduleStatus();
  }

  // Insert (or re-insert) an item at its place in thread order, with its tile and filmstrip thumbnail
  function placeItem(item) {
    let lo = 0, hi = S.items.length; // binary insert: async results arrive out of order
    while (lo < hi) { const mid = (lo + hi) >> 1; if (comparePos(S.items[mid].pos, item.pos) < 0) lo = mid + 1; else hi = mid; }
    S.items.splice(lo, 0, item);
    const after = S.items.slice(lo + 1);
    const wasOn = !!(item.thumbEl && item.thumbEl.classList.contains('on'));
    const fresh = buildTile(item);
    if (item.el) { dropTile(item.el); item.el.remove(); }
    item.el = fresh;
    const nextTile = after.find((i) => i.el);
    ui.grid.insertBefore(item.el, nextTile ? nextTile.el : null);
    if (item.dead) return;
    if (item.thumbEl) item.thumbEl.remove();
    item.thumbEl = buildThumb(item);
    item.thumbEl.classList.toggle('on', wasOn);
    const nextThumb = after.find((i) => i.thumbEl);
    ui.strip.insertBefore(item.thumbEl, nextThumb ? nextThumb.thumbEl : null);
  }

  // The post that quoted this media turned up first; now the post it quotes has: move the item there
  function moveToPost(item, pos, ctx) {
    S.items.splice(S.items.indexOf(item), 1);
    Object.assign(item, { pos, page: ctx.page, postId: ctx.postId, pageUrl: ctx.pageUrl, meta: ctx.meta, caption: ctx.caption || null, quote: null });
    placeItem(item);
    scheduleDividers();
    if (S.cur === item) { setFocus(item.page); refreshLabels(); ui.postLink.href = postUrl(item); }
    scheduleStatus();
  }

  function handleUnit(unit, pos, ctx) {
    if (Array.isArray(unit)) { unit.forEach((spec, i) => addItem(spec, pos.concat(i), ctx)); return; }
    const linkKey = 'link:' + keyOf(unit.source);
    if (S.keys.has(linkKey)) { // same link seen before (usually a quote): resolve it again only for the post it quotes
      if (ctx.quote || !S.quotedLinks.has(linkKey)) return;
      S.quotedLinks.delete(linkKey); // (the lookup is cached, so this costs no request)
    }
    S.keys.add(linkKey);
    if (ctx.quote) S.quotedLinks.add(linkKey);
    const gen = S.gen;
    const forStart = !S.startLocked && ctx.page === S.startPage;
    if (forStart) S.startPending++;
    S.pending++;
    S.pageLinks.set(ctx.page, (S.pageLinks.get(ctx.page) || 0) + 1);
    scheduleStatus();
    const done = (res) => {
      if (gen !== S.gen) return;
      if (Array.isArray(res) && res.length) res.forEach((spec, i) => addItem(spec, pos.concat(i), ctx));
      else addItem({ type: 'dead', source: unit.source }, pos, ctx);
    };
    unit.run().then(done, () => done('DEAD')).finally(() => {
      if (gen !== S.gen) return;
      S.pending--;
      if (forStart) { S.startPending--; maybeLockStart(); }
      const left = S.pageLinks.get(ctx.page) - 1;
      S.pageLinks.set(ctx.page, left);
      if (!left) pageSettled(ctx.page);
      scheduleStatus();
    });
  }

  // Parse a thread page into plain, cacheable data. Links that need a network lookup are kept as
  // { link } and resolved when the page is replayed (usually straight from the link cache).
  function parsePage(doc, pageUrl) {
    return getPosts(doc).map((post) => {
      const { units, anchors, quotes } = extractPost(post, pageUrl);
      return {
        postId: postIdOf(post),
        meta: postMeta(post, pageUrl),
        units: units.map((u) => (Array.isArray(u) ? u : { link: u.source })),
        captions: mediaCaptions(post, anchors),
        quotes: quotes.some(Boolean) ? quotes : undefined, // optional: pages cached before this have none
      };
    });
  }

  function replayPage(posts, page, pageUrl) {
    posts.forEach((post, pi) => {
      if (page === 1 && pi === 0) setThreadStarter(post.meta.author, false);
      const ctx = { page, postId: post.postId, pageUrl, meta: post.meta };
      post.units.forEach((unit, k) => {
        const u = unit.link ? resolveLink(unit.link, pageUrl) : unit;
        if (u) handleUnit(u, [page, pi, k], Object.assign({}, ctx, { caption: (post.captions && post.captions[k]) || null, quote: (post.quotes && post.quotes[k]) || null }));
      });
    });
  }

  // A native video that will not play falls back to the host's embedded player when there is one
  function videoFail(item) {
    if (!item.fallbackEmbed || item.dead) { markDead(item); return; }
    Object.assign(item, { type: 'embed', url: item.fallbackEmbed, fallbackEmbed: null, candidates: [] });
    replaceTile(item);
    if (item.thumbEl) {
      const fresh = buildThumb(item);
      fresh.classList.toggle('on', item.thumbEl.classList.contains('on'));
      item.thumbEl.replaceWith(fresh);
      item.thumbEl = fresh;
    }
    if (S.cur === item) renderStage();
  }

  function markDead(item) {
    if (item.dead) return;
    item.dead = true;
    if (item.type !== 'embed') rememberDead(item);
    replaceTile(item);
    if (item.thumbEl) { item.thumbEl.remove(); item.thumbEl = null; scheduleDividers(); }
    if (S.cur === item && !step(S.lastDir, false) && !step(-S.lastDir, false)) renderStage();
    scheduleStatus();
  }

  // quoted media whose original post is not loaded links to that post (XenForo's goto link), else to where it is
  const postUrl = (item) => (item.quote && item.quote.url) || item.pageUrl + (item.postId ? '#post-' + item.postId : '');

