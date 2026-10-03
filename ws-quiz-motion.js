/* ws-quiz-motion.js — クイズの「動き」骨組み（試作 2026-10-03）
   クイズ本体の関数には手を入れず、画面の変化を「見張って」動きの印を付けるだけ。
   ここが失敗してもクイズ・計測（GA4）は今のまま動く（全部 try で包む）。 */
(function () {
  'use strict';
  try {
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.documentElement.classList.add('wsm');

    function restart(el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }
    function $(id) { return document.getElementById(id); }

    /* --- 設問が切り替わった時: 番号→設問文→選択肢→ボタン の順に時差で浮かぶ --- */
    var qText = $('questionText'), qNum = $('questionNumber'), opts = $('optionsContainer'), nextBtn = $('nextBtn');
    function onQuestion() {
      if (qText && qText.firstChild && !(qText.firstChild.nodeType === 1 && qText.firstChild.classList.contains('wsm-mask-in'))) {
        var t = qText.textContent;
        qText.textContent = '';
        var inner = document.createElement('span');
        inner.className = 'wsm-mask-in';
        inner.textContent = t;
        qText.appendChild(inner);
        qText.classList.add('wsm-mask');
      }
      if (qNum) { qNum.style.setProperty('--i', 0); restart(qNum, 'wsm-rise'); }
      var bs = opts ? opts.querySelectorAll('.option') : [];
      for (var i = 0; i < bs.length; i++) { bs[i].style.setProperty('--i', i + 2); bs[i].classList.add('wsm-rise'); }
      if (nextBtn) { nextBtn.style.setProperty('--i', bs.length + 2); restart(nextBtn, 'wsm-rise'); }
    }
    if (opts && window.MutationObserver) {
      new MutationObserver(function () { try { onQuestion(); } catch (_) {} }).observe(opts, { childList: true });
      onQuestion();
    }
    /* 選択後は選択肢の「浮かぶ」を外す（不正解の揺れと重ならないように） */
    if (opts) opts.addEventListener('click', function () {
      setTimeout(function () {
        var bs = opts.querySelectorAll('.option');
        for (var i = 0; i < bs.length; i++) bs[i].classList.remove('wsm-rise');
      }, 0);
    }, true);

    /* --- 結果画面: 点数が数え上がり、部品が順に浮かび、「関連商品」に線が伸びる --- */
    var rs = $('resultScreen');
    var label = null;
    if (rs) {
      var ps = rs.querySelectorAll('p');
      for (var k = 0; k < ps.length; k++) if (ps[k].textContent.trim() === '関連商品') { label = ps[k]; label.classList.add('wsm-cta-label'); }
    }
    function countUp(el) {
      var m = (el.textContent || '').match(/^(\d+)\s*\/\s*(\d+)$/);
      if (!m || reduced) return;
      var to = +m[1], total = m[2], t0 = null, dur = 700 + to * 40;
      function step(ts) {
        if (!t0) t0 = ts;
        var p = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(to * e) + ' / ' + total;
        if (p < 1) requestAnimationFrame(step);
      }
      el.textContent = '0 / ' + total;
      requestAnimationFrame(step);
    }
    function onResult() {
      if (!rs || rs.style.display === 'none') { if (label) label.classList.remove('wsm-on'); return; }
      var kids = rs.children;
      for (var i = 0; i < kids.length; i++) { kids[i].style.setProperty('--i', i * 1.5); restart(kids[i], 'wsm-rise'); }
      var sc = $('resultScore');
      if (sc) setTimeout(function () { countUp(sc); }, 120);
      if (label) setTimeout(function () { label.classList.add('wsm-on'); }, 450);
    }
    if (rs && window.MutationObserver) {
      new MutationObserver(function () { try { onResult(); } catch (_) {} }).observe(rs, { attributes: true, attributeFilter: ['style'] });
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
