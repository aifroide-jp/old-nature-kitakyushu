# proposal/ — モックアップ制約化の検証環境

モックアップを書く時点で構造を宣言させ、WordPress への変換をコマンド化するための一式。

**ルールの正は [`vocabulary.md`](vocabulary.md) 1枚。** lint も生成プロンプトもここから派生する。
二重管理しないこと（ズレは `check-rule-sync.js` が検出する）。

---

## 中身

| | 役割 |
|---|---|
| `vocabulary.md` | **制約語彙**。ルールの唯一の正 |
| `prompts/` | モック生成用プロンプト。語彙から派生 |
| `lint/` | 語彙への適合検査（L01〜L25） |
| `scan/` | 制約モック → `acf-map.yaml` / `field-map.json` / 取りこぼし検証 |
| `converter/` | 制約モック → WordPress テーマ。**非対応入力は停止する** |
| `a11y/` | pa11y + axe（WCAG2AA）ゲート |
| `visual-check/` | 既存モックと制約版のピクセル比較 |
| `shared/` | lint と変換器が共有するロジック（二重実装の防止） |
| `mockup-real/` | 実物ページを見た目そのままで構造化したもの |
| `check-rule-sync.js` | 語彙・lint・プロンプトの3者が揃っているかの監査 |
| `serve.js` | モックをローカル配信して見るための簡易サーバ |

---

## 準備

```bash
cd proposal/lint      && npm install
cd proposal/converter && npm install
```

`a11y/` と `visual-check/` は自前の `node_modules` を持たず、
`scripts/test-spec/`（pa11y）と `scripts/visual-diff/`（playwright）のものを借りる。
それらが未インストールなら先に入れる。

---

## ゲート一覧

上から順に流すのが基本。**どれか1つでも落ちたら先へ進まない。**

### 1. ルールの健全性

```bash
node proposal/check-rule-sync.js
```

語彙・lint 実装・生成プロンプトの3者にルールIDが揃っているかを見る。
片側にしか無いものと、欠番なのに実装に残っているものを検出する。

### 2. 制約への適合（lint）

```bash
node proposal/lint/lint.js proposal/mockup-real          # 人が読む形式
node proposal/lint/lint.js proposal/mockup-real --json   # 機械可読
```

error が1件でもあれば非ゼロ終了。warn（L20＝宣言の無いテキスト）は落とさないが、
**「更新対象外としてお客様と合意する文言」のリスト**なので必ず目を通す。

### 3. アクセシビリティ

```bash
node proposal/a11y/check.js proposal/mockup-real
```

WCAG2AA / axe。**モック段階で通す**（WP化後に直すとモックとの差分が生まれ、
「モックで合意したもの＝納品物」という前提が崩れる）。

「要人手確認」の件数は自動チェックが**測れなかった**箇所であって、問題が無いという意味ではない。

### 4. 見た目が変わっていないこと

```bash
node proposal/visual-check/compare.js            # デスクトップ 1280px
node proposal/visual-check/compare.js --mobile   # モバイル 375px
```

既存モックと制約版をフルページスクリーンショットで比較する。
**しきい値は設けない。1ピクセルでも違えば FAIL。**
出力は `visual-check/out/`（before / after / diff）。

### 5. acf-map.yaml 生成と取りこぼし検証

```bash
node proposal/scan/scan.js proposal/mockup-real proposal/scan/out-real
```

`acf-map.yaml` / `field-map.json` / `coverage.json` を出す。
全テキストノードが「ACF / nav / CF7 / ダミー / 装飾 / 未宣言」のいずれかに分類され、
**未分類が1件でもあれば非ゼロ終了**する。

### 6. テーマ生成

```bash
node proposal/converter/convert.js proposal/mockup-real <出力先>
```

宣言が無い・想定外の構造・置換元が見つからない場合は**推測せず停止し、1ファイルも書かない**。

`--allow-unresolved-links` は未解決の内部リンクを警告に落とす**一時オプション**。
モックのページを揃える途中で先に進むためのもので、**全ページが揃ったら必ず外す**。

### 7. 生成物の検証

```bash
node proposal/converter/verify-coverage.js  <mockupDir> <themeDir>   # 宣言 → the_field() の突合
node proposal/converter/verify-structure.js <mockupDir> <themeDir>   # モックの class が失われていないか
php -l <生成された各PHP>
```

`verify-coverage` は「ACF に登録したのにテンプレートへ出力し忘れる」事故を、
`verify-structure` は「変換の過程で class が消える」事故を検出する。
前者だけでは後者を捕まえられない（実測でナビの class が1つ消えていた）。

---

## モックを見る

```bash
node proposal/serve.js proposal/mockup-real 8080
```

`file://` で直接開いてもよい（内部参照はすべて相対パスで書く規約のため）。

---

## 既存モック（`proposal/` の外）に lint をかけると

大量の error が出るが、**これは失敗ではなく「今のモックは規約に適合していない」という測定結果**。
ルールを緩めて通してはいけない。

比較のために測るときは、`proposal/` 配下の制約モックが混ざらないよう
対象ページと `css/` だけを別ディレクトリへ複製してから実行する。
