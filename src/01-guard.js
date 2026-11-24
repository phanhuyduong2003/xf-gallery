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

