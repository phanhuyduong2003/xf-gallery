  // ---------------------------------------------------------------------------
  // Cache (IndexedDB of the forum's origin, one key/value store)
  //   p:<thread>:<page>  parsed media of one thread page
  //   l:<link key>       what an image-host link resolved to
  //   t:<media key>      thumbnail found for a video
  //   v:<thread>         thread record: last visit, last viewed item
  // ---------------------------------------------------------------------------
  const HOUR = 3600e3, DAY = 24 * HOUR;
  const CACHE_SCHEMA = 2; // bump when the shape of cached pages changes
  const LINK_TTL = 7 * DAY, DEAD_LINK_TTL = DAY, THUMB_TTL = 7 * DAY, MAX_THREADS = 30;
  // Cached pages: old pages rarely change, the last few (where new posts land) are refreshed sooner
  const PAGE_TTL_OLD = 7 * DAY, PAGE_TTL_RECENT = HOUR;
  const pageTtl = (p) => (p >= S.totalPages - 2 ? PAGE_TTL_RECENT : PAGE_TTL_OLD);
  // Thread id, whatever the URL scheme: XF's content key, else the last ".123/" or "/123/" in the canonical URL
  const THREAD_ID = (() => {
    const key = (docEl.getAttribute('data-content-key') || '').match(/^thread-(\d+)$/);
    if (key) return key[1];
    const canon = (document.querySelector('link[rel="canonical"]') || {}).href || location.href.split('#')[0];
    const ids = [...canon.matchAll(/[./](\d+)(?=\/|$)/g)];
    return ids.length ? ids[ids.length - 1][1] : location.pathname;
  })();

  const cache = (() => {
    let dbPromise = null;
    const open = () => dbPromise || (dbPromise = new Promise((resolve) => {
      try {
        const req = indexedDB.open('xenforo-thread-gallery', 1);
        req.onupgradeneeded = () => req.result.createObjectStore('kv');
        req.onsuccess = () => resolve(req.result);
        req.onerror = req.onblocked = () => resolve(null);
      } catch (e) { resolve(null); } // private mode / storage disabled: run without cache
    }));
    const run = async (mode, fn) => {
      const db = await open();
      if (!db) return null;
      return new Promise((resolve) => {
        try {
          const tx = db.transaction('kv', mode);
          const req = fn(tx.objectStore('kv'));
          tx.oncomplete = () => resolve(req && 'result' in req ? req.result : null);
          tx.onerror = tx.onabort = () => resolve(null);
        } catch (e) { resolve(null); }
      });
    };
    const range = (prefix) => IDBKeyRange.bound(prefix, prefix + '￿');
    const sweep = (prefix, ttl) => run('readwrite', (store) => {
      const req = store.openCursor(range(prefix));
      req.onsuccess = () => {
        const c = req.result;
        if (!c) return;
        if (!c.value || Date.now() - c.value.at > ttl) c.delete();
        c.continue();
      };
    });
    const api = {
      async get(key, ttl) {
        const v = await run('readonly', (store) => store.get(key));
        return v && (!ttl || Date.now() - v.at < ttl) ? v : null;
      },
      put: (key, value) => run('readwrite', (store) => store.put(Object.assign({}, value, { at: Date.now() }), key)),
      dropPrefix: (prefix) => run('readwrite', (store) => store.delete(range(prefix))),
      async entries(prefix) {
        const keys = (await run('readonly', (store) => store.getAllKeys(range(prefix)))) || [];
        const vals = (await run('readonly', (store) => store.getAll(range(prefix)))) || [];
        return keys.map((k, i) => [k, vals[i]]);
      },
      // At most once a day: keep the MAX_THREADS most recent threads and drop expired entries
      async prune() {
        if (await api.get('meta:prune', DAY)) return;
        await api.put('meta:prune', {});
        const keys = (await run('readonly', (store) => store.getAllKeys(range('v:')))) || [];
        const vals = (await run('readonly', (store) => store.getAll(range('v:')))) || [];
        const stale = keys.map((k, i) => [k, (vals[i] || {}).at || 0]).sort((a, b) => b[1] - a[1]).slice(MAX_THREADS);
        for (const [k] of stale) {
          await api.dropPrefix('p:' + k.slice(2) + ':');
          await run('readwrite', (store) => store.delete(k));
        }
        await sweep('p:', PAGE_TTL_OLD);
        await sweep('l:', LINK_TTL);
        await sweep('t:', THUMB_TTL);
      },
    };
    return api;
  })();

  const metaContent = (doc, ...names) => {
    for (const n of names) {
      const m = doc.querySelector(`meta[property="${n}"], meta[name="${n}"]`);
      if (m && m.getAttribute('content')) return m.getAttribute('content');
    }
    return null;
  };

