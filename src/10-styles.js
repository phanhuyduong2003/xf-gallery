  const CSS = `
.xtg-i{display:block;flex:0 0 auto}
#xtg-fab{position:fixed;right:16px;bottom:16px;z-index:2147483000;padding:10px 16px;display:inline-flex;align-items:center;gap:7px;border:0;border-radius:999px;
  background:#1f6feb;color:#fff;font:600 14px/1 system-ui,sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.35);cursor:pointer}
#xtg-fab:hover{background:#2b7bff}
#xtg-root{position:fixed;inset:0;z-index:2147483001;display:flex;align-items:center;justify-content:center;
  background:rgba(8,9,11,.8);backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);
  font:14px/1.4 system-ui,sans-serif;color:#e8e8ea;opacity:0;transition:opacity .18s}
#xtg-root.xtg-open{opacity:1}
#xtg-root[hidden]{display:none}
#xtg-root *{box-sizing:border-box}
.xtg-modal{position:relative;width:min(1500px,calc(100vw - 48px));height:calc(100vh - 48px);background:#121317;border-radius:12px;
  box-shadow:0 24px 70px rgba(0,0,0,.6);display:flex;flex-direction:column;overflow:hidden;transform:scale(.97);transition:transform .18s}
.xtg-open .xtg-modal{transform:none}
.xtg-top{position:relative;display:flex;align-items:center;gap:4px 8px;padding:7px 8px 7px 16px;border-bottom:1px solid #24262c;flex-wrap:wrap}
.xtg-head{display:flex;align-items:center;gap:12px;flex:1 1 0;min-width:0}
.xtg-titleblock{display:flex;flex-direction:column;justify-content:center;min-width:0;line-height:1.25}
.xtg-meta{display:flex;align-items:center;gap:6px;min-width:0;font-size:11.5px;color:#8b9097;white-space:nowrap}
.xtg-meta:empty{display:none}
.xtg-pageinfo:not(:empty) + .xtg-status:not(:empty)::before{content:'·';margin-right:6px}
.xtg-stoplink{flex:0 0 auto;padding:0;border:0;background:none;color:#8fb8ff;font:600 11.5px system-ui,sans-serif;cursor:pointer}
.xtg-stoplink:hover{text-decoration:underline}
.xtg-stoplink[hidden]{display:none}
.xtg-filterwrap{position:relative;flex:0 0 auto}
.xtg-fbtn{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 8px 0 10px;border:1px solid #2c2f36;border-radius:8px;
  background:#1b1d22;color:#d6d9de;font:12.5px system-ui,sans-serif;cursor:pointer;white-space:nowrap}
.xtg-fbtn:hover{border-color:#3a3e46;color:#fff}
.xtg-fbtn.on{border-color:#1f6feb;color:#fff}
.xtg-fbtn b{font-weight:600;font-variant-numeric:tabular-nums;color:#fff}
.xtg-fmenu{position:absolute;top:calc(100% + 4px);left:0;z-index:6;min-width:180px;padding:5px;background:#1b1d22;border:1px solid #2c2f36;
  border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,.5)}
.xtg-fmenu[hidden]{display:none}
.xtg-fmenu button{display:flex;align-items:center;gap:9px;width:100%;padding:8px 10px;border:0;border-radius:6px;background:none;
  color:#e0e3e7;font:13px system-ui,sans-serif;cursor:pointer;text-align:left}
.xtg-fmenu button:hover{background:#262930}
.xtg-fmenu button span{flex:1}
.xtg-fmenu button b{font-weight:600;color:#9aa0a8;font-variant-numeric:tabular-nums}
.xtg-fmenu button.on{color:#7fb0ff}
.xtg-fmenu button.on b{color:#7fb0ff}
.xtg-tools{display:flex;align-items:center;gap:2px}
.xtg-sep{width:1px;height:20px;background:#2a2d33;margin:0 4px}
.xtg-short{display:none}
.xtg-counter{font-size:15px;font-weight:700;font-variant-numeric:tabular-nums;white-space:nowrap}
.xtg-pageinfo{flex:0 0 auto;color:#c4c8ce}
.xtg-pageinfo:empty{display:none}
.xtg-f-image [data-kind="video"],.xtg-f-video [data-kind="image"]{display:none}
.xtg-pdiv{flex:0 0 auto;align-self:center;padding:2px 6px 2px 8px;margin-left:2px;border-left:1px solid #33363d;
  font-size:11px;color:#9aa0a8;white-space:nowrap}
.xtg-gap{flex:0 0 auto;align-self:stretch;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:2px;
  padding:0 10px;margin:0 2px;border:1px dashed #3a3e47;border-radius:8px;background:none;color:#9aa0a8;font:inherit;font-size:11px;
  line-height:1.25;white-space:nowrap;cursor:pointer}
.xtg-gap:hover{border-color:#5b8cff;color:#e6e8eb}
.xtg-gap[data-kind="failed"]{border-color:#7a5230;color:#f0b37e}
.xtg-gap[data-kind="loading"]{cursor:default;opacity:.75}
.xtg-grid .xtg-gap{grid-column:1/-1;flex-direction:row;gap:8px;padding:14px;margin:4px 0;font-size:13px;width:100%;max-width:960px}
.xtg-mtitle{padding:8px 10px 2px;font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:#8b9099;border-top:1px solid #2c2f36;margin-top:4px}
.xtg-vb.xtg-q{width:auto;padding:0 8px;font-size:12px;font-weight:600;letter-spacing:.02em}
.xtg-pdiv:first-child{border-left:0;margin-left:0;padding-left:2px}
.xtg-status{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.xtg-grow{flex:1}
.xtg-ib{height:32px;min-width:32px;padding:0 9px;border:0;border-radius:7px;background:transparent;color:#d6d9de;
  font:13px system-ui,sans-serif;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:5px;text-decoration:none;white-space:nowrap}
.xtg-ib:hover{background:#25282e;color:#fff}
.xtg-ib.on{background:#1f6feb;color:#fff}
.xtg-ib[hidden]{display:none}
.xtg-seg{display:inline-flex;background:#1b1d22;border-radius:8px;padding:2px}
.xtg-seg .xtg-ib{height:28px}
.xtg-menu{position:absolute;right:8px;top:calc(100% + 4px);z-index:5;background:#1b1d22;border:1px solid #2c2f36;border-radius:10px;padding:6px;
  box-shadow:0 10px 30px rgba(0,0,0,.5);min-width:260px}
.xtg-menu[hidden]{display:none}
.xtg-menu label,.xtg-menu button{display:flex;align-items:center;gap:8px;width:100%;padding:8px 10px;border:0;border-radius:6px;background:none;
  color:#e0e3e7;font:13px system-ui,sans-serif;text-align:left;cursor:pointer}
.xtg-menu label:hover,.xtg-menu button:hover{background:#262930}
.xtg-body{flex:1;min-height:0;position:relative}
.xtg-viewer{position:absolute;inset:0;display:flex;flex-direction:column}
.xtg-viewer[hidden],.xtg-scroll[hidden]{display:none}
.xtg-stagebox{flex:1;min-height:0;position:relative;display:flex}
.xtg-stage{flex:1;min-width:0;min-height:0;padding:0 78px;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;
  user-select:none;-webkit-user-select:none;touch-action:none}
.xtg-stage>img{max-width:100%;max-height:100%;object-fit:contain;cursor:zoom-in;transition:transform .2s;will-change:transform}
.xtg-stage>img.zoomed{cursor:grab}
.xtg-stage>img.dragging{cursor:grabbing;transition:none}
.xtg-stage>video{max-width:100%;max-height:100%;background:#000;cursor:pointer}
.xtg-stage>iframe{width:min(100%,calc((100vh - 200px)*16/9));aspect-ratio:16/9;max-height:100%;border:0;background:#000}
.xtg-msg{color:#8b9097;text-align:center;padding:20px;line-height:1.8}
.xtg-msg a{color:#8fb8ff}
.xtg-nav{display:flex;align-items:center;justify-content:center;position:absolute;top:50%;transform:translateY(-50%);width:52px;height:52px;
  padding:0;border-radius:50%;border:1px solid rgba(255,255,255,.22);background:rgba(12,13,16,.72);color:#fff;cursor:pointer;z-index:4;
  box-shadow:0 2px 10px rgba(0,0,0,.45);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);transition:background .15s,transform .15s}
.xtg-nav:active{transform:translateY(-50%) scale(.94)}
.xtg-nav:hover{background:rgba(31,111,235,.9);border-color:transparent}
.xtg-nav:disabled{opacity:.3;pointer-events:none}
.xtg-prev{left:14px}.xtg-next{right:14px}
.xtg-prev .xtg-i{margin-right:2px}.xtg-next .xtg-i{margin-left:2px}
.xtg-stripbar{display:flex;align-items:center;border-top:1px solid #24262c;background:#0f1013}
.xtg-snav{display:none}
.xtg-edge{display:flex;align-items:center;justify-content:center;flex:0 0 40px;align-self:stretch;padding:0;border:0;
  background:none;color:#aeb3ba;cursor:pointer}
.xtg-edge:hover{color:#fff;background:#1b1d22}
.xtg-edge:disabled{opacity:.25;pointer-events:none}
.xtg-strip{position:relative;flex:1;min-width:0;display:flex;gap:6px;overflow-x:auto;padding:8px 10px;
  scrollbar-width:thin;scrollbar-color:#3a3d44 transparent;min-height:72px}
.xtg-th{flex:0 0 auto;width:72px;height:54px;border-radius:5px;overflow:hidden;cursor:pointer;position:relative;opacity:.5;
  outline:2px solid transparent;outline-offset:-2px;background:#1b1d21}
.xtg-th:hover{opacity:.85}
.xtg-strip{cursor:grab;user-select:none;-webkit-user-select:none}
.xtg-strip.xtg-dragging{cursor:grabbing;scroll-behavior:auto}
.xtg-strip.xtg-dragging .xtg-th{pointer-events:none}
.xtg-stage>img.xtg-preview{width:100%;height:100%;object-fit:contain;filter:blur(6px) brightness(.85)}
/* until the image/video has loaded, keep the poster info and the tag out of the way */
.xtg-stage.xtg-loading .xtg-reel-info,.xtg-stage.xtg-loading .xtg-corner{opacity:0;visibility:hidden}
.xtg-stage.xtg-loading .xtg-reel-img{pointer-events:none;background:transparent}
.xtg-slow{position:absolute;left:50%;top:calc(50% + 34px);transform:translateX(-50%);z-index:3;display:flex;flex-wrap:wrap;
  align-items:center;justify-content:center;gap:6px 12px;max-width:calc(100% - 24px);padding:8px 14px;border-radius:10px;
  background:rgba(12,13,16,.82);color:#d6d9de;font-size:13px;text-align:center}
.xtg-slow button{padding:4px 12px;border:0;border-radius:6px;background:#1f6feb;color:#fff;font:600 12.5px system-ui,sans-serif;cursor:pointer}
.xtg-slow a{color:#8fb8ff;text-decoration:none}
.xtg-stage.xtg-loading::after{content:'';position:absolute;left:50%;top:50%;width:38px;height:38px;margin:-19px 0 0 -19px;z-index:2;
  border:3px solid rgba(255,255,255,.25);border-top-color:#fff;border-radius:50%;animation:xtg-spin .8s linear infinite;pointer-events:none}
@keyframes xtg-spin{to{transform:rotate(360deg)}}
.xtg-th.on{opacity:1;outline-color:#1f6feb}
.xtg-th img,.xtg-th video{width:100%;height:100%;object-fit:cover;display:block;pointer-events:none}
.xtg-th span{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;text-shadow:0 1px 3px #000}
.xtg-scroll{position:absolute;inset:0;overflow:auto;scrollbar-color:#3a3d44 transparent;padding:12px 14px 30px}
.xtg-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:6px}
.xtg-tile{position:relative;aspect-ratio:1;background:#1b1d21;border-radius:5px;overflow:hidden;cursor:pointer}
.xtg-tile img,.xtg-tile video{width:100%;height:100%;object-fit:cover;display:block}
.xtg-badge{display:inline-flex;align-items:center;gap:4px;position:absolute;top:6px;left:6px;background:rgba(0,0,0,.7);color:#fff;
  border-radius:4px;padding:2px 6px;font-size:12px;pointer-events:none}
.xtg-ph{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;
  background:linear-gradient(135deg,#23262c,#1a1c20);color:#aeb3ba;font-size:13px;text-align:center;padding:8px;word-break:break-all}
.xtg-ph .xtg-i{color:#fff;opacity:.9}
.xtg-dead .xtg-ph{color:#c98a8a}
.xtg-dead .xtg-ph .xtg-i,.xtg-msg .xtg-i{color:#c98a8a;margin:0 auto 6px}
.xtg-cap{position:absolute;bottom:0;left:0;right:0;padding:3px 6px;font-size:11px;color:#ddd;
  background:linear-gradient(transparent,rgba(0,0,0,.75));opacity:0;transition:opacity .15s}
.xtg-cap a{color:#8fb8ff;margin-left:10px;text-decoration:none}
.xtg-tile:hover .xtg-cap{opacity:1}
.xtg-hide-dead .xtg-dead{display:none}
.xtg-grid.xtg-list{display:flex;flex-direction:column;align-items:center;gap:14px}
.xtg-list .xtg-tile{aspect-ratio:auto;width:100%;max-width:960px;cursor:default;background:none}
.xtg-list .xtg-tile img{height:auto;object-fit:contain;cursor:zoom-in;min-height:60px;background:#1b1d21}
.xtg-list .xtg-tile video{height:auto;max-height:80vh;object-fit:contain;background:#000}
.xtg-list .xtg-tile iframe{width:100%;aspect-ratio:16/9;border:0;background:#000;display:block}
.xtg-list .xtg-cap{position:static;opacity:1;background:none;color:#8b9097;padding:4px 0 0}
.xtg-list .xtg-dead .xtg-ph{height:70px}
.xtg-empty{color:#8b9097;text-align:center;padding:60px 0}
.xtg-banner{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;padding:9px 16px;background:#3a2a10;border-bottom:1px solid #5a4318;
  color:#f3e2bf;font-size:13px}
.xtg-banner[hidden]{display:none}
.xtg-banner span{flex:1 1 260px}
.xtg-banner button,.xtg-banner a{padding:5px 12px;border:0;border-radius:6px;background:#f0b542;color:#241a06;font:600 12.5px system-ui,sans-serif;
  text-decoration:none;cursor:pointer;white-space:nowrap}
.xtg-banner a{background:transparent;color:#f3e2bf;border:1px solid #8a6a2a}
.xtg-toast{position:absolute;left:50%;bottom:90px;transform:translateX(-50%);background:#2a2d33;color:#fff;padding:8px 14px;
  border-radius:8px;font-size:13px;z-index:6}

/* poster info + Reels-style controls */
.xtg-reel{position:absolute;z-index:3;pointer-events:none;padding:40px 14px 12px;color:#fff;transition:opacity .2s;
  background:linear-gradient(transparent,rgba(0,0,0,.14) 40%,rgba(0,0,0,.4));text-shadow:0 1px 3px rgba(0,0,0,.85),0 0 8px rgba(0,0,0,.45)}
.xtg-reel a,.xtg-reel button{pointer-events:auto}
.xtg-reel-vid{padding-bottom:0;background:linear-gradient(transparent 70%,rgba(0,0,0,.14));transition:background .25s}
.xtg-show .xtg-reel-vid{background:linear-gradient(transparent,rgba(0,0,0,.14) 40%,rgba(0,0,0,.4))}
.xtg-reel-info,.xtg-vrow{transition:opacity .25s}
.xtg-reel-img{background:transparent;transition:background .25s}
.xtg-show .xtg-reel-img{background:linear-gradient(transparent,rgba(0,0,0,.14) 40%,rgba(0,0,0,.4))}
.xtg-reel-img .xtg-reel-info{opacity:0}
.xtg-show .xtg-reel-img .xtg-reel-info{opacity:1}
.xtg-stage:not(.xtg-show) .xtg-reel-img:not(.xtg-touchinfo) *{pointer-events:none}
.xtg-reel-img.xtg-touchinfo{pointer-events:auto;padding-top:28px;background:linear-gradient(transparent,rgba(0,0,0,.18) 35%,rgba(0,0,0,.5))}
.xtg-reel-img.xtg-touchinfo .xtg-reel-info{opacity:1}
.xtg-compact .xtg-av{width:26px;height:26px;border-width:1.5px}
.xtg-compact .xtg-av-txt{font-size:13px}
.xtg-compact .xtg-name{font-size:14px}
.xtg-compact .xtg-text{margin-top:4px;font-size:13px;-webkit-line-clamp:1}
.xtg-compact .xtg-btns,.xtg-compact .xtg-date,.xtg-compact .xtg-text.xtg-full-text{display:none}
.xtg-btns{display:flex;gap:14px;margin-top:2px}
.xtg-text.xtg-full-text{display:none}
.xtg-showfull .xtg-text.xtg-cap-text{display:none}
.xtg-showfull .xtg-text.xtg-full-text{display:block;-webkit-line-clamp:unset;max-height:40vh;overflow:auto;pointer-events:auto}
.xtg-reel-vid .xtg-reel-info,.xtg-reel-vid .xtg-vrow{opacity:0}
.xtg-show .xtg-reel-vid .xtg-reel-info,.xtg-show .xtg-reel-vid .xtg-vrow{opacity:1}
.xtg-stage:not(.xtg-show) .xtg-reel-vid *{pointer-events:none}
.xtg-stage.zoomed .xtg-reel,.xtg-stage.zoomed .xtg-corner{opacity:0;visibility:hidden}
.xtg-corner{position:absolute;z-index:3;pointer-events:none;top:10px;left:10px;transition:opacity .2s}
.xtg-corner .xtg-tag{display:inline-block;font-size:12px;padding:4px 10px;background:rgba(0,0,0,.55);
  backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);box-shadow:0 1px 4px rgba(0,0,0,.35)}
.xtg-corner .xtg-tag-op{background:#1f6feb}
.xtg-vbar{pointer-events:auto;margin:4px -10px 0}
.xtg-vrow{display:flex;align-items:center;gap:2px;height:34px}
.xtg-vb{width:34px;height:32px;border:0;border-radius:6px;background:none;color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0}
.xtg-vb:hover{background:rgba(255,255,255,.16)}
.xtg-time{font-size:12px;font-variant-numeric:tabular-nums;color:rgba(255,255,255,.9);margin-left:4px;white-space:nowrap}
.xtg-prog{height:14px;display:flex;align-items:center;cursor:pointer;touch-action:none;padding:0 8px}
.xtg-track{position:relative;flex:1;height:3px;background:rgba(255,255,255,.25);border-radius:2px;transition:height .15s}
.xtg-prog:hover .xtg-track,.xtg-prog.seeking .xtg-track{height:5px}
.xtg-buf,.xtg-played{position:absolute;left:0;top:0;bottom:0;width:0;border-radius:2px}
.xtg-buf{background:rgba(255,255,255,.35)}
.xtg-played{background:#fff}
.xtg-played::after{content:'';position:absolute;right:-6px;top:50%;width:12px;height:12px;margin-top:-6px;border-radius:50%;background:#fff;
  transform:scale(0);transition:transform .15s}
.xtg-show .xtg-prog:hover .xtg-played::after,.xtg-show .xtg-prog.seeking .xtg-played::after{transform:scale(1)}
.xtg-bigplay{position:absolute;left:50%;top:50%;width:68px;height:68px;margin:-34px 0 0 -34px;border-radius:50%;background:rgba(0,0,0,.5);
  color:#fff;display:flex;align-items:center;justify-content:center;pointer-events:none;opacity:0;transition:opacity .2s;z-index:2}
.xtg-paused .xtg-bigplay{opacity:1}
.xtg-embed{display:flex;flex-direction:column;width:min(100%,calc((100vh - 360px)*16/9));min-width:min(100%,420px);max-height:100%}
.xtg-embed iframe{width:100%;aspect-ratio:16/9;border:0;background:#000;flex:0 1 auto;min-height:0}
.xtg-embed .xtg-post{max-width:none;border-radius:0 0 8px 8px;flex:0 0 auto}
.xtg-embed .xtg-expanded .xtg-text{max-height:22vh}
.xtg-who{display:flex;align-items:center;gap:10px;min-width:0}
.xtg-av{width:36px;height:36px;border-radius:50%;object-fit:cover;flex:0 0 auto;border:2px solid rgba(255,255,255,.85);background:#333}
.xtg-av-txt{display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px;color:#fff;text-shadow:none}
.xtg-line{display:flex;align-items:center;flex-wrap:wrap;gap:4px 8px;min-width:0}
.xtg-name{font-weight:700;font-size:15px;color:#fff !important;text-decoration:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%}
a.xtg-name:hover{text-decoration:underline}
.xtg-tag{font-size:11.5px;font-weight:600;padding:2px 8px;border-radius:999px;background:rgba(255,255,255,.2);color:#fff;text-shadow:none;white-space:nowrap}
.xtg-tag-op{background:#1f6feb}
.xtg-date{font-size:12px;color:rgba(255,255,255,.75)}
.xtg-text{margin-top:8px;font-size:14px;line-height:1.45;white-space:pre-line;word-break:break-word;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.xtg-expanded .xtg-text{display:block;-webkit-line-clamp:unset;max-height:40vh;overflow:auto;pointer-events:auto}
.xtg-more,.xtg-full{margin-top:2px;padding:0;border:0;background:none;color:rgba(255,255,255,.85);font:600 13px system-ui,sans-serif;cursor:pointer}
.xtg-more:hover,.xtg-full:hover{color:#fff;text-decoration:underline}
.xtg-post{width:100%;max-width:960px;padding:10px 12px;background:#1a1c21;border-radius:8px 8px 0 0;color:#e8e8ea}
.xtg-post .xtg-av{border-color:#3a3d44}
.xtg-post .xtg-text{text-shadow:none}
@media (max-width:960px){
  /* narrower windows and phones: row 1 = counter + meta, filter, close; row 2 = labelled tools, icon above label */
  .xtg-top{padding:4px 4px 0 12px;gap:0}
  .xtg-head{order:1;min-height:46px;gap:10px}
  .xtg-close{order:2;width:40px;height:40px}
  .xtg-fbtn{height:32px}
  .xtg-fmenu{left:auto;right:0}
  .xtg-tools{order:3;flex:1 0 100%;margin:0 -4px 0 -12px;padding:4px 4px 6px;gap:0;border-top:1px solid #24262c;
    overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch}
  .xtg-tools::-webkit-scrollbar{display:none}
  .xtg-seg{display:contents}
  .xtg-tools .xtg-ib{flex:1 0 auto;min-width:50px;height:auto;flex-direction:column;gap:3px;padding:6px 4px;font-size:10.5px;line-height:1.1}
  .xtg-tools .xtg-ib.on{background:rgba(31,111,235,.18);color:#7fb0ff}
  .xtg-sep{height:30px;margin:0 2px;flex:0 0 1px}
}
@media (max-width:700px){
  .xtg-modal{width:100vw;height:100vh;height:100dvh;border-radius:0}
  .xtg-grid{grid-template-columns:repeat(auto-fill,minmax(105px,1fr))}
  /* phones: prev/next sit at both ends of the filmstrip, so nothing covers the media */
  .xtg-nav{display:none}
  .xtg-stage{padding:0}
  .xtg-edge{flex-basis:34px}
  .xtg-snav{display:flex;align-items:center;justify-content:center;flex:0 0 40px;align-self:stretch;padding:0;border:0;
    background:none;color:#e8e8ea;cursor:pointer}
  .xtg-snav:active{background:#1b1d22}
  .xtg-snav:disabled{opacity:.25;pointer-events:none}
  .xtg-strip{padding:8px 2px}
  .xtg-long{display:none}
  .xtg-short{display:inline}
  .xtg-menu{left:8px;right:8px;min-width:0}
}`;

