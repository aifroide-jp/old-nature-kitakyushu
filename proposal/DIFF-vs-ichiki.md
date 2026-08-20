# Ichiki 本体（`.claude/ichiki`）と `proposal/` の差分

**目的**: 本体へ取り込むために、何が変わったのかを1枚にする。
`.claude/ichiki` は本 PoC で一切変更していない。

計測日: 2026-08-18 / 対象: Ichiki `rules/ichiki.md` ほか一式、`proposal/` 全体

---

## 0. まず訂正しておく前提

Ichiki は **md だけの AI 駆動ではない。** Phase0 と検収ゲートはコードで実装済み。

| | 実体 | 行数 |
|---|---|---|
| `src/scan.js` | mockup → acf-map.yaml | 302 |
| `bin/gate.js` | check-coverage / check-structure | 146 |
| `bin/mockup2wp.js` | CLI | 30 |
| `test/run.js` | scan のスナップショット回帰テスト | 58 |
| `rules/ichiki.md` ほか md | 固定ルール・コマンド定義 | 404 |

AI（Claude Code）が書くのは **Phase1 だけ** で、それが `commands/run.md`（131行）。

`proposal/` は JS 7,784行 / md 1,571行。**規模は約15倍**になっている。

---

## 1. 最大の差 — Phase1 が AI から変換器になった

| | Ichiki | proposal |
|---|---|---|
| Phase1 | `commands/run.md` の手順に従い **Claude Code がテンプレートを書く** | `converter/convert.js` が**機械的に出力** |
| 1ページごと | AI が生成 → 検収ゲート → 次のページ | 全ページを一度に決定的変換 |
| お手本 | 既存実装を参照して倣う | 不要（宣言から導出） |
| 失敗時 | AI が判断して埋める | **停止する。1ファイルも書かない** |

これが成立する条件がモック側の宣言（`data-*`）で、それが `vocabulary.md`。

---

## 2. Phase0 — 推測をやめた

Ichiki の `src/scan.js` は推測している。`rules/ichiki.md` 自身が
「セクション分類の既知の弱点（人手レビュー対象）」として認めている箇所。

```js
const HERO_RE = /(hero|main|top|kv|mv)/i;          // クラス名の部分一致で hero 判定
if ($(a).attr('id') || SECTION_TAGS.includes(...)) // 祖先を遡ってセクション名を決める
$('section, main, article').each(... 'data-ich-sec' // 匿名セクションは出現順の連番
```

proposal は `data-section` / `data-page` / `data-cpt` を読むだけ。推測が無い。

**結果として消えた工程**

| 工程 | Ichiki | proposal |
|---|---|---|
| 機械命名 → 意味名のリネーム | 必要（`field-map.json` に記録） | **不要**。208件すべて恒等写像 |
| セクション名の目視確認（`/setup` 手順4） | 必要 | 不要 |
| main タブ分類の目視確認 | 必要 | 不要 |
| 単一インスタンス CPT の検出 | **原理的に不可**（構成一致で推定するため） | 宣言で解決 |

---

## 3. 検収ゲートの中身が変わった

### Ichiki `bin/gate.js`（2種類）

| 検査 | 内容 |
|---|---|
| `check-coverage` | acf-map.yaml のフィールド名が `field-map.json` に載っているか |
| `check-structure` | 出力契約のファイルが存在するか（`page-<slug>.php` 等）＋ `php -l` |

**ファイルの存在と名前の突合まで。** 中身が正しいかは見ていない。

### proposal `gate.js`（8種類）

| 検査 | Ichiki に相当するもの |
|---|---|
| ルール同期（語彙・lint・プロンプトの3者にルールIDが揃うか） | 無し |
| lint L01〜L31（モックが規約に適合するか） | 無し |
| a11y（pa11y + axe をローカル実行） | CI のみ（`.github/workflows/wcag.yml`） |
| scan（取りこぼしゼロ検証） | scan はあるが取りこぼし検証は無し |
| 変換（acf-map.yaml と突き合わせ） | Phase1 は AI なので該当なし |
| フィールド突合（**宣言 → 実際に `the_field()` が出ているか**） | 名前の突合まで |
| 構造忠実性（**モックの class が生成物に残っているか**） | ファイル存在まで |
| php -l | 同じ |

**差の本質**: Ichiki は「あるべきファイルがあるか」、proposal は「中身がモック通りか」を見る。

### proposal にあって Ichiki に無いもの（gate の外）

- `verify-rules.js` — **全ルールが実際に違反を検出できるか**の負のテスト。
  `mockup-bad/` に違反例を置き、1つでも発火しなければ失敗する
- `verify-live.js` — **生成後のサイトを HTTP で取得して**検証（空リンク・`.html` 残り・
  ループの重複・空フィールド・ナビの本数）
- `visual-check/compare.js` — 元モックとのピクセル比較（しきい値0）

Ichiki の `test/run.js`（scan のスナップショット回帰）は proposal に**無い**。取り込む価値がある。

---

## 4. 語彙（`vocabulary.md`）— 完全に新規

Ichiki には対応物が無い。31ルール（L17 / L22 は欠番）。

宣言一覧: `data-page` `data-page-id` `data-page-variant` `data-cpt` `data-section`
`data-acf` `data-acf-type` `data-acf-url` `data-loop` `data-loop-item` `data-loop-sample`
`data-loop-order` `data-loop-count` `data-loop-repeat` `data-common` `data-nav`
`data-nav-item` `data-nav-current` `data-breadcrumb` `data-deco` `data-cf7*`

`rules/ichiki.md` の記述と食い違う点:

| ichiki.md | proposal |
|---|---|
| 「命名規則: `{セクション名}_{要素種別}_{連番}`」を機械が生成 | 人（AI）が意味名を書く。機械命名は無い |
| 「数字始まりのセクション名は `sec_` を前置」 | 数字始まりは lint L03 で**禁止**（前置しない） |
| 「タブ分類: ①メインコンテンツ ②セクション別 ③装飾要素」 | `data-section` で明示。①②の区別は持たない |
| 「繰り返し要素は固定数前提。連番フィールドで表現」 | `data-loop` で CPT ループにする。連番は使わない |
| 「nav 要素は WP カスタムメニューへ変換する」 | 同じ。ただし**形はモック通り**（ウォーカーを生成） |

---

## 5. 成果物（テスト仕様書・リリース手順書）

`rules/ichiki.md` の「## 成果物」は次を規定している。

- テスト仕様書（Markdown + PDF、1画面1テスト、YES/NO判定）を自動出力する
- 本番リリース手順書（Markdown、エックスサーバー向け）を自動出力する

**Ichiki 側に実装は無い**（`bin/` `src/` `test/` に該当コードなし）。ルールだけがある。

実装は案件リポジトリ側の `scripts/test-spec/generate.js` にあり、
`acf-map.yaml` を入力に C1（テスト仕様書）/ C3（L1向け検収シート）/ C3付録を出す。
案件 `CLAUDE.md` が Markdown 出力へ上書き規定している（PDF は作らない）。

→ **ここは Ichiki 本体が正しく、proposal 側が持っていない。** 取り込むのではなく、
proposal が `acf-map.yaml` を完全に保つことで**この実装を活かす**のが正しい。
本 PoC で `variant` / `css` / `loop-repeat` を追加したのはそのため。

---

## 6. 取り込みの方針（案）

| 区分 | 対象 | 判断 |
|---|---|---|
| **A. proposal → 本体** | `vocabulary.md` / lint 一式 / 変換器 / 各 verify | Phase1 を AI から機械に替える中核。取り込む |
| **B. 本体 → proposal** | `test/run.js`（scan のスナップショット回帰） | proposal に無い。取り込む |
| **C. 本体を維持** | `scripts/test-spec`（案件側）と `acf-map.yaml` の契約 | 変えない。proposal 側が合わせる |
| **D. 要書き換え** | `rules/ichiki.md` の命名・タブ分類・繰り返しの節 | 4章の食い違いを解消する |
| **E. 要書き換え** | `commands/run.md`（131行の AI 手順） | 変換器コマンドに置き換わる |
| **F. 検討** | `src/scan.js` の推測ロジック | 宣言があれば不要。ただし**非制約モックの読み取り用に残す**選択もある |

**F が最大の判断点。** 宣言なしの既存モックを扱えなくしてよいかどうか。
残すなら「制約モード / 推測モード」の2系統になり、検査の意味が系統ごとに変わる。

---

## 6.1 決まったこと（2026-08-18）

**推測版の scan は捨てる。** 後付けが現実的だと実測できたため（下記）。
制約なしモックは lint の指摘を作業リストとして通せる。2系統を抱える理由が無い。

> 実測: `about/biodiversity.html`（710行）を制約なしの状態から通した。
> lint error 37件 → 0件、宣言139箇所、**7分**。ピクセル差 249px（フォント要因のみ）。
> 工程の大半は共通領域のコピーと `<style>` の分離で、意味を考えるのは `data-acf` の命名だけ。

**実装は本体に置く。案件リポジトリ依存にしない。** ルールだけ本体にあって実装が案件側にある
現状（`rules/ichiki.md`「## 成果物」に対する `scripts/test-spec`）は逆になっている。

### 移設コスト（実測）

`scripts/` に埋まっている案件固有の記述は **3ファイル・7箇所**しかない。

| ファイル | 箇所 | 中身 | 対処 |
|---|---|---|---|
| `visual-diff/pages.js` | 全26行 | 51ページのラベルとパスの表 | **acf-map.yaml から導出**（`file` / `title` が揃っている）。ファイルごと不要 |
| `visual-diff/diff.js` | 3 | 既定の比較先 URL、レポートのタイトル | 引数・設定に出す |
| `test-spec/lib/theme-model.js` | 3 | `nkk_seed_post()` の正規表現、`{news:'nkk_news', …}` | CPT 接頭辞を設定から受け取る |

他のファイル（`test-spec/generate.js` `lib/checks/*` `lib/render-c1.js` `lib/render-c3.js`）に
案件固有の記述は**無い**。

### 統合後の入口（案）

```
ichiki lint       <mockup>
ichiki a11y       <mockup>
ichiki scan       <mockup> <out>        ← proposal/scan（推測版 src/scan.js は削除）
ichiki build      <mockup> <theme>
ichiki verify     <mockup> <theme>      ← coverage + structure（bin/gate.js を置き換え）
ichiki verify:live <mockup> <URL>
ichiki diff       <mockup>              ← 元モック ↔ 制約モック（「構造だけ変えた」の裏取り）
ichiki diff:wp    <mockup> <URL>        ← 元モック ↔ WordPress（「変換が正しい」の裏取り）
ichiki testspec   <acf-map> <theme> <URL>
ichiki gate       <mockup>              ← 上を順に流す
ichiki selftest                         ← ルール同期 + 負のテスト + scan 回帰
```

覚えるのは `ichiki gate` だけでよくなる。個別は切り分け用。

**見た目の比較は2本に分けたままにする。** 比べる対象が違い、答える問いも違う。
1本に束ねてオプションで切り替えると「どちらを流したか」が曖昧になり、
「見た目は変わっていない」という主張の根拠がどちらなのか追えなくなる。

### 残る判断

- `test-spec` を本体へ移すとき、案件固有の上書き規定（Markdown 出力・PDF なし・出力先）を
  どう渡すか。案件 `CLAUDE.md` に書いてある内容なので、設定ファイルか引数に出す必要がある

---

## 6.2 到達点：proposal/ を「生成物だけ」にする（後回し）

移設が済んで案件側に実装は無くなったが、**手で作ったものがまだ残っている**。
最終的には proposal/ 配下が全部コマンドの出力になるのが正しい。

**判定条件は単純で、`proposal/` 配下が全部 .gitignore に入ること。**

| いま残っているもの | 何になるべきか |
|---|---|
| `mockup-real/` | 制約なしモックに宣言を後付けするコマンドの**出力**。`annotate.js` が手作業の記録として残っているので、これを一般化する |
| `snapshot/expected.json` | 凍結を解除したら不要（下記） |
| `visual-check/pairs.json` | **PoC 固有**。元モックと制約モックの2つがあるのはリバースだからで、新規案件には片方しか無い |
| `*.md` | PoC の記録。本体の docs へ移すか、役目を終えたら消す |

### 凍結（snapshot）について

移設中の「上書き→ミス→差し戻し」を防ぐために作ったもので、**移設が終われば役目は終わる**。
ただし完全に捨てるかは要検討で、案件ごとの回帰テストとしては使い道が残る
（テーマを手で直したあと、変換し直しても同じ出力になるか）。

### 見た目の比較について

2本あるうち、性質が違う。

| | 新規案件で要るか |
|---|---|
| `diff`（元モック ↔ 制約モック） | **要らない。** モックは1つしか無い。リバースのときだけ必要 |
| `diff:wp`（モック ↔ WordPress） | **要る。**「変換が正しい」の裏取りは毎回必要 |

`diff:wp` が使う `pages.json` は、いまは手書きだが **acf-map.yaml から導出できる**
（`pages[].file` と `page_id` が揃っている）。ファイルごと不要にできる。

---

## 7. 未解決（本 PoC の宿題）

| | 状態 |
|---|---|
| `--allow-unresolved-links` を外す | 51ページ中11ページのみのため外せない。**全ページ揃えれば外れる** |
| a11y contrast 32件 | 元モック由来。色とテキストの重なり。デザイン判断 |
| ピクセル差 index 253px | 未特定。目視で切り分ける |
| ピクセル差 events-index 137px | 元サイトが一覧ページで現在地を出していない不整合。**こちらを一貫させた結果**であり戻さない |

---

## 8. scan と変換器が別々にモックを読んでいる（未解決）

同じモックを2つの実装が別々に読んでいる。**今日だけで3回、片方だけ抜けている事故を踏んだ。**

```
nkk_page_slug     seed-menus は _ を - に変換、functions は素通し
loadPage の title scan は <title> を読む、変換器は読まない
外部 CSS / JS     headLinks は拾う、enqueue は拾わない
```

### 照合したら 39件の食い違いが出た（2026-08-20）

`--acf-map` の突き合わせは**型しか見ていなかった**。title・セクション・デフォルト値も
比べるようにしたところ、デフォルト値で39件ズレていた。**全部 scan 側の誤り。**

| | 件数 | 中身 |
|---|---|---|
| 整形タグを落とす | 12 | scan は `<strong>` を消す。変換器は残す（規約どおり） |
| 入れ子フィールドの文字を飲み込む | 3 | `stat_number_1` が `73%` になる。`%` は別フィールド |
| `data-loop-sample` を除外しない | 2 | 捨てられるダミーの値で本物を上書き |
| 改行をまたぐ属性が読めない | 4 | `<iframe>` の `src` が次行だと空になる |
| その他 | 18 | 未分類 |

**acf-map.yaml に間違った値が入る**ので、検収成果物（C1/C3）まで波及する。

### いまの扱い

デフォルト値の食い違いは **warn**。error にすると変換が一切通らなくなるため。
`ichiki gate` が `✓ 変換  ※ 警告 40 件` と件数を出すので、**減ったかどうかが見える**。

> gate は通ったステップの出力を捨てていた。warn にしただけでは誰にも見えず、
> 「問題が出るようにした」つもりで隠れていた。件数を出すようにして解消した。

### 次にやること

**scan を変換器のモデルに寄せて、実装を1つにする。**
差がゼロになった時点で warn を error に上げる。

scan は `acf-map.yaml` という別形式を出すので「モデル → YAML」の変換層が要る。
変換器のモデルは PHP 生成向けの情報も持つため、そのまま出すと余分が混じる。

