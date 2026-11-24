  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  const S = {
    items: [],               // ready items, sorted by position in the thread
    keys: new Set(),         // de-duplication keys
    pending: 0,              // external links still resolving
    totalPages: 1,
    pageErrors: 0,
    started: false,
    view: store.get('view', 'viewer'),         // viewer | grid | list
    showDead: false,
    infoVideos: store.get('infoVideos', store.get('showLabel', true)),
    infoImages: store.get('infoImages', true),
    pinInfo: store.get('pinInfo', false),   // image info stays shown (compact, outside the image) until unpinned
    muted: store.get('muted', false),
    vquality: store.get('vquality', 'auto'), // auto | hd | sd
    threadStarter: null,
    starterFromHeader: false,
    cur: null,               // item shown in the viewer
    userMoved: false,        // user navigated, so stop auto-jumping to earlier items
    lastDir: 1,
    slideshow: store.get('autoplay', true), // autoplay is on by default; the choice is remembered
    slideTimer: null,
    unwireVideo: null,
    renderId: 0,             // bumped on every render of the viewer
    curReady: false,         // the current item has loaded
    curBuffered: false,      // ... and, for a video, buffered enough that background loads may start
    slowTimer: null,
    stripTouched: 0,         // last time the user scrolled the filmstrip by hand
    filter: store.get('filter', 'all'), // all | image | video (video includes embedded players)
    loadMode: store.get('loadMode', 'balanced'), // saver | balanced | all
    allConfirmed: false,     // Whole thread on a big thread: the user said "Load all"
    allDismissed: false,     // ... or "Later"
    pendingNav: null,        // { page, run, intent }: a move waiting for that page to load (next at the edge, first / last, gap click)
    navIntent: null,         // browse mode: the move that opened this page ({ dir } or { key }), finished on arrival
    startPost: 0,            // post linked in the URL (#post-123, e.g. from /unread): the gallery starts there
    resumeOffer: null,       // { page, key }: "last time you were at page 812"
    autoPicked: null,        // the opening item picked automatically (not remembered as "last viewed")
    pageLinks: new Map(),    // page -> links still resolving
    gen: 0,                  // bumped by "Reload" so late results of the previous load are ignored
    noCache: false,          // set by "Reload": ignore cached data for this load
    pagesCached: 0,
    pageState: new Map(),    // page -> 'queued' | 'loading' | 'loaded' | 'failed' | 'unloaded'
    pageUrl: null,
    focusPage: 1,            // page of the item being viewed (the queue serves pages near it first)
    netState: null,          // why page loading is waiting: 'wait' | 'fetching' | 'hidden' | 'cap' | 'trip' | 'rate'
    fetchingPage: null,
    startPage: 1,            // the page the user is reading: the gallery opens on its first item
    resumeKey: null,         // last viewed item, when it is on the page being read
    startLocked: false,      // the opening item has been chosen: no more automatic switching
    startPending: 0,         // links of the page being read still resolving
    startReplayed: false,
    videoCtl: null,
  };
  let ui = null;

