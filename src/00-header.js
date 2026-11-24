// ==UserScript==
// @name             XenForo Thread Gallery
// @name:vi          XenForo Thread Gallery – Album ảnh/video cho chủ đề
// @namespace        xenforo-thread-gallery
// @author           Dylan Phan
// @version          3.2.1
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

