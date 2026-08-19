# 道具一覧（proposal / scripts / Ichiki 本体）

**同じことをする道具が3箇所にある。** 統合の判断材料として現状を並べる。

計測日: 2026-08-18

---

## 1. `proposal/`（本 PoC）

### 入口（人が叩くもの）

| コマンド | 何をするか | 行数 |
|---|---|---|
| `node proposal/gate.js <mockup>` | **これ1本で下記を順に流す。**最初に落ちたところで止まる | 179 |
| `node proposal/lint/lint.js <mockup>` | モックが語彙(L01〜L31)に適合するか | 93 |
| `node proposal/a11y/check.js <mockup>` | pa11y + axe。WCAG2AA | 233 |
| `node proposal/scan/scan.js <mockup> <out>` | acf-map.yaml / coverage.json / field-map.json を出す | 342 |
| `node proposal/converter/convert.js <mockup> <out>` | WordPress テーマを生成 | 200 |
| `node proposal/check-rule-sync.js` | 語彙・lint・プロンプトの3者にルールIDが揃うか | 109 |

### 生成物の検証

| コマンド | 何を見るか | 行数 |
|---|---|---|
| `converter/verify-coverage.js <mockup> <theme>` | 宣言 → `the_field()` が実際に出ているか | 136 |
| `converter/verify-structure.js <mockup> <theme>` | モックの class が生成物に残っているか | 266 |
| `verify-live.js <mockup> <URL>` | **公開後のサイトを HTTP で取得**して突き合わせる | 295 |
| `verify-rules.js` | **lint が実際に違反を検出できるか**（負のテスト） | 97 |

### 見た目

| コマンド | 何と何を比べるか | 行数 |
|---|---|---|
| `visual-check/compare.js` | 元モック ↔ **制約モック**（しきい値0） | 105 |
| `visual-check/crop.js <label> [y]` | 差分の塊を一覧／位置指定で切り出す | 66 |

### 補助

| | | 行数 |
|---|---|---|
| `serve.js` | mockup-real を配信するだけの静的サーバ | 78 |
| `mockup-real/annotate.js` | 制約なしモックへ宣言を後付けした**記録**（再実行用ではない） | 181 |

### 共有ライブラリ（直接は叩かない）

`shared/constants.js` `shared/declaration-attrs.js` `shared/site-path.js` `shared/text-classify.js`
— lint と変換器の**二重実装を防ぐための唯一の定義場所**。

---

## 2. `scripts/`（案件リポジトリ側）

| コマンド | 何をするか | 行数 |
|---|---|---|
| `scripts/test-spec/generate.js` | **検収成果物**を出す。C1テスト仕様書 / C3検収シート / C3付録 | 102 |
| `scripts/test-spec/gen-pa11yci.js` | pa11y-ci の設定を生成 | 29 |
| `scripts/visual-diff/diff.js` | **元モック ↔ WordPress サイト**（`NKK_WP_BASE` で比較先切替） | 262 |

`test-spec/lib/checks/` に自動判定が6種（a11y / acf-render / cf7 / http / links / visual-diff）。
入力は `acf-map.yaml` とテーマとライブサイト。

---

## 3. `.claude/ichiki`（本体）

| コマンド | 何をするか | 行数 |
|---|---|---|
| `bin/mockup2wp.js scan <dir>` | mockup → acf-map.yaml（**推測あり**） | 30 + src/scan.js 302 |
| `bin/gate.js check-coverage` | acf-map のフィールド名が field-map.json に載っているか | 146 |
| `bin/gate.js check-structure` | 出力契約のファイルが存在するか ＋ `php -l` | 同上 |
| `test/run.js` | scan のスナップショット回帰テスト | 58 |
| `commands/run.md` | **Phase1。Claude Code がテンプレートを書く手順書** | 131 |
| `rules/ichiki.md` | 固定ルール | 92 |

---

## 重複している機能

| やること | proposal | scripts | Ichiki |
|---|---|---|---|
| mockup → acf-map.yaml | `scan/scan.js` | — | `src/scan.js` |
| 出力の検証（フィールド） | `verify-coverage.js` | — | `gate.js check-coverage` |
| 出力の検証（構造） | `verify-structure.js` | — | `gate.js check-structure` |
| a11y | `a11y/check.js` | `test-spec/lib/checks/a11y.js` | `.pa11yci.json` + CI |
| 見た目の比較 | `visual-check/compare.js` | `visual-diff/diff.js` | — |
| ゲートの束ね | `gate.js` | — | `bin/gate.js` |

**見た目の比較が2つあるのは重複ではない。** 比べる対象が違う。

```
compare.js  : 元モック ↔ 制約モック      「構造だけ変えた」の裏取り
diff.js     : 元モック ↔ WordPress サイト 「変換が正しい」の裏取り
```

**scan が2つあるのは重複。** 推測するか宣言を読むかの違いで、出力形式は同じ。

**検証系が3系統に散っている。** proposal の4本、Ichiki の2本、scripts の6チェック。

---

## 統合したときの姿（案）

```
ichiki lint      <mockup>            ← proposal/lint
ichiki a11y      <mockup>            ← proposal/a11y
ichiki scan      <mockup> <out>      ← proposal/scan（Ichiki の src/scan.js を置き換え）
ichiki build     <mockup> <theme>    ← proposal/converter
ichiki verify    <mockup> <theme>    ← coverage + structure（Ichiki の gate.js を置き換え）
ichiki verify:live <mockup> <URL>    ← proposal/verify-live
ichiki diff      <mockup> [--wp URL] ← compare.js と diff.js を1本に
ichiki testspec  <acf-map> <theme>   ← scripts/test-spec（案件側から移設するか要判断）
ichiki gate      <mockup>            ← 上記を順に流す
ichiki selftest                      ← verify-rules + check-rule-sync + Ichiki の test/run.js
```

**入口を1つにすれば、覚えるのは `ichiki gate` だけになる。**
個別に叩けるのは、落ちた箇所を切り分けるときだけでよい。

---

## 決まったこと（2026-08-18）

1. **推測版の scan は捨てる。** 後付けが7分で通ると実測できたため（`DIFF-vs-ichiki.md` 6.1節）
2. **実装は本体に置く。** 案件リポジトリ依存にしない。移設コストは3ファイル・7箇所
3. **見た目の比較は2本のまま。** 比べる対象が違い、束ねると根拠が追えなくなる

## 残る判断

- `test-spec` の案件固有の上書き規定（Markdown 出力・PDF なし・出力先）を、
  本体へ移したあとどう渡すか（設定ファイルか引数か）
