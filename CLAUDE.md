# 案件用 CLAUDE.md — nature-kitakyushu（Ichiki / mockup→WordPress）

<!-- Ichiki Phase 0 (mockup2wp scan) で自動生成 / generated: 2026-06-12 -->
<!-- 固定ルールは下の import で読み込む。人手で触るのは「ACF化除外」ブロックだけ -->
@.claude/ichiki/rules/ichiki.md

## この案件のリスク・確認事項
**`PROJECT-NOTES.md` を参照。** 実装ルールは本ファイル、リスクと未確認事項は
`PROJECT-NOTES.md` に分けている。現在の主要項目:
- 写真投稿フォームのメール添付が届かない可能性（最大50MB。要実測）
- CF7 複数ファイルアップロード拡張への依存（フォーム1枚のため）
- チェックボックス／ラジオは CF7 のマークアップになる（モックと1:1にならない唯一の例外）

## プロジェクト
- プロジェクト名: nature-kitakyushu
- フィールド台帳: `acf-map.yaml` を参照（フィールド候補・タブ分類・デフォルト値・nav・form・装飾・meta）

## 対象ページ
- 生物多様性とは？ | アーバンネイチャー北九州 (about/biodiversity.html)
- 全体像 | アーバンネイチャー北九州 (about/index.html)
- 北九州市の自然スポット | アーバンネイチャー北九州 (about/spots.html)
- 合馬竹林公園 | アーバンネイチャー北九州 (about/spots/auma.html)
- 響灘ビオトープ | アーバンネイチャー北九州 (about/spots/biotope.html)
- 玄海国定公園（若松北海岸） | アーバンネイチャー北九州 (about/spots/genkai.html)
- 平尾台 | アーバンネイチャー北九州 (about/spots/hiraodai.html)
- 関門海峡 | アーバンネイチャー北九州 (about/spots/kanmon.html)
- 紫川 | アーバンネイチャー北九州 (about/spots/murasaki.html)
- 皿倉山 | アーバンネイチャー北九州 (about/spots/sarakurayama.html)
- 曽根干潟 | アーバンネイチャー北九州 (about/spots/sone-higata.html)
- 山田緑地 | アーバンネイチャー北九州 (about/spots/yamada.html)
- 北九州市の取り組み | アーバンネイチャー北九州 (about/strategy.html)
- 活動ブログ | アーバンネイチャー北九州 (blog/index.html)
- 北九州市響灘ビオトープ | アーバンネイチャー北九州 (center/biotope.html)
- 響灘緑地グリーンパーク | アーバンネイチャー北九州 (center/greenpark.html)
- 北九州市ほたる館 | アーバンネイチャー北九州 (center/hotarukan.html)
- 活動拠点 | アーバンネイチャー北九州 (center/index.html)
- いのちのたび博物館 | アーバンネイチャー北九州 (center/inochi.html)
- 到津の森公園 | アーバンネイチャー北九州 (center/itouzu.html)
- 香月・黒川ほたる館 | アーバンネイチャー北九州 (center/katsuki-hotaru.html)
- 水環境館 | アーバンネイチャー北九州 (center/mizukankyokan.html)
- ソラランド平尾台 | アーバンネイチャー北九州 (center/soraland.html)
- タカミヤ環境ミュージアム | アーバンネイチャー北九州 (center/takamiya.html)
- 山田緑地 | アーバンネイチャー北九州 (center/yamada.html)
- お問合せ | アーバンネイチャー北九州 (contact/index.html)
- 参加申し込み｜企業向け生態系保全体験プログラム ― ビオトープづくり | アーバンネイチャー北九州 (events/biotope-kigyo-apply.html)
- 企業向け生態系保全体験プログラム ― ビオトープづくり | アーバンネイチャー北九州 (events/biotope-kigyo.html)
- 参加申し込み｜平尾台 春の自然観察会 | アーバンネイチャー北九州 (events/hiraodai-kansatsukai-apply.html)
- 平尾台 春の自然観察会 〜カルスト台地の野草を楽しむ〜 | アーバンネイチャー北九州 (events/hiraodai-kansatsukai.html)
- 平尾台トゥクトゥクで巡る自然ツアー | アーバンネイチャー北九州 (events/hiraodai-tuk-tuk.html)
- イベント | アーバンネイチャー北九州 (events/index.html)
- 平尾台シャボン玉フェスティバル | アーバンネイチャー北九州 (events/sample.html)
- 参加申し込み｜曽根干潟クリーンアップ大作戦 2026春 | アーバンネイチャー北九州 (events/sone-higata-cleanup-apply.html)
- 曽根干潟クリーンアップ大作戦 2026春 | アーバンネイチャー北九州 (events/sone-higata-cleanup.html)
- 参加申し込み｜夏休み自然体験キャンプ ― 2泊3日で学ぶ北九州の自然 | アーバンネイチャー北九州 (events/summer-camp-apply.html)
- 夏休み自然体験キャンプ ― 2泊3日で学ぶ北九州の自然 | アーバンネイチャー北九州 (events/summer-camp.html)
- 子ども自然教室「森の生きもの探検隊」 | アーバンネイチャー北九州 (events/yamada-kodomo-kyoshitsu.html)
- アーバンネイチャー北九州 | 都市と自然、近いからこそおもしろい。 (index.html)
- 会員募集 | アーバンネイチャー北九州 (join/index.html)
- 自然共生サイト | アーバンネイチャー北九州 (nature-symbiosis/index.html)
- 活動実績 | アーバンネイチャー北九州 (network/cases/index.html)
- 株式会社マイン | 実践事例 | アーバンネイチャー北九州 (network/cases/mine.html)
- 株式会社ネイチャー | 実践事例 | アーバンネイチャー北九州 (network/cases/nature.html)
- 響灘ビオトープ共同事業体 | アーバンネイチャー北九州 (network/hibikinadabiotope.html)
- 地域との繋がり | アーバンネイチャー北九州 (network/index.html)
- お知らせ | アーバンネイチャー北九州 (news/index.html)
- アーバンネイチャー北九州のサイトをリニューアルしました | お知らせ | アーバンネイチャー北九州 (news/site-renewal.html)
- みんなの写真展 | アーバンネイチャー北九州 (photos/index.html)
- 写真を投稿する | みんなの写真展 | アーバンネイチャー北九州 (photos/submit.html)
- プライバシーポリシー | アーバンネイチャー北九州 (privacy/index.html)

## 実装（後処理：Claude Code）
- 入力は `acf-map.yaml`。固定ルール（@.claude/ichiki/rules/ichiki.md）とお手本に従って実装する
- 1ページ・1CPTずつ構築し、各段で検収ゲート（カバレッジ照合・構成チェック・PHP lint・WCAG）を通す
- `acf-map.yaml` の機械命名は意味ベースの名前にリネームし、対応を `field-map.json` に記録する
- 型・ページ種別・トップ・nav解決・画像方式は固定ルールに従い、判断に迷う境界は止めて確認する

## トップページ（front-page.php）の仕様
- front-page.php は「お手本」対象外だが、CPT系お手本と同様に **mockup(`index.html`)のHTML構造・class名に1:1で合わせる**こと。独自のWP_Query整形・独自クラスへの置き換えは禁止（例: `.more-link`を`.btn`に変えない、`<ul><li>`への構造変更をしない）
- 「地域との繋がり」セクションは acf-map.yaml 定義の単体カード（network_image/title_2/text_2/text_3）をそのまま出力する。動的一覧（WP_Query による複数カード化）にしない
- 「みんなの写真展」セクションは nkk_photo の動的クエリではなく、acf-map.yaml 定義の固定8枠（photos_image_1〜8 + カテゴリ名キャプション）の静的グリッドとして出力する。各画像は `.photo-category` > 画像 + `.photo-category-overlay > .photo-category-name` の構造でmockupに1:1で合わせる
- ヒーロー（`.hero`）セクションにボタンを追加しない。mockupのヒーローはスライド＋見出し＋本文＋ドット＋スクロール指示のみで、CTAボタンは存在しない
- 画像フィールドのフォールバックは、値が空文字列になり得ないようにする（例: ACF画像→サムネイル→**静的デフォルト画像パス**の順。空文字列に落として`continue`でスキップする書き方は禁止。他CPTセクション nkk_center/nkk_case/nkk_event の書き方に倣うこと）
- ページ専用CSS（例: `assets/css/front-page.css`）には、mockup該当ページの`<style>`内 `:root` 変数とセクション背景定義を漏れなく転記すること（グローバル`css/style.css`だけでなくページ内styleも対象）

## お手本（ゴールデンサンプル）
- 参照先: 検証案件 nature-kitakyushu の既存実装
  - `inc/acf-spot.php`（ACFフィールド定義の構造・粒度・命名・instructions）
  - `single-nkk_spot.php`（テンプレートの構成・フォールバック・hide_on_screen）
  - `archive-nkk_spot.php`（CPT一覧テンプレート）
- この構造・命名・instructions の付け方に倣うこと
- お手本は無断で変えない。変えたら再現性の基準がずれるため検証し直す

## ACF化除外
<!-- 【人手】ここだけ確認・追記する。宣言ゼロでも動作する -->
- CSSアニメーション用SVG
- `<style>` タグ内のインラインSVG
- （案件固有の除外をここに追記）

## CF7 6.x 固有の注意事項（再実行時に必ず守ること）

### 1. フォームタグの属性順序
CF7 6.x の `parse_atts()` はクォートされた値（`"..."`）がすべての無引用オプションの**後ろ**に来ることを要求する。
違反するとタグがパースされず素テキストとして出力される。

**NG:** `[text* your-name placeholder "例：山田 太郎" class:form-input id:c-name]`
**OK:** `[text* your-name class:form-input id:c-name placeholder "例：山田 太郎"]`

→ `placeholder "..."` は必ず末尾に置くこと。

### 2. フォーム作成 API
`WPCF7_ContactForm::set_form()` は CF7 6.x に存在しない。`set_properties()` を使う。

```php
$cf7 = WPCF7_ContactForm::get_template( [ 'title' => $title ] );
$cf7->set_properties( [ 'form' => $form_body, 'mail' => $mail, 'mail_2' => $mail_2 ] );
$id = $cf7->save();
```

## グローバル CSS の扱い

モックアップの `css/style.css`（1259行）がすべての共通スタイルの正とする。
テーマの `assets/css/style.css` はこのファイルを全取込みし、末尾に WordPress/CF7 固有スタイルを追記する。
ページ別 CSS ファイルはページ内 `<style>` タグのみを抽出したもので、グローバル定義は含まない。

## seed-posts.php の責務

`inc/seed-posts.php` は以下をすべて自動投入すること（`wp eval-file` 1コマンドで完結）：

1. 固定ページ（テンプレート指定込み）
2. CF7 フォーム（4件：お問合せ・会員申込・イベント申込・写真投稿）
3. フロントページ設定（`show_on_front` / `page_on_front`）
4. CPT 初期記事（nkk_spot×5・nkk_center×4・nkk_event×3・nkk_news×1・nkk_case×2・nkk_photo×1・nkk_network×1）
   - モックアップの既存コンテンツから抽出したテキストを ACF フィールドに `update_field()` で投入する
5. サイト設定ページ（site-options）の ACF 初期値（CTA・フッターテキスト等）

画像フィールドは seed では skip し、管理画面から手動入力または別途 sideload で対応。

## Phase2 C1/C3（検収）の出力形式

rules/ichiki.md の成果物規定（Markdown + PDF）をこの案件では次の通り上書きする。理由: 検収対象を全ページ分（51ページ→CPT代表集約後27テストケース）出す必要があり、PDFはL1が書き込みにくく、量も多いため。

- **C1（テスト仕様書・全記録）**: Markdown（`scripts/test-spec/out/test-spec.md`）。PDF化はしない。1ページ=1テストケース、CPTの一覧→詳細は代表1件に集約し、残りは付録に列挙する（隠さない）。表示確認・ACF差し替え・フォーム送信・リンク遷移・レスポンシブ・アクセシビリティ簡易チェックの6種別のうち、ページに該当するものだけを出す。
- **自動化する種別 / しない種別**: ACF差し替え（デフォルト値のライブHTML内存在チェック）・リンク遷移（内部リンクのHTTPステータス）・フォーム送信のうちフォーム描画確認（CF7フォームタグの有無）・アクセシビリティ簡易チェック（pa11y-ci結果の読み取り、未実行なら「未実行」と明記し自動OK扱いにしない）は自動判定する。表示確認・レスポンシブ・フォーム送信のうち送信後のメール着信確認は人の目が必須のため自動化しない。
- **C3（L1向け検収シート）**: PDFではなくスプレッドシート（`scripts/test-spec/out/l1-checklist.tsv`、タブ区切り・UTF-8 BOM付き）。C1で自動判定済みの種別（ACF差し替え・リンク遷移・アクセシビリティ）は載せない。表示確認・レスポンシブ・フォーム送信（着信確認）のみ、ページ単位で1〜3行程度に絞る。判定はYES/一部NG/NOの3択、補足欄はNG系を選んだ時だけ記入する運用。
- **C3付録（L1向け検収ガイド）**: `scripts/test-spec/out/l1-guide.md`。平易な日本語で1〜2ページ。手順・判定に迷った時の対応（一部NGを選んで補足に一言、担当者に連絡）・自動チェック済みで見なくてよい項目、を明記する。
- 生成スクリプトは `scripts/test-spec/generate.js`（`node generate.js`）。acf-map.yaml・テーマの `functions.php`/`inc/seed-posts.php`・ライブサイト（`.ichiki.json` の `site_url`）を入力に、上記を再生成できる。
