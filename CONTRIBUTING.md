# Contributing

Tiếng Việt: [CONTRIBUTING.vi.md](CONTRIBUTING.vi.md)

## Commit messages

This project follows [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/). Structured messages keep the history readable, map directly to version numbers and to [CHANGELOG.md](CHANGELOG.md), and matter here for one more reason: **when Greasy Fork syncs from GitHub, the commit message becomes the public changelog** of that version.

### Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

Example:

```
fix(video): keep the corner tag in place while zooming

The tag was positioned from getBoundingClientRect, which includes the
zoom transform. Use offsetLeft/offsetTop instead.

Closes #12
```

### Type

| Type | Use for | Version bump | CHANGELOG section |
|---|---|---|---|
| `feat` | A new feature users can see | minor (`2.1.0`) | Added |
| `fix` | A bug fix | patch (`2.0.1`) | Fixed |
| `perf` | Faster or lighter, same behaviour | patch | Changed |
| `refactor` | Code restructuring, no behaviour change | none | (not listed) |
| `style` | Formatting only (spaces, semicolons), not CSS changes | none | (not listed) |
| `docs` | README, CHANGELOG, GREASYFORK, comments | none | (not listed) |
| `build` | Script header / metadata (`@match`, `@connect`, `@grant`…) | patch if users are affected | Changed |
| `ci` | GitHub Actions, webhooks | none | (not listed) |
| `chore` | Maintenance that fits nowhere else, releases | none | (not listed) |
| `revert` | Undo an earlier commit | depends | depends |

A visual change to the gallery UI (CSS) is a `feat` or `fix`, not `style`.

### Scope

Optional, but preferred. It names the part of the script that changed:

| Scope | Area |
|---|---|
| `viewer` | One-at-a-time view, filmstrip, zoom, swipe |
| `grid` | Grid view |
| `scroll` | Vertical scroll view |
| `video` | Reels-style player, controls |
| `label` | Poster info, Thread starter / Member tag |
| `resolve` | Turning links into media (hosts, Chevereto, Streamable, Imgur…) |
| `thumb` | Video thumbnails |
| `loader` | Fetching thread pages, de-duplication, dead media |
| `slideshow` | Slideshow |
| `i18n` | English / Vietnamese strings |
| `ui` | Toolbar, modal, options menu, shared styles |
| `meta` | Userscript header |
| `release` | Release commits |

### Subject

- English, imperative mood: "add", "fix", "remove", not "added" / "fixes".
- Lowercase first letter, no period at the end.
- At most 72 characters including the type and scope.
- Say what changes for the user when possible: `fix(label): hide the tag while an image is zoomed` rather than `fix(label): toggle class`.

### Body (optional)

- Separate from the subject with one blank line, wrap at 72 characters.
- Explain *why* and *what*, not *how*. The code shows how.

### Footer (optional)

- `Closes #12` / `Refs #12` to link issues.
- `BREAKING CHANGE: <what breaks and how to adapt>` for changes that break old behaviour or settings. You can also add `!` after the type: `feat(ui)!: store settings in GM storage`. A breaking change bumps the major version (`3.0.0`).

## Releasing

1. Make sure every user-facing commit since the last release is listed under *Unreleased* in `CHANGELOG.md` and `CHANGELOG.vi.md`.
2. Move those items into a new version section with today's date, and bump `@version` in `xenforo-thread-gallery.user.js`:
   - any `BREAKING CHANGE` → major
   - otherwise any `feat` → minor
   - otherwise → patch
3. Commit the version bump as the **release commit**. Because Greasy Fork shows the commit message as the changelog, put the user-facing summary in the subject:

   ```
   chore(release): 2.1.0 - add grid size option; fix video seek on iOS
   ```

   Keep it on one line: Greasy Fork drops line breaks from commit messages.
4. Push. With the webhook set up, Greasy Fork picks up the new version automatically.

Pushes that don't touch `xenforo-thread-gallery.user.js` (e.g. `docs`, `ci`) give Greasy Fork nothing new to sync. Once sync is on, any push that changes the script file is picked up, so bundle code changes and the version bump into the same push rather than pushing half-finished work to `main`.
