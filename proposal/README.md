# proposal/ — モックアップ制約化の検証環境

モックを書く時点で構造を宣言させ、WordPress への変換をコマンド化する仕組みの検証場所。

**道具はここには無い。すべて [`.claude/ichiki/`](../.claude/ichiki/) に移設済み**（2026-08-20）。
ルールの正も `.claude/ichiki/rules/vocabulary.md` 1枚。ここには「検証に使う材料」だけを置く。

---

## 中身

| | 役割 |
|---|---|
| `mockup-real/` | **いまのモック**（12ページ）。実物ページを見た目そのままで構造化したもの |
| `DOCS-GAP.md` | 必要な成果物と現状の差。**残件はここを見る** |

**この配置は規約から外れている。** 規約（`.claude/ichiki/rules/ichiki.md`「モックの置き場所」）は
「ルートがいまのモック、`mockup-before/` がリバース前」で、この案件は逆転している
（ルートに旧51ページ、`proposal/mockup-real` に制約版12ページ）。
リバース途中であることは `.ichiki.json` の `retrofit` に宣言してある。
残り39ページが揃った時点で規約どおりに移し、`proposal/` は無くなる。

---

## まとめて流す

```bash
node .claude/ichiki/bin/ichiki.js gate proposal/mockup-real --allow-unresolved-links
```

ルール同期 → lint → a11y → scan → 変換 → 生成物の検証 → php -l を順に流す。
`--snapshot .ichiki/snapshot.json` を付けると出力の凍結比較も走る。

**ピクセル比較は gate に入っていない。** 合意前のモックは見た目が変わるのが正しいので、
毎回かけると正しい変更が FAIL になる。見た目の固定が要るのは retrofit のときだけなので、
そのときに `ichiki diff` を明示的に叩く。

```bash
node .claude/ichiki/bin/ichiki.js serve . 18081 &          # 旧モックを配る
node .claude/ichiki/bin/ichiki.js diff proposal/mockup-real http://localhost:18081
```

`--allow-unresolved-links` の扱い:

- **本番案件では使わない。** モック＝全ページなので、未解決リンクは本当の不具合
- **この検証では必要。** 51ページ中12ページだけを書き直したサンプルなので、
  書いていないページへのリンクは解決しなくて当然

個別のコマンドは `node .claude/ichiki/bin/ichiki.js --help` に全部出る。

---

## acf-map.yaml をなぜ残すのか

**yaml だけではテーマを作れない。** マークアップの骨格は yaml に無くモックの HTML にしかない
（yaml が持つ HTML は wysiwyg の default 値だけ）。入力元は常にモックで、yaml はその読み取り結果の記録。
直したいときはモックを直して `scan` を回し直す。

それでも残すのは:

- **人が読める解釈記録になる。** 変換器がモックをどう読んだかがどこにも残らないと、
  生成物を読むまで読み違いに気づけない。お客様と合意するのもこの台帳
- **検収成果物の入力になる。** `ichiki testspec` が C1 テスト仕様書 / C3 検収シートをここから組み立てる

読み取りの実装は `src/converter` 1つで、`scan` はそのモデルを yaml に書き出すだけ。
以前は scan が独自にモックを読んでいて、実測で39件ズレていた。
`convert --acf-map <yaml>` で台帳と生成物を突き合わせ、1件でも食い違えば停止する
（台帳を出し直し忘れたことが分かる）。**突き合わせは出力を変えない**。

---

## モックを見る

```bash
node .claude/ichiki/bin/ichiki.js serve proposal/mockup-real 8080
```

`file://` で直接開いてもよい（内部参照はすべて相対パスで書く規約のため）。

---

## 既存モック（`proposal/` の外）に lint をかけると

大量の error が出るが、**これは失敗ではなく「今のモックは規約に適合していない」という測定結果**。
ルールを緩めて通してはいけない。
