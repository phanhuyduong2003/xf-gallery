// ==UserScript==
// @name             XenForo Thread Gallery
// @name:vi          XenForo Thread Gallery – Album ảnh/video cho chủ đề
// @namespace        xenforo-thread-gallery
// @author           Dylan Phan
// @version          3.2.0
// @description      Collects every image and video across all pages of a XenForo thread into one seamless gallery: viewer, grid and scroll modes, autoplay, Reels-style video player, poster labels, resolves image-host links (Chevereto, Imgur, Streamable…) and skips dead media.
// @description:vi   Gom toàn bộ ảnh và video qua mọi trang của một chủ đề XenForo thành một album xem liền mạch: xem từng ảnh, lưới, cuộn dọc, trình phát video kiểu Reels, nhãn người đăng, tự lấy file thật từ link dịch vụ ảnh (Chevereto, Imgur, Streamable…) và bỏ qua ảnh/video đã chết.
// @license          MIT
// @contributionURL  https://ko-fi.com/dylanphan
// @icon             data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%231f6feb' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M18 22H4a2 2 0 0 1-2-2V6'/%3E%3Cpath d='m22 13-1.296-1.296a2.41 2.41 0 0 0-3.408 0L11 18'/%3E%3Ccircle cx='12' cy='8' r='2'/%3E%3Crect width='16' height='16' x='6' y='2' rx='2'/%3E%3C/svg%3E
// @match            *://*/*
// @exclude          *://*.google.com/*
// @exclude          *://*.youtube.com/*
// @exclude          *://*.facebook.com/*
// @exclude          *://*.messenger.com/*
// @exclude          *://*.instagram.com/*
// @exclude          *://*.twitter.com/*
// @exclude          *://*.x.com/*
// @exclude          *://*.tiktok.com/*
// @exclude          *://*.reddit.com/*
// @exclude          *://*.linkedin.com/*
// @exclude          *://*.whatsapp.com/*
// @exclude          *://*.zalo.me/*
// @exclude          *://*.github.com/*
// @exclude          *://*.wikipedia.org/*
// @exclude          *://*.amazon.com/*
// @exclude          *://*.netflix.com/*
// @exclude          *://*.microsoft.com/*
// @exclude          *://*.live.com/*
// @exclude          *://*.office.com/*
// @exclude          *://*.apple.com/*
// @exclude          *://*.icloud.com/*
// @exclude          *://*.paypal.com/*
// @exclude          *://*.shopee.vn/*
// @exclude          *://*.lazada.vn/*
// @exclude          *://*.tiki.vn/*
// @exclude          *://*.chatgpt.com/*
// @exclude          *://*.openai.com/*
// @exclude          *://*.claude.ai/*
// @grant            GM_xmlhttpRequest
// @grant            GM.xmlHttpRequest
// @grant            GM_registerMenuCommand
// @connect          *
// @run-at           document-idle
// @noframes
// ==/UserScript==

/*
 * Icons: Lucide (https://lucide.dev), ISC License. Only the icons used here are inlined.
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Only run on XenForo (1.x or 2.x) thread pages. The script is allowed on every site because forums
  // can rename the "threads/" part of their URLs, so pages are recognised by their markup instead.
  // On any other page it stops here: nothing is added to the page and no request is made.
  // ---------------------------------------------------------------------------
  const docEl = document.documentElement;
  function isThreadPage() {
    const hasPosts = () => !!document.querySelector('article.message .bbWrapper, li.message .messageText');
    if (docEl.id === 'XF' || docEl.hasAttribute('data-xf')) {
      // XF 2.x names the page template: thread_view, thread_view_type_article / _question / _suggestion…
      const tpl = docEl.getAttribute('data-template');
      return tpl ? tpl.startsWith('thread_view') : hasPosts();
    }
    if (docEl.id === 'XenForo') return !!document.querySelector('#content.thread_view') || hasPosts();
    // themes that drop the html markers: the post markup itself is XenForo-specific
    return !!document.querySelector('article.message--post .bbWrapper');
  }
  const isXenForoPage = docEl.id === 'XF' || docEl.id === 'XenForo' || docEl.hasAttribute('data-xf');
  const onThreadPage = isThreadPage();
  if (isXenForoPage) addNewTabButtons(!onThreadPage);
  if (!onThreadPage) return;

  // A small "open in a new tab" icon after each thread title in thread lists (forums, new posts, search
  // results, widgets…). watch: keep adding it to items that appear later (filters, "load more").
  function addNewTabButtons(watch) {
    const label = (navigator.language || '').toLowerCase().startsWith('vi') ? 'Mở chủ đề trong tab mới' : 'Open thread in a new tab';
    const svg = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h6v6"/><path d="M10 14 21 3"/>' +
      '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>';
    const TITLES = '.structItem--thread .structItem-title, .discussionListItem .title';
    let styled = false;
    const process = () => {
      document.querySelectorAll(TITLES).forEach((title) => {
        if (title.querySelector('.xtg-newtab')) return;
        // the thread link itself, not the prefix label links in front of it
        const link = title.querySelector('a[data-tp-primary]') ||
          [...title.querySelectorAll('a[href]')].filter((a) => !a.matches('.labelLink, .prefixLink, [href*="prefix_id="]')).pop();
        if (!link) return;
        if (!styled) {
          styled = true;
          const st = document.createElement('style');
          st.textContent = '.xtg-newtab{display:inline-flex;align-items:center;vertical-align:middle;margin-left:6px;padding:2px;' +
            'border-radius:4px;color:inherit;opacity:.45;text-decoration:none!important}' +
            '.xtg-newtab:hover,.xtg-newtab:focus-visible{opacity:1;background:rgba(127,127,127,.2)}';
          document.head.appendChild(st);
        }
        const a = document.createElement('a');
        a.className = 'xtg-newtab';
        a.href = link.href;
        a.target = '_blank';
        a.rel = 'noopener';
        a.title = label;
        a.setAttribute('aria-label', label);
        a.innerHTML = svg;
        link.after(a);
      });
    };
    process();
    if (!watch) return;
    let timer = null;
    new MutationObserver(() => { clearTimeout(timer); timer = setTimeout(process, 250); })
      .observe(document.body, { childList: true, subtree: true });
  }

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

  // ---------------------------------------------------------------------------
  // i18n (English by default, Vietnamese when the browser language is Vietnamese)
  // ---------------------------------------------------------------------------
  const LANG = (navigator.language || 'en').toLowerCase().startsWith('vi') ? 'vi' : 'en';
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  const STR = {
    en: {
      fab: 'Album',
      fabTip: 'View every image and video in this thread',
      menuOpen: 'Open thread gallery',
      menuHosts: 'Edit image host list',
      dialog: 'Thread gallery',
      slideshow: 'Autoplay', slideshowShort: 'Auto', slideshowTip: 'Autoplay (Space)',
      post: 'Post', postTip: 'Open the post containing this item',
      source: 'Source', sourceTip: 'Open the original link',
      view: 'View', viewTip: 'One at a time',
      grid: 'Grid', gridTip: 'Thumbnail grid (G)',
      scroll: 'Scroll', scrollTip: 'Vertical scroll',
      stop: 'Stop loading', stopShort: 'Stop', stopTip: 'Stop loading the remaining pages',
      options: 'Options', close: 'Close (Esc)', prev: 'Previous (←)', next: 'Next (→)', first: 'First (Home)', last: 'Last (End)',
      optInfoVideos: 'Show info on videos (I)',
      optInfoImages: 'Show info on images (I)',
      pinTip: 'Keep the info shown, outside the image (P)', unpinTip: 'Show the info only under the mouse (P)',
      fullPost: 'Whole post',
      inPost: (i, n) => `${i} of ${n} in this post`,
      optDead: 'Show broken items in grid / scroll',
      optHosts: 'Edit image host list…',
      optReload: 'Reload this thread (ignore cache)',
      fromCache: (n) => ` · ${plural(n, 'page', 'pages')} from cache`,
      searching: 'Looking for images and videos…',
      none: 'No images or videos found.',
      loading: 'Loading…',
      counts: (i, v) => `${plural(i, 'image', 'images')} · ${plural(v, 'video', 'videos')}`,
      broken: (n) => ` · ${n} broken`,
      pageErrors: (n) => ` · ${plural(n, 'page', 'pages')} failed`,
      pagesLoaded: (a, b) => ` · ${a}/${b} pages`,
      netWait: ' · waiting (spacing requests)',
      netFetching: (p) => ` · loading page ${p}`,
      netHidden: ' · paused (tab hidden)',
      netPaused: ' · paused',
      bannerTrip: 'The forum is asking for verification (captcha / security check). Open the thread in a normal tab, complete it, then press Continue.',
      bannerRate: (sec) => `The forum asked to slow down. Resuming in about ${sec} s.`,
      bannerBrowse: 'This forum does not allow loading pages in the background. The gallery collects the pages you open, and going to another page opens it the normal way.',
      btnGotIt: 'Got it', btnBgRetry: 'Try background loading again',
      netBrowse: ' · browse mode', navOpening: (p) => `Opening page ${p}…`,
      resumeAsk: (p) => `Last time you were at page ${p}.`, btnResume: 'Continue there', btnSkip: 'Dismiss',
      bannerAll: (n, min) => `This thread has ${n} pages. Loading all of them takes about ${min} min and pauses every ${SESSION_CAP} pages.`,
      btnLoadAll: 'Load all', btnLater: 'Later',
      modeTitle: 'Loading pages', modeSaver: 'Saver: only when you get there', modeBalanced: 'Balanced: 2 pages around',
      modeAll: 'Whole thread',
      gapPages: (a, b) => (a === b ? `p. ${a}` : `p. ${a}–${b}`), gapUnloaded: 'not loaded', gapLoading: 'loading…',
      gapFailed: 'failed, click to retry', gapTip: 'Click to load', waitPage: (p) => `Loading page ${p}…`,
      bannerRateStop: 'The forum keeps asking to slow down, so loading has stopped. Wait a few minutes, then press Continue.',
      bannerCap: (n) => `${n} pages loaded in the last 10 minutes. Paused so the forum is not overloaded.`,
      btnContinue: 'Continue', btnOpenPage: 'Open the thread',
      dead: 'Removed or failed to load',
      deadLong: 'This image/video was removed or failed to load.',
      openOriginal: 'Open original link ↗',
      slowMsg: 'The server is responding slowly…', retry: 'Retry',
      page: (n) => `Page ${n}`,
      pageOf: (p, n) => `Page ${p}/${n}`,
      fAll: 'All', fImages: 'Images', fVideos: 'Videos', filterTip: 'Show only this kind',
      pageShort: (p) => `p. ${p}`,
      postLink: 'post ↗', sourceLink: 'source ↗', video: 'video',
      op: 'Thread starter', member: 'Member',
      more: 'Show more', less: 'Show less',
      playTip: 'Play / pause (K)', muteTip: 'Mute / unmute (M)', fsTip: 'Fullscreen (F)',
      qTip: 'Video quality: Auto (lighter version on slow hosts) → HD → SD',
      hostsPrompt: 'Image/video hosts whose links point to a viewer page instead of the file (comma-separated).\n' +
        'The script opens that page to find the real file. Entries without a dot match any domain containing that text.\n' +
        'Leave empty to restore the defaults.',
      saved: 'Saved. Reload the page to apply it to this thread.',
    },
    vi: {
      fab: 'Album',
      fabTip: 'Xem toàn bộ ảnh/video của chủ đề',
      menuOpen: 'Mở album chủ đề',
      menuHosts: 'Sửa danh sách dịch vụ ảnh',
      dialog: 'Album ảnh và video',
      slideshow: 'Tự động phát', slideshowShort: 'Tự động', slideshowTip: 'Tự động phát (Space)',
      post: 'Bài gốc', postTip: 'Mở bài viết chứa mục này',
      source: 'Nguồn', sourceTip: 'Mở link gốc',
      view: 'Xem', viewTip: 'Xem từng ảnh',
      grid: 'Lưới', gridTip: 'Lưới ảnh thu nhỏ (G)',
      scroll: 'Cuộn', scrollTip: 'Cuộn dọc',
      stop: 'Dừng tải', stopShort: 'Dừng', stopTip: 'Dừng tải các trang còn lại',
      options: 'Tuỳ chọn', close: 'Đóng (Esc)', prev: 'Trước (←)', next: 'Sau (→)', first: 'Đầu tiên (Home)', last: 'Cuối cùng (End)',
      optInfoVideos: 'Hiện thông tin trên video (phím I)',
      optInfoImages: 'Hiện thông tin trên ảnh (phím I)',
      pinTip: 'Ghim thông tin, đặt ra ngoài ảnh (phím P)', unpinTip: 'Chỉ hiện thông tin khi di chuột vào (phím P)',
      fullPost: 'Xem cả bài',
      inPost: (i, n) => `${i}/${n} trong bài`,
      optDead: 'Hiện mục hỏng ở chế độ lưới / cuộn',
      optHosts: 'Sửa danh sách dịch vụ ảnh…',
      optReload: 'Tải lại chủ đề này (bỏ qua bộ nhớ đệm)',
      fromCache: (n) => ` · ${n} trang từ bộ nhớ đệm`,
      searching: 'Đang tìm ảnh và video…',
      none: 'Không tìm thấy ảnh hoặc video nào.',
      loading: 'Đang tải…',
      counts: (i, v) => `${i} ảnh · ${v} video`,
      broken: (n) => ` · ${n} hỏng`,
      pageErrors: (n) => ` · ${n} trang lỗi`,
      pagesLoaded: (a, b) => ` · ${a}/${b} trang`,
      netWait: ' · đang chờ (giãn cách yêu cầu)',
      netFetching: (p) => ` · đang tải trang ${p}`,
      netHidden: ' · tạm dừng (tab ẩn)',
      netPaused: ' · đã dừng',
      bannerTrip: 'Diễn đàn đang yêu cầu xác minh (captcha / kiểm tra bảo mật). Mở chủ đề trong tab thường để xác minh, rồi bấm Tiếp tục.',
      bannerRate: (sec) => `Diễn đàn yêu cầu giảm tốc. Tự tiếp tục sau khoảng ${sec} giây.`,
      bannerBrowse: 'Diễn đàn này không cho tải trang ngầm. Album gom ảnh từ các trang bạn mở; đi tới trang khác sẽ mở trang đó như bình thường.',
      btnGotIt: 'Đã hiểu', btnBgRetry: 'Thử tải ngầm lại',
      netBrowse: ' · chế độ duyệt', navOpening: (p) => `Đang mở trang ${p}…`,
      resumeAsk: (p) => `Lần trước bạn xem tới trang ${p}.`, btnResume: 'Xem tiếp từ đó', btnSkip: 'Bỏ qua',
      bannerAll: (n, min) => `Chủ đề có ${n} trang. Tải toàn bộ mất khoảng ${min} phút và tạm dừng sau mỗi ${SESSION_CAP} trang.`,
      btnLoadAll: 'Tải toàn bộ', btnLater: 'Để sau',
      modeTitle: 'Tải trang', modeSaver: 'Tiết kiệm: chỉ khi xem tới', modeBalanced: 'Cân bằng: 2 trang xung quanh',
      modeAll: 'Toàn bộ chủ đề',
      gapPages: (a, b) => (a === b ? `Tr. ${a}` : `Tr. ${a}–${b}`), gapUnloaded: 'chưa tải', gapLoading: 'đang tải…',
      gapFailed: 'lỗi, bấm để thử lại', gapTip: 'Bấm để tải', waitPage: (p) => `Đang tải trang ${p}…`,
      bannerRateStop: 'Diễn đàn liên tục yêu cầu giảm tốc nên đã dừng tải. Đợi vài phút rồi bấm Tiếp tục.',
      bannerCap: (n) => `Đã tải ${n} trang trong 10 phút qua. Tạm dừng để không làm quá tải diễn đàn.`,
      btnContinue: 'Tiếp tục', btnOpenPage: 'Mở chủ đề',
      dead: 'Đã bị xoá hoặc không tải được',
      deadLong: 'Ảnh/video này đã bị xoá hoặc không tải được.',
      openOriginal: 'Mở link gốc ↗',
      slowMsg: 'Máy chủ phản hồi chậm…', retry: 'Thử lại',
      page: (n) => `Trang ${n}`,
      pageOf: (p, n) => `Trang ${p}/${n}`,
      fAll: 'Tất cả', fImages: 'Ảnh', fVideos: 'Video', filterTip: 'Chỉ hiện loại này',
      pageShort: (p) => `Tr. ${p}`,
      postLink: 'bài gốc ↗', sourceLink: 'nguồn ↗', video: 'video',
      op: 'Tác giả chủ đề', member: 'Thành viên',
      more: 'Xem thêm', less: 'Thu gọn',
      playTip: 'Phát / tạm dừng (K)', muteTip: 'Tắt / bật tiếng (M)', fsTip: 'Toàn màn hình (F)',
      qTip: 'Chất lượng video: Tự động (bản nhẹ khi host chậm) → HD → SD',
      hostsPrompt: 'Tên miền dịch vụ lưu ảnh/video mà link trỏ tới trang xem ảnh thay vì file (cách nhau bằng dấu phẩy).\n' +
        'Script mở trang đó để lấy file thật. Mục không có dấu chấm sẽ khớp mọi tên miền chứa chuỗi đó.\n' +
        'Để trống để khôi phục mặc định.',
      saved: 'Đã lưu. Tải lại trang để áp dụng cho chủ đề này.',
    },
  };
  const tr = (key, ...args) => {
    const v = STR[LANG][key] !== undefined ? STR[LANG][key] : STR.en[key];
    return typeof v === 'function' ? v(...args) : v;
  };

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

  // ---------------------------------------------------------------------------
  // Cache (IndexedDB of the forum's origin, one key/value store)
  //   p:<thread>:<page>  parsed media of one thread page
  //   l:<link key>       what an image-host link resolved to
  //   t:<media key>      thumbnail found for a video
  //   m:<media key>      { ok: url } the file that loaded last time, or { dead: true } (see mediaMemo)
  //   v:<thread>         thread record: last visit, last viewed item
  // ---------------------------------------------------------------------------
  const HOUR = 3600e3, DAY = 24 * HOUR;
  const CACHE_SCHEMA = 2; // bump when the shape of cached pages changes
  const LINK_TTL = 7 * DAY, DEAD_LINK_TTL = DAY, THUMB_TTL = 7 * DAY, MAX_THREADS = 30;
  const MEDIA_OK_TTL = 7 * DAY, DEAD_MEDIA_TTL = 12 * HOUR; // a host that is down for a while gets another chance soon
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
        await sweep('m:', MEDIA_OK_TTL);
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

  // Media of one post, in document order. Each unit is spec[] or a Promise (see resolveLink).
  function extractPost(post, base) {
    const roots = [post.querySelector(BODY_SEL), post.querySelector('.message-attachments, .attachedFiles')].filter(Boolean);
    const units = [];
    const anchors = [];      // the element each unit came from (used to find the text next to it)
    const consumed = new Set();
    const push = (res, anchor) => { if (res) { units.push(res); anchors.push(anchor); } };
    const SEL = 'img, video, iframe, a[href], blockquote.imgur-embed-pub, [data-media-site-id][data-media-key], [data-s9e-mediaembed-iframe]';

    for (const root of roots) {
      for (const node of root.querySelectorAll(SEL)) {
        if (consumed.has(node) || node.closest('.bbCodeBlock-sourceJump, .avatar, .username, .contentRow-figure')) continue;
        const tag = node.tagName;

        if (tag === 'IMG') {
          if (node.matches('.smilie, .emoji, [data-smilie]') || node.closest('.bbCodeBlock--unfurl')) continue;
          const w = parseInt(node.getAttribute('width'), 10), h = parseInt(node.getAttribute('height'), 10);
          if ((w && w < 40) || (h && h < 40)) continue; // smilies / icons
          const shown = node.getAttribute('data-src') || node.getAttribute('src');
          const wrap = node.closest('[data-src]');
          const orig = node.getAttribute('data-url') || (wrap && wrap !== node ? wrap.getAttribute('data-src') : null);
          const shownU = shown && !shown.startsWith('data:') ? abs(shown, base) : null;
          const origU = orig ? abs(orig, base) : null;
          if (!shownU && !origU) continue;
          const cands = [];
          const a = node.closest('a[href]');
          if (a && root.contains(a)) {
            consumed.add(a);
            const ah = abs(a.getAttribute('href'), base);
            if (ah && (IMG_EXT.test(unproxy(ah).pathname) || (ah.origin === location.origin && /\/attachments\//.test(ah.pathname)))) cands.push(ah.href);
          }
          if (origU) cands.push(stripChevereto(origU.href));
          if (shownU) cands.push(stripChevereto(unproxy(new URL(shownU.href)).href), shownU.href); // proxied copy may survive a dead original
          if (origU) cands.push(origU.href);
          push([{ type: 'image', candidates: uniq(cands), thumb: shownU ? shownU.href : undefined, source: (origU || shownU).href }],
            a && root.contains(a) ? a : node);
        } else if (tag === 'VIDEO') {
          const srcs = [node.getAttribute('src'), node.getAttribute('data-src')];
          node.querySelectorAll('source').forEach((s) => srcs.push(s.getAttribute('src'), s.getAttribute('data-src')));
          const cands = uniq(srcs).map((s) => abs(s, base)).filter(Boolean).map((x) => x.href);
          if (!cands.length) continue;
          const poster = node.getAttribute('poster') || node.getAttribute('data-poster');
          push([{ type: 'video', candidates: cands, thumb: poster ? abs(poster, base).href : undefined, source: cands[0] }], node);
        } else if (tag === 'IFRAME' || node.hasAttribute('data-s9e-mediaembed-iframe')) {
          const s = iframeSrc(node);
          if (!s) continue;
          node.querySelectorAll('iframe').forEach((f) => consumed.add(f));
          const res = resolveLink(s, base);
          const x = abs(s, base);
          push(res || (x && [{ type: 'embed', url: x.href, source: x.href }]), node);
        } else if (node.hasAttribute('data-media-site-id')) {
          node.querySelectorAll('iframe, a, img, video').forEach((c) => consumed.add(c));
          const inner = node.querySelector('iframe');
          const site = MEDIA_SITES[node.getAttribute('data-media-site-id')];
          const url = (inner && iframeSrc(inner)) || (site && site(node.getAttribute('data-media-key')));
          if (url) push(resolveLink(url, base), node);
        } else if (tag === 'BLOCKQUOTE') {
          node.querySelectorAll('a').forEach((c) => consumed.add(c));
          const id = node.getAttribute('data-id');
          if (id) push(resolveLink('https://imgur.com/' + id, base), node);
        } else if (tag === 'A' && !node.querySelector('img, video')) { // linked images are handled via the <img>
          const href = node.getAttribute('href');
          if (href && !href.startsWith('#') && !href.startsWith('javascript:')) push(resolveLink(href, base), node);
        }
      }
    }
    return { units, anchors };
  }

  // ---------------------------------------------------------------------------
  // Poster info (for the Reels-style label)
  // ---------------------------------------------------------------------------
  function detectThreadStarter(doc) {
    const n = doc.querySelector('.p-description .username, .p-description a[href*="members/"], #pageDescription .username, #pageDescription a[href*="members/"]');
    return n ? n.textContent.trim() : null;
  }

  // Plain text of a cloned post body: quotes, media, bare links and media-link text removed
  function cleanText(c) {
    c.querySelectorAll('.bbCodeBlock--quote, blockquote, script, style, img, video, iframe, .bbMediaWrapper, .bbMediaJustifier, ' +
      '[data-s9e-mediaembed], [data-media-site-id], .bbCodeBlock--unfurl, .bbCodeSpoiler-button, .messageTextEndMarker').forEach((n) => n.remove());
    c.querySelectorAll('a').forEach((a) => {
      const txt = a.textContent.trim();
      if (!txt || /^(https?:\/\/|www\.)/i.test(txt) || isMediaHref(a.getAttribute('href'))) a.remove();
    });
    c.querySelectorAll('br').forEach((b) => b.replaceWith('\n'));
    c.querySelectorAll('div, p, li, h1, h2, h3, h4').forEach((d) => d.append('\n'));
    return c.textContent.replace(/[ \t ]+/g, ' ').replace(/ ?\n ?/g, '\n').replace(/\n{2,}/g, '\n').trim();
  }

  function postText(post) {
    const body = post.querySelector(BODY_SEL);
    return body ? cleanText(body.cloneNode(true)).slice(0, 2000) : '';
  }

  // Caption for each media item of a post with several items: the text right next to it.
  // The post text is split at every item; if the post starts with text (or ends with none), captions
  // are taken to sit above their item, otherwise below it. Items without their own text share the
  // nearest caption in that direction. Returns null for items where the whole post text should be used.
  function mediaCaptions(post, anchors) {
    const none = anchors.map(() => null);
    const body = post.querySelector(BODY_SEL);
    if (!body) return none;
    const marked = anchors.map((a) => !!(a && body.contains(a)));
    if (marked.filter(Boolean).length < 2) return none;
    anchors.forEach((a, i) => { if (marked[i]) a.setAttribute('data-xtg-a', i); });
    const c = body.cloneNode(true);
    anchors.forEach((a, i) => { if (marked[i]) a.removeAttribute('data-xtg-a'); });
    c.querySelectorAll('[data-xtg-a]').forEach((n) => n.replaceWith(`\u0001${n.getAttribute('data-xtg-a')}\u0002`));
    const parts = cleanText(c).split(/\u0001(\d+)\u0002/);
    const segs = [], order = [];
    parts.forEach((part, i) => { if (i % 2) order.push(+part); else segs.push(part.trim()); });
    const n = order.length;
    if (n < 2) return none;
    const below = !segs[0] && !!segs[n];
    const out = none.slice();
    order.forEach((unit, j) => {
      if (below) { for (let k = j + 1; k <= n; k++) if (segs[k]) { out[unit] = segs[k]; break; } }
      else { for (let k = j; k >= 0; k--) if (segs[k]) { out[unit] = segs[k]; break; } }
      if (out[unit]) out[unit] = out[unit].slice(0, 2000);
    });
    return out;
  }

  function postMeta(post, base) {
    const nameEl = post.querySelector('.message-name .username, .message-cell--user .username, .message-userDetails .username, .messageUserInfo .username, .userText .username');
    const avImg = post.querySelector('.message-avatar img, .message-cell--user .avatar img, .messageUserBlock .avatar img, .message-user .avatar img');
    const avSrc = avImg && (avImg.getAttribute('src') || avImg.getAttribute('data-src'));
    const avatar = avSrc && !avSrc.startsWith('data:') ? abs(avSrc, base) : null;
    const profLink = nameEl && nameEl.closest('a[href]');
    const profile = profLink ? abs(profLink.getAttribute('href'), base) : null;
    const dateEl = post.querySelector('.message-attribution-main time, .message-attribution time, .messageMeta .DateTime, .privateControls .DateTime');
    return {
      author: post.getAttribute('data-author') || (nameEl ? nameEl.textContent.trim() : ''),
      avatar: avatar ? avatar.href : null,
      profile: profile ? profile.href : null,
      date: dateEl ? dateEl.textContent.trim() : '',
      text: postText(post),
    };
  }

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

  const CSS = `
.xtg-i{display:block;flex:0 0 auto}
#xtg-fab{position:fixed;right:16px;bottom:16px;z-index:2147483000;padding:10px 16px;display:inline-flex;align-items:center;gap:7px;border:0;border-radius:999px;
  background:#1f6feb;color:#fff;font:600 14px/1 system-ui,sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.35);cursor:pointer}
#xtg-fab:hover{background:#2b7bff}
#xtg-root{position:fixed;inset:0;z-index:2147483001;display:flex;align-items:center;justify-content:center;
  background:rgba(8,9,11,.8);backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);
  font:14px/1.4 system-ui,sans-serif;color:#e8e8ea;opacity:0;transition:opacity .18s}
#xtg-root.xtg-open{opacity:1}
#xtg-root[hidden]{display:none}
#xtg-root *{box-sizing:border-box}
.xtg-modal{position:relative;width:min(1500px,calc(100vw - 48px));height:calc(100vh - 48px);background:#121317;border-radius:12px;
  box-shadow:0 24px 70px rgba(0,0,0,.6);display:flex;flex-direction:column;overflow:hidden;transform:scale(.97);transition:transform .18s}
.xtg-open .xtg-modal{transform:none}
.xtg-top{position:relative;display:flex;align-items:center;gap:4px 8px;padding:7px 8px 7px 16px;border-bottom:1px solid #24262c;flex-wrap:wrap}
.xtg-head{display:flex;align-items:center;gap:12px;flex:1 1 0;min-width:0}
.xtg-titleblock{display:flex;flex-direction:column;justify-content:center;min-width:0;line-height:1.25}
.xtg-meta{display:flex;align-items:center;gap:6px;min-width:0;font-size:11.5px;color:#8b9097;white-space:nowrap}
.xtg-meta:empty{display:none}
.xtg-pageinfo:not(:empty) + .xtg-status:not(:empty)::before{content:'·';margin-right:6px}
.xtg-stoplink{flex:0 0 auto;padding:0;border:0;background:none;color:#8fb8ff;font:600 11.5px system-ui,sans-serif;cursor:pointer}
.xtg-stoplink:hover{text-decoration:underline}
.xtg-stoplink[hidden]{display:none}
.xtg-filterwrap{position:relative;flex:0 0 auto}
.xtg-fbtn{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 8px 0 10px;border:1px solid #2c2f36;border-radius:8px;
  background:#1b1d22;color:#d6d9de;font:12.5px system-ui,sans-serif;cursor:pointer;white-space:nowrap}
.xtg-fbtn:hover{border-color:#3a3e46;color:#fff}
.xtg-fbtn.on{border-color:#1f6feb;color:#fff}
.xtg-fbtn b{font-weight:600;font-variant-numeric:tabular-nums;color:#fff}
.xtg-fmenu{position:absolute;top:calc(100% + 4px);left:0;z-index:6;min-width:180px;padding:5px;background:#1b1d22;border:1px solid #2c2f36;
  border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,.5)}
.xtg-fmenu[hidden]{display:none}
.xtg-fmenu button{display:flex;align-items:center;gap:9px;width:100%;padding:8px 10px;border:0;border-radius:6px;background:none;
  color:#e0e3e7;font:13px system-ui,sans-serif;cursor:pointer;text-align:left}
.xtg-fmenu button:hover{background:#262930}
.xtg-fmenu button span{flex:1}
.xtg-fmenu button b{font-weight:600;color:#9aa0a8;font-variant-numeric:tabular-nums}
.xtg-fmenu button.on{color:#7fb0ff}
.xtg-fmenu button.on b{color:#7fb0ff}
.xtg-tools{display:flex;align-items:center;gap:2px}
.xtg-sep{width:1px;height:20px;background:#2a2d33;margin:0 4px}
.xtg-short{display:none}
.xtg-counter{font-size:15px;font-weight:700;font-variant-numeric:tabular-nums;white-space:nowrap}
.xtg-pageinfo{flex:0 0 auto;color:#c4c8ce}
.xtg-pageinfo:empty{display:none}
.xtg-f-image [data-kind="video"],.xtg-f-video [data-kind="image"]{display:none}
.xtg-pdiv{flex:0 0 auto;align-self:center;padding:2px 6px 2px 8px;margin-left:2px;border-left:1px solid #33363d;
  font-size:11px;color:#9aa0a8;white-space:nowrap}
.xtg-gap{flex:0 0 auto;align-self:stretch;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:2px;
  padding:0 10px;margin:0 2px;border:1px dashed #3a3e47;border-radius:8px;background:none;color:#9aa0a8;font:inherit;font-size:11px;
  line-height:1.25;white-space:nowrap;cursor:pointer}
.xtg-gap:hover{border-color:#5b8cff;color:#e6e8eb}
.xtg-gap[data-kind="failed"]{border-color:#7a5230;color:#f0b37e}
.xtg-gap[data-kind="loading"]{cursor:default;opacity:.75}
.xtg-grid .xtg-gap{grid-column:1/-1;flex-direction:row;gap:8px;padding:14px;margin:4px 0;font-size:13px;width:100%;max-width:960px}
.xtg-mtitle{padding:8px 10px 2px;font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:#8b9099;border-top:1px solid #2c2f36;margin-top:4px}
.xtg-vb.xtg-q{width:auto;padding:0 8px;font-size:12px;font-weight:600;letter-spacing:.02em}
.xtg-pdiv:first-child{border-left:0;margin-left:0;padding-left:2px}
.xtg-status{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.xtg-grow{flex:1}
.xtg-ib{height:32px;min-width:32px;padding:0 9px;border:0;border-radius:7px;background:transparent;color:#d6d9de;
  font:13px system-ui,sans-serif;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:5px;text-decoration:none;white-space:nowrap}
.xtg-ib:hover{background:#25282e;color:#fff}
.xtg-ib.on{background:#1f6feb;color:#fff}
.xtg-ib[hidden]{display:none}
.xtg-seg{display:inline-flex;background:#1b1d22;border-radius:8px;padding:2px}
.xtg-seg .xtg-ib{height:28px}
.xtg-menu{position:absolute;right:8px;top:calc(100% + 4px);z-index:5;background:#1b1d22;border:1px solid #2c2f36;border-radius:10px;padding:6px;
  box-shadow:0 10px 30px rgba(0,0,0,.5);min-width:260px}
.xtg-menu[hidden]{display:none}
.xtg-menu label,.xtg-menu button{display:flex;align-items:center;gap:8px;width:100%;padding:8px 10px;border:0;border-radius:6px;background:none;
  color:#e0e3e7;font:13px system-ui,sans-serif;text-align:left;cursor:pointer}
.xtg-menu label:hover,.xtg-menu button:hover{background:#262930}
.xtg-body{flex:1;min-height:0;position:relative}
.xtg-viewer{position:absolute;inset:0;display:flex;flex-direction:column}
.xtg-viewer[hidden],.xtg-scroll[hidden]{display:none}
.xtg-stagebox{flex:1;min-height:0;position:relative;display:flex}
.xtg-stage{flex:1;min-width:0;min-height:0;padding:0 78px;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;
  user-select:none;-webkit-user-select:none;touch-action:none}
.xtg-stage>img{max-width:100%;max-height:100%;object-fit:contain;cursor:zoom-in;transition:transform .2s;will-change:transform}
.xtg-stage>img.zoomed{cursor:grab}
.xtg-stage>img.dragging{cursor:grabbing;transition:none}
.xtg-stage>video{max-width:100%;max-height:100%;background:#000;cursor:pointer}
.xtg-stage>iframe{width:min(100%,calc((100vh - 200px)*16/9));aspect-ratio:16/9;max-height:100%;border:0;background:#000}
.xtg-msg{color:#8b9097;text-align:center;padding:20px;line-height:1.8}
.xtg-msg a{color:#8fb8ff}
.xtg-nav{display:flex;align-items:center;justify-content:center;position:absolute;top:50%;transform:translateY(-50%);width:52px;height:52px;
  padding:0;border-radius:50%;border:1px solid rgba(255,255,255,.22);background:rgba(12,13,16,.72);color:#fff;cursor:pointer;z-index:4;
  box-shadow:0 2px 10px rgba(0,0,0,.45);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);transition:background .15s,transform .15s}
.xtg-nav:active{transform:translateY(-50%) scale(.94)}
.xtg-nav:hover{background:rgba(31,111,235,.9);border-color:transparent}
.xtg-nav:disabled{opacity:.3;pointer-events:none}
.xtg-prev{left:14px}.xtg-next{right:14px}
.xtg-prev .xtg-i{margin-right:2px}.xtg-next .xtg-i{margin-left:2px}
.xtg-stripbar{display:flex;align-items:center;border-top:1px solid #24262c;background:#0f1013}
.xtg-snav{display:none}
.xtg-edge{display:flex;align-items:center;justify-content:center;flex:0 0 40px;align-self:stretch;padding:0;border:0;
  background:none;color:#aeb3ba;cursor:pointer}
.xtg-edge:hover{color:#fff;background:#1b1d22}
.xtg-edge:disabled{opacity:.25;pointer-events:none}
.xtg-strip{position:relative;flex:1;min-width:0;display:flex;gap:6px;overflow-x:auto;padding:8px 10px;
  scrollbar-width:thin;scrollbar-color:#3a3d44 transparent;min-height:72px}
.xtg-th{flex:0 0 auto;width:72px;height:54px;border-radius:5px;overflow:hidden;cursor:pointer;position:relative;opacity:.5;
  outline:2px solid transparent;outline-offset:-2px;background:#1b1d21}
.xtg-th:hover{opacity:.85}
.xtg-strip{cursor:grab;user-select:none;-webkit-user-select:none}
.xtg-strip.xtg-dragging{cursor:grabbing;scroll-behavior:auto}
.xtg-strip.xtg-dragging .xtg-th{pointer-events:none}
.xtg-stage>img.xtg-preview{width:100%;height:100%;object-fit:contain;filter:blur(6px) brightness(.85)}
/* until the image/video has loaded, keep the poster info and the tag out of the way */
.xtg-stage.xtg-loading .xtg-reel-info,.xtg-stage.xtg-loading .xtg-corner{opacity:0;visibility:hidden}
.xtg-stage.xtg-loading .xtg-reel-img{pointer-events:none;background:transparent}
.xtg-slow{position:absolute;left:50%;top:calc(50% + 34px);transform:translateX(-50%);z-index:3;display:flex;flex-wrap:wrap;
  align-items:center;justify-content:center;gap:6px 12px;max-width:calc(100% - 24px);padding:8px 14px;border-radius:10px;
  background:rgba(12,13,16,.82);color:#d6d9de;font-size:13px;text-align:center}
.xtg-slow button{padding:4px 12px;border:0;border-radius:6px;background:#1f6feb;color:#fff;font:600 12.5px system-ui,sans-serif;cursor:pointer}
.xtg-slow a{color:#8fb8ff;text-decoration:none}
.xtg-stage.xtg-loading::after{content:'';position:absolute;left:50%;top:50%;width:38px;height:38px;margin:-19px 0 0 -19px;z-index:2;
  border:3px solid rgba(255,255,255,.25);border-top-color:#fff;border-radius:50%;animation:xtg-spin .8s linear infinite;pointer-events:none}
@keyframes xtg-spin{to{transform:rotate(360deg)}}
.xtg-th.on{opacity:1;outline-color:#1f6feb}
.xtg-th img,.xtg-th video{width:100%;height:100%;object-fit:cover;display:block;pointer-events:none}
.xtg-th span{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;text-shadow:0 1px 3px #000}
.xtg-scroll{position:absolute;inset:0;overflow:auto;scrollbar-color:#3a3d44 transparent;padding:12px 14px 30px}
.xtg-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:6px}
.xtg-tile{position:relative;aspect-ratio:1;background:#1b1d21;border-radius:5px;overflow:hidden;cursor:pointer}
.xtg-tile img,.xtg-tile video{width:100%;height:100%;object-fit:cover;display:block}
.xtg-badge{display:inline-flex;align-items:center;gap:4px;position:absolute;top:6px;left:6px;background:rgba(0,0,0,.7);color:#fff;
  border-radius:4px;padding:2px 6px;font-size:12px;pointer-events:none}
.xtg-ph{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;
  background:linear-gradient(135deg,#23262c,#1a1c20);color:#aeb3ba;font-size:13px;text-align:center;padding:8px;word-break:break-all}
.xtg-ph .xtg-i{color:#fff;opacity:.9}
.xtg-dead .xtg-ph{color:#c98a8a}
.xtg-dead .xtg-ph .xtg-i,.xtg-msg .xtg-i{color:#c98a8a;margin:0 auto 6px}
.xtg-cap{position:absolute;bottom:0;left:0;right:0;padding:3px 6px;font-size:11px;color:#ddd;
  background:linear-gradient(transparent,rgba(0,0,0,.75));opacity:0;transition:opacity .15s}
.xtg-cap a{color:#8fb8ff;margin-left:10px;text-decoration:none}
.xtg-tile:hover .xtg-cap{opacity:1}
.xtg-hide-dead .xtg-dead{display:none}
.xtg-grid.xtg-list{display:flex;flex-direction:column;align-items:center;gap:14px}
.xtg-list .xtg-tile{aspect-ratio:auto;width:100%;max-width:960px;cursor:default;background:none}
.xtg-list .xtg-tile img{height:auto;object-fit:contain;cursor:zoom-in;min-height:60px;background:#1b1d21}
.xtg-list .xtg-tile video{height:auto;max-height:80vh;object-fit:contain;background:#000}
.xtg-list .xtg-tile iframe{width:100%;aspect-ratio:16/9;border:0;background:#000;display:block}
.xtg-list .xtg-cap{position:static;opacity:1;background:none;color:#8b9097;padding:4px 0 0}
.xtg-list .xtg-dead .xtg-ph{height:70px}
.xtg-empty{color:#8b9097;text-align:center;padding:60px 0}
.xtg-banner{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;padding:9px 16px;background:#3a2a10;border-bottom:1px solid #5a4318;
  color:#f3e2bf;font-size:13px}
.xtg-banner[hidden]{display:none}
.xtg-banner span{flex:1 1 260px}
.xtg-banner button,.xtg-banner a{padding:5px 12px;border:0;border-radius:6px;background:#f0b542;color:#241a06;font:600 12.5px system-ui,sans-serif;
  text-decoration:none;cursor:pointer;white-space:nowrap}
.xtg-banner a{background:transparent;color:#f3e2bf;border:1px solid #8a6a2a}
.xtg-toast{position:absolute;left:50%;bottom:90px;transform:translateX(-50%);background:#2a2d33;color:#fff;padding:8px 14px;
  border-radius:8px;font-size:13px;z-index:6}

/* poster info + Reels-style controls */
.xtg-reel{position:absolute;z-index:3;pointer-events:none;padding:40px 14px 12px;color:#fff;transition:opacity .2s;
  background:linear-gradient(transparent,rgba(0,0,0,.14) 40%,rgba(0,0,0,.4));text-shadow:0 1px 3px rgba(0,0,0,.85),0 0 8px rgba(0,0,0,.45)}
.xtg-reel a,.xtg-reel button{pointer-events:auto}
.xtg-reel-vid{padding-bottom:0;background:linear-gradient(transparent 70%,rgba(0,0,0,.14));transition:background .25s}
.xtg-show .xtg-reel-vid{background:linear-gradient(transparent,rgba(0,0,0,.14) 40%,rgba(0,0,0,.4))}
.xtg-reel-info,.xtg-vrow{transition:opacity .25s}
.xtg-reel-img{background:transparent;transition:background .25s}
.xtg-show .xtg-reel-img{background:linear-gradient(transparent,rgba(0,0,0,.14) 40%,rgba(0,0,0,.4))}
.xtg-reel-img .xtg-reel-info{opacity:0}
.xtg-show .xtg-reel-img .xtg-reel-info{opacity:1}
.xtg-stage:not(.xtg-show):not(.xtg-pinned) .xtg-reel-img:not(.xtg-touchinfo) *{pointer-events:none}
/* pinned image info: always shown, compact and outside the picture until hovered */
.xtg-pinned .xtg-reel-img .xtg-reel-info{opacity:1}
.xtg-reel-img.xtg-reel-out.xtg-compact{background:transparent;padding-top:6px}
.xtg-reel-img .xtg-reel-info{position:relative}
.xtg-reel-img .xtg-who{padding-right:32px}
.xtg-pin{position:absolute;right:0;top:0;width:26px;height:26px;padding:0;border:0;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.35);color:#fff;opacity:.8;cursor:pointer}
.xtg-pin:hover{opacity:1;background:rgba(0,0,0,.6)}
.xtg-pin.on{opacity:1;background:#1f6feb}
.xtg-reel-img.xtg-touchinfo{pointer-events:auto;padding-top:28px;background:linear-gradient(transparent,rgba(0,0,0,.18) 35%,rgba(0,0,0,.5))}
.xtg-reel-img.xtg-touchinfo .xtg-reel-info{opacity:1}
.xtg-compact .xtg-av{width:26px;height:26px;border-width:1.5px}
.xtg-compact .xtg-av-txt{font-size:13px}
.xtg-compact .xtg-name{font-size:14px}
.xtg-compact .xtg-text{margin-top:4px;font-size:13px;-webkit-line-clamp:1}
.xtg-compact .xtg-btns,.xtg-compact .xtg-date,.xtg-compact .xtg-text.xtg-full-text{display:none}
.xtg-btns{display:flex;gap:14px;margin-top:2px}
.xtg-text.xtg-full-text{display:none}
.xtg-showfull .xtg-text.xtg-cap-text{display:none}
.xtg-showfull .xtg-text.xtg-full-text{display:block;-webkit-line-clamp:unset;max-height:40vh;overflow:auto;pointer-events:auto}
.xtg-reel-vid .xtg-reel-info,.xtg-reel-vid .xtg-vrow{opacity:0}
.xtg-show .xtg-reel-vid .xtg-reel-info,.xtg-show .xtg-reel-vid .xtg-vrow{opacity:1}
.xtg-stage:not(.xtg-show) .xtg-reel-vid *{pointer-events:none}
.xtg-stage.zoomed .xtg-reel,.xtg-stage.zoomed .xtg-corner{opacity:0;visibility:hidden}
.xtg-corner{position:absolute;z-index:3;pointer-events:none;top:10px;left:10px;transition:opacity .2s}
.xtg-corner .xtg-tag{display:inline-block;font-size:12px;padding:4px 10px;background:rgba(0,0,0,.55);
  backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);box-shadow:0 1px 4px rgba(0,0,0,.35)}
.xtg-corner .xtg-tag-op{background:#1f6feb}
.xtg-vbar{pointer-events:auto;margin:4px -10px 0}
.xtg-vrow{display:flex;align-items:center;gap:2px;height:34px}
.xtg-vb{width:34px;height:32px;border:0;border-radius:6px;background:none;color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0}
.xtg-vb:hover{background:rgba(255,255,255,.16)}
.xtg-time{font-size:12px;font-variant-numeric:tabular-nums;color:rgba(255,255,255,.9);margin-left:4px;white-space:nowrap}
.xtg-prog{height:14px;display:flex;align-items:center;cursor:pointer;touch-action:none;padding:0 8px}
.xtg-track{position:relative;flex:1;height:3px;background:rgba(255,255,255,.25);border-radius:2px;transition:height .15s}
.xtg-prog:hover .xtg-track,.xtg-prog.seeking .xtg-track{height:5px}
.xtg-buf,.xtg-played{position:absolute;left:0;top:0;bottom:0;width:0;border-radius:2px}
.xtg-buf{background:rgba(255,255,255,.35)}
.xtg-played{background:#fff}
.xtg-played::after{content:'';position:absolute;right:-6px;top:50%;width:12px;height:12px;margin-top:-6px;border-radius:50%;background:#fff;
  transform:scale(0);transition:transform .15s}
.xtg-show .xtg-prog:hover .xtg-played::after,.xtg-show .xtg-prog.seeking .xtg-played::after{transform:scale(1)}
.xtg-bigplay{position:absolute;left:50%;top:50%;width:68px;height:68px;margin:-34px 0 0 -34px;border-radius:50%;background:rgba(0,0,0,.5);
  color:#fff;display:flex;align-items:center;justify-content:center;pointer-events:none;opacity:0;transition:opacity .2s;z-index:2}
.xtg-paused .xtg-bigplay{opacity:1}
.xtg-embed{display:flex;flex-direction:column;width:min(100%,calc((100vh - 360px)*16/9));min-width:min(100%,420px);max-height:100%}
.xtg-embed iframe{width:100%;aspect-ratio:16/9;border:0;background:#000;flex:0 1 auto;min-height:0}
.xtg-embed .xtg-post{max-width:none;border-radius:0 0 8px 8px;flex:0 0 auto}
.xtg-embed .xtg-expanded .xtg-text{max-height:22vh}
.xtg-who{display:flex;align-items:center;gap:10px;min-width:0}
.xtg-av{width:36px;height:36px;border-radius:50%;object-fit:cover;flex:0 0 auto;border:2px solid rgba(255,255,255,.85);background:#333}
.xtg-av-txt{display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px;color:#fff;text-shadow:none}
.xtg-line{display:flex;align-items:center;flex-wrap:wrap;gap:4px 8px;min-width:0}
.xtg-name{font-weight:700;font-size:15px;color:#fff !important;text-decoration:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%}
a.xtg-name:hover{text-decoration:underline}
.xtg-tag{font-size:11.5px;font-weight:600;padding:2px 8px;border-radius:999px;background:rgba(255,255,255,.2);color:#fff;text-shadow:none;white-space:nowrap}
.xtg-tag-op{background:#1f6feb}
.xtg-date{font-size:12px;color:rgba(255,255,255,.75)}
.xtg-text{margin-top:8px;font-size:14px;line-height:1.45;white-space:pre-line;word-break:break-word;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.xtg-expanded .xtg-text{display:block;-webkit-line-clamp:unset;max-height:40vh;overflow:auto;pointer-events:auto}
.xtg-more,.xtg-full{margin-top:2px;padding:0;border:0;background:none;color:rgba(255,255,255,.85);font:600 13px system-ui,sans-serif;cursor:pointer}
.xtg-more:hover,.xtg-full:hover{color:#fff;text-decoration:underline}
.xtg-post{width:100%;max-width:960px;padding:10px 12px;background:#1a1c21;border-radius:8px 8px 0 0;color:#e8e8ea}
.xtg-post .xtg-av{border-color:#3a3d44}
.xtg-post .xtg-text{text-shadow:none}
@media (max-width:960px){
  /* narrower windows and phones: row 1 = counter + meta, filter, close; row 2 = labelled tools, icon above label */
  .xtg-top{padding:4px 4px 0 12px;gap:0}
  .xtg-head{order:1;min-height:46px;gap:10px}
  .xtg-close{order:2;width:40px;height:40px}
  .xtg-fbtn{height:32px}
  .xtg-fmenu{left:auto;right:0}
  .xtg-tools{order:3;flex:1 0 100%;margin:0 -4px 0 -12px;padding:4px 4px 6px;gap:0;border-top:1px solid #24262c;
    overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch}
  .xtg-tools::-webkit-scrollbar{display:none}
  .xtg-seg{display:contents}
  .xtg-tools .xtg-ib{flex:1 0 auto;min-width:50px;height:auto;flex-direction:column;gap:3px;padding:6px 4px;font-size:10.5px;line-height:1.1}
  .xtg-tools .xtg-ib.on{background:rgba(31,111,235,.18);color:#7fb0ff}
  .xtg-sep{height:30px;margin:0 2px;flex:0 0 1px}
}
@media (max-width:700px){
  .xtg-modal{width:100vw;height:100vh;height:100dvh;border-radius:0}
  .xtg-grid{grid-template-columns:repeat(auto-fill,minmax(105px,1fr))}
  /* phones: prev/next sit at both ends of the filmstrip, so nothing covers the media */
  .xtg-nav{display:none}
  .xtg-stage{padding:0}
  .xtg-edge{flex-basis:34px}
  .xtg-snav{display:flex;align-items:center;justify-content:center;flex:0 0 40px;align-self:stretch;padding:0;border:0;
    background:none;color:#e8e8ea;cursor:pointer}
  .xtg-snav:active{background:#1b1d22}
  .xtg-snav:disabled{opacity:.25;pointer-events:none}
  .xtg-strip{padding:8px 2px}
  .xtg-long{display:none}
  .xtg-short{display:inline}
  .xtg-menu{left:8px;right:8px;min-width:0}
}`;

  // ---------------------------------------------------------------------------
  // Modal
  // ---------------------------------------------------------------------------
  function buildUI() {
    const root = el('div', { id: 'xtg-root', hidden: true });
    // label: always shown; short: replaces the label on narrow screens
    const labels = (label, short) => (short
      ? `<span class="xtg-lbl xtg-long">${esc(label)}</span><span class="xtg-lbl xtg-short">${esc(short)}</span>`
      : (label ? `<span class="xtg-lbl">${esc(label)}</span>` : ''));
    const btn = (attrs, icon, label, tip, short) =>
      `<button class="xtg-ib" ${attrs} title="${esc(tip)}" aria-label="${esc(label || tip)}">${icon}${labels(label, short)}</button>`;
    root.innerHTML = `
      <div class="xtg-modal" role="dialog" aria-label="${esc(tr('dialog'))}">
        <div class="xtg-top">
          <div class="xtg-head">
            <div class="xtg-titleblock">
              <span class="xtg-counter">0 / 0</span>
              <div class="xtg-meta">
                <span class="xtg-pageinfo"></span>
                <span class="xtg-status"></span>
                <button class="xtg-stoplink" data-act="stop" title="${esc(tr('stopTip'))}">${esc(tr('stopShort'))}</button>
              </div>
            </div>
            <div class="xtg-filterwrap">
              <button class="xtg-fbtn" data-act="filter" title="${esc(tr('filterTip'))}" aria-haspopup="true">
                ${ic('filter', 15)}<span class="xtg-fcur"></span><b class="xtg-fcount">0</b>${ic('down', 14)}
              </button>
              <div class="xtg-fmenu" hidden>
                <button data-filter="all">${ic('images', 15)}<span>${esc(tr('fAll'))}</span><b>0</b></button>
                <button data-filter="image">${ic('image', 15)}<span>${esc(tr('fImages'))}</span><b>0</b></button>
                <button data-filter="video">${ic('video', 15)}<span>${esc(tr('fVideos'))}</span><b>0</b></button>
              </div>
            </div>
          </div>
          <div class="xtg-tools">
            <span class="xtg-seg">
              ${btn('data-view="viewer"', ic('image', 16), tr('view'), tr('viewTip'))}
              ${btn('data-view="grid"', ic('grid', 16), tr('grid'), tr('gridTip'))}
              ${btn('data-view="list"', ic('rows', 16), tr('scroll'), tr('scrollTip'))}
            </span>
            <span class="xtg-sep"></span>
            ${btn('data-act="play"', `<span class="xtg-pi">${ic('play', 16, true)}</span>`, tr('slideshow'), tr('slideshowTip'), tr('slideshowShort'))}
            <a class="xtg-ib" data-act="post" target="_blank" rel="noopener" title="${esc(tr('postTip'))}">${ic('post', 16)}<span class="xtg-lbl">${esc(tr('post'))}</span></a>
            <a class="xtg-ib" data-act="src" target="_blank" rel="noopener noreferrer" title="${esc(tr('sourceTip'))}">${ic('link', 16)}<span class="xtg-lbl">${esc(tr('source'))}</span></a>
            ${btn('data-act="menu"', ic('settings', 16), tr('options'), tr('options'))}
          </div>
          <button class="xtg-ib xtg-close" data-act="close" title="${esc(tr('close'))}" aria-label="${esc(tr('close'))}">${ic('x', 20)}</button>
          <div class="xtg-menu" hidden>
            <label><input type="checkbox" data-opt="infoVideos"> ${esc(tr('optInfoVideos'))}</label>
            <label><input type="checkbox" data-opt="infoImages"> ${esc(tr('optInfoImages'))}</label>
            <label><input type="checkbox" data-opt="dead"> ${esc(tr('optDead'))}</label>
            <div class="xtg-mtitle">${esc(tr('modeTitle'))}</div>
            <label><input type="radio" name="xtg-mode" value="saver"> ${esc(tr('modeSaver'))}</label>
            <label><input type="radio" name="xtg-mode" value="balanced"> ${esc(tr('modeBalanced'))}</label>
            <label><input type="radio" name="xtg-mode" value="all"> ${esc(tr('modeAll'))}</label>
            <button data-act="reload">${esc(tr('optReload'))}</button>
            <button data-act="hosts">${esc(tr('optHosts'))}</button>
          </div>
        </div>
        <div class="xtg-banner" hidden></div>
        <div class="xtg-body">
          <div class="xtg-viewer">
            <div class="xtg-stagebox">
              <div class="xtg-stage"></div>
              <button class="xtg-nav xtg-prev" title="${esc(tr('prev'))}" aria-label="${esc(tr('prev'))}">${ic('left', 28)}</button>
              <button class="xtg-nav xtg-next" title="${esc(tr('next'))}" aria-label="${esc(tr('next'))}">${ic('right', 28)}</button>
            </div>
            <div class="xtg-stripbar">
              <button class="xtg-edge xtg-first" title="${esc(tr('first'))}" aria-label="${esc(tr('first'))}">${ic('first', 20)}</button>
              <button class="xtg-snav xtg-sprev" data-nav="-1" title="${esc(tr('prev'))}" aria-label="${esc(tr('prev'))}">${ic('left', 22)}</button>
              <div class="xtg-strip"></div>
              <button class="xtg-snav xtg-snext" data-nav="1" title="${esc(tr('next'))}" aria-label="${esc(tr('next'))}">${ic('right', 22)}</button>
              <button class="xtg-edge xtg-last" title="${esc(tr('last'))}" aria-label="${esc(tr('last'))}">${ic('last', 20)}</button>
            </div>
          </div>
          <div class="xtg-scroll" hidden>
            <div class="xtg-grid xtg-hide-dead"></div>
            <div class="xtg-empty"></div>
          </div>
        </div>
      </div>`;
    document.body.appendChild(root);
    const q = (s) => root.querySelector(s);
    ui = {
      root, modal: q('.xtg-modal'), counter: q('.xtg-counter'), pageInfo: q('.xtg-pageinfo'), status: q('.xtg-status'),
      playBtn: q('[data-act="play"]'), postLink: q('[data-act="post"]'), srcLink: q('[data-act="src"]'),
      stopBtn: q('[data-act="stop"]'), menu: q('.xtg-menu'), fmenu: q('.xtg-fmenu'),
      fcur: q('.xtg-fcur'), fcount: q('.xtg-fcount'),
      prevBtns: root.querySelectorAll('.xtg-prev, .xtg-sprev'), nextBtns: root.querySelectorAll('.xtg-next, .xtg-snext'),
      firstBtn: q('.xtg-first'), lastBtn: q('.xtg-last'),
      viewer: q('.xtg-viewer'), stage: q('.xtg-stage'), strip: q('.xtg-strip'),
      scroll: q('.xtg-scroll'), grid: q('.xtg-grid'), empty: q('.xtg-empty'), banner: q('.xtg-banner'),
    };

    root.addEventListener('click', (e) => {
      const more = e.target.closest('.xtg-more, .xtg-full');
      if (more) {
        const box = more.closest('.xtg-reel-info, .xtg-post');
        if (more.classList.contains('xtg-full')) more.textContent = box.classList.toggle('xtg-showfull') ? tr('less') : tr('fullPost');
        else more.textContent = box.classList.toggle('xtg-expanded') ? tr('less') : tr('more');
        positionOverlay();
        e.stopPropagation();
        return;
      }
      if (e.target === root) { closeGallery(); return; } // click on the backdrop
      if (!e.target.closest('.xtg-menu, [data-act="menu"]')) ui.menu.hidden = true;
      if (!e.target.closest('.xtg-filterwrap')) ui.fmenu.hidden = true;
      const filterBtn = e.target.closest('[data-filter]');
      if (filterBtn) { ui.fmenu.hidden = true; setFilter(filterBtn.getAttribute('data-filter')); return; }
      const viewBtn = e.target.closest('[data-view]');
      if (viewBtn) { setView(viewBtn.getAttribute('data-view')); return; }
      const act = e.target.closest('[data-act]');
      switch (act && act.getAttribute('data-act')) {
        case 'close': closeGallery(); break;
        case 'stop': stopPages(); break;
        case 'play': toggleSlideshow(); break;
        case 'menu': ui.menu.hidden = !ui.menu.hidden; ui.fmenu.hidden = true; break;
        case 'filter': ui.fmenu.hidden = !ui.fmenu.hidden; ui.menu.hidden = true; break;
        case 'hosts': ui.menu.hidden = true; editHosts(); break;
        case 'reload': reloadThread(); break;
        case 'retry': renderStage(); break;
        case 'pin': togglePin(); break;
        case 'netcontinue': netContinue(); break;
        case 'loadall': S.allConfirmed = true; ensureWindow(); scheduleStatus(); break;
        case 'later': S.allDismissed = true; scheduleStatus(); break;
        case 'browseack': store.set('browseAck', true); scheduleStatus(); break;
        case 'browseoff': store.set('browseAck', false); net.write({ browse: 0 }); ensureWindow(); scheduleStatus(); break;
        case 'resume': resumeThere(); break;
        case 'resumeno': S.resumeOffer = null; scheduleStatus(); break;
        default: break;
      }
    });

    const opt = (name) => q(`[data-opt="${name}"]`);
    ['infoVideos', 'infoImages'].forEach((kind) => {
      opt(kind).checked = S[kind];
      opt(kind).addEventListener('change', (e) => setInfo(kind, e.target.checked));
    });
    root.querySelectorAll('[name="xtg-mode"]').forEach((r) => {
      r.checked = r.value === S.loadMode;
      r.addEventListener('change', () => setLoadMode(r.value));
    });
    opt('dead').addEventListener('change', (e) => {
      S.showDead = e.target.checked;
      ui.grid.classList.toggle('xtg-hide-dead', !S.showDead);
    });
    enableDragScroll(ui.strip);
    ui.prevBtns.forEach((b) => { b.onclick = () => step(-1, true); });
    ui.nextBtns.forEach((b) => { b.onclick = () => step(1, true); });
    ui.firstBtn.onclick = () => jumpToEdge(-1);
    ui.lastBtn.onclick = () => jumpToEdge(1);
    new ResizeObserver(positionOverlay).observe(ui.stage);
    setupStageGestures();
    setSlideshow(S.slideshow, false);
    setFilter(S.filter);
    document.addEventListener('keydown', onKey, true);
    applyView();
  }

  function setLoadMode(mode) {
    S.loadMode = mode;
    store.set('loadMode', mode);
    S.allConfirmed = false;
    S.allDismissed = false;
    ensureWindow();
    pumpPages();
    scheduleStatus();
  }

  // Drag the filmstrip sideways with the mouse; a click without dragging still opens the thumbnail.
  // The vertical mouse wheel scrolls it sideways too.
  function enableDragScroll(strip) {
    let down = null, dragged = false;
    strip.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = { x: e.clientX, left: strip.scrollLeft };
      S.stripTouched = Date.now();
      dragged = false;
    });
    window.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - down.x;
      if (!dragged && Math.abs(dx) > 5) { dragged = true; strip.classList.add('xtg-dragging'); }
      if (dragged) { strip.scrollLeft = down.left - dx; e.preventDefault(); }
    });
    window.addEventListener('pointerup', () => {
      if (!down) return;
      down = null;
      strip.classList.remove('xtg-dragging');
      if (dragged) setTimeout(() => { dragged = false; }, 0); // after the click that follows this pointerup
    });
    strip.addEventListener('touchstart', () => { S.stripTouched = Date.now(); }, { passive: true });
    strip.addEventListener('click', (e) => { if (dragged) { e.stopPropagation(); e.preventDefault(); } }, true);
    strip.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      strip.scrollLeft += e.deltaY;
      S.stripTouched = Date.now();
      e.preventDefault();
    }, { passive: false });
  }

  function onKey(e) {
    if (!ui || ui.root.hidden || /^(INPUT|TEXTAREA|SELECT)$/.test((e.target && e.target.tagName) || '')) return;
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (k === 'Escape') {
      if (!ui.menu.hidden || !ui.fmenu.hidden) { ui.menu.hidden = true; ui.fmenu.hidden = true; } else closeGallery();
      e.preventDefault();
      return;
    }
    if (S.view === 'viewer' && S.videoCtl) {
      if (k === 'k') { S.videoCtl.toggle(); return; }
      if (k === 'm') { S.videoCtl.mute(); return; }
      if (k === 'f') { toggleFullscreen(); return; }
    }
    if (k === 'i') { // toggles the info of the kind being viewed
      const kind = S.cur && S.cur.type === 'image' ? 'infoImages' : 'infoVideos';
      setInfo(kind, !S[kind]);
      return;
    }
    if (k === 'p') { togglePin(); return; } // keeps the image info shown, outside the picture
    if (k === 'g') { setView(S.view === 'grid' ? 'viewer' : 'grid'); return; }
    if (k === 'Home' || k === 'End') { jumpToEdge(k === 'Home' ? -1 : 1); e.preventDefault(); return; }
    if (S.view !== 'viewer') return;
    if (k === 'ArrowRight') { step(1, true); e.preventDefault(); }
    else if (k === 'ArrowLeft') { step(-1, true); e.preventDefault(); }
    else if (k === ' ') { toggleSlideshow(); e.preventDefault(); }
  }

  function editHosts() {
    const v = prompt(tr('hostsPrompt'), hosts.join(', '));
    if (v == null) return;
    hosts = v.trim() ? v.split(',').map((s) => s.trim()).filter(Boolean) : DEFAULT_HOSTS.slice();
    store.set('hosts', hosts);
    if (ui && !ui.root.hidden) toast(tr('saved')); else alert(tr('saved'));
  }

  function toast(msg) {
    const node = el('div', { className: 'xtg-toast', textContent: msg });
    ui.modal.appendChild(node);
    setTimeout(() => node.remove(), 3200);
  }

  // ---------------------------------------------------------------------------
  // Status bar (many changes in a row are batched into one update)
  // ---------------------------------------------------------------------------
  const liveItems = () => S.items.filter((i) => !i.dead);
  const kindOf = (item) => (item.type === 'image' ? 'image' : 'video');
  const passesFilter = (item) => S.filter === 'all' || kindOf(item) === S.filter;
  const visibleItems = () => S.items.filter((i) => !i.dead && passesFilter(i));

  function setFilter(f) {
    S.filter = f;
    store.set('filter', f);
    ui.root.classList.toggle('xtg-f-image', f === 'image');
    ui.root.classList.toggle('xtg-f-video', f === 'video');
    ui.root.querySelectorAll('[data-filter]').forEach((b) => b.classList.toggle('on', b.getAttribute('data-filter') === f));
    ui.fcur.textContent = tr({ all: 'fAll', image: 'fImages', video: 'fVideos' }[f]);
    ui.root.querySelector('.xtg-fbtn').classList.toggle('on', f !== 'all');
    if (S.cur && !passesFilter(S.cur)) {
      // jump to the nearest item of the chosen kind, preferring the ones after the current item
      const i = S.items.indexOf(S.cur);
      const pick = S.items.slice(i + 1).find((x) => !x.dead && passesFilter(x)) ||
        S.items.slice(0, i).reverse().find((x) => !x.dead && passesFilter(x));
      S.cur = null;
      if (pick) showItem(pick); else renderStage();
    }
    updateDividers();
    scheduleStatus();
  }
  const loadedPages = () => { let n = 0; S.pageState.forEach((v) => { if (v === 'loaded') n++; }); return n; };
  const isLoading = () => pageQ.queue.length > 0 || pageQ.running || S.pending > 0;

  function renderBanner() {
    const st = S.netState;
    let html = '';
    if (st === 'trip') {
      if (net.read().trip?.reason === 'rate') html = `<span>${esc(tr('bannerRateStop'))}</span><button data-act="netcontinue">${esc(tr('btnContinue'))}</button>`;
      else html = `<span>${esc(tr('bannerTrip'))}</span><a href="${esc(location.href.split('#')[0])}" target="_blank" rel="noopener">${esc(tr('btnOpenPage'))}</a>` +
        `<button data-act="netcontinue">${esc(tr('btnContinue'))}</button>`;
    } else if (st === 'rate') {
      const left = Math.max(1, Math.round(((net.read().trip || {}).until - Date.now()) / 1000));
      html = `<span>${esc(tr('bannerRate', left))}</span>`;
    } else if (st === 'cap') {
      html = `<span>${esc(tr('bannerCap', SESSION_CAP))}</span><button data-act="netcontinue">${esc(tr('btnContinue'))}</button>`;
    } else if (browsing() && !store.get('browseAck', false)) {
      html = `<span>${esc(tr('bannerBrowse'))}</span><button data-act="browseack">${esc(tr('btnGotIt'))}</button>` +
        `<button data-act="browseoff">${esc(tr('btnBgRetry'))}</button>`;
    } else if (S.started && S.loadMode === 'all' && !loadsAll() && !S.allDismissed && !browsing()) {
      const left = S.totalPages - loadedPages();
      const min = Math.max(1, Math.ceil(left * PAGE_INTERVAL_MS / 60e3), Math.floor((left - 1) / SESSION_CAP) * 10);
      html = `<span>${esc(tr('bannerAll', S.totalPages, min))}</span><button data-act="loadall">${esc(tr('btnLoadAll'))}</button>` +
        `<button data-act="later">${esc(tr('btnLater'))}</button>`;
    } else if (S.resumeOffer && !(S.cur && S.cur.page === S.resumeOffer.page)) {
      html = `<span>${esc(tr('resumeAsk', S.resumeOffer.page))}</span><button data-act="resume">${esc(tr('btnResume'))}</button>` +
        `<button data-act="resumeno">${esc(tr('btnSkip'))}</button>`;
    }
    if (ui.banner.dataset.html !== html) {
      ui.banner.dataset.html = html;
      ui.banner.innerHTML = html;
      ui.banner.hidden = !html;
    }
  }
  let statusQueued = false;
  function scheduleStatus() {
    if (statusQueued || !ui) return;
    statusQueued = true;
    setTimeout(() => { statusQueued = false; renderStatus(); }, 16);
  }

  function renderStatus() {
    const all = liveItems();
    let images = 0;
    for (const i of all) if (i.type === 'image') images++;
    const counts = { all: all.length, image: images, video: all.length - images };
    ui.root.querySelectorAll('[data-filter]').forEach((b) => { b.querySelector('b').textContent = counts[b.getAttribute('data-filter')]; });
    ui.fcount.textContent = counts[S.filter];
    const live = visibleItems();
    const dead = S.items.length - all.length;
    const loading = isLoading();
    let st = '';
    if (dead) st += tr('broken', dead);
    const loaded = loadedPages();
    if (S.totalPages > 1 && loaded < S.totalPages) st += tr('pagesLoaded', loaded, S.totalPages);
    if (S.netState === 'wait') st += tr('netWait');
    else if (S.netState === 'fetching') st += tr('netFetching', S.fetchingPage);
    else if (S.netState === 'hidden') st += tr('netHidden');
    else if (browsing()) st += tr('netBrowse');
    else if (S.netState === 'cap' || S.netState === 'trip' || S.netState === 'rate') st += tr('netPaused');
    if (S.pagesCached) st += tr('fromCache', S.pagesCached);
    if (S.pageErrors) st += tr('pageErrors', S.pageErrors);
    ui.status.textContent = st.replace(/^ · /, '');
    renderBanner();
    ui.stopBtn.hidden = !loading;
    const pos = S.cur && !S.cur.dead ? live.indexOf(S.cur) : -1;
    ui.counter.textContent = `${pos + 1} / ${live.length}`;
    ui.pageInfo.textContent = pos >= 0 && S.totalPages > 1 ? tr('pageOf', S.cur.page, S.totalPages) : '';
    const atStart = pos <= 0 && !moreIn(-1), atEnd = (pos < 0 || pos >= live.length - 1) && !moreIn(1);
    ui.prevBtns.forEach((b) => { b.disabled = atStart; });
    ui.nextBtns.forEach((b) => { b.disabled = atEnd; });
    ui.firstBtn.disabled = atStart;
    ui.lastBtn.disabled = atEnd;
    const msg = loading ? tr('searching') : tr('none');
    ui.empty.textContent = msg;
    ui.empty.style.display = live.length ? 'none' : '';
    if (!S.cur && S.view === 'viewer') ui.stage.innerHTML = `<div class="xtg-msg">${esc(live.length ? tr('loading') : msg)}</div>`;
  }

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

  function addItem(spec, pos, ctx) {
    let key;
    if (spec.type === 'dead') {
      key = 'dead:' + keyOf(spec.source);
      if (S.keys.has(key)) return;
      S.keys.add(key);
    } else {
      key = keyOf(spec.type === 'embed' ? spec.url : spec.candidates[0]);
      if (S.keys.has(key)) return;
      S.keys.add(key);
      (spec.candidates || []).slice(1).forEach((c) => S.keys.add(keyOf(c)));
    }
    const item = Object.assign({ candidates: [] }, spec, {
      key, pos, page: ctx.page, postId: ctx.postId, pageUrl: ctx.pageUrl, meta: ctx.meta, caption: ctx.caption || null, dead: spec.type === 'dead',
    });
    if (item.dead) item.type = 'image';
    // here rather than when reading the page, so pages already in the cache get the same order
    if (item.candidates.length) item.candidates = directFirst(item.candidates);
    if (item.thumb) item.thumb = directUrl(item.thumb);
    if (item.type === 'image' && !item.dead) Object.assign(item, imageSizes(item));

    // binary insert to keep thread order (async results arrive out of order)
    let lo = 0, hi = S.items.length;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (comparePos(S.items[mid].pos, pos) < 0) lo = mid + 1; else hi = mid; }
    S.items.splice(lo, 0, item);
    const after = S.items.slice(lo + 1);

    item.el = buildTile(item);
    const nextTile = after.find((i) => i.el);
    ui.grid.insertBefore(item.el, nextTile ? nextTile.el : null);
    if (!item.dead) {
      item.thumbEl = buildThumb(item);
      const nextThumb = after.find((i) => i.thumbEl);
      ui.strip.insertBefore(item.thumbEl, nextThumb ? nextThumb.thumbEl : null);
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

  function handleUnit(unit, pos, ctx) {
    if (Array.isArray(unit)) { unit.forEach((spec, i) => addItem(spec, pos.concat(i), ctx)); return; }
    const linkKey = 'link:' + keyOf(unit.source);
    if (S.keys.has(linkKey)) return; // same link already being resolved (usually a quote)
    S.keys.add(linkKey);
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
      const { units, anchors } = extractPost(post, pageUrl);
      return {
        postId: postIdOf(post),
        meta: postMeta(post, pageUrl),
        units: units.map((u) => (Array.isArray(u) ? u : { link: u.source })),
        captions: mediaCaptions(post, anchors),
      };
    });
  }

  function replayPage(posts, page, pageUrl) {
    posts.forEach((post, pi) => {
      if (page === 1 && pi === 0) setThreadStarter(post.meta.author, false);
      const ctx = { page, postId: post.postId, pageUrl, meta: post.meta };
      post.units.forEach((unit, k) => {
        const u = unit.link ? resolveLink(unit.link, pageUrl) : unit;
        if (u) handleUnit(u, [page, pi, k], Object.assign({}, ctx, { caption: (post.captions && post.captions[k]) || null }));
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

  const postUrl = (item) => item.pageUrl + (item.postId ? '#post-' + item.postId : '');

  // ---------------------------------------------------------------------------
  // Media loading with fallbacks
  // ---------------------------------------------------------------------------
  function isPlaceholder(img) {
    const w = img.naturalWidth, h = img.naturalHeight;
    if (w <= 1 || h <= 1) return true;
    // imgur "removed" image, also through the manager (blob: URL) or the forum's image proxy, which caches it
    const from = unproxy(abs(img._xtgFrom || img.src));
    return w === 161 && h === 81 && !!from && /(^|\.)imgur\.com$/.test(from.hostname);
  }

  // What happened to a file on an earlier visit (cache "m:<key>"): { ok: the candidate that loaded } or { dead: true }.
  // Read once per item, ignored by "Reload (ignore cache)". A dead file is not asked for again for DEAD_MEDIA_TTL,
  // and the file that loaded is tried first, so neither costs failed requests on the next visit.
  function mediaMemo(item) {
    if (!item.memo) {
      item.memo = (S.noCache || !item.key ? Promise.resolve(null) : cache.get('m:' + item.key, MEDIA_OK_TTL).catch(() => null))
        .then((m) => {
          if (m && m.dead && Date.now() - m.at > DEAD_MEDIA_TTL) return null;
          if (m && m.dead) item.memoDead = true;
          if (m && m.ok) item.savedOk = m.ok;
          return m;
        });
    }
    return item.memo;
  }
  // The picture shown in the post (often a small preview of the original) is also kept among the candidates, as a
  // last resort when the original is gone. A thumbnail that loads it must not count as "the file that works",
  // or the viewer would show the small preview instead of the original.
  const isPreview = (item, u) => !!item.thumb && !!u && directUrl(u) === directUrl(item.thumb);
  function rememberOk(item, url) {
    if (!item.key || item.savedOk === url || (!item.savedOk && url === item.candidates[0])) return; // nothing to learn
    item.savedOk = url;
    cache.put('m:' + item.key, { ok: url });
  }
  function rememberDead(item) {
    // offline says nothing about the file; links that resolved to nothing are cached as such already
    if (!item.key || item.key.startsWith('dead:') || item.memoDead || !navigator.onLine) return;
    item.memoDead = true;
    cache.put('m:' + item.key, { dead: true });
  }

  // Hosts whose images only load through the manager (hotlink protection), learnt when a file of theirs failed
  // directly and then showed as a real picture through the manager, kept for MANAGER_HOST_TTL. Their files skip
  // the direct attempts that would fail.
  const MANAGER_HOST_TTL = 7 * DAY;
  const managerHost = (u) => (store.get('mgrHosts', {})[hostOf(u)] || 0) > Date.now();
  function learnManagerHost(u) {
    const all = store.get('mgrHosts', {}), now = Date.now();
    for (const h of Object.keys(all)) if (all[h] < now) delete all[h];
    all[hostOf(u)] = now + MANAGER_HOST_TTL;
    store.set('mgrHosts', all);
  }

  // Images downloaded through the manager are blob: URLs held in memory: the IMAGE_BLOBS_MAX most recent are kept.
  // One download per item and size, shared by its thumbnail, tile and the viewer.
  const IMAGE_BLOBS_MAX = 30;
  const imageBlobs = []; // { item, src, k }, oldest first
  function managerBlob(item, urls) {
    const jobs = item.blobJobs || (item.blobJobs = new Map());
    const k = urls[0];
    if (!jobs.has(k)) {
      jobs.set(k, gmBlobUrl(urls).then((r) => {
        imageBlobs.push({ item, src: r.src, k });
        while (imageBlobs.length > IMAGE_BLOBS_MAX) {
          const at = imageBlobs.findIndex((b) => b.item !== S.cur);
          const old = imageBlobs.splice(at, 1)[0];
          URL.revokeObjectURL(old.src); // pictures already on screen stay; a later view downloads again
          old.item.blobJobs.delete(old.k);
          if (old.item.working === old.src) old.item.working = null;
          if (old.item.shown === old.src) old.item.shown = null;
        }
        return r;
      }, (e) => { jobs.delete(k); throw e; }));
    }
    return jobs.get(k);
  }

  // Small screen or data saver: the host's large size (Imgur 1024 px) instead of the original, which loads on zoom.
  const fitsLarge = () => slowNet() || Math.max(innerWidth, innerHeight) <= 1100;
  const fitUrls = (item) => (item.large && fitsLarge() ? uniq([item.large, ...item.candidates]) : item.candidates);

  // Try each URL; then download through the manager (hotlink protection); retry everything once after 2 s
  // (flaky network) before declaring the item dead. A file known dead fails at once; the file that loaded last
  // time goes first; URLs on hosts known to need the manager go through it first and directly only as a last resort.
  function loadImage(img, item, urls, onFail, onOk) {
    let i = 0, blobTried = false, retried = false, later = [], list = urls;
    const canBlob = !item.attachment && item.candidates.length > 0;
    img.referrerPolicy = 'no-referrer';
    img.decoding = 'async';
    const giveUp = () => {
      if (retried) { onFail(); return; }
      retried = true;
      setTimeout(() => { list = urls; i = 0; later = []; tryNext(); }, 2000);
    };
    const viaManager = () => {
      blobTried = true;
      managerBlob(item, uniq(urls.filter((u) => /^https?:/i.test(u)).concat(item.candidates))).then((r) => {
        img._xtgFrom = r.from;
        img.src = r.src;
      }, tryNext);
    };
    const tryNext = () => {
      while (i < list.length) {
        const u = list[i++];
        if (!blobTried && canBlob && managerHost(u)) { later.push(u); continue; }
        img.src = u;
        return;
      }
      if (!blobTried && canBlob) { viaManager(); return; }
      if (later.length) { list = later; later = []; i = 0; tryNext(); return; }
      giveUp();
    };
    const failedDirect = new Set(); // hosts whose files errored when loaded directly (not placeholders: those are dead)
    img.onerror = () => {
      if (!img.src.startsWith('blob:')) failedDirect.add(hostOf(img.src));
      tryNext();
    };
    img.onload = () => {
      if (isPlaceholder(img)) { tryNext(); return; }
      if (img._xtgFrom && img.src.startsWith('blob:')) {
        if (failedDirect.has(hostOf(img._xtgFrom))) learnManagerHost(img._xtgFrom); // failed directly, fine through the manager
        if (item.candidates.includes(img._xtgFrom) && !isPreview(item, img._xtgFrom)) item.working = img.src;
      } else if (item.candidates.includes(img.src) && !isPreview(item, img.src)) {
        if (!item.working) item.working = img.src;
        rememberOk(item, img.src);
      } else if (img.src === item.large) item.fitted = img.src;
      if (onOk) onOk(img.src);
    };
    mediaMemo(item).then((m) => {
      if (m && m.dead) { onFail(); return; }
      if (m && m.ok && item.candidates.includes(m.ok) && !isPreview(item, m.ok)) { // (3.1.0 may have saved a preview)
        const at = urls.findIndex((u) => item.candidates.includes(u));
        if (at >= 0) urls = uniq([...urls.slice(0, at), m.ok, ...urls.slice(at)]);
      }
      list = urls;
      tryNext();
    });
  }

  // Thumbnails load only when (nearly) visible, at most THUMB_LOADS at a time and THUMB_LOADS_PER_HOST per host.
  // The image being viewed is then not stuck behind dozens of thumbnail downloads, no host gets many requests at
  // once (the forum's attachments included), and a slow host does not hold up thumbnails from the others.
  const THUMB_LOADS = 6;
  const THUMB_LOADS_PER_HOST = 2;
  const MID_DELAY_MS = 800; // wait this long for the full image before asking for a medium size
  const thumbLoadQueue = makeHostQueue(THUMB_LOADS, THUMB_LOADS_PER_HOST);
  const lazyObserver = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (!en.isIntersecting) continue;
      lazyObserver.unobserve(en.target);
      en.target.xtgStart();
    }
  }, { rootMargin: '300px' });

  function nearView(el, margin = 300) {
    const r = el.getBoundingClientRect();
    const box = (el.closest('.xtg-strip, .xtg-scroll') || document.documentElement).getBoundingClientRect();
    return r.width > 0 && r.right >= box.left - margin && r.left <= box.right + margin &&
      r.bottom >= box.top - margin && r.top <= box.bottom + margin;
  }

  // A full image that has loaded is in the browser cache: show it in the item's filmstrip thumbnail too
  // (no extra request) if that thumbnail has not loaded yet.
  function fillThumb(item, src) {
    const ti = item.thumbEl && item.thumbEl.querySelector('img');
    if (!ti || (ti.complete && ti.naturalWidth > 0)) return;
    lazyObserver.unobserve(ti);
    ti.onerror = null;
    ti.onload = null;
    ti.src = src;
    if (!item.shown) item.shown = src;
  }

  function lazyImage(img, item, urls, onFail, priority = 'low') {
    img.fetchPriority = priority;
    img.draggable = false;
    img.xtgStart = () => thumbLoadQueue(hostOf(urls[0] || ''), () => new Promise((done) => {
      if (!img.isConnected || img.getAttribute('src')) { done(); return; }
      // scrolled out of view while waiting in the queue (autoplay, dragging): wait until it is visible again
      if (!nearView(img)) { lazyObserver.observe(img); done(); return; }
      setTimeout(done, QUEUE_SLOT_MS); // slow host: let the next thumbnail start, this one keeps loading
      loadImage(img, item, urls, () => { onFail(); done(); }, (src) => { if (!item.shown) item.shown = src; done(); });
    }));
    lazyObserver.observe(img);
  }

  // Preload the neighbours of the viewed item one at a time, after the item itself has loaded: two ahead in the
  // direction of travel and one behind (only the next one on data saver)
  const preloadQueue = makeQueue(1);
  function preloadAround(item) {
    const d = S.lastDir || 1;
    const n1 = neighbour(item, d), n2 = n1 && neighbour(n1, d), back = neighbour(item, -d);
    const saver = navigator.connection && navigator.connection.saveData;
    (saver ? [n1] : [n1, n2, back]).filter((x) => x && x.type === 'image' && !x.dead && !x.working && !x.fitted).forEach((x) => {
      preloadQueue(() => new Promise((done) => {
        if (S.cur !== item || x.working || x.fitted) { done(); return; } // the user moved on: skip stale preloads
        const im = new Image();
        im.fetchPriority = 'low';
        setTimeout(done, QUEUE_SLOT_MS);
        loadImage(im, x, fitUrls(x), done, (src) => { fillThumb(x, src); done(); });
      }));
    });
  }

  // Zoomed in on the large size: load the original and swap it in (it becomes the item's working file)
  function upgradeToFull(item, img) {
    if (item.fullLoading || item.working) return;
    item.fullLoading = true;
    const full = new Image();
    full.fetchPriority = 'high';
    loadImage(full, item, item.candidates.slice(), () => { item.fullLoading = false; }, (src) => {
      item.fullLoading = false;
      full.decode().catch(() => {}).then(() => { if (S.cur === item && img.isConnected) img.src = src; });
    });
  }
  // ---------------------------------------------------------------------------
  // Video delivery. Video hosts are not the forum, so they can take more than one request at a time, but:
  //   - the forum's own files (attachments, its image proxy) only ever get normal playback;
  //   - every host's speed (time to the first frame) is remembered, and hosts known to be slow start with
  //     the lighter version when there is one;
  //   - if the chosen file shows nothing after VIDEO_RACE_MS, the lighter version starts hidden next to it
  //     and whichever shows a frame first is kept (the other is cancelled);
  //   - the next video is prepared in a hidden element (the browser buffers its start) and moved onto the
  //     stage when you get there; not on data saver, never for the forum's files;
  //   - the video being watched always plays as it downloads, like opening its link, and has the connection to
  //     itself until it is VIDEO_AHEAD_S ahead (see curBuffered): the next video, video thumbnails and image
  //     preloads wait until then instead of taking bandwidth from it.
  // ---------------------------------------------------------------------------
  const VIDEO_SLOW_MS = 3000;                 // slower than this to the first frame: the host counts as slow
  const VIDEO_RACE_MS = 1500;                 // head start of the chosen file before the lighter one may race it
  const VIDEO_AHEAD_S = 10;                   // background loads wait until this much is downloaded ahead...
  const VIDEO_BUFFER_MS = 10000;              // ... or at most this long after the first frame
  const VIDEO_HOSTS_MAX = 60;

  const vhosts = {
    get: (h) => store.get('vhosts', {})[h] || {},
    set(h, patch) {
      const all = store.get('vhosts', {});
      all[h] = Object.assign(all[h] || {}, patch, { at: Date.now() });
      const keys = Object.keys(all);
      if (keys.length > VIDEO_HOSTS_MAX) keys.sort((a, b) => all[a].at - all[b].at).slice(0, keys.length - VIDEO_HOSTS_MAX).forEach((k) => delete all[k]);
      store.set('vhosts', all);
    },
  };
  const isForumUrl = (u) => {
    const x = abs(u);
    return !x || x.protocol === 'blob:' || bareHost(x.hostname) === bareHost(location.hostname) || /\/proxy\.php$/.test(x.pathname);
  };
  const hostSlow = (u) => (vhosts.get(hostOf(u)).ttff || 0) > VIDEO_SLOW_MS;
  function recordTtff(u, ms) {
    if (!u || isForumUrl(u)) return;
    const h = hostOf(u), old = vhosts.get(h).ttff;
    vhosts.set(h, { ttff: Math.round(old ? old * 0.6 + ms * 0.4 : ms) }); // moving average, recent visits weigh more
  }

  // Order of the files to try: the user's choice (HD / SD), else the lighter one first on a slow connection
  // or a host known to be slow. playUrl: the file picked for this item (race winner, quality button).
  function videoUrls(item) {
    const c = item.candidates;
    let list = c;
    if (item.sd) {
      const sdFirst = S.vquality === 'sd' || (S.vquality === 'auto' && (slowNet() || hostSlow(c[0])));
      list = sdFirst ? uniq([item.sd, ...c]) : uniq([...c.filter((u) => u !== item.sd), item.sd]);
    }
    return item.playUrl ? uniq([item.playUrl, ...list]) : list;
  }

  const killVideo = (v) => {
    if (!v) return;
    v.onerror = null;
    v.pause();
    v.removeAttribute('src');
    try { v.load(); } catch (e) { /* ignore */ }
  };

  // frag '#t=1' makes thumbnails show the frame at 1 s instead of the (often black) first frame.
  // Thumbnails prefer the lighter version. v._xtgFail can be swapped when a prepared element changes owner.
  function loadVideo(v, item, onFail, frag = '', urls = null) {
    let i = 0;
    urls = urls || (frag ? (item.sd ? uniq([item.sd, ...item.candidates]) : item.candidates) : videoUrls(item));
    v._xtgFail = onFail;
    const tryNext = () => {
      if (i < urls.length) { v._xtgUrl = urls[i++]; v.src = v._xtgUrl + frag; } else v._xtgFail();
    };
    v.onerror = tryNext;
    tryNext();
  }

  // Video thumbnails without a poster load one at a time, and only once the video being watched has buffered
  // enough (also while the opening item is not picked yet, which takes up to 1.5 s)
  const thumbVideoQueue = makeQueue(1);
  const mainVideoBusy = () => ui && !ui.root.hidden && S.view === 'viewer' && (!S.cur ? S.items.length > 0 : S.cur.type === 'video' && !S.curBuffered);
  // Run fn once the video being watched has buffered enough (at once for anything else), unless the user moved on
  function afterBuffered(rid, fn) {
    if (rid !== S.renderId) return;
    if (S.cur && S.cur.type === 'video' && !S.curBuffered) { setTimeout(() => afterBuffered(rid, fn), 300); return; }
    fn();
  }
  function thumbVideo(v, item, onFail) {
    thumbVideoQueue(async () => {
      while (mainVideoBusy()) await sleep(300);
      if (!v.isConnected) return; // the thumbnail was replaced meanwhile
      await new Promise((done) => {
        const t = setTimeout(done, 8000);
        v.addEventListener('loadeddata', () => { clearTimeout(t); done(); }, { once: true });
        loadVideo(v, item, () => { clearTimeout(t); onFail(); done(); }, '#t=1');
      });
    });
  }

  // Open the connection (DNS, TLS) to the next item's host ahead of time; costs next to nothing
  const preconnected = new Set();
  function preconnect(u) {
    const x = abs(u);
    if (!x || !isHttp(x) || x.origin === location.origin || preconnected.has(x.origin) || preconnected.size >= 40) return;
    preconnected.add(x.origin);
    document.head.appendChild(el('link', { rel: 'preconnect', href: x.origin }));
  }

  function neighbour(item, d) {
    for (let j = S.items.indexOf(item) + d; j >= 0 && j < S.items.length; j += d) {
      const x = S.items[j];
      if (!x.dead && passesFilter(x)) return x;
    }
    return null;
  }

  // The next video, buffering in a hidden element
  const PREP = { item: null, v: null };
  function dropPrepared() {
    killVideo(PREP.v);
    PREP.item = PREP.v = null;
  }
  function prepareNext(item) {
    if (!item || document.hidden || (navigator.connection && navigator.connection.saveData)) return;
    const next = neighbour(item, S.lastDir || 1);
    if (next) preconnect(next.type === 'embed' ? next.url : next.candidates[0]);
    if (PREP.item === next && PREP.v) return;
    dropPrepared();
    if (!next || next.type !== 'video') return;
    const urls = videoUrls(next);
    if (isForumUrl(urls[0])) return; // the forum's own files are never fetched ahead
    const v = mediaEl('video', { muted: true, preload: 'auto' });
    v._xtgPrepared = true;
    // enough to start playing: stop buffering further until the user gets there
    v.addEventListener('canplaythrough', () => { if (PREP.v === v) v.preload = 'metadata'; }, { once: true });
    PREP.item = next;
    PREP.v = v;
    loadVideo(v, next, () => { if (PREP.v === v) dropPrepared(); }, '', urls);
  }

  // The stage's video element: the prepared one when it is this item, else a fresh one. It plays while it
  // downloads, and S.curBuffered turns true once it is VIDEO_AHEAD_S ahead (or VIDEO_BUFFER_MS after its first frame).
  function stageVideo(item, rid) {
    const t0 = Date.now();
    let v;
    if (PREP.item === item && PREP.v) {
      v = PREP.v;
      PREP.item = PREP.v = null;
      v._xtgFail = () => videoFail(item);
      v.preload = 'auto';
      v.autoplay = true;
      v.muted = !!S.muted;
      v.play().catch(() => {});
    } else {
      v = mediaEl('video', { autoplay: true, muted: !!S.muted });
      loadVideo(v, item, () => videoFail(item));
      raceLighter(item, v, rid);
    }
    // "buffered enough": VIDEO_AHEAD_S seconds ahead of the playhead are downloaded, or the rest of the file.
    // (canplaythrough is no use here: browsers fire it with the first frame.)
    const buffered = () => {
      if (rid !== S.renderId || S.curBuffered) return;
      S.curBuffered = true;
      v.removeEventListener('progress', check);
      v.removeEventListener('timeupdate', check);
    };
    const check = () => {
      const t = v.currentTime, d = v.duration;
      for (let i = 0; i < v.buffered.length; i++) {
        if (v.buffered.start(i) <= t + 0.5 && v.buffered.end(i) >= t) {
          const end = v.buffered.end(i);
          if (end - t >= VIDEO_AHEAD_S || (d && end >= d - 0.5)) buffered();
          return;
        }
      }
    };
    v.addEventListener('progress', check);
    v.addEventListener('timeupdate', check);
    if (item.thumb) v.poster = item.thumb;
    if (S.resumeAt && S.resumeAt.item === item) { // quality switch: carry on where it was
      const at = S.resumeAt.t;
      S.resumeAt = null;
      v.addEventListener('loadedmetadata', () => { v.currentTime = at; }, { once: true });
    }
    const ready = () => {
      if (!v._xtgPrepared) recordTtff(v._xtgUrl, Date.now() - t0);
      setTimeout(buffered, VIDEO_BUFFER_MS); // a long video on a slow line may never "play through"
      mediaReady(rid);
    };
    if (v.readyState >= 2) setTimeout(ready, 0);
    else v.addEventListener('loadeddata', ready, { once: true });
    return v;
  }

  // The chosen (bigger) file shows nothing after VIDEO_RACE_MS: start the lighter one hidden; first frame wins
  function raceLighter(item, v, rid) {
    if (S.vquality !== 'auto' || !item.sd) return;
    setTimeout(() => {
      const cur = v._xtgUrl;
      if (rid !== S.renderId || v.readyState >= 2 || cur === item.sd || isForumUrl(cur) || isForumUrl(item.sd)) return;
      const b = mediaEl('video', { muted: true, preload: 'auto' });
      b._xtgPrepared = true;
      const lose = () => killVideo(b);
      v.addEventListener('loadeddata', lose, { once: true });
      b.onerror = lose;
      b.addEventListener('loadeddata', () => {
        if (rid !== S.renderId || v.readyState >= 2) { lose(); return; }
        recordTtff(cur, VIDEO_SLOW_MS * 2); // the bigger file lost: next time this host starts with the lighter one
        item.playUrl = item.sd;
        b._xtgUrl = item.sd;
        PREP.item = item;
        PREP.v = b;
        renderStage(); // moves the winner onto the stage, cancels the loser
      }, { once: true });
      b.src = item.sd;
    }, VIDEO_RACE_MS);
  }

  // Quality button: Auto → HD → SD → Auto, keeping the playback position
  function cycleQuality(item, v) {
    S.vquality = { auto: 'hd', hd: 'sd', sd: 'auto' }[S.vquality];
    store.set('vquality', S.vquality);
    item.playUrl = S.vquality === 'auto' ? null : S.vquality === 'sd' ? item.sd : item.candidates.find((u) => u !== item.sd);
    const want = videoUrls(item)[0];
    if (want && want !== v._xtgUrl) {
      S.resumeAt = { item, t: v.currentTime || 0 };
      renderStage();
    } else {
      const qb = ui.stage.querySelector('[data-v="q"]');
      if (qb) qb.textContent = qualityLabel(item, v);
    }
  }
  const qualityLabel = (item, v) => (S.vquality === 'auto' ? 'Auto ' : '') +
    (v._xtgUrl === item.sd ? 'SD' : 'HD');

  function mediaEl(tag, props) {
    const node = el(tag, props);
    if (tag === 'video') node.playsInline = true;
    return node;
  }

  function iframeEl(url, lazy) {
    const f = el('iframe', { src: url, allowFullscreen: true });
    if (lazy) f.loading = 'lazy';
    f.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture; encrypted-media');
    return f;
  }

  // ---------------------------------------------------------------------------
  // Grid / scroll tiles and filmstrip thumbnails
  // ---------------------------------------------------------------------------
  function buildTile(item) {
    const t = el('div', { className: 'xtg-tile' });
    t.dataset.kind = kindOf(item);
    t.dataset.page = item.page;
    const list = S.view === 'list';
    const cap = el('div', { className: 'xtg-cap' });
    cap.innerHTML = list
      ? `${esc(tr('page', item.page))}<a href="${esc(postUrl(item))}" target="_blank" rel="noopener">${esc(tr('postLink'))}</a>` +
        (item.source ? `<a href="${esc(item.source)}" target="_blank" rel="noopener noreferrer">${esc(tr('sourceLink'))}</a>` : '')
      : esc(tr('page', item.page)) + (item.type !== 'image' && item.meta && item.meta.author ? ` · ${esc(item.meta.author)}` : '');
    cap.querySelectorAll('a').forEach((a) => { a.onclick = (e) => e.stopPropagation(); });

    if (item.dead) {
      t.classList.add('xtg-dead');
      t.innerHTML = `<div class="xtg-ph">${ic('dead', 30)}${esc(tr('dead'))}<span>${esc(hostOf(item.source))}</span></div>`;
      t.appendChild(cap);
      if (item.source) t.onclick = () => window.open(item.source, '_blank', 'noopener');
      return t;
    }
    if (list && showsLabel(item)) t.appendChild(el('div', { className: 'xtg-post', innerHTML: posterHTML(item, true) }));

    const fail = () => markDead(item);
    const open = () => { S.userMoved = true; setView('viewer'); showItem(item); };

    if (item.type === 'image') {
      const img = el('img', { alt: '' });
      lazyImage(img, item, uniq(list ? [item.working, ...fitUrls(item)] : [item.medium, item.working, item.thumb, ...item.candidates]), fail, list ? 'auto' : 'low');
      img.onclick = open;
      t.appendChild(img);
    } else if (list && item.type === 'video') {
      const v = mediaEl('video', { controls: true, preload: item.thumb ? 'none' : 'metadata' });
      if (item.thumb) v.poster = item.thumb;
      v._xtgItem = item;
      listVideoObserver().observe(v);
      t.appendChild(v);
    } else if (list) {
      t.appendChild(iframeEl(item.url, true));
    } else {
      if (item.thumb) {
        const img = el('img', { loading: 'lazy', alt: '', referrerPolicy: 'no-referrer', src: item.thumb });
        img.onerror = () => {
          img.replaceWith(el('div', { className: 'xtg-ph', innerHTML: ic('play', 30, true) }));
          ensureThumb(item, img.src);
        };
        t.appendChild(img);
      } else if (item.type === 'video') {
        const v = mediaEl('video', { muted: true, preload: 'metadata' });
        thumbVideo(v, item, () => videoFail(item));
        t.appendChild(v);
      } else {
        t.innerHTML = `<div class="xtg-ph">${ic('play', 30, true)}${esc(hostOf(item.url))}</div>`;
      }
      const isVid = item.type === 'video';
      t.insertAdjacentHTML('beforeend', `<span class="xtg-badge">${ic(isVid ? 'video' : 'play', 13, !isVid)}${esc(isVid ? tr('video') : hostOf(item.url))}</span>`);
      t.onclick = open;
    }
    t.appendChild(cap);
    return t;
  }

  // Scroll view: a video asks its host for anything only once it comes near the screen, and a paused one that
  // goes far off screen lets its file go (connection and buffer); it carries on from the same point when back.
  let listVideoObs = null;
  function listVideoObserver() {
    if (!listVideoObs) {
      listVideoObs = new IntersectionObserver((entries) => {
        for (const en of entries) {
          const v = en.target, item = v._xtgItem;
          if (en.isIntersecting && !v._xtgLoaded) {
            v._xtgLoaded = true;
            if (v._xtgResume) {
              const at = v._xtgResume;
              v.addEventListener('loadedmetadata', () => { v.currentTime = at; }, { once: true });
            }
            loadVideo(v, item, () => videoFail(item));
          } else if (!en.isIntersecting && v._xtgLoaded && v.paused) {
            v._xtgResume = v.currentTime || 0;
            v._xtgLoaded = false;
            killVideo(v);
          }
        }
      }, { root: ui.scroll, rootMargin: '600px 0px' });
    }
    return listVideoObs;
  }

  function replaceTile(item) {
    const fresh = buildTile(item);
    item.el.replaceWith(fresh);
    item.el = fresh;
  }

  // Page dividers ("p. 2") in the filmstrip, rebuilt shortly after items arrive
  let dividerTimer = null;
  function scheduleDividers() {
    clearTimeout(dividerTimer);
    dividerTimer = setTimeout(updateDividers, 80);
  }
  function updateDividers() {
    if (!ui) return;
    ui.strip.querySelectorAll('.xtg-pdiv, .xtg-gap').forEach((d) => d.remove());
    ui.grid.querySelectorAll('.xtg-gap').forEach((d) => d.remove());
    gapObserver.disconnect();
    if (S.totalPages > 1) {
      let last = null;
      for (const th of [...ui.strip.children]) {
        if (S.filter !== 'all' && th.dataset.kind !== S.filter) continue;
        if (th.dataset.page === last) continue;
        last = th.dataset.page;
        th.before(el('div', { className: 'xtg-pdiv', textContent: tr('pageShort', last) }));
      }
      const runs = gapRuns();
      placeGaps(ui.strip, '.xtg-th', runs);
      placeGaps(ui.grid, '.xtg-tile', runs).forEach((g) => gapObserver.observe(g));
    }
    centerStrip(false, false);
  }

  // Runs of consecutive pages that are not loaded, by kind: 'unloaded' | 'loading' | 'failed'
  function gapRuns() {
    const runs = [];
    let run = null;
    for (let p = 1; p <= S.totalPages; p++) {
      const st = S.pageState.get(p);
      const kind = st === 'loaded' ? null : st === 'failed' ? 'failed' : st === 'queued' || st === 'loading' ? 'loading' : 'unloaded';
      if (!kind) run = null;
      else if (run && run.kind === kind) run.b = p;
      else runs.push(run = { a: p, b: p, kind });
    }
    return runs;
  }

  // A "p. 4–8 · not loaded" box where those pages would be, among thumbnails / tiles (sorted by page)
  function placeGaps(box, sel, runs) {
    const items = [...box.querySelectorAll(':scope > ' + sel)];
    const made = [];
    let i = 0;
    for (const run of runs) {
      while (i < items.length && +items[i].dataset.page < run.a) i++;
      const g = el('button', { className: 'xtg-gap', title: run.kind === 'loading' ? '' : tr('gapTip') });
      Object.assign(g.dataset, { a: run.a, b: run.b, kind: run.kind });
      const state = tr(run.kind === 'failed' ? 'gapFailed' : run.kind === 'loading' ? 'gapLoading' : 'gapUnloaded');
      g.innerHTML = `<b>${esc(tr('gapPages', run.a, run.b))}</b><span>${esc(state)}</span>`;
      g.onclick = (e) => { e.stopPropagation(); openGap(run); };
      let at = items[i] || null;
      if (at && at.previousElementSibling && at.previousElementSibling.classList.contains('xtg-pdiv')) at = at.previousElementSibling;
      box.insertBefore(g, at && at.parentNode === box ? at : null);
      made.push(g);
    }
    return made;
  }

  // Load the gap's page nearest to what is being viewed and, in the viewer, go to its first (or last) item
  function openGap(run) {
    if (run.kind === 'loading') return;
    const back = run.b < curPage();
    const p = back ? run.b : run.a;
    if (run.kind === 'failed') S.pageState.set(p, 'unloaded');
    waitForPage(p, () => {
      const list = visibleItems().filter((i) => i.page === p);
      const target = back ? list[list.length - 1] : list[0];
      if (target && S.view === 'viewer') { S.userMoved = true; showItem(target); }
      else if (target && target.el) target.el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, { dir: back ? -1 : 1 });
  }

  function resumeThere() {
    const o = S.resumeOffer;
    S.resumeOffer = null;
    if (!o) return;
    waitForPage(o.page, () => {
      const list = visibleItems().filter((i) => i.page === o.page);
      const target = list.find((i) => i.key === o.key) || list[0];
      if (target) { S.userMoved = true; showItem(target); }
    }, { key: o.key, dir: 1 });
    scheduleStatus();
  }

  // Grid / Scroll: a not-loaded gap after the page being viewed that scrolls into view loads its next page,
  // like an endless list (not in Saver mode, and never backwards, so opening the list does not walk to page 1)
  const gapObserver = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const g = e.target;
      if (!e.isIntersecting || S.loadMode === 'saver' || browsing() || g.dataset.kind !== 'unloaded' || ui.scroll.hidden) continue;
      if (+g.dataset.a > curPage()) requestPage(+g.dataset.a, { explicit: true });
    }
  }, { rootMargin: '400px' });

  // Keep the viewed item's thumbnail in the middle of the filmstrip. Items arriving later shift it, so this
  // also runs after insertions, unless the user scrolled the strip themselves in the last few seconds.
  function centerStrip(smooth, force) {
    const th = S.cur && S.cur.thumbEl;
    if (!ui || !th || !th.isConnected || ui.viewer.hidden) return;
    if (!force && Date.now() - S.stripTouched < 3000) return;
    const strip = ui.strip;
    strip.scrollTo({ left: th.offsetLeft - strip.clientWidth / 2 + th.offsetWidth / 2, behavior: smooth ? 'smooth' : 'auto' });
  }

  function buildThumb(item) {
    const th = el('div', { className: 'xtg-th', title: tr('page', item.page) });
    th.dataset.page = item.page;
    th.dataset.kind = kindOf(item);
    if (item.type === 'image') {
      const img = el('img', { alt: '' });
      lazyImage(img, item, uniq([item.small, item.medium, item.thumb, item.working, ...item.candidates]), () => markDead(item));
      th.appendChild(img);
    } else {
      if (item.thumb) {
        const img = el('img', { loading: 'lazy', alt: '', referrerPolicy: 'no-referrer', src: item.thumb });
        img.onerror = () => { img.remove(); ensureThumb(item, img.src); };
        th.appendChild(img);
      } else if (item.type === 'video') {
        const v = mediaEl('video', { muted: true, preload: 'metadata' });
        thumbVideo(v, item, () => v.remove());
        th.appendChild(v);
      }
      th.insertAdjacentHTML('beforeend', `<span>${ic('play', 18, true)}</span>`);
    }
    th.onclick = () => { S.userMoved = true; showItem(item); };
    return th;
  }

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

  // ---------------------------------------------------------------------------
  // Poster label
  // ---------------------------------------------------------------------------
  const sameName = (a, b) => !!a && !!b && a.trim().toLowerCase() === b.trim().toLowerCase();
  const showsLabel = (item) => !item.dead && !!(item.meta && item.meta.author) && (item.type === 'image' ? S.infoImages : S.infoVideos);

  function nameColor(name) {
    let h = 0;
    for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 360;
    return `hsl(${h},45%,42%)`;
  }

  function roleTagHTML(item) {
    if (!S.threadStarter || !item.meta || !item.meta.author) return '';
    const op = sameName(item.meta.author, S.threadStarter);
    return `<span class="xtg-tag${op ? ' xtg-tag-op' : ''}">${esc(op ? tr('op') : tr('member'))}</span>`;
  }

  function posterHTML(item, withTag) {
    const m = item.meta;
    const avatar = m.avatar
      ? `<img class="xtg-av" src="${esc(m.avatar)}" alt="" referrerpolicy="no-referrer" onerror="this.style.visibility='hidden'">`
      : `<span class="xtg-av xtg-av-txt" style="background:${nameColor(m.author)}">${esc([...m.author][0].toUpperCase())}</span>`;
    const name = m.profile
      ? `<a class="xtg-name" href="${esc(m.profile)}" target="_blank" rel="noopener">${esc(m.author)}</a>`
      : `<span class="xtg-name">${esc(m.author)}</span>`;
    const siblings = S.items.filter((x) => !x.dead && x.page === item.page && x.postId === item.postId);
    const where = siblings.length > 1 ? `<span class="xtg-date">${esc(tr('inPost', siblings.indexOf(item) + 1, siblings.length))}</span>` : '';
    const date = m.date ? `<span class="xtg-date">${esc(m.date)}</span>` : '';
    const shown = item.caption || m.text;
    const hasFull = !!(item.caption && m.text && item.caption !== m.text);
    const long = shown && (shown.length > 110 || shown.includes('\n'));
    const buttons = (long ? `<button class="xtg-more">${esc(tr('more'))}</button>` : '') +
      (hasFull ? `<button class="xtg-full">${esc(tr('fullPost'))}</button>` : '');
    const text = shown
      ? `<div class="xtg-text xtg-cap-text">${esc(shown)}</div>` +
        (hasFull ? `<div class="xtg-text xtg-full-text">${esc(m.text)}</div>` : '') +
        (buttons ? `<div class="xtg-btns">${buttons}</div>` : '')
      : '';
    return `<div class="xtg-who">${avatar}<div class="xtg-line">${name}${withTag ? roleTagHTML(item) : ''}${date}${where}</div></div>${text}`;
  }

  function setCornerTag(item) {
    const old = ui.stage.querySelector('.xtg-corner');
    if (old) old.remove();
    const html = showsLabel(item) ? roleTagHTML(item) : '';
    if (html) ui.stage.insertAdjacentHTML('beforeend', `<div class="xtg-corner">${html}</div>`);
  }

  // Place the corner tag and the bottom overlay on the media's layout box
  // (offset* ignores CSS transforms, so zooming an image does not move them).
  function positionOverlay() {
    if (!ui) return;
    const media = ui.stage.querySelector(':scope > video, :scope > img');
    if (!media || !media.offsetWidth || !media.offsetHeight) return;
    const sw = ui.stage.clientWidth, sh = ui.stage.clientHeight;
    const ml = media.offsetLeft, mt = media.offsetTop, mw = media.offsetWidth, mh = media.offsetHeight;
    const corner = ui.stage.querySelector('.xtg-corner');
    if (corner) {
      corner.style.left = Math.max(0, ml) + 10 + 'px';
      corner.style.top = Math.max(0, mt) + 10 + 'px';
    }
    const reel = ui.stage.querySelector('.xtg-reel');
    if (!reel) return;
    const w = Math.max(mw, Math.min(320, sw));
    const below = sh - (mt + mh);
    reel.classList.remove('xtg-reel-out');
    reel.style.left = Math.max(0, Math.min(ml - (w - mw) / 2, sw - w)) + 'px';
    reel.style.width = w + 'px';
    reel.style.bottom = Math.max(0, below) + 'px';
    // (not while the blurred preview fills the stage: the real picture decides where the info fits)
    if (!reel.classList.contains('xtg-reel-img') || !S.pinInfo || ui.stage.classList.contains('zoomed') || ui.stage.classList.contains('xtg-loading')) return;

    // Pinned image info goes next to the picture, never over it: below it when there is room (wide pictures),
    // else on its right (tall pictures; the arrows keep their 78 px), else the picture is shrunk to make room
    // below. The compact height counts: hovering expands the info over the picture on purpose, to read it all.
    const h = compactHeight(reel);
    if (below >= h) {
      reel.classList.add('xtg-reel-out');
      reel.style.bottom = below - h + 'px';
      return;
    }
    const right = sw - (ml + mw) - 78;
    if (right >= 200) {
      const rw = Math.min(320, right - 16);
      reel.classList.add('xtg-reel-out');
      reel.style.left = ml + mw + 8 + 'px';
      reel.style.width = rw + 'px';
      return;
    }
    if (media.tagName === 'IMG' && !media.dataset.reserve) { // the observer calls this again once it has shrunk
      media.dataset.reserve = h;
      media.style.maxHeight = `calc(100% - ${h}px)`;
      media.style.marginBottom = h + 'px';
    }
  }
  // Height of the info in its compact, outside-the-picture form, whatever its state now
  function compactHeight(reel) {
    const had = [reel.classList.contains('xtg-compact'), reel.classList.contains('xtg-reel-out')];
    reel.classList.add('xtg-compact', 'xtg-reel-out');
    const h = reel.offsetHeight;
    if (!had[0]) reel.classList.remove('xtg-compact');
    if (!had[1]) reel.classList.remove('xtg-reel-out');
    return h;
  }
  function releaseReserve() {
    const img = ui.stage.querySelector(':scope > img');
    if (!img || !img.dataset.reserve) return;
    delete img.dataset.reserve;
    img.style.maxHeight = img.style.marginBottom = '';
  }

  // Pin button / P key: keep the image info shown (compact, outside the picture) on every image until unpinned
  function togglePin() {
    S.pinInfo = !S.pinInfo;
    store.set('pinInfo', S.pinInfo);
    if (!S.pinInfo) releaseReserve();
    applyPin();
  }
  function applyPin() {
    if (!ui) return;
    ui.stage.classList.toggle('xtg-pinned', S.pinInfo);
    const reel = ui.stage.querySelector('.xtg-reel-img');
    if (reel) {
      const pin = reel.querySelector('.xtg-pin');
      if (pin) { pin.classList.toggle('on', S.pinInfo); pin.title = tr(S.pinInfo ? 'unpinTip' : 'pinTip'); }
      if (!reel.classList.contains('xtg-touchinfo')) reel.classList.toggle('xtg-compact', S.pinInfo && !ui.stage.classList.contains('xtg-show'));
    }
    positionOverlay();
  }

  // Bottom overlay: poster info, plus (for videos) the Reels-style controls
  function addOverlay(item, media) {
    const isVid = media.tagName === 'VIDEO';
    const label = showsLabel(item);
    if (!label && !isVid) return;
    const reel = el('div', { className: 'xtg-reel ' + (isVid ? 'xtg-reel-vid' : 'xtg-reel-img') });
    const pin = isVid ? '' : `<button class="xtg-pin" data-act="pin">${ic('pin', 15)}</button>`;
    reel.innerHTML = (label ? `<div class="xtg-reel-info">${pin}${posterHTML(item, false)}</div>` : '') + (isVid ? `
      <div class="xtg-vbar">
        <div class="xtg-vrow">
          <button class="xtg-vb" data-v="play" title="${esc(tr('playTip'))}"></button>
          <span class="xtg-time">0:00 / 0:00</span>
          <span class="xtg-grow"></span>
          ${item.sd && item.candidates.some((u) => u !== item.sd) ? `<button class="xtg-vb xtg-q" data-v="q" title="${esc(tr('qTip'))}"></button>` : ''}
          <button class="xtg-vb" data-v="mute" title="${esc(tr('muteTip'))}"></button>
          <button class="xtg-vb" data-v="fs" title="${esc(tr('fsTip'))}">${ic('max', 18)}</button>
        </div>
        <div class="xtg-prog"><div class="xtg-track"><div class="xtg-buf"></div><div class="xtg-played"></div></div></div>
      </div>` : '');
    ui.stage.appendChild(reel);
    setCornerTag(item);
    if (isVid) {
      ui.stage.insertAdjacentHTML('beforeend', `<div class="xtg-bigplay">${ic('play', 32, true)}</div>`);
      wireVideo(media, reel);
      const qb = reel.querySelector('[data-v="q"]');
      if (qb) {
        const label = () => { qb.textContent = qualityLabel(item, media); };
        label();
        media.addEventListener('loadstart', label);
        qb.onclick = () => cycleQuality(item, media);
      }
    } else {
      wireImageInfo(media, reel);
    }
    media.addEventListener(isVid ? 'loadedmetadata' : 'load', positionOverlay);
    new ResizeObserver(positionOverlay).observe(media);
    requestAnimationFrame(positionOverlay);
  }

  // Where the mouse last was over the page (null once it left the window): an image that appears under a mouse
  // that did not move (keyboard, the next button, autoplay) shows its info at once instead of after a move.
  let mouseAt = null;
  function trackMouse() {
    if (trackMouse.done) return;
    trackMouse.done = true;
    document.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') mouseAt = { x: e.clientX, y: e.clientY }; }, { capture: true, passive: true });
    document.addEventListener('mouseout', (e) => { if (!e.relatedTarget) mouseAt = null; }, true);
  }

  // Images: on desktop the info appears while the mouse is over the image, or stays (compact) when pinned; on
  // touch screens a compact line (name + one line of text) is always shown and a tap expands it.
  function wireImageInfo(img, reel) {
    applyPin();
    if (!matchMedia('(hover: hover)').matches) {
      reel.classList.add('xtg-touchinfo', 'xtg-compact');
      reel.addEventListener('click', (e) => {
        if (e.target.closest('a, button')) return;
        reel.classList.toggle('xtg-compact');
        positionOverlay();
      });
      return;
    }
    trackMouse();
    let hovering = false;
    const inside = (node, x, y) => {
      const r = node.getBoundingClientRect();
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    };
    const setHover = (h) => {
      if (h === hovering) return;
      hovering = h;
      ui.stage.classList.toggle('xtg-show', h);
      if (S.pinInfo) { reel.classList.toggle('xtg-compact', !h); positionOverlay(); }
    };
    const onMove = (e) => {
      if (e.pointerType !== 'mouse') return;
      setHover(inside(img, e.clientX, e.clientY) || inside(reel, e.clientX, e.clientY));
    };
    const onLeave = () => setHover(false);
    const sync = () => { if (mouseAt && img.isConnected) setHover(inside(img, mouseAt.x, mouseAt.y) || inside(reel, mouseAt.x, mouseAt.y)); };
    img.addEventListener('load', () => requestAnimationFrame(sync));
    requestAnimationFrame(sync);
    ui.stage.addEventListener('pointermove', onMove);
    ui.stage.addEventListener('pointerleave', onLeave);
    S.unwireVideo = () => {
      ui.stage.removeEventListener('pointermove', onMove);
      ui.stage.removeEventListener('pointerleave', onLeave);
      ui.stage.classList.remove('xtg-show');
    };
  }

  function setInfo(kind, on) {
    S[kind] = on;
    store.set(kind, on);
    const cb = ui.root.querySelector(`[data-opt="${kind}"]`);
    if (cb) cb.checked = on;
    refreshLabels();
  }

  // Re-render labels after an option change or once the thread starter is known
  function refreshLabels() {
    if (!ui) return;
    if (S.view === 'viewer' && S.cur && !S.cur.dead) {
      const reel = ui.stage.querySelector(':scope > video') && ui.stage.querySelector('.xtg-reel');
      if (reel) { // keep the playing video, only swap the info
        let info = reel.querySelector('.xtg-reel-info');
        if (showsLabel(S.cur)) {
          if (!info) { info = el('div', { className: 'xtg-reel-info' }); reel.prepend(info); }
          info.innerHTML = posterHTML(S.cur, false);
        } else if (info) info.remove();
        setCornerTag(S.cur);
        positionOverlay();
      } else renderStage();
    }
    for (const item of S.items) if (!item.dead && (item.type !== 'image' || S.view === 'list')) replaceTile(item);
  }

  function setThreadStarter(name, fromHeader) {
    if (!name || (S.starterFromHeader && !fromHeader) || sameName(name, S.threadStarter)) return;
    S.threadStarter = name;
    S.starterFromHeader = fromHeader;
    refreshLabels();
  }

  // ---------------------------------------------------------------------------
  // Video controls
  // ---------------------------------------------------------------------------
  const fmtTime = (sec) => {
    const t = Math.floor(isFinite(sec) && sec > 0 ? sec : 0);
    const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = String(t % 60).padStart(2, '0');
    return h ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
  };

  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else if (ui.stage.requestFullscreen) ui.stage.requestFullscreen().catch(() => {});
  }

  // Desktop: info + controls appear while the mouse is over the video and hide as soon as it leaves.
  // Touch: tap pauses and reveals info, controls and seeking; playing again collapses them.
  function wireVideo(v, reel) {
    const q = (s) => reel.querySelector(s);
    const playBtn = q('[data-v="play"]'), muteBtn = q('[data-v="mute"]'), time = q('.xtg-time');
    const prog = q('.xtg-prog'), track = q('.xtg-track'), played = q('.xtg-played'), buf = q('.xtg-buf');
    const touch = !matchMedia('(hover: hover)').matches;
    let hovering = false;

    const toggle = () => { if (v.paused) v.play().catch(() => {}); else v.pause(); };
    const update = () => ui.stage.classList.toggle('xtg-show', hovering || prog.classList.contains('seeking') || (touch && v.paused));
    const inside = (node, e) => {
      const r = node.getBoundingClientRect();
      return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    };
    const onMove = (e) => {
      if (e.pointerType !== 'mouse') return;
      const h = inside(v, e) || inside(reel, e);
      if (h !== hovering) { hovering = h; update(); }
    };
    const onLeave = (e) => { if (e.pointerType === 'mouse') { hovering = false; update(); } };
    const sync = () => {
      playBtn.innerHTML = ic(v.paused ? 'play' : 'pause', 18, true);
      ui.stage.classList.toggle('xtg-paused', v.paused && v.readyState > 0);
      update();
    };
    const tick = () => {
      const d = v.duration || 0;
      played.style.width = d ? (v.currentTime / d) * 100 + '%' : '0';
      time.textContent = `${fmtTime(v.currentTime)} / ${fmtTime(d)}`;
    };
    const buffered = () => {
      try { if (v.duration && v.buffered.length) buf.style.width = (v.buffered.end(v.buffered.length - 1) / v.duration) * 100 + '%'; } catch (e) { /* ignore */ }
    };
    const volIcon = () => { muteBtn.innerHTML = ic(v.muted || v.volume === 0 ? 'mute' : 'vol', 18); };

    ['play', 'pause', 'loadeddata'].forEach((ev) => v.addEventListener(ev, sync));
    ['timeupdate', 'loadedmetadata'].forEach((ev) => v.addEventListener(ev, tick));
    v.addEventListener('progress', buffered);
    v.addEventListener('volumechange', volIcon);
    v.addEventListener('click', toggle);
    v.addEventListener('dblclick', toggleFullscreen);
    playBtn.onclick = toggle;
    muteBtn.onclick = () => { v.muted = !v.muted; S.muted = v.muted; store.set('muted', v.muted); };
    q('[data-v="fs"]').onclick = toggleFullscreen;

    // seek by clicking or dragging the progress bar
    const seekAt = (e) => {
      const r = track.getBoundingClientRect();
      if (v.duration) { v.currentTime = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * v.duration; tick(); }
    };
    prog.addEventListener('pointerdown', (e) => {
      prog.classList.add('seeking');
      try { prog.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      seekAt(e);
    });
    prog.addEventListener('pointermove', (e) => { if (prog.classList.contains('seeking')) seekAt(e); });
    const stopSeek = () => { prog.classList.remove('seeking'); update(); };
    prog.addEventListener('pointerup', stopSeek);
    prog.addEventListener('pointercancel', stopSeek);

    ui.stage.addEventListener('pointermove', onMove);
    ui.stage.addEventListener('pointerleave', onLeave);
    S.unwireVideo = () => {
      ui.stage.removeEventListener('pointermove', onMove);
      ui.stage.removeEventListener('pointerleave', onLeave);
      ui.stage.classList.remove('xtg-show', 'xtg-paused');
    };
    S.videoCtl = { toggle, mute: () => muteBtn.click() };
    volIcon();
    sync();
    tick();
  }

  // ---------------------------------------------------------------------------
  // Views
  // ---------------------------------------------------------------------------
  function setView(v) {
    const rebuild = (v === 'list') !== (S.view === 'list');
    S.view = v;
    store.set('view', v);
    if (rebuild) S.items.forEach(replaceTile);
    applyView();
  }

  function applyView() {
    const v = S.view;
    ui.viewer.hidden = v !== 'viewer';
    ui.scroll.hidden = v === 'viewer';
    ui.grid.classList.toggle('xtg-list', v === 'list');
    ui.root.querySelectorAll('[data-view]').forEach((b) => b.classList.toggle('on', b.getAttribute('data-view') === v));
    ui.playBtn.hidden = v !== 'viewer';
    if (v === 'viewer') {
      renderStage();
    } else {
      clearTimeout(S.slideTimer); // autoplay resumes when coming back to View
      ui.stage.querySelectorAll('video').forEach((x) => x.pause());
      if (S.cur && S.cur.el) S.cur.el.scrollIntoView({ block: 'center' });
    }
    scheduleStatus();
  }

  // ---------------------------------------------------------------------------
  // Viewer: zoom, pan, swipe
  // ---------------------------------------------------------------------------
  let Z = { s: 1, x: 0, y: 0 };
  const stageImg = () => ui.stage.querySelector(':scope > img');

  function applyZoom() {
    const img = stageImg();
    if (!img) return;
    img.style.transform = `translate(${Z.x}px, ${Z.y}px) scale(${Z.s})`;
    img.classList.toggle('zoomed', Z.s > 1);
    ui.stage.classList.toggle('zoomed', Z.s > 1);
    if (Z.s > 1 && S.cur && S.cur.large && img.src === S.cur.large) upgradeToFull(S.cur, img); // zoomed: the details need the original
  }

  function zoomTo(scale, cx, cy) {
    const s = Math.min(6, Math.max(1, scale));
    if (s === 1) { Z = { s: 1, x: 0, y: 0 }; applyZoom(); return; }
    const r = ui.stage.getBoundingClientRect();
    const px = cx - (r.left + r.width / 2), py = cy - (r.top + r.height / 2);
    const k = s / Z.s;
    Z = { s, x: px - (px - Z.x) * k, y: py - (py - Z.y) * k }; // keep the point under the cursor fixed
    applyZoom();
  }

  function setupStageGestures() {
    const st = ui.stage;
    const pointers = new Map();
    let start = null, pinch = null;

    st.addEventListener('wheel', (e) => {
      if (!stageImg()) return;
      e.preventDefault();
      zoomTo(Z.s * (e.deltaY < 0 ? 1.2 : 1 / 1.2), e.clientX, e.clientY);
    }, { passive: false });

    st.addEventListener('pointerdown', (e) => {
      if (e.target.closest('video, iframe, a, .xtg-reel, .xtg-embed')) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return; // right/middle click: leave the context menu alone
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 1) start = { x: e.clientX, y: e.clientY, zx: Z.x, zy: Z.y, t: Date.now(), moved: false, onImg: e.target === stageImg() };
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), s: Z.s };
      }
      try { st.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    });

    st.addEventListener('pointermove', (e) => {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const img = stageImg();
      if (pointers.size === 2 && pinch && img) {
        const [a, b] = [...pointers.values()];
        zoomTo((pinch.s * Math.hypot(a.x - b.x, a.y - b.y)) / pinch.d, (a.x + b.x) / 2, (a.y + b.y) / 2);
        if (start) start.moved = true;
        return;
      }
      if (!start) return;
      const dx = e.clientX - start.x, dy = e.clientY - start.y;
      if (Math.abs(dx) + Math.abs(dy) > 6) start.moved = true;
      if (Z.s > 1 && img) {
        img.classList.add('dragging');
        Z.x = start.zx + dx;
        Z.y = start.zy + dy;
        applyZoom();
      }
    });

    const end = (e) => {
      if (!pointers.has(e.pointerId)) return;
      pointers.delete(e.pointerId);
      const img = stageImg();
      if (img) img.classList.remove('dragging');
      if (pointers.size < 2) pinch = null;
      if (pointers.size || !start) return;
      const dx = e.clientX - start.x;
      if (!start.moved && e.type === 'pointerup' && img && start.onImg) {
        if (Z.s > 1) zoomTo(1); else zoomTo(2.5, e.clientX, e.clientY);   // click to zoom in / out
      } else if (Z.s === 1 && Math.abs(dx) > 60 && Date.now() - start.t < 800) {
        step(dx < 0 ? 1 : -1, true);                                      // horizontal swipe
      }
      start = null;
    };
    st.addEventListener('pointerup', end);
    st.addEventListener('pointercancel', end);
  }

  let viewTimer = null;
  function rememberView() {
    clearTimeout(viewTimer);
    viewTimer = setTimeout(() => {
      if (S.cur && !(S.cur === S.autoPicked && !S.navIntent)) cache.put('v:' + THREAD_ID, { lastKey: S.cur.key, lastPage: S.cur.page, totalPages: S.totalPages });
    }, 800);
  }

  function showItem(item) {
    clearTimeout(navTimer);
    S.cur = item;
    S.pendingNav = null;
    if (item) { setFocus(item.page); prefetchAhead(item); }
    rememberView();
    if (ui.viewer.hidden && S.view === 'viewer') applyView();
    else renderStage();
  }

  // Close to the last loaded item in the direction of travel: ask for the next page now, so it is there (or on its
  // way, at the usual pace) when you reach the end, instead of only then. Also in Saver mode, where nothing else
  // loads ahead. Not in browse mode: there a page can only be opened by going to it.
  const PREFETCH_ITEMS = 3;
  function prefetchAhead(item) {
    if (browsing() || S.totalPages <= 1) return;
    const d = S.lastDir || 1;
    let x = item;
    for (let k = 0; k < PREFETCH_ITEMS && x; k++) x = neighbour(x, d);
    if (x) return; // more than PREFETCH_ITEMS loaded items still ahead
    const gap = firstGap(item.page, d > 0 ? S.totalPages + 1 : 0, d);
    if (gap) requestPage(gap, { explicit: true });
  }

  // First (-1) or last (+1) item of the current filter. In Grid / Scroll views this scrolls the list.
  function jumpToEdge(dir) {
    const edge = dir < 0 ? 1 : S.totalPages;
    const st = S.pageState.get(edge);
    if (st !== 'loaded' && st !== 'failed') { waitForPage(edge, () => jumpToEdge(dir), { dir: -dir }); return; }
    const list = visibleItems();
    const target = dir < 0 ? list[0] : list[list.length - 1];
    if (S.view !== 'viewer') {
      ui.scroll.scrollTo({ top: dir < 0 ? 0 : ui.scroll.scrollHeight, behavior: 'smooth' });
      if (target) S.cur = target;
      scheduleStatus();
      return;
    }
    if (!target || target === S.cur) return;
    S.userMoved = true;
    S.lastDir = dir;
    showItem(target);
  }

  // Move to the next live item in direction d; returns false at either end
  // Pages not loaded yet in between (or beyond the last loaded item) are loaded first, then the move happens;
  // returns true in that case too, so autoplay waits instead of stopping.
  function step(d, byUser) {
    const from = S.cur ? S.items.indexOf(S.cur) : -1;
    const here = curPage();
    let target = null;
    for (let i = from + d; i >= 0 && i < S.items.length; i += d) {
      if (S.items[i].dead || !passesFilter(S.items[i])) continue;
      target = S.items[i];
      break;
    }
    const gap = firstGap(here, target ? target.page : d > 0 ? S.totalPages + 1 : 0, d);
    if (byUser) S.userMoved = true;
    S.lastDir = d;
    if (gap) { waitForPage(gap, () => step(d, false), { dir: d }); return true; }
    if (!target) return false;
    showItem(target);
    return true;
  }

  // The current item has loaded: drop the spinner / slow notice, show the info, start the autoplay delay.
  // rid ties the call to one render, so a late load from an earlier render (e.g. before "Retry") is ignored.
  function mediaReady(rid) {
    if (rid !== S.renderId) return;
    S.curReady = true;
    clearTimeout(S.slowTimer);
    ui.stage.classList.remove('xtg-loading');
    setTimeout(() => afterBuffered(rid, () => prepareNext(S.cur)), 300);
    const notice = ui.stage.querySelector('.xtg-slow');
    if (notice) notice.remove();
    if (S.slideshow) scheduleSlide();
  }

  function showSlowNotice(item, rid) {
    if (rid !== S.renderId || S.curReady) return;
    const notice = el('div', { className: 'xtg-slow' });
    notice.innerHTML = `<span>${esc(tr('slowMsg'))}</span><button data-act="retry">${esc(tr('retry'))}</button>` +
      (item.source ? `<a href="${esc(item.source)}" target="_blank" rel="noopener noreferrer">${esc(tr('openOriginal'))}</a>` : '');
    ui.stage.appendChild(notice);
  }

  function renderStage() {
    if (!ui || S.view !== 'viewer') return;
    const item = S.cur;
    const rid = ++S.renderId;
    S.curReady = false;
    S.curBuffered = false;
    clearTimeout(S.slowTimer);
    Z = { s: 1, x: 0, y: 0 };
    // the previous video stops downloading too (the host's bandwidth is not wasted on what is not watched)
    ui.stage.querySelectorAll('video').forEach((x) => { if (x !== PREP.v) killVideo(x); });
    if (PREP.item && item !== PREP.item && (!item || (neighbour(item, 1) !== PREP.item && neighbour(item, -1) !== PREP.item))) dropPrepared();
    ui.stage.innerHTML = '';
    ui.stage.classList.remove('zoomed', 'xtg-loading');
    clearTimeout(S.slideTimer);
    if (S.unwireVideo) { S.unwireVideo(); S.unwireVideo = null; }
    S.videoCtl = null;
    if (!item) { scheduleStatus(); return; }

    ui.postLink.href = postUrl(item);
    ui.srcLink.href = item.source || item.url || item.candidates[0] || '#';

    if (item.dead) {
      ui.stage.innerHTML = `<div class="xtg-msg">${ic('dead', 34)}${esc(tr('deadLong'))}<br>` +
        (item.source ? `<a href="${esc(item.source)}" target="_blank" rel="noopener noreferrer">${esc(tr('openOriginal'))}</a>` : '') + '</div>';
    } else if (item.type === 'image') {
      const img = el('img', { alt: '', draggable: false });
      img.fetchPriority = 'high';
      ui.stage.appendChild(img);
      const known = item.working || (fitsLarge() && item.fitted);
      if (known) {
        // the image has loaded before: it comes straight from the browser cache
        ui.stage.classList.add('xtg-loading');
        loadImage(img, item, uniq([known, ...item.candidates]), () => markDead(item), (src) => {
          mediaReady(rid);
          fillThumb(item, src);
          preloadAround(item);
        });
      } else {
        // show the thumbnail already in the cache (blurred) with a spinner while the full image loads
        if (item.shown) { img.src = item.shown; img.classList.add('xtg-preview'); }
        ui.stage.classList.add('xtg-loading');
        let fullDone = false, mid = null;
        // full image still loading after MID_DELAY_MS and the host has a medium size: show that meanwhile
        const midTimer = item.medium && item.medium !== item.shown && setTimeout(() => {
          if (fullDone || S.cur !== item) return;
          mid = new Image();
          mid.fetchPriority = 'high';
          mid.referrerPolicy = 'no-referrer';
          mid.onload = () => {
            if (fullDone || S.cur !== item || !img.isConnected || isPlaceholder(mid)) return;
            img.src = mid.src;
            img.classList.remove('xtg-preview');
          };
          mid.src = item.medium;
        }, MID_DELAY_MS);
        const full = new Image();
        full.fetchPriority = 'high';
        loadImage(full, item, uniq(fitUrls(item)), () => {
          fullDone = true;
          clearTimeout(midTimer);
          if (S.cur === item) ui.stage.classList.remove('xtg-loading');
          markDead(item);
        }, (src) => {
          fullDone = true;
          clearTimeout(midTimer);
          if (mid && !mid.complete) mid.src = ''; // the full image won: drop the medium request
          fillThumb(item, src); // also when the user has already moved on
          if (rid !== S.renderId) return;
          // decoded before the swap: a big image does not stall the page at the moment it appears
          full.decode().catch(() => {}).then(() => {
            if (rid !== S.renderId) return;
            img.src = src;
            img.classList.remove('xtg-preview');
            mediaReady(rid);
            preloadAround(item);
          });
        });
      }
      addOverlay(item, img);
    } else if (item.type === 'video') {
      ui.stage.classList.add('xtg-loading');
      const v = stageVideo(item, rid);
      v.addEventListener('ended', () => { if (S.slideshow) nextOrStop(); });
      ui.stage.appendChild(v);
      addOverlay(item, v);
    } else {
      const f = iframeEl(item.url, false);
      if (showsLabel(item)) {
        // embedded players have their own controls we cannot change, so the info goes below the frame
        const wrap = el('div', { className: 'xtg-embed' });
        wrap.append(f, el('div', { className: 'xtg-post', innerHTML: posterHTML(item, true) }));
        ui.stage.appendChild(wrap);
      } else {
        ui.stage.appendChild(f);
      }
    }

    S.items.forEach((i) => i.thumbEl && i.thumbEl.classList.toggle('on', i === item));
    centerStrip(true, true);
    scheduleStatus();

    if (item.type !== 'image' && !item.dead) setTimeout(() => afterBuffered(rid, () => preloadAround(item)), 1000);
    if (item.type === 'embed' || item.dead) {
      S.curReady = true; // nothing to wait for
      setTimeout(() => { if (rid === S.renderId) prepareNext(item); }, 1000);
    } else if (!S.curReady) {
      S.slowTimer = setTimeout(() => showSlowNotice(item, rid), SLOW_NOTICE_MS);
    }
    if (S.slideshow) scheduleSlide();
  }

  // ---------------------------------------------------------------------------
  // Slideshow
  // ---------------------------------------------------------------------------
  function nextOrStop() { if (!step(1, false)) stopSlideshow(); }

  // Autoplay timing: the delay starts once the item has loaded (videos advance when they end);
  // an item still loading after LOAD_SKIP_MS is skipped, without being marked broken.
  function scheduleSlide() {
    clearTimeout(S.slideTimer);
    const item = S.cur;
    if (!S.slideshow || !item) return;
    if (!S.curReady) { S.slideTimer = setTimeout(nextOrStop, LOAD_SKIP_MS); return; }
    if (item.type === 'video') return;
    S.slideTimer = setTimeout(nextOrStop, item.type === 'embed' ? SLIDE_EMBED_MS : SLIDE_MS);
  }

  // remember = false: a temporary stop (end of the list) that keeps the saved preference
  function setSlideshow(on, remember = true) {
    S.slideshow = on;
    if (remember) store.set('autoplay', on);
    clearTimeout(S.slideTimer);
    if (!ui) return;
    ui.playBtn.classList.toggle('on', on);
    ui.playBtn.querySelector('.xtg-pi').innerHTML = on ? ic('pause', 16, true) : ic('play', 16, true);
    if (on) scheduleSlide();
  }
  const toggleSlideshow = () => setSlideshow(!S.slideshow);
  const stopSlideshow = () => setSlideshow(false, false);

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
      items: [], keys: new Set(), pending: 0, pagesCached: 0, pageErrors: 0, pageState: new Map(), netState: null,
      pendingNav: null, pageLinks: new Map(),
      cur: null, userMoved: false, resumeKey: null, startLocked: false, startPending: 0, startReplayed: false, noCache: true,
    });
    ui.grid.innerHTML = '';
    ui.strip.innerHTML = '';
    renderStage();
    loadThread();
  }

  // ---------------------------------------------------------------------------
  // Open / close
  // ---------------------------------------------------------------------------
  let savedOverflow = '';

  function openGallery() {
    if (!ui) buildUI();
    if (ui.root.hidden) {
      ui.root.hidden = false;
      void ui.root.offsetWidth; // flush layout so the fade-in transition runs
      ui.root.classList.add('xtg-open');
      savedOverflow = docEl.style.overflow;
      docEl.style.overflow = 'hidden';
      applyView();
    }
    if (!S.started) loadThread();
    else pumpPages(); // resume page loading paused while the gallery was closed
  }

  function closeGallery() {
    clearTimeout(S.slideTimer); // pause only: the autoplay setting stays
    clearTimeout(navTimer);
    dropPrepared();
    ui.stage.querySelectorAll('video').forEach((x) => x.pause());
    ui.stage.querySelectorAll('iframe').forEach((x) => x.remove()); // stop embedded players
    ui.root.classList.remove('xtg-open');
    ui.root.hidden = true;
    ui.menu.hidden = true;
    docEl.style.overflow = savedOverflow;
  }

  // ---------------------------------------------------------------------------
  // Init
  // ---------------------------------------------------------------------------
  document.head.appendChild(el('style', { textContent: CSS }));
  const fab = el('button', { id: 'xtg-fab', title: tr('fabTip'), innerHTML: ic('images', 17) + esc(tr('fab')) });
  fab.onclick = openGallery;
  document.body.appendChild(fab);
  // arrived by a move in browse mode: reopen the gallery and finish the move
  try {
    const nav = JSON.parse(sessionStorage.getItem('xtg_nav') || 'null');
    sessionStorage.removeItem('xtg_nav');
    if (nav && nav.thread === THREAD_ID && nav.page === currentPage() && Date.now() - nav.at < NAV_TTL_MS) {
      S.navIntent = nav.intent || { dir: 1 };
      openGallery();
    }
  } catch (e) { /* ignore */ }
  if (typeof GM_registerMenuCommand === 'function') {
    GM_registerMenuCommand(tr('menuOpen'), openGallery);
    GM_registerMenuCommand(tr('menuHosts'), editHosts);
  }
})();
