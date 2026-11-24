  // ---------------------------------------------------------------------------
  // Views
  // ---------------------------------------------------------------------------
  function setView(v) {
    const rebuild = (v === 'list') !== (S.view === 'list');
    S.view = v;
    store.set('view', v);
    if (rebuild) S.items.forEach(replaceTile);
    applyView();
  }

  function applyView() {
    const v = S.view;
    ui.viewer.hidden = v !== 'viewer';
    ui.scroll.hidden = v === 'viewer';
    ui.grid.classList.toggle('xtg-list', v === 'list');
    ui.root.querySelectorAll('[data-view]').forEach((b) => b.classList.toggle('on', b.getAttribute('data-view') === v));
    ui.playBtn.hidden = v !== 'viewer';
    if (v === 'viewer') {
      renderStage();
    } else {
      clearTimeout(S.slideTimer); // autoplay resumes when coming back to View
      ui.stage.querySelectorAll('video').forEach((x) => x.pause());
      if (S.cur && S.cur.el) S.cur.el.scrollIntoView({ block: 'center' });
    }
    scheduleStatus();
  }

