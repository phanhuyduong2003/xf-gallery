# XenForo Thread Gallery

Long XenForo threads often hide their images and videos between pages of text, and the media is a mix of forum uploads, embeds and plain links to image hosts. Some links render, some don't, and some point to files that were deleted long ago.

**XenForo Thread Gallery** collects every image and video across **all pages** of a thread into one gallery, so you can browse them in one go.

## Features

- **Whole thread, every page, without getting you banned.** Click the **Album** button on any thread page. It starts with the page you are reading and loads the pages around it, then more as you browse; pages not loaded yet show as a block you can click. Requests are paced like a person browsing: one page about every 5 seconds, shared by all your tabs, at most 40 pages per 10 minutes, nothing while the tab is in the background. If the forum shows a captcha or asks to slow down, loading stops in every tab instead of retrying. Forums that do not allow background loading (voz.vn) switch to **browse mode**: moving to another page opens it normally and the gallery reopens there. Opens at the unread post, and offers to continue where you left off. Modes: **Saver**, **Balanced** (default), **Whole thread**.
- **Open in new tab:** a small ↗ icon after each thread title in thread lists.
- **Filter** all / images / videos, page indicator and page dividers in the filmstrip, jump to first / last.
- **Three views**
  - **View**: one item at a time with a filmstrip. Arrow keys / swipe to navigate; click, mouse wheel or pinch to zoom; drag to pan.
  - **Grid**: all thumbnails at a glance.
  - **Scroll**: full-size media stacked vertically.
- **Finds the real file behind links**
  - Forum attachments (full size, not the thumbnail), lazy-loaded and proxied images.
  - Direct links to `.jpg .png .gif .webp .mp4 .webm …`.
  - Chevereto hosts (anh.moe, ibb.co, jpg.church…), including whole albums.
  - Streamable and RedGifs (native MP4 via their APIs), Imgur, YouTube, Vimeo, TikTok.
  - **Fast videos:** the next video is prepared in the background, slow hosts are remembered and start with the lighter version (or race it), short clips on slow hosts download in parallel parts, and an Auto / HD / SD button. The forum's own files are never touched by any of this.
  - Imgur and Chevereto images use the host's smaller sizes for thumbnails and while a slow full image loads.
  - Any other host you add: the script reads the page's `og:image` / `og:video`.
- **Skips dead media.** Broken links, 404s and "image removed" placeholders are hidden (you can show them from the options). Hotlink-protected images are fetched through the userscript manager. Transient network errors are retried once.
- **No duplicates.** Images quoted again later only appear once.
- **Cached, and opens where you are reading.** Pages and resolved links are cached in the browser, so moving from page 1 to page 2 does not re-download the thread: old pages are kept for a week, the last pages for an hour. The gallery opens on the first item of the page you are reading (or the item you were viewing on it).
- **Reels-style video player**
  - Shows a slim progress bar only, so it doesn't cover the video.
  - Desktop: hover the video to reveal poster info and controls.
  - Mobile: tap to pause, then seek.
  - Shortcuts: **K** play/pause, **M** mute, **F** fullscreen.
- **Poster info on images and videos**
  - A **Thread starter** / **Member** tag in the top-left corner.
  - The poster's avatar, name, date and text (quotes and bare links removed). On desktop it appears on hover; on phones images show a compact line you tap to expand.
  - In posts with several images/videos, **each item gets the text next to it** ("Photo 1: …", "Photo 2: …"), with its position in the post and a *Whole post* button.
  - Separate switches for images and videos; press **I** to toggle.
- **Video thumbnails.** When a video has none, the script captures a frame, asks oEmbed / RedGifs, or reads `og:image`.
- **Autoplay** (Space), on by default. Images advance every 3.5 s; videos advance when they end.
- **English and Vietnamese UI**, chosen automatically from your browser language.
- Lightweight: no external libraries. Icons are inline [Lucide](https://lucide.dev) SVGs (ISC).

## Keyboard shortcuts

| Key | Action |
|---|---|
| ← / → | Previous / next |
| Home / End | First / last |
| Space | Autoplay |
| G | Toggle grid |
| I | Toggle poster label |
| K / M / F | Video: play-pause / mute / fullscreen |
| Esc | Close |

## Notes

- Works on any XenForo 1.x / 2.x forum, whatever its URLs (`/threads/`, `/t/`, custom routes). The script is allowed on all sites but recognises XenForo pages from their markup and **stops immediately everywhere else**, without adding anything or sending any data. Big non-forum sites are excluded outright.
- **Tampermonkey asks "A userscript wants to access a cross-origin resource"**: the script fetches files and pages from image hosts. Click **Always allow all domains** so it doesn't ask again for every host. If you already picked another button, open the Tampermonkey dashboard → this script → **Settings** → **XHR Security** → **User domain whitelist**, add a line with `*`, and save.
- Settings (view mode, mute, label options, host list) are stored per forum in `localStorage`; the cache lives in IndexedDB (30 most recent threads). **Options → Reload this thread** ignores the cache.
- Media that was deleted from its host cannot be recovered; it is only hidden.
- Embedded players (YouTube…) cannot be checked for availability.

## Support

Free and open source, made by Dylan Phan. If this gallery saves you some scrolling, you can **[buy me a coffee on Ko-fi](https://ko-fi.com/dylanphan)**. Thank you!

Source code, issues and changelog: [GitHub](https://github.com/phanhuyduong2003/xf-gallery).
