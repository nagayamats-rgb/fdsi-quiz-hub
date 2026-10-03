/* ws-film-diag.js — 「あなたに合うフィルム診断」（記事に埋め込む小さな診断・2026-10-04）
   使い方: <div id="ws-film-diag"></div> を置いて、このファイルを読み込むだけ。
   商品URLは 2026-09-28 の実在確認済み台帳の値。推測で作らない。 */
(function () {
  'use strict';
  var root = document.getElementById('ws-film-diag');
  if (!root || root.getAttribute('data-ready')) return;
  root.setAttribute('data-ready', '1');
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SRC = root.getAttribute('data-src') || 'blog';
  var U = 'utm_source=worldselect_' + SRC + '&utm_medium=film_diag&utm_campaign=film_diag&utm_content=';
  var R = 'https://item.rakuten.co.jp/world11select/', Y = 'https://store.shopping.yahoo.co.jp/world1select/';

  var P = {
    ag:   {n:'iPhone さらさらアンチグレアフィルム', r:R+'iphone12-antiglare/', y:Y+'ws-iphone12glassfilm-antiglare-1.html'},
    agset:{n:'iPhone アンチグレアフィルム ＋ 2in1 充電ケーブル セット', r:R+'set-film-2in1-06/', y:Y+'set-film-2in1-06.html'},
    blue: {n:'iPhone ブルーライトカットフィルム', r:R+'iphone12-antiblue/', y:Y+'ws-iphone12glassfilm-antibluelight-1.html'},
    ipad: {n:'iPad アンチグレアフィルム', r:R+'ipad-antiglare/', y:Y+'ipad-antiglare.html'},
    mbag: {n:'MacBook Pro 16インチ アンチグレアフィルム', r:R+'mb-antiglare/', y:Y+'mb-antiglare.html'},
    mbcl: {n:'MacBook 保護フィルム（クリア・光沢）', r:R+'macbook-film/', y:Y+'macbook-film.html'},
    aw:   {n:'Apple Watch 保護フィルム（高透明・自己修復）', r:R+'aw-film/', y:Y+'aw-film.html'},
    sw:   {n:'Nintendo Switch 有機EL 保護フィルム（9H・高透明）', r:R+'ws-switch-galas-film/', y:Y+'ws-switch-galas-film.html'}
  };

  var Q1 = {t:'スマホやタブレットを見ていて、いちばん「うっ」となるのは？', o:[
    {k:'glare', e:'☀️', x:'外や窓ぎわで画面が見えない・指紋がベタベタ'},
    {k:'game',  e:'🎮', x:'ゲーム中に指がひっかかる'},
    {k:'eye',   e:'🌙', x:'夜に見ていると目がしょぼしょぼする'},
    {k:'peep',  e:'🚃', x:'電車でとなりの人の視線が気になる'},
    {k:'photo', e:'📷', x:'写真や動画をとにかくキレイに見たい'}
  ]};
  var Q2 = {t:'使っているのはどれ？', o:[
    {k:'iphone', e:'📱', x:'iPhone'}, {k:'ipad', e:'📲', x:'iPad'}, {k:'mac', e:'💻', x:'MacBook'},
    {k:'watch', e:'⌚', x:'Apple Watch'}, {k:'switch', e:'🕹️', x:'Nintendo Switch（有機EL）'}
  ]};
  var Q3 = {t:'ついでに…充電ケーブル、ボロボロになっていない？', o:[
    {k:'yes', e:'😅', x:'じつはボロボロ／足りない'}, {k:'no', e:'👍', x:'ケーブルは大丈夫'}
  ]};

  var MAME = {
    glare:'つや消し（アンチグレア）は、<b>表面の細かいデコボコで光をちらして</b>映りこみをへらしています。つるつるのフィルムより指紋が目立ちにくいのも、同じしくみです。',
    game:'さらさらのつや消しフィルムは、<b>指との接する面積が小さいので指がすべりやすい</b>のが特長。リズムゲームや FPS が好きな人に選ばれています。',
    eye:'ブルーライトカットのフィルムでへらせるのは、青い光の<b>一部</b>です。夜は iPhone の「Night Shift」を一緒に使うと、画面の青みがぐっとへります。',
    peep:'のぞき見防止フィルムは、<b>細いブラインドが並んだようなつくり</b>で、正面以外からは暗く見えます。そのぶん、正面から見ても画面が少し暗くなります。',
    photo:'「硬度9H」は<b>鉛筆の硬さのものさし</b>で、ひっかき傷への強さのこと。落としたときに割れないという意味ではありません。'
  };

  function pick(a) {
    var w = a.q1, d = a.q2;
    if (d === 'iphone') {
      if (w === 'glare' || w === 'game') return {p: a.q3 === 'yes' ? P.agset : P.ag,
        why: w === 'game' ? '画面がさらさらになり、指がすべりやすくなります。外での映りこみや指紋も目立ちにくくなります。' : '外でも画面が見やすく、指紋も目立ちにくくなります。',
        honest:'光沢フィルムにくらべて、画面がほんの少し白っぽく見えます。写真の色をいちばん大事にする人には光沢のほうが向いています。'};
      if (w === 'eye') return {p:P.blue, why:'画面の青い光の一部をカットするフィルムです。',
        honest:'対応している機種が限られます。お使いの機種があるか、商品ページで確かめてください。'};
      if (w === 'peep') return {p:null, why:'',
        honest:'ごめんなさい、のぞき見防止フィルムは World Select では扱っていません。外での見やすさなら、つや消しフィルムが役に立ちます。', alt:P.ag, amz:{n:'iPhone のぞき見防止フィルム', q:'iPhone のぞき見防止 ガラスフィルム'}};
      return {p:null, why:'',
        honest:'ごめんなさい、iPhone 用の光沢（クリア）フィルムは今は扱っていません。指紋や映りこみが気になるなら、つや消しフィルムがあります。', alt:P.ag, amz:{n:'iPhone 光沢（クリア）ガラスフィルム', q:'iPhone ガラスフィルム 光沢 高透過'}};
    }
    if (d === 'ipad') return {p:P.ipad, why:'映りこみと指紋をへらすつや消しタイプです。',
      honest:({photo:'つや消しなので、画面がほんの少し白っぽく見えます。', eye:'ブルーライトカット専用ではなく、つや消しタイプです。', peep:'のぞき見防止ではありません。'}[w] || '') + '対応世代は商品ページで確かめてください。'};
    if (d === 'mac') {
      if (w === 'photo') return {p:P.mbcl, why:'透明度の高い光沢タイプ。画面の色をそのまま楽しめます。', honest:'対応機種が限られ、在庫も少なめです。商品ページで確かめてください。'};
      return {p:P.mbag, why:'照明の映りこみをへらすつや消しタイプです。', honest:'MacBook Pro 16インチ用です。ほかのサイズには合いません。' + (w === 'peep' ? 'のぞき見防止ではありません。' : '')};
    }
    if (d === 'watch') return {p:P.aw, why:'小さな傷なら時間がたつと目立たなくなる「自己修復」タイプの透明フィルムです。',
      honest:({glare:'つや消しではなく透明タイプです。', game:'つや消しではなく透明タイプです。', eye:'ブルーライトカットではありません。', peep:'のぞき見防止ではありません。'}[w] || '') + 'サイズは商品ページで選べます。'};
    return {p:P.sw, why:'硬度9Hのガラスで、持ち歩きの小さな傷から画面を守ります。',
      honest:'有機ELモデル用です。' + ({glare:'つや消しではなく透明タイプです。', game:'つや消しではなく透明タイプです。', eye:'ブルーライトカットではありません。', peep:'のぞき見防止ではありません。'}[w] || '')};
  }

  var css = '' +
  '.wsfd{--m:#88619A;--t:#F1EDF4;--l:#E4DEE9;--k:#343C4B;--k2:#5F6673;--e:cubic-bezier(.19,1,.22,1);background:#F7F4F9;border:1px solid var(--l);border-radius:20px;padding:20px 16px;margin:28px 0;color:var(--k);font-size:15px;line-height:1.7;text-align:left}' +
  '.wsfd *{box-sizing:border-box}' +
  '.wsfd .h{font-size:12px;font-weight:700;letter-spacing:.12em;color:var(--m);margin:0 0 4px}' +
  '.wsfd .tt{font-size:19px;font-weight:700;line-height:1.5;margin:0 0 4px}' +
  '.wsfd .sub{font-size:13px;color:var(--k2);margin:0 0 14px}' +
  '.wsfd .qn{font-size:12px;font-weight:700;color:var(--m)}' +
  '.wsfd .qt{font-size:17px;font-weight:700;margin:2px 0 12px;line-height:1.5}' +
  '.wsfd button.o{appearance:none;display:flex;gap:10px;align-items:center;width:100%;text-align:left;background:#fff;border:2px solid var(--l);border-radius:14px;padding:12px 14px;margin:0 0 8px;font:inherit;font-size:15px;color:var(--k);cursor:pointer;transition:border-color .2s,background .2s}' +
  '.wsfd button.o:hover{border-color:var(--m);background:var(--t)}' +
  '.wsfd button.o.on{background:var(--m);border-color:var(--m);color:#fff}' +
  '.wsfd .em{font-size:20px;width:26px;text-align:center;flex:none}' +
  '.wsfd .card{background:#fff;border-radius:16px;padding:16px;margin:10px 0}' +
  '.wsfd .pn{font-size:16px;font-weight:700;margin:0 0 6px}' +
  '.wsfd .hon{font-size:13px;color:var(--k2);border-left:3px solid #CBBBD5;background:#FAF8FB;padding:8px 10px;border-radius:0 8px 8px 0;margin:8px 0 12px}' +
  '.wsfd .bt{display:flex;gap:8px;flex-wrap:wrap}' +
  '.wsfd .bt a{flex:1 1 130px;text-align:center;color:#fff!important;text-decoration:none!important;font-weight:700;padding:12px 8px;border-radius:12px}' +
  '.wsfd .r{background:#BF0000}.wsfd .y{background:#E60033}' +
  '.wsfd .mm{font-size:14px}.wsfd .mm b{background:linear-gradient(transparent 62%,#EADFF0 62%)}' +
  '.wsfd .lb{font-size:12px;font-weight:700;letter-spacing:.1em;color:var(--m);margin:0 0 4px}' +
  '.wsfd .amz{margin-top:14px;padding-top:12px;border-top:1px dashed var(--l)}.wsfd .amh{font-size:13px;font-weight:700;margin:0 0 4px}.wsfd .pr{display:inline-block;background:#C8453B;color:#fff;font-size:11px;font-weight:700;border-radius:4px;padding:1px 6px;margin-right:6px}.wsfd .amz a{font-weight:700;color:#654873;text-decoration:underline}.wsfd .amn{font-size:11px;color:var(--k2);margin:4px 0 0}' +
  '.wsfd .again{appearance:none;background:none;border:0;color:var(--m);font:inherit;font-size:14px;font-weight:700;cursor:pointer;padding:6px 0;text-decoration:underline}' +
  '@keyframes wsfdUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}' +
  '.wsfd .up{animation:wsfdUp .6s var(--e) both;animation-delay:calc(var(--i,0)*.06s)}' +
  '@media (prefers-reduced-motion:reduce){.wsfd .up{animation:none}.wsfd button.o{transition:none}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var a = {};
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function head(){ return '<p class="h">30秒でわかる</p><p class="tt">あなたに合うフィルム診断</p><p class="sub">2〜3問に答えるだけ。合うフィルムと、その弱点まで正直にお伝えします。</p>'; }
  function ask(n, total, q, key){
    var h = '<div class="wsfd-in">' + head() + '<div class="qn up" style="--i:0">Q' + n + '</div><p class="qt up" style="--i:1">' + esc(q.t) + '</p>';
    q.o.forEach(function(o, i){ h += '<button type="button" class="o up" style="--i:' + (i+2) + '" data-k="' + o.k + '"><span class="em" aria-hidden="true">' + o.e + '</span><span>' + esc(o.x) + '</span></button>'; });
    root.innerHTML = '<div class="wsfd">' + h + '</div></div>';
    Array.prototype.forEach.call(root.querySelectorAll('button.o'), function(b){
      b.onclick = function(){ b.classList.add('on'); a[key] = b.getAttribute('data-k'); setTimeout(next, reduced ? 0 : 220); };
    });
  }
  function btns(p, tag){
    return '<div class="bt"><a class="r" href="' + p.r + '?' + U + tag + '" target="_blank" rel="noopener">楽天で見る</a><a class="y" href="' + p.y + '?' + U + tag + '" target="_blank" rel="noopener">Yahoo!で見る</a></div>';
  }
  function result(){
    var r = pick(a), tag = a.q1 + '_' + a.q2 + (a.q3 ? '_' + a.q3 : ''), h = head();
    h += '<div class="card up" style="--i:0"><p class="lb">' + (r.p ? 'あなたに合うのは' : 'ざんねん…でも代わりに') + '</p>';
    if (r.p) h += '<p class="pn">' + esc(r.p.n) + '</p><p>' + esc(r.why) + '</p>';
    h += '<p class="hon"><b>正直ポイント：</b>' + esc(r.honest) + '</p>';
    if (r.p) h += btns(r.p, tag);
    else if (r.alt) h += '<p class="pn">' + esc(r.alt.n) + '</p>' + btns(r.alt, tag + '_alt');
    if (r.amz) h += '<div class="amz"><p class="amh"><span class="pr">PR</span>ほかのお店で探すなら</p><a href="https://www.amazon.co.jp/s?k=' + encodeURIComponent(r.amz.q) + '&tag=mayumichi2525-22" target="_blank" rel="nofollow sponsored noopener">' + esc(r.amz.n) + ' を Amazon で探す →</a><p class="amn">World Select では扱っていない商品です。リンク先は Amazon の検索結果で、購入されると紹介料が入ります。</p></div>';
    h += '</div><div class="card mm up" style="--i:2"><p class="lb">明日だれかに言いたい豆知識</p>' + MAME[a.q1] + '</div>';
    h += '<button type="button" class="again">もう一度診断する</button>';
    root.innerHTML = '<div class="wsfd">' + h + '</div>';
    root.querySelector('.again').onclick = function(){ a = {}; next(); };
    try { if (typeof gtag === 'function') gtag('event', 'film_diag_result', {diag: tag, page_path: location.pathname}); } catch (_) {}
  }
  function next(){
    if (!a.q1) return ask(1, 3, Q1, 'q1');
    if (!a.q2) return ask(2, 3, Q2, 'q2');
    var needQ3 = a.q2 === 'iphone' && (a.q1 === 'glare' || a.q1 === 'game');
    if (needQ3 && !a.q3) return ask(3, 3, Q3, 'q3');
    result();
  }
  next();
})();
