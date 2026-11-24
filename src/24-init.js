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
