# XenForo Thread Gallery

Long XenForo threads often hide their images and videos between pages of text, and the media is a mix of forum uploads, embeds and plain links to image hosts. Some links render, some don't, and some point to files that were deleted long ago.

**XenForo Thread Gallery** collects every image and video across **all pages** of a thread into one gallery, so you can browse them in one go.

## Features

- **Whole thread, every page.** Click the **Album** button on any thread page. Pages are fetched in the background (one page at a time, with a short pause between pages so the forum is not overloaded) and media appears in thread order as it loads.
- **Three views**
  - **View**: one item at a time with a filmstrip. Arrow keys / swipe to navigate; click, mouse wheel or pinch to zoom; drag to pan.
  - **Grid**: all thumbnails at a glance.
  - **Scroll**: full-size media stacked vertically.
- **Finds the real file behind links**
  - Forum attachments (full size, not the thumbnail), lazy-loaded and proxied images.
  - Direct links to `.jpg .png .gif .webp .mp4 .webm …`.
  - Chevereto hosts (anh.moe, ibb.co, jpg.church…), including whole albums.
  - Streamable (native MP4 via the API), Imgur, YouTube, Vimeo, RedGifs, TikTok.
  - Any other host you add: the script reads the page's `og:image` / `og:video`.
- **Skips dead media.** Broken links, 404s and "image removed" placeholders are hidden (you can show them from the options). Hotlink-protected images are fetched through the userscript manager. Transient network errors are retried once.
- **No duplicates.** Images quoted again later only appear once.
- **Cached, and opens where you are reading.** Pages and resolved links are cached in the browser, so moving from page 1 to page 2 does not re-download the thread: only the last page is fetched again. The gallery opens on the first item of the page you are reading (or the item you were viewing on it).
- **Reels-style video player**
  - Shows a slim progress bar only, so it doesn't cover the video.
  - Desktop: hover the video to reveal poster info and controls.
  - Mobile: tap to pause, then seek.
  - Shortcuts: **K** play/pause, **M** mute, **F** fullscreen.
- **Poster label**
  - A **Thread starter** / **Member** tag in the top-left corner.
  - The poster's avatar, name, date and post text (quotes and bare links removed).
  - Press **I** to toggle.
- **Video thumbnails.** When a video has none, the script captures a frame, asks oEmbed / RedGifs, or reads `og:image`.
- **Autoplay** (Space). Images advance every 3.5 s; videos advance when they end.
- **English and Vietnamese UI**, chosen automatically from your browser language.
- Lightweight: no external libraries. Icons are inline [Lucide](https://lucide.dev) SVGs (ISC).

## Keyboard shortcuts

| Key | Action |
|---|---|
| ← / → | Previous / next |
| Space | Autoplay |
| G | Toggle grid |
| I | Toggle poster label |
| K / M / F | Video: play-pause / mute / fullscreen |
| Esc | Close |

## Notes

- Works on XenForo 1.x and 2.x thread URLs containing `threads/`. If your forum uses different URLs, add a `// @match https://your-forum.example/*` line.
- **Tampermonkey asks "A userscript wants to access a cross-origin resource"**: the script fetches files and pages from image hosts. Click **Always allow all domains** so it doesn't ask again for every host. If you already picked another button, open the Tampermonkey dashboard → this script → **Settings** → **XHR Security** → **User domain whitelist**, add a line with `*`, and save.
- Settings (view mode, mute, label options, host list) are stored per forum in `localStorage`; the cache lives in IndexedDB (30 most recent threads). **Options → Reload this thread** ignores the cache.
- Media that was deleted from its host cannot be recovered; it is only hidden.
- Embedded players (YouTube…) cannot be checked for availability.

## Support

Free and open source, made by Dylan Phan. If this gallery saves you some scrolling, you can **[buy me a coffee on Ko-fi](https://ko-fi.com/dylanphan)**. Thank you!

Source code, issues and changelog: [GitHub](https://github.com/phanhuyduong2003/xf-gallery).
