/* ws-quiz-motion.js — クイズの「動き」骨組み（2026-10-04 汎用化）
   クイズ本体の関数には手を入れず、画面の変化を「見張って」動きの印を付けるだけ。
   ここが失敗してもクイズ・計測（GA4）は今のまま動く（全部 try で包む）。
   対応する型:
     A) #questionText / #optionsContainer .option / #nextBtn / #resultScreen|#resultContainer （film-pro, film, cable-master 等）
     B) 設問ごとに DOM ごと作り直す型（academy の #quizContent, survival の #content）
     C) 選択肢が .option-btn / .op / .option-button の型（charging, digital, marathon）
     D) 画面切替が class（active / hidden / hid）の型（travel, charging, digital, academy）
   共通の目印は「.question 内の選択肢」「.question__h の設問文」。 */
(function () {
  'use strict';
  try {
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.documentElement.classList.add('wsm');

    function restart(el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }
    function $(id) { return document.getElementById(id); }
    function q1(sel) { return document.querySelector(sel); }
    function shown(el) { return !!el && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden'; }

    var OPT_SEL = '.question .option, .question .option-btn, .question .op, .question .option-button, #optionsContainer .option';

    /* --- 設問が切り替わった時: 番号→設問文→選択肢→ボタン の順に時差で浮かぶ --- */
    var lastKey = null;
    function questionEl() {
      return $('questionText') || $('qT') || $('qText') || $('questionTitle') || q1('.question__h');
    }
    function onQuestion() {
      var qText = questionEl();
      if (!qText) return;
      var qNum = q1('#questionNumber, #qN, #qNumber, .question .eyebrow');
      var key = (qText.textContent || '') + '|' + (qNum ? qNum.textContent : '');
      /* 同じ設問の描き直し（選択状態の反映など）では動かさない */
      if (key === lastKey) return;
      var bs = document.querySelectorAll(OPT_SEL);
      if (!bs.length) return;               /* 選択肢がまだ無い */
      lastKey = key;
      if (qText.firstChild && !(qText.firstChild.nodeType === 1 && qText.firstChild.classList.contains('wsm-mask-in'))) {
        var inner = document.createElement('span');
        inner.className = 'wsm-mask-in';
        while (qText.firstChild) inner.appendChild(qText.firstChild);   /* 中身（タグ含む）をそのまま移す */
        qText.appendChild(inner);
        qText.classList.add('wsm-mask');
      } else if (qText.firstChild) {
        restart(qText.firstChild, 'wsm-mask-in');
      }
      if (qNum) { qNum.style.setProperty('--i', 0); restart(qNum, 'wsm-rise'); }
      for (var i = 0; i < bs.length; i++) { bs[i].style.setProperty('--i', i + 2); restart(bs[i], 'wsm-rise'); }
      var nextBtn = q1('#nextBtn, #bN, .next-button');
      if (nextBtn && shown(nextBtn)) { nextBtn.style.setProperty('--i', bs.length + 2); restart(nextBtn, 'wsm-rise'); }
    }
    var roots = ['content', 'quizContent', 'quizContainer', 'qz', 'quizScreen', 'questionScreen'];
    var seen = [], lastDyn = null;
    if (window.MutationObserver) {
      roots.forEach(function (id) {
        var r = $(id);
        if (!r || seen.indexOf(r) >= 0) return;
        seen.push(r);
        new MutationObserver(function () {
          try {
            onQuestion();
            /* 結果を同じ入れ物の中に描く型（survival） */
            var dr = r.querySelector(':scope > .result-screen');
            if (dr && dr !== lastDyn) { lastDyn = dr; onResult(dr); }
            if (!dr) lastDyn = null;
          } catch (_) {}
        }).observe(r, { childList: true, subtree: true });
      });
      onQuestion();
    }
    /* 選択後は選択肢の「浮かぶ」を外す（不正解の揺れ・選択の反応と重ならないように） */
    document.addEventListener('click', function (e) {
      var t = e.target && e.target.closest ? e.target.closest(OPT_SEL) : null;
      if (!t) return;
      /* クリック時点の選択肢だけを対象にする（すぐ次の設問に進む型で、新しい選択肢の動きを消さないため） */
      var old = document.querySelectorAll(OPT_SEL), olds = [];
      for (var k = 0; k < old.length; k++) olds.push(old[k]);
      setTimeout(function () {
        for (var i = 0; i < olds.length; i++) olds[i].classList.remove('wsm-rise');
      }, 0);
    }, true);

    /* --- レベル選択カード（academy）: 順に浮かぶ --- */
    var grid = $('levelGrid');
    if (grid && window.MutationObserver) {
      var riseGrid = function () {
        for (var i = 0; i < grid.children.length; i++) {
          grid.children[i].style.setProperty('--i', i * 1.5);
          grid.children[i].classList.add('wsm-rise');
        }
      };
      new MutationObserver(function () { try { riseGrid(); } catch (_) {} }).observe(grid, { childList: true });
      riseGrid();
    }

    /* --- 結果画面: 点数が数え上がり、部品が順に浮かび、見出しに線が伸びる --- */
    function countUp(el) {
      var m = (el.textContent || '').match(/^(\d+)(?:(\s*\/\s*)(\d+)(.*))?$/);   /* 「12 / 20」「12/20」「32 / 100 (32%)」「23」 */
      if (!m || reduced) return;
      var to = +m[1], sep = m[2] || '', total = m[3] || '', rest = m[4] || '', t0 = null, dur = 700 + to * 40;
      var pm = rest.match(/^(.*?)(\d+)%(.*)$/);   /* 「 (73%)」が付く型は割合も一緒に */
      function step(ts) {
        if (!t0) t0 = ts;
        var p = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        var r = rest;
        if (pm) r = pm[1] + Math.round(+pm[2] * e) + '%' + pm[3];
        el.textContent = Math.round(to * e) + sep + total + r;
        if (p < 1) requestAnimationFrame(step);
      }
      el.textContent = '0' + sep + total + (pm ? pm[1] + '0%' + pm[3] : rest);
      requestAnimationFrame(step);
    }
    function labelsOf(rs) {
      var out = [], ps = rs.querySelectorAll('p, .prods-h');
      for (var k = 0; k < ps.length; k++) {
        if (ps[k].classList.contains('prods-h') || ps[k].textContent.trim() === '関連商品') out.push(ps[k]);
      }
      return out;
    }
    function onResult(rs) {
      var kids = rs.children;
      var depth = 0;
      while (kids.length === 1 && depth < 2) { kids = kids[0].children; depth++; }
      for (var i = 0; i < kids.length; i++) { kids[i].style.setProperty('--i', i * 1.5); restart(kids[i], 'wsm-rise'); }
      var sc = rs.querySelector('#resultScore, #finalScore, .score__num');
      if (sc) setTimeout(function () { countUp(sc); }, 120);
      var ls = labelsOf(rs);
      ls.forEach(function (l) { l.classList.add('wsm-cta-label'); l.classList.remove('wsm-on'); });
      setTimeout(function () { ls.forEach(function (l) { l.classList.add('wsm-on'); }); }, 450);
    }
    if (window.MutationObserver) {
      ['resultScreen', 'resultContainer', 'res', 'levelResultPage', 'finalResultPage'].forEach(function (id) {
        var rs = $(id);
        if (!rs) return;
        var was = shown(rs);
        new MutationObserver(function () {
          try {
            var now = shown(rs);
            if (now && !was) onResult(rs);
            was = now;
          } catch (_) {}
        }).observe(rs, { attributes: true, attributeFilter: ['style', 'class'] });
      });
    }

    /* --- スクロールで入ってきたら浮かぶ: 「World Select で探す」枠 --- */
    var targets = [];
    var all = document.querySelectorAll('div');
    for (var j = 0; j < all.length; j++) {
      var d = all[j];
      if (d.firstElementChild && /World Select で探す/.test(d.firstElementChild.textContent || '') && d.children.length >= 2) targets.push(d);
    }
    var marked = document.querySelectorAll('[data-wsm-reveal]');
    for (var n = 0; n < marked.length; n++) if (targets.indexOf(marked[n]) < 0) targets.push(marked[n]);
    targets.forEach(function (el) { el.setAttribute('data-wsm-reveal', ''); });
    if (reduced || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('wsm-in'); });
    } else {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('wsm-in'); io.unobserve(e.target); } });
      }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
      targets.forEach(function (el) { io.observe(el); });
    }
  } catch (_) {
    /* 失敗したら印を外して、今の見た目に戻す */
    try { document.documentElement.classList.remove('wsm'); } catch (__) {}
  }
})();
