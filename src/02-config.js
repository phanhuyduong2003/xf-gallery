  // ---------------------------------------------------------------------------
  // Config
  // ---------------------------------------------------------------------------
  // Hosts whose links point to a *viewer page* rather than the file itself.
  // The script fetches that page in the background to find the real file (og:image / og:video).
  // An entry without a dot (e.g. "zpic") matches any domain containing that text.
  const DEFAULT_HOSTS = [
    'anh.moe', 'zpic', 'ibb.co', 'imgbb.com', 'postimg.cc', 'postimages.org',
    'pixhost.to', 'imagebam.com', 'imgbox.com', 'imagetwist.com', 'lensdump.com',
    'jpg.church', 'jpg.pet', 'jpg5.su', 'imgchest.com', 'pixeldrain.com',
  ];
  // Thread-page requests to the forum go through one scheduler (see "Page request scheduler"). The numbers are
  // deliberately conservative: the goal is to look like a person browsing, because that is what is happening.
  const PAGE_INTERVAL_MS = 5000;        // base gap between two page requests, shared by every tab of the forum
  const PAGE_JITTER_MS = 1000;          // ± random part of that gap
  const PAGE_MAX_INTERVAL_MS = 60000;   // the gap doubles up to this when the server is slow or failing
  const PAGE_SLOW_MS = 3000;            // a page slower than this counts as "server under load"
  const SESSION_CAP = 40;               // page requests allowed per SESSION_WINDOW_MS before asking the user
  const SESSION_WINDOW_MS = 10 * 60e3;
  const TRIP_MS = 15 * 60e3;            // after a captcha / block page: no page requests for this long (or until "Continue")
  const RATE_STRIKES = 3;               // the third "429 Too Many Requests" in a row is treated like a block page
  const PAGE_ATTEMPTS = 4;
  const BROWSE_MS = 24 * 3600e3;         // a forum that blocks background page requests: browse mode for this long
  const NAV_TTL_MS = 10 * 60e3;          // a browse-mode move is finished on arrival if the page opens within this (a captcha may come first)
  const RESUME_TTL = 7 * 24 * 3600e3;    // "you were at page 812" is offered for this long
  const WINDOW_PAGES = 2;               // Balanced mode: pages loaded on each side of the page being viewed
  const BIG_THREAD_PAGES = 50;          // Whole-thread mode asks first above this many pages
  const SETTLE_MS = 1500;               // a page's media is considered complete after this long (links resolve late)              // one try plus three retries for timeouts / server errors
  const RESOLVE_CONCURRENCY = 2;   // external links resolved at once
  const THUMB_CONCURRENCY = 2;     // video thumbnails looked up at once
  const SLIDE_MS = 3500;           // slideshow delay for images
  const SLIDE_EMBED_MS = 15000;    // slideshow delay for embedded players
  const PAGE_TIMEOUT_MS = 20000;   // give up on a thread page request after this long (then retry)
  const LOAD_SKIP_MS = 15000;      // autoplay skips an item that has not loaded after this long (not marked broken)
  const SLOW_NOTICE_MS = 5000;     // show "the server is responding slowly" after this long
  const QUEUE_SLOT_MS = 10000;     // a slow thumbnail / preload gives its queue slot away after this long

  const IMG_EXT = /\.(jpe?g|png|gif|webp|avif|bmp|jfif)$/i;
  const VID_EXT = /\.(mp4|webm|mov|m4v|ogv)$/i;
  const BODY_SEL = '.message-userContent .bbWrapper, .message-body .bbWrapper, .messageText, .bbWrapper';

