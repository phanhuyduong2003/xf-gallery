# Changelog

Tiếng Việt: [CHANGELOG.vi.md](CHANGELOG.vi.md)

All notable changes to **XenForo Thread Gallery** are listed here, newest first.

**When releasing an update:**
1. Move the items from *Unreleased* into a new version section with today's date.
2. Bump `@version` in `src/00-header.js` to the same number and run `node build.mjs`.
3. Commit with a one-line summary of that version's items (see [CONTRIBUTING.md](CONTRIBUTING.md)) and push to `main`. Greasy Fork syncs the code and shows the commit message as the changelog.

Commit messages and the full release steps: [CONTRIBUTING.md](CONTRIBUTING.md).

Version numbers: `2.0.1` for fixes, `2.1.0` for new features, `3.0.0` for big changes that break old behaviour or settings.

## [Unreleased]

### Added
- Pin the image info (**P**, or the pin button on the info): it stays shown on every image, compact and next to the picture (below it, on its right for tall pictures, or with the picture shrunk a little), so it never covers it. Hovering expands it. The choice is remembered.
- The next page is requested when 3 items are left before the end of what is loaded, so the gallery does not stop at the last item to wait for it (also in Saver mode; not in browse mode, where pages can only be opened by going there).

### Changed
- Videos always play while they download, like opening their link: short clips on hosts marked slow are no longer downloaded whole before playing.
- The video being watched gets the connection first: the next video, video thumbnails and image preloads wait until 10 s of it are downloaded (at most 10 s). Grabbing a frame for a video thumbnail no longer buffers the start of the file.

### Fixed
- Image info disappeared on every move to the next image until the mouse moved again; it now shows at once when the mouse is over the new image.
- The viewer could show the small preview from the post (an attachment thumbnail, for example) instead of the original, once the filmstrip had loaded that preview. Previews remembered by 3.1.0 are ignored.
- A video host marked slow once stayed slow for good; its speed is now measured on every video again.

## [3.1.0] - 2026-11-25

### Added
- On a small screen or with data saver on, Imgur photos open at 1024 px instead of the original; zooming in loads the original.

### Changed
- Media found dead is remembered for 12 hours and the file that loaded is remembered for 7 days, so opening the thread again asks no host for files known to fail.
- Hosts that only serve images through the userscript manager (hotlink protection) are remembered: their images skip the direct tries that would fail. Downloaded images are released from memory beyond the 30 most recent.
- Scroll view: videos only start loading near the screen, and a paused one far off screen lets its file go (it resumes from the same point).
- Thumbnails: at most 2 at a time from the same host (6 in all), so one slow host no longer holds up the others and the forum gets fewer requests at once.
- Images and thumbnails load straight from their host first; the forum's image/link proxy is only the last resort (it may still hold a copy of a dead original). Faster, and the forum serves fewer files.
- Images are preloaded in the direction you are browsing (only the next one on data saver), and big images are decoded before they appear.

### Fixed
- Deleted Imgur images showed Imgur's "removed" picture when they came through the forum's image proxy or the userscript manager, and as the medium-size preview; they are now marked dead.

## [3.0.0] - 2026-11-24

### Added
- Loading modes in *Options → Loading pages*: **Saver** (only the page you are reading, the next one when you get there), **Balanced** (default: 2 pages on each side, following you as you browse) and **Whole thread** (asks first above 50 pages).
- Pages not loaded yet show as a "p. 4–8 · not loaded" block in the filmstrip and the grid; clicking it loads the nearest page and jumps there. Next / previous, first / last and autoplay load the pages they need, then move. Grid and Scroll load the next page when you scroll to the end.
- A banner explains why loading is paused ("slow down", 40-page limit) with a **Continue** button.
- **Browse mode** for forums that answer background page requests with a security check (voz.vn): no retry; moving to a page that is not loaded opens it the normal way and the gallery reopens there, on the item the move was heading to (autoplay included). Spaced and counted like background requests.
- The gallery opens at the linked post (`#post-123`, where XenForo's unread link lands), and offers "Last time you were at page 812. Continue there".
- Faster videos: the next video is prepared in the background and played at once when you get there; each host's speed is remembered and slow hosts start with the lighter version; if the full-quality file shows nothing after 1.5 s the lighter one races it; short clips (up to 30 MB) on slow hosts download in 3 parallel parts; the connection to the next item's host is opened early. A host answering 403 / 429 / 503 gets none of this for 30 minutes, and the forum's own files never do.
- **Auto / HD / SD** button in the video bar (remembered, keeps the playback position).

### Changed
- **The gallery no longer downloads the whole thread by default.** Page requests are paced to look like a person browsing, to avoid captchas and account bans: one at a time per forum across all tabs, about 5 s apart (longer when the forum is slow), at most 40 per 10 minutes, nothing while the tab is hidden or the gallery closed. A captcha / security check or 403 / 503 stops loading in every tab with no retry; 429 waits as long as the forum asks, longer each time, and stops on the third.
- Cached thread pages are kept 7 days (the last 3 pages 1 hour) instead of 12 hours, so moving between pages costs fewer requests.
- Video thumbnails without a poster load one at a time, only after the watched video shows a frame, and use the lighter version. Leaving a video stops its download.

## [2.5.0] - 2026-11-24

### Added
- A small "open in a new tab" icon after each thread title in XenForo thread lists (forums, new posts, search results), including items loaded later.

### Changed
- Works with any forum URL scheme (`/t/`, `/chu-de/`, custom routes): thread pages are recognised from their XenForo markup instead of `threads/` in the URL, and the thread id is taken from the page's canonical URL. The script is allowed on every site but stops immediately on non-XenForo pages; large non-forum sites are excluded.

## [2.4.0] - 2026-11-24

### Added
- Slow-server notice: after 5 seconds of loading, a message with **Retry** and **Open original link** appears (the poster info stays hidden until the media has loaded).

### Changed
- Autoplay starts its delay only once the image has loaded, and skips an item that has not loaded after 15 seconds (without marking it broken).
- While an image or video is still loading, only the spinner is shown: the poster info and the Thread starter / Member tag appear once it has loaded.

### Fixed
- A thread page that never answered stalled the whole thread: requests now give up after 20 seconds and are retried up to 3 times, then the page is counted as failed and loading continues.
- Slow thumbnails no longer block the thumbnail queue: each gives its slot away after 10 seconds and keeps loading in the background. The same applies to preloading.

## [2.3.0] - 2026-11-24

### Added
- Progressive image sizes for Imgur and Chevereto: small thumbnails in the filmstrip, medium in the grid, and a medium version shown while a full image is still loading after 0.8 s.
- Lighter video on slow connections or data saver: Streamable's mobile version and RedGifs SD. RedGifs now plays as a native video in the Reels-style player, with the embedded player as fallback.

### Changed
- The opening item is chosen once the page being read is processed (at most about 1.5 s), so it no longer jumps when a link near the top resolves late.

### Fixed
- Filmstrip thumbnails stayed empty during autoplay: thumbnails that scrolled out of view no longer hold up the queue, and a loaded full image also fills its own thumbnail.

## [2.2.0] - 2026-11-24

### Added
- Poster info on images, like on videos: on desktop it appears while hovering the image; on phones a compact line (name + one line of text) is always shown and expands on tap.
- Per-item captions in posts with several images/videos: each item shows the text right next to it (captions above or below their item are detected per post), its position in the post ("2 of 5 in this post") and a *Whole post* button.
- Separate options to show info on images and on videos (both on by default). **I** toggles the kind being viewed.
- Filter button next to the counter: All / Images / Videos, with counts.
- Page indicator ("Page 2/3") and page dividers in the filmstrip; the filmstrip keeps the viewed item centred.
- First / last buttons at the ends of the filmstrip, and **Home** / **End** keys.
- Drag the filmstrip with the mouse, or scroll it with the mouse wheel.

### Changed
- Autoplay is on by default and remembers your choice. Its button shows ▶ when off and a pause icon when on.
- Previous / next buttons never cover the media: on desktop they sit in margins beside it, on phones at both ends of the filmstrip.
- Tidier toolbar: the counter sits above a small line with the page, broken items and loading progress; the filter is a single dropdown; windows narrower than about 960 px use two rows like phones.
- Faster, gentler image loading: thumbnails load only when visible and at most 4 at a time, the opened image gets priority and shows its cached thumbnail with a spinner until the full image arrives, and neighbouring images are preloaded one at a time.

## [2.1.1] - 2026-11-24

### Added
- Ko-fi support link: shown as a donation button on Greasy Fork (`@contributionURL`) and as a Sponsor button on GitHub.

### Changed
- Previous / next buttons are larger round buttons with a solid background, so they stand out on any image or video.

### Fixed
- Previous / next buttons are centred on the image/video instead of on the area including the filmstrip.
- On phones, a long status line no longer pushes the close button onto its own row.

## [2.1.0] - 2026-11-24

### Added
- Cache in the browser (IndexedDB) for thread pages (12 h), resolved image-host links (7 days) and video thumbnails (7 days). Moving between pages of a thread no longer re-downloads it: the page being read comes from the web page, other pages from the cache, and only the last page is fetched again.
- The gallery opens on the first item of the page you are reading, or on the item you were viewing on that page.
- **Options → Reload this thread (ignore cache)**.
- Previous / next buttons on phones. On every screen they dim at the first and last item.

### Changed
- Reorganised toolbar: every tool now shows its name. On phones it uses two rows: counter, status and close on top, then a row of tools with the icon above the label.
- Distinct icons for Post, Source and Autoplay, so they are no longer confused with each other or with the video play button.
- "Slideshow" is renamed "Autoplay".
- Gentler loading to avoid overloading forums and getting blocked: one thread page at a time with a 1.2–1.8 s pause between pages, fewer simultaneous requests to image hosts, and the server's Retry-After is respected when rate-limited.

## [2.0.0] - 2026-11-24

First public release on Greasy Fork.

### Added
- Collects every image and video across all pages of a XenForo 1.x / 2.x thread into one gallery, in thread order.
- Three views: View (one item at a time with a filmstrip), Grid, and Scroll.
- Zoom by click, mouse wheel or pinch; drag to pan; swipe to navigate on phones.
- Finds the real file behind links: forum attachments, lazy-loaded and proxied images, direct file links, Chevereto hosts (including albums), Streamable, Imgur, YouTube, Vimeo, RedGifs, TikTok, plus any host added to the host list.
- Hides dead media (broken links, 404s, "removed" placeholders), works around hotlink protection, retries flaky loads once, and removes duplicates from quotes.
- Reels-style video player: slim progress bar by default; hover (desktop) or tap to pause (phone) to show poster info and controls.
- Poster label: Thread starter / Member tag in the top-left corner, plus avatar, name, date and post text.
- Automatic thumbnails for videos that have none (frame capture, oEmbed, RedGifs API, `og:image`).
- Autoplay, keyboard shortcuts (← → Space G I K M F Esc).
- English and Vietnamese interface, chosen from the browser language.

### Before 2.0.0 (unpublished)
Developed privately as "XenForo Album" (1.0 – 1.8). Settings from that script are not carried over.
