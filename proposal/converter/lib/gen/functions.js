'use strict';

const { CPT_PREFIX } = require('../constants');
const { phpSingleQuote } = require('../php-util');
const { generateNavWalkers } = require('./nav-walker');

function generateFunctionsPhp(model, errors) {
  const lines = [];
  lines.push('<?php');
  lines.push('/**');
  lines.push(' * functions.php');
  lines.push(' * proposal/mockup から変換器(proposal/converter)が機械生成したテーマ設定。');
  lines.push(' * 手編集しない。再生成すれば同じ入力から同じ出力になる(決定的変換)。');
  lines.push(' */');
  lines.push('');
  lines.push("if ( ! defined( 'ABSPATH' ) ) { exit; }");
  lines.push('');

  // --- テーマサポート・ナビメニュー登録 ---
  lines.push("function nkk_setup() {");
  lines.push("    add_theme_support( 'title-tag' );");
  lines.push("    add_theme_support( 'post-thumbnails' );");
  lines.push('    register_nav_menus( array(');
  for (const name of model.navMap.keys()) {
    lines.push(`        ${phpSingleQuote(name)} => ${phpSingleQuote(`data-nav="${name}"`)},`);
  }
  lines.push('    ) );');
  lines.push('}');
  lines.push("add_action( 'after_setup_theme', 'nkk_setup' );");
  lines.push('');

  // ナビは theme_location ごとに専用 Walker を生成する(下記 --- ナビ Walker --- )。
  // 以前は「形を2種類に分類して class 名だけ抜き出し、フィルタで差し戻す」方式だったが、
  // 形が増えるたびに分類と Walker が増える作りだった。テンプレート方式に置き換え済み。

  // --- CPT登録 ---
  lines.push('function nkk_register_post_types() {');
  for (const [cpt, entry] of model.cptMap) {
    const postType = `${CPT_PREFIX}${cpt}`;
    lines.push(`    register_post_type( ${phpSingleQuote(postType)}, array(`);
    lines.push(`        'label' => ${phpSingleQuote(cpt)},`);
    lines.push("        'labels' => array(");
    lines.push(`            'name' => ${phpSingleQuote(cpt)},`);
    lines.push(`            'singular_name' => ${phpSingleQuote(cpt)},`);
    lines.push('        ),');
    lines.push("        'public' => true,");
    lines.push(`        'has_archive' => ${entry.archivePage ? 'true' : 'false'},`);
    lines.push("        'show_in_rest' => true,");
    lines.push("        'supports' => array( 'title' ),");
    lines.push(`        'menu_icon' => 'dashicons-admin-post',`);
    lines.push('    ) );');
  }
  lines.push('}');
  lines.push("add_action( 'init', 'nkk_register_post_types' );");
  lines.push('');

  // --- アセット(css)のenqueue。vocabulary.md 7章の css/base.css + css/page/*.css 構成に対応 ---
  lines.push('function nkk_enqueue_assets() {');
  lines.push("    $dir = get_template_directory_uri();");
  lines.push("    wp_enqueue_style( 'nkk-base', $dir . '/assets/css/base.css', array(), null );");
  lines.push('');
  lines.push('    if ( is_front_page() ) {');
  lines.push("        wp_enqueue_style( 'nkk-page-front', $dir . '/assets/css/page/front.css', array( 'nkk-base' ), null );");
  lines.push('    }');
  for (const pageId of model.pageMap.keys()) {
    lines.push(`    if ( is_page_template( 'page-${pageId}.php' ) ) {`);
    lines.push(
      `        wp_enqueue_style( 'nkk-page-${pageId}', $dir . '/assets/css/page/${pageId}.css', array( 'nkk-base' ), null );`
    );
    lines.push('    }');
  }
  for (const cpt of model.cptMap.keys()) {
    const postType = `${CPT_PREFIX}${cpt}`;
    lines.push(`    if ( is_singular( '${postType}' ) || is_post_type_archive( '${postType}' ) ) {`);
    lines.push(
      `        wp_enqueue_style( 'nkk-page-${cpt}', $dir . '/assets/css/page/${cpt}.css', array( 'nkk-base' ), null );`
    );
    lines.push('    }');
  }
  lines.push('}');
  lines.push("add_action( 'wp_enqueue_scripts', 'nkk_enqueue_assets' );");
  lines.push('');

  // --- 固定リンク解決ヘルパー(vocabulary.md 2.2 / 10章) ---
  lines.push('/**');
  lines.push(' * data-page="page" のページのパーマリンクを、変換時に確定した data-page-id から取得する。');
  lines.push(' * ページはテーマ側では作成しない(inc/seed-posts.php 等、別工程の責務)ため、');
  lines.push(' * 該当スラッグのページが存在しない環境では空文字列を返す(実行時のnullガードであり、');
  lines.push(' * vocabulary.mdが禁じる「変換時のエスケープハッチ」とは異なる)。');
  lines.push(' */');
  lines.push('function nkk_get_page_permalink( $page_id_slug ) {');
  lines.push('    $page = get_page_by_path( $page_id_slug );');
  lines.push("    return $page ? get_permalink( $page ) : '';");
  lines.push('}');
  lines.push('');
  lines.push('/**');
  lines.push(' * 単一インスタンス想定のCPT(例: nkk_network)の、唯一の投稿へのパーマリンクを取得する。');
  lines.push(' * vocabulary.md はどの投稿を指すかの識別方法を定義していないため、');
  lines.push(' * 「該当CPTの最初の1件」を採用する(本PoCで変換器側が下した判断。report item5参照)。');
  lines.push(' */');
  lines.push('function nkk_get_single_permalink( $post_type ) {');
  lines.push("    $posts = get_posts( array( 'post_type' => $post_type, 'posts_per_page' => 1, 'orderby' => 'date', 'order' => 'ASC' ) );");
  lines.push("    return $posts ? get_permalink( $posts[0] ) : '';");
  lines.push('}');
  lines.push('');

  // --- サイトオプション取得ヘルパー ---
  lines.push('/**');
  lines.push(' * site-options 用の固定ページ(page-site-options.php を割り当てたページ)のIDを取得する。');
  lines.push(' * ACF無料版はオプションページを持たないための代替実装(ichiki.md準拠: ACF PRO専用機能に非依存)。');
  lines.push(' */');
  lines.push('function nkk_get_site_options_page_id() {');
  lines.push("    static $id = null;");
  lines.push('    if ( null === $id ) {');
  lines.push("        $page = get_page_by_path( 'site-options' );");
  lines.push('        $id = $page ? $page->ID : 0;');
  lines.push('    }');
  lines.push('    return $id;');
  lines.push('}');
  lines.push('');

  // --- ナビ Walker(theme_location ごとに1クラス) ---
  // 実装は lib/gen/nav-walker.js。生成PHPを単体テストできるよう切り出してある。
  for (const line of generateNavWalkers(model.navInfo)) lines.push(line);

  // --- inc/ の読み込み ---
  lines.push('foreach ( glob( get_template_directory() . \'/inc/*.php\' ) as $nkk_inc_file ) {');
  lines.push('    require_once $nkk_inc_file;');
  lines.push('}');
  lines.push('');

  return lines.join('\n');
}

module.exports = { generateFunctionsPhp };
