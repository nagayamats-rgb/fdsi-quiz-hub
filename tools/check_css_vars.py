#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""未定義CSSカスタムプロパティの検出 (2026-09-02 新設)

■ なぜ必要か
  2026-09-01 に判明した2つの欠陥:
    ・「-guide」6ページが --c-surface / --c-border など12変数を未定義のまま参照しており、
      選択肢ボタンの背景・枠線・正誤色が一切効かず、ただの文字列として描画されていた
    ・academy / survival が --nav-h を未定義のまま参照しており、ナビの高さ指定が無効だった
  いずれも「壊れて見えない」ため、目視でもリンクチェックでも発見できなかった。

■ 何を見るか
  各ページで var(--x) として参照されている変数が、
  そのページ自身か、読み込んでいる外部CSSのどこかで定義されているかを照合する。
  フォールバック付き var(--x, 値) は、値があるので未定義でも壊れない＝警告に留める。

■ 使い方
  python3 tools/check_css_vars.py
  未定義（フォールバックなし）が1件でもあれば exit 1
"""
import os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKIP = {'fdsi-quiz-hub', 'links', 'tools', '.git'}
# var(--name) / var(--name, fallback) の両方を拾い、フォールバック有無を区別する
VAR_USE = re.compile(r'var\(\s*(--[a-zA-Z0-9_-]+)\s*(,)?')
VAR_DEF = re.compile(r'(--[a-zA-Z0-9_-]+)\s*:')
# サブページは href="../x.css"、ハブトップ(ルート直下)は href="x.css" と書式が違う。
# 片方しか拾わないと「読み込んでいるのに未定義」と誤検知するので両方に対応する。
LINKED = re.compile(r'href="(?:\.\./)?([a-zA-Z0-9_.-]+\.css)"')


def check(page_dir):
    path = os.path.join(ROOT, page_dir, 'index.html') if page_dir != '.' \
        else os.path.join(ROOT, 'index.html')
    h = open(path, encoding='utf-8', errors='ignore').read()

    defined = set(VAR_DEF.findall(h))
    for css in set(LINKED.findall(h)):
        p = os.path.join(ROOT, css)
        if os.path.isfile(p):
            defined |= set(VAR_DEF.findall(open(p, encoding='utf-8', errors='ignore').read()))

    hard, soft = set(), set()
    for name, fb in VAR_USE.findall(h):
        if name in defined:
            continue
        (soft if fb else hard).add(name)
    return sorted(hard), sorted(soft)


def main():
    pages = [d for d in sorted(os.listdir(ROOT))
             if d not in SKIP and not d.startswith('.')
             and os.path.isfile(os.path.join(ROOT, d, 'index.html'))]
    if os.path.isfile(os.path.join(ROOT, 'index.html')):
        pages.append('.')

    ng = 0
    for p in pages:
        hard, soft = check(p)
        if hard:
            ng += 1
            print('[css-vars] ❌ %-18s 未定義(フォールバックなし): %s' % (p, ', '.join(hard)))
        elif soft:
            print('[css-vars] ⚠ %-18s 未定義だがフォールバックあり: %s' % (p, ', '.join(soft)))

    print('[css-vars] %d ページを検査' % len(pages))
    if ng:
        print('[css-vars] ❌ %d ページで未定義変数。回避は SKIP_CSS_CHECK=1 git push' % ng)
        return 1
    print('[css-vars] ✅ 未定義変数なし')
    return 0


if __name__ == '__main__':
    sys.exit(main())
