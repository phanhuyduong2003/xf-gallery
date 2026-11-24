  // The innermost quote a media element sits in, as { author, postId, url, text } (any may be empty), or null.
  // XF 2: blockquote.bbCodeBlock--quote[data-quote][data-source="post: 123"]; XF 1: .bbCodeQuote[data-author]
  // with an .AttributionLink. Media quoted from an earlier post is credited to that post (see addItem).
  const QUOTE_SEL = '.bbCodeBlock--quote, .bbCodeQuote';
  function quoteOf(node, root, base) {
    const q = node && node.closest(QUOTE_SEL);
    if (!q || !root.contains(q)) return null;
    const src = (q.getAttribute('data-source') || '').match(/post:\s*(\d+)/);
    const jump = q.querySelector('.bbCodeBlock-sourceJump[href], .AttributionLink[href]');
    const jumpUrl = jump && abs(jump.getAttribute('href'), base);
    const jm = jumpUrl && jumpUrl.href.match(/(?:goto\/post\?id=|posts\/)(\d+)/);
    const content = q.querySelector('.bbCodeBlock-expandContent, .bbCodeBlock-content, .quote');
    return {
      author: (q.getAttribute('data-quote') || q.getAttribute('data-author') || '').trim() || null,
      postId: (src && src[1]) || (jm && jm[1]) || null,
      url: jumpUrl ? jumpUrl.href : null,
      text: content ? cleanText(content.cloneNode(true)).slice(0, 1000) : '',
    };
  }

  // Media of one post, in document order. Each unit is spec[] or a Promise (see resolveLink).
  function extractPost(post, base) {
    const roots = [post.querySelector(BODY_SEL), post.querySelector('.message-attachments, .attachedFiles')].filter(Boolean);
    const units = [];
    const anchors = [];      // the element each unit came from (used to find the text next to it)
    const quotes = [];       // the quote each unit sits in (null: the post's own media)
    const consumed = new Set();
    let curRoot = null;
    const push = (res, anchor) => { if (res) { units.push(res); anchors.push(anchor); quotes.push(quoteOf(anchor, curRoot, base)); } };
    const SEL = 'img, video, iframe, a[href], blockquote.imgur-embed-pub, [data-media-site-id][data-media-key], [data-s9e-mediaembed-iframe]';

    for (const root of roots) {
      curRoot = root;
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
    return { units, anchors, quotes };
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

