# nature-kitakyushu — モックアップと WordPress 化

このリポジトリの**ルートがモックアップ**です。`index.html` をブラウザで開けばサイトが見られます。
そこから WordPress テーマを作るのが [Ichiki](.claude/ichiki/)（`.claude/ichiki` に submodule で入っています）。

## やりたいことから探す

| | |
|---|---|
| **はじめて触る / エラーで止まった** | [セットアップと詰まりどころ](.claude/ichiki/docs/01-セットアップ.md) |
| **モックを作る・直す** | [モックアップを作る](.claude/ichiki/docs/02-モックアップを作る.md) |
| **WordPress にする・検査する** | [変換して検査する](.claude/ichiki/docs/03-変換して検査する.md) |
| **本番に載せる** | [リリース手順書](docs/リリース手順書.md)（`ichiki release` の出力） |
| **検収する** | [検収シート](docs/検収/l1-checklist.tsv) と [使い方](docs/検収/l1-guide.html) |
| **残件を知りたい** | [DOCS-GAP.md](docs/DOCS-GAP.md) |
| Ichiki の中身を知りたい | [Ichiki の README](.claude/ichiki/README.md) |

## いつも使う2つ

```bash
node .claude/ichiki/bin/ichiki.js gate      # モック → テーマ（lint → scan → 変換 → 生成物の検証）
#   ここでテーマを WordPress に入れる
node .claude/ichiki/bin/ichiki.js deliver   # 公開後の検査 → 検収成果物 → リリース手順書
node .claude/ichiki/bin/ichiki.js --help    # コマンド一覧
```

引数は要りません。モックの場所・サイトの URL その他は [`.ichiki.json`](.ichiki.json) が持っています。

`gate` はサイトが無くても動きます。`deliver` は**動いている WordPress が要ります**
（見た目とアクセシビリティを実サイトで測り、その結果を検収成果物に取り込むため）。
`--no-visual` で撮影を飛ばせます（速いが、C1 の表示確認は「未実行」になります）。

---

## 中身

| | |
|---|---|
| ルート直下の `*.html` / `css/` / `js/` / `images/` | **モックアップ**（12ページ）。お客様と合意するもの |
| `.ichiki.json` | 案件の設定。モックの場所・テーマの出力先・サイトURL・`<title>` の区切り |
| `.ichiki/mockup-before/` | **リバース前のモック**（51ページ）。記録用。見た目が変わっていないかの比較に使う |
| `.ichiki/snapshot.json` | 生成物の凍結。出力が変わったら名指しで出る |
| `docs/検収/` | C1 テスト仕様書 / C3 検収シート・ガイド（`ichiki testspec` の出力。gitignore） |
| `docs/検収-51p/` | 人手で作った51ページ版の検収成果物。**再生成できないので記録として追跡する** |
| `docs/リリース手順書.md` | 本番公開の手順（`ichiki release` の出力） |
| `docs/DOCS-GAP.md` | 必要な成果物と現状の差。**残件はここを見る** |
| `acf-map.yaml` | フィールド台帳。`ichiki scan . .` で出し直せる |
| `CLAUDE.md` / `PROJECT-NOTES.md` | 実装ルール / リスクと未確認事項 |

---

## この案件はリバース途中です

既存モック51ページのうち12ページを制約語彙に変換した状態で、**残りは作りません**（検証の目的は
12ページで足りているため）。`.ichiki.json` の `retrofit` に宣言してあり、その間は:

- 未解決の内部リンク28件が警告に落ちる（変換していないページへのリンク）
- 生成したテーマが管理画面に「変換途中です」と出す

`ichiki doctor` が変換前／変換済みのページ数を数えます。

---

## 見た目が変わっていないことの確認

構造化（`data-*` の付与）で見た目が変わっていないかは、リバース前のモックと比べます。

```bash
node .claude/ichiki/bin/ichiki.js serve .ichiki/mockup-before 18081 &
node .claude/ichiki/bin/ichiki.js diff . http://localhost:18081
```

**ピクセル比較は `gate` に入れていません。** お客様と合意するまでモックの見た目は変わるのが
正しいので、毎回かけると正しい変更が FAIL になります。固定が要るのはリバースのときだけです。

WordPress と比べるときは、比較先を実サイトの URL にします（パーマリンクは REST から解決します）。

```bash
node .claude/ichiki/bin/ichiki.js diff . http://localhost:10009
```

---

## acf-map.yaml をなぜ残すのか

**yaml だけではテーマを作れません。** マークアップの骨格は yaml に無く、モックの HTML にしか
ありません（yaml が持つ HTML は wysiwyg のデフォルト値だけ）。入力元は常にモックで、
yaml はその読み取り結果の記録です。直したいときはモックを直して `scan` を回し直します。

それでも残すのは:

- **人が読める解釈記録になる。** 変換器がモックをどう読んだかが残らないと、生成物を読むまで
  読み違いに気づけません。お客様と合意するのもこの台帳です
- **検収成果物の入力になる。** `ichiki testspec` が C1 / C3 をここから組み立てます

読み取りの実装は変換器1つで、`scan` はそのモデルを yaml に書き出すだけです。
`convert --acf-map <yaml>` で台帳と生成物を突き合わせ、1件でも食い違えば停止します。
