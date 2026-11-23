# XenForo Thread Gallery

Tiếng Việt: [README.vi.md](README.vi.md) · Author: Dylan Phan · License: [MIT](LICENSE)

This userscript collects every image and video across all pages of a XenForo thread into one seamless gallery. The interface switches between English and Vietnamese automatically, based on the browser language.

## Publishing on Greasy Fork

1. Sign in to [greasyfork.org](https://greasyfork.org) → your account name → **Post a script**.
2. *Code*: paste the whole of `xenforo-thread-gallery.user.js`. The name, descriptions (English + Vietnamese), MIT license and icon are already in the script header.
3. *Additional info*: paste the contents of `GREASYFORK.md` (English) and choose the Markdown format. Then add a localized additional info for **Tiếng Việt (vi)** and paste `GREASYFORK.vi.md` into it, so Vietnamese visitors see the Vietnamese description.
4. Click **Post script**.

### Syncing from GitHub

Source code: <https://github.com/phanhuyduong2003/xf-gallery>. Greasy Fork can pull both the code and the description from this repository, so updates need no manual pasting.

On Greasy Fork → the script → **Admin**:

1. **Code sync**: set the URL to `https://raw.githubusercontent.com/phanhuyduong2003/xf-gallery/main/xenforo-thread-gallery.user.js` and choose **Automatic**.
2. **Additional info (default language)**: choose Markdown and sync from `https://raw.githubusercontent.com/phanhuyduong2003/xf-gallery/main/GREASYFORK.md`.
3. **Add localized additional info** → **Tiếng Việt (vi)**, sync from `https://raw.githubusercontent.com/phanhuyduong2003/xf-gallery/main/GREASYFORK.vi.md`.
4. **Default language**: English.
5. Open [Set up webhook](https://greasyfork.org/users/webhook-info) and copy the *Payload URL* and *Secret*. On GitHub → the repository → **Settings → Webhooks → Add webhook**: paste both, content type `application/json`, event **Just the push event**. Greasy Fork then updates as soon as you push, instead of on its periodic check.

**Releasing an update:** record each change in [CHANGELOG.md](CHANGELOG.md) under *Unreleased*. When releasing, move those items into a new version section, bump `@version` to the same number (e.g. `2.0.1`), and commit with a one-line summary as described in [CONTRIBUTING.md](CONTRIBUTING.md). Push to `main`: Greasy Fork picks up the new code and uses the commit message as the changelog.

If the old "XenForo Album" script is installed, remove it first, otherwise there will be two Album buttons. Its settings (view mode, image host list) are not carried over.

## Installation

1. Install a userscript manager:
   - Chrome / Edge / Brave (Chromium): **Tampermonkey** or **Violentmonkey**.
     On recent Chrome versions, Tampermonkey also needs *Allow User Scripts* (or *Developer mode*) enabled on the extensions page.
   - Firefox: **Violentmonkey** or **Tampermonkey**.
2. Install from the script's Greasy Fork page (**Install** button), or open the manager's dashboard → *Create a new script* → paste the whole of `xenforo-thread-gallery.user.js` → Save.
3. Open a thread on the forum. An **Album** button appears in the bottom-right corner.

If the button does not appear (the forum's URLs do not contain `threads`), add a `// @match` line for the forum's domain to the script header, for example:

```
// @match        https://your-forum.example/*
```

### Allowing cross-origin requests (all domains)

To fetch images from hosts, read viewer pages and find video thumbnails, the script requests other domains. The first time it does, Tampermonkey shows a dialog titled **"A userscript wants to access a cross-origin resource"**. To stop it from asking for every new host:

- **Option 1, from the dialog:** click **Always allow all domains**. This button is available because the script declares `@connect *`. Tampermonkey will no longer ask for any domain.
- **Option 2, from the settings** (if you already chose a different button, or want to set it up beforehand):
  1. Open the Tampermonkey dashboard → click the script's name → the **Settings** tab.
  2. In the **XHR Security** section, find **User domain whitelist**.
  3. Add a line containing just `*`, then click **Save**.

If you only clicked **Allow once** or **Always allow domain**, the dialog will appear again for other hosts. Choose **Always allow all domains** next time, or use option 2.

Violentmonkey does not show this dialog: scripts that declare `@connect *` may connect to any domain.

## Usage

Click **Album** to open the gallery as a modal on top of the page (the forum stays dimmed behind it). The script reads every page of the thread (one page at a time, pausing about 1–2 seconds between pages so the forum is not overloaded) and adds images and videos in thread order as they load. Clicking images and videos inside posts keeps the forum's normal behaviour.

The modal has 3 views:

- **View** (default): a large item in the middle, with a filmstrip below to jump to any other item.
  - Navigate: ← → keys, the ‹ › buttons (beside the media on desktop, at both ends of the filmstrip on phones, so they never cover it), or a horizontal swipe on phones.
  - Zoom: left-click the image (click again to zoom out), use the mouse wheel, or pinch. Drag to pan while zoomed. Right-click still opens the normal context menu (save image, copy…) and does not zoom.
  - **Autoplay** (Space), **on by default**: images advance every 3.5 seconds; videos advance when they end. The button shows ▶ when off and a pause icon when on; your choice is remembered.
  - **Videos** use Reels-style controls along the bottom edge of the video, right below the poster info: play/pause, time, mute, fullscreen and a slim progress bar (click or drag to seek).
    - Click the video to play/pause, double-click for fullscreen. Shortcuts: **K** play/pause, **M** mute, **F** fullscreen.
    - By default only a slim time bar is shown along the bottom edge, so the video is not covered.
    - **Desktop:** hover the video to show the poster info and controls; they hide as soon as the mouse leaves the video.
    - **Phone:** tap the video to pause and reveal the info, controls and seeking; tap again to resume and collapse them. While playing, the time bar is display-only (prevents accidental seeks).
    - The mute choice is remembered.
  - **Embedded players** (YouTube, embedded Streamable…) have their own controls that the script cannot change, so the poster info is shown as a card below the player instead of on top of it.
- **Grid** (G key): every thumbnail at once; click one to open it in View.
- **Scroll**: full-size media stacked vertically; videos play inline.

The view is remembered. Other controls:

- **Post ↗ / Source ↗**: open the post that contains the current item, or the item's original link.
- **Stop**: stop loading a very long thread midway. Only shown while loading.
- **Poster info (Reels-style)**, on both images and videos:
  - The top-left corner always shows a **Thread starter** (blue) or **Member** tag.
  - The bottom overlay shows the poster's avatar, name, post date, the item's position in its post ("2 of 5 in this post") and its text (2 lines, *Show more* reads it all). It sits on a light overlay so the media is not covered much.
  - **Videos:** the info appears together with the controls (see above).
  - **Images, desktop:** the info appears while the mouse is over the image and hides when it leaves.
  - **Images, phone:** a compact line (name + one line of text) is always shown; tap it to expand.
  - **Posts with several images/videos:** each item shows the text right next to it instead of the whole post. If the post starts with text, captions are taken to sit above their item (items without their own text share the caption above); if it starts with an image and ends with text, captions are taken to sit below. *Whole post* shows the full post text. Posts with a single item show the whole post.
  - Quotes, bare links and the text of media links are removed from the text.
  - Press **I** to toggle the info for the kind being viewed (images or videos). While an image is zoomed, the tag and the info hide.
  - In Scroll view the info is a card above the item; in Grid view the poster's name appears on video tiles.
  - The thread starter is taken from the thread header, or from the author of the first post on page 1.
- **Options** (the two-sliders icon):
  - *Show info on videos* / *Show info on images*: two separate switches, both on by default.
  - *Show broken items*: deleted images/videos are hidden by default; turn this on to see them in Grid / Scroll and open their source links.
  - *Edit image host list*: domains whose links point to a *viewer page* rather than the file. The script opens that page in the background to find the real file. An entry without a dot (e.g. `zpic`) matches any domain containing that text. Add new hosts here when you come across them.
  - *Reload this thread (ignore cache)*: fetch every page and link again, for when older posts were edited or removed.
- Close the modal with the ✕ button, the Esc key, or by clicking the dark area outside it. Reopening returns to where you were without reloading.

Settings (view, mute, label options, host list) are stored per forum.

### Cache and moving between pages

Moving from page 1 to page 2 of a thread reloads the whole web page, so the script starts again. To avoid re-downloading the thread every time, it keeps a cache in the browser (IndexedDB, on your computer only):

| Data | Kept for |
|---|---|
| Media and poster info of each thread page | 12 hours |
| What an image-host link resolved to | 7 days (broken links: 1 day) |
| Video thumbnails found by the script | 7 days |
| The item you were viewing | 12 hours |

When you open the gallery:

- The page you are reading is read straight from the web page: no request, always up to date.
- Other pages come from the cache when it is recent enough; the status shows how many ("3 pages from cache").
- The last page is always fetched again, because new posts land there. New pages are fetched too.
- Only links that are not in the cache are looked up on image hosts.
- The gallery opens on the **first item of the page you are reading**. If you were viewing an item on that page earlier, it opens on that item instead.

The cache keeps the 30 most recently viewed threads and clears expired entries once a day. Use *Reload this thread* in **Options** to refresh everything.

## What the script recognises

| Type | Handling |
|---|---|
| Images/videos uploaded to the forum (`/attachments/`) | Uses the full-size file instead of the thumbnail |
| Embedded `[IMG]`, lazy-loaded images, images through the forum's proxy | Uses the original link, falling back to the proxied copy (which sometimes survives after the original is deleted) |
| Direct links to `.jpg .png .gif .webp .mp4 .webm …` | Shown directly |
| anh.moe, ibb.co, zpic… (Chevereto) | Opens the page to get the original image, strips the `.md` / `.th` suffix for full size; album links collect the whole album |
| Streamable | Gets the MP4 through the API (detects deleted videos); falls back to the embedded player |
| Imgur, YouTube, Vimeo, RedGifs, TikTok | Direct image or embedded player |
| Other hosts in the list | Reads the page's `og:image` / `og:video` tags |

### Video thumbnails

For videos without a thumbnail, the script tries the following in order and updates the tile as soon as one works:

1. Direct video files (`.mp4`, `.webm`…): capture a frame at around 1.5 seconds. Only possible when the video is on the forum itself or the video server allows it (CORS).
2. Vimeo, Streamable, TikTok: ask oEmbed for the thumbnail. RedGifs: ask the RedGifs API.
3. Other hosts: read the source page's `og:image` tag.
4. If all of the above fail: the tile shows the frame at 1 second instead of the (often black) first frame.

If an existing thumbnail is broken, the script also runs these steps.

Duplicate images (from quotes) appear only once. Hotlink-protected images are re-downloaded through the userscript manager. Broken images and "removed" placeholders are marked as broken.

Images that fail to load are retried once after 2 seconds before being marked broken, to avoid false positives from a flaky connection.

Icons come from [Lucide](https://lucide.dev) (ISC license) and are inlined as SVG, so nothing extra is loaded from outside.

## Limitations

- Media deleted from its host cannot be recovered; it is only hidden.
- For embedded players (YouTube…), the script cannot tell whether the video still exists.
- Hosts behind a captcha / Cloudflare challenge are reported as failed to load; click **Source ↗** to open them manually.

## Support

XenForo Thread Gallery is free and open source, made by Dylan Phan. If it saves you some scrolling, you can buy me a coffee on Ko-fi. It helps me keep improving it.

[![Support me on Ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/dylanphan)
