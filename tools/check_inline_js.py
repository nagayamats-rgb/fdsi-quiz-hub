#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""クイズ全ページのインラインJS構文ゲート (2026-09-02 新設)

■ なぜ必要か（2026-09-01 の事故）
  解説文 e:"..." に <a href="..."> を素の二重引用符のまま埋め込んだため、
  JS文字列が href= の直後で閉じ、<script> ブロック全体が SyntaxError で死亡。
  7ページが最長2ヶ月間まったく描画されないまま本番で放置された。
  当時これを検知する仕組みが一切なく、リンク死活チェックだけでは素通りしていた。

■ 何を見るか
  1. 各ページのインラインJS（src付き・application/ld+json は除外）を node --check
  2. <script> と </script> の個数一致
     （charging で JSON-LD の開始タグが欠落し、生テキストが本文に露出していた事故の再発防止）
  3. application/ld+json ブロックが JSON として妥当か

■ 使い方
  python3 tools/check_inline_js.py            # 全ページ
  python3 tools/check_inline_js.py a b        # ページ指定
  異常があれば exit 1（pre-push フックが push をブロックする）

■ 注意
  node が無い環境では 1 をスキップし、2/3 のみ実施して警告を出す（ゲートは通す）。
"""
import os, re, sys, json, subprocess, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKIP_DIRS = {'fdsi-quiz-hub', 'links', 'tools', '.git'}
INLINE = re.compile(
    r'<script(?![^>]*\bsrc=)(?![^>]*application/ld\+json)[^>]*>(.*?)</script>', re.S | re.I)
LDJSON = re.compile(r'<script[^>]*application/ld\+json[^>]*>(.*?)</script>', re.S | re.I)


def has_node():
    try:
        subprocess.run(['node', '--version'], capture_output=True, timeout=10)
        return True
    except Exception:
        return False


def pages(argv):
    if argv:
        return argv
    out = []
    for d in sorted(os.listdir(ROOT)):
        if d in SKIP_DIRS or d.startswith('.'):
            continue
        if os.path.isfile(os.path.join(ROOT, d, 'index.html')):
            out.append(d)
    if os.path.isfile(os.path.join(ROOT, 'index.html')):
        out.append('.')
    return out


def main():
    node_ok = has_node()
    if not node_ok:
        print('[js-check] ⚠ node が見つかりません。JS構文チェックはスキップします')

    errs = []
    targets = pages(sys.argv[1:])
    for p in targets:
        path = os.path.join(ROOT, p, 'index.html') if p != '.' else os.path.join(ROOT, 'index.html')
        if not os.path.isfile(path):
            errs.append((p, 'index.html が存在しない')); continue
        h = open(path, encoding='utf-8', errors='ignore').read()

        # 2. タグの開閉整合
        o = len(re.findall(r'<script\b', h, re.I))
        c = len(re.findall(r'</script\s*>', h, re.I))
        if o != c:
            errs.append((p, '<script> %d 個に対し </script> %d 個（開始タグ欠落や余分な閉じタグ）' % (o, c)))

        # 1. インラインJSの構文
        if node_ok:
            for i, b in enumerate(INLINE.findall(h)):
                if not b.strip():
                    continue
                with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False,
                                                 encoding='utf-8') as f:
                    f.write(b); tmp = f.name
                r = subprocess.run(['node', '--check', tmp], capture_output=True, text=True)
                os.unlink(tmp)
                if r.returncode != 0:
                    msg = next((l for l in (r.stderr or '').splitlines() if 'Error' in l), '?')
                    errs.append((p, 'script[%d] %s' % (i + 1, msg.strip()[:90])))

        # 3. JSON-LD の妥当性
        for i, b in enumerate(LDJSON.findall(h)):
            try:
                json.loads(b.strip())
            except Exception as e:
                errs.append((p, 'JSON-LD[%d] が不正: %s' % (i + 1, str(e)[:60])))

    print('[js-check] %d ページを検査' % len(targets))
    if errs:
        print('[js-check] ❌ %d 件の問題:' % len(errs))
        for p, m in errs:
            print('   %-18s %s' % (p, m))
        print('[js-check] push を中止します。回避する場合は SKIP_JS_CHECK=1 git push')
        return 1
    print('[js-check] ✅ 問題なし')
    return 0


if __name__ == '__main__':
    sys.exit(main())
