# Changelog

Tiếng Việt: [CHANGELOG.vi.md](CHANGELOG.vi.md)

All notable changes to **XenForo Thread Gallery** are listed here, newest first.

**When releasing an update:**
1. Move the items from *Unreleased* into a new version section with today's date.
2. Bump `@version` in `xenforo-thread-gallery.user.js` to the same number.
3. Commit with a one-line summary of that version's items (see [CONTRIBUTING.md](CONTRIBUTING.md)) and push to `main`. Greasy Fork syncs the code and shows the commit message as the changelog.

Commit messages and the full release steps: [CONTRIBUTING.md](CONTRIBUTING.md).

Version numbers: `2.0.1` for fixes, `2.1.0` for new features, `3.0.0` for big changes that break old behaviour or settings.

## [Unreleased]

### Added
-

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
