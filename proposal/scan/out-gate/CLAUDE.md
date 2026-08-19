# 案件用 CLAUDE.md — old-nature-kitakyushu（Ichiki / mockup→WordPress）

<!-- Ichiki Phase 0 (mockup2wp scan) で自動生成 / generated: 2026-08-19 -->
<!-- 固定ルールは下の import で読み込む。人手で触るのは「ACF化除外」ブロックだけ -->
@.claude/ichiki/rules/ichiki.md

## プロジェクト
- プロジェクト名: old-nature-kitakyushu
- フィールド台帳: `acf-map.yaml` を参照（フィールド候補・タブ分類・デフォルト値・nav・form・装飾・meta）

## 対象ページ
- 生物多様性とは？ | アーバンネイチャー北九州 (about/biodiversity.html)
- 北九州市の自然スポット | アーバンネイチャー北九州 (about/spots.html)
- 平尾台 | アーバンネイチャー北九州 (about/spots/hiraodai.html)
- 北九州市響灘ビオトープ | アーバンネイチャー北九州 (center/biotope.html)
- 活動拠点 | アーバンネイチャー北九州 (center/index.html)
- お問合せ | アーバンネイチャー北九州 (contact/index.html)
- イベント | アーバンネイチャー北九州 (events/index.html)
- 平尾台シャボン玉フェスティバル | アーバンネイチャー北九州 (events/sample.html)
- 参加申し込み｜夏休み自然体験キャンプ ― 2泊3日で学ぶ北九州の自然 | アーバンネイチャー北九州 (events/summer-camp-apply.html)
- アーバンネイチャー北九州 | 都市と自然、近いからこそおもしろい。 (index.html)
- お知らせ | アーバンネイチャー北九州 (news/index.html)
- アーバンネイチャー北九州のサイトをリニューアルしました | お知らせ | アーバンネイチャー北九州 (news/site-renewal.html)

## 実装（後処理：Claude Code）
- 入力は `acf-map.yaml`。固定ルール（@.claude/ichiki/rules/ichiki.md）とお手本に従って実装する
- 1ページ・1CPTずつ構築し、各段で検収ゲート（カバレッジ照合・構成チェック・PHP lint・WCAG）を通す
- `acf-map.yaml` の機械命名は意味ベースの名前にリネームし、対応を `field-map.json` に記録する
- 型・ページ種別・トップ・nav解決・画像方式は固定ルールに従い、判断に迷う境界は止めて確認する

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
