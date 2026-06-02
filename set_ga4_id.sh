#!/bin/bash
# GA4 測定ID を全クイズに反映して push するワンショット
# 使い方: bash set_ga4_id.sh G-XXXXXXXXXX
set -e
ID="$1"
if [ -z "$ID" ]; then echo "usage: bash set_ga4_id.sh G-XXXXXXXXXX"; exit 1; fi
case "$ID" in G-*) ;; *) echo "ERROR: 測定IDは G- で始まります"; exit 1;; esac

cd "$(dirname "$0")"
# 追跡対象の index.html すべて（ネスト fdsi-quiz-hub も含めて統一）
grep -rl "G-XXXXXXXXXX" . --include=index.html | while read f; do
  sed -i '' "s/G-XXXXXXXXXX/$ID/g" "$f"
done
echo "置換完了。残プレースホルダ: $(grep -rl 'G-XXXXXXXXXX' . --include=index.html | wc -l) 件"
git add -A
git commit -m "chore(analytics): activate GA4 measurement ID $ID"
git push origin HEAD
echo "完了: GA4 ($ID) 有効化＆push 済み"
