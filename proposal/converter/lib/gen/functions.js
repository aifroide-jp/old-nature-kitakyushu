'use strict';

const { CPT_PREFIX } = require('../constants');
const { phpSingleQuote } = require('../php-util');

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

  // --- フラットナビ(単一<ul><li><a>形式)の <li>/<a> class 保持 ---
  // 背景(バグ修正): items_wrap で <ul> の class は保持できるが、<li> は wp_nav_menu() が
  // 各項目ごとに動的生成するため、items_wrap には書けない。何もしないと wp_nav_menu() の
  // 既定class(menu-item, menu-item-type-…等)に置き換わり、モックの class(例: site-nav__item)が
  // 消えてCSSが当たらなくなる(実際に発生した欠陥。ichiki.md「モックと1:1」契約違反)。
  // theme_location ごとにモックから読み取った実class(nav-structure.jsが決定的に確定した値)を
  // 保持し、nav_menu_css_class / nav_menu_link_attributes フィルタで丸ごと差し替える。
  // grouped(footer等)は専用Walkerが start_el を独自実装しており、この2フィルタは
  // 呼ばれない(Walker側でclassを直接埋め込む。下記 Nkk_Grouped_Nav_Walker 参照)ため対象外。
  const flatNavs = [...model.navInfo.entries()].filter(([, info]) => info.kind === 'flat');
  if (flatNavs.length > 0) {
    lines.push('$nkk_nav_flat_classes = array(');
    for (const [name, info] of flatNavs) {
      const liVal = info.liClass ? phpSingleQuote(info.liClass) : 'null';
      const aVal = info.aClass ? phpSingleQuote(info.aClass) : 'null';
      lines.push(`    ${phpSingleQuote(name)} => array( 'li' => ${liVal}, 'a' => ${aVal} ),`);
    }
    lines.push(');');
    lines.push('');
    lines.push('function nkk_nav_menu_css_class( $classes, $item, $args, $depth ) {');
    lines.push('    global $nkk_nav_flat_classes;');
    lines.push("    if ( empty( $args->theme_location ) || ! isset( $nkk_nav_flat_classes[ $args->theme_location ] ) ) {");
    lines.push('        return $classes;');
    lines.push('    }');
    lines.push("    $li_class = $nkk_nav_flat_classes[ $args->theme_location ]['li'];");
    lines.push('    return $li_class ? array( $li_class ) : array();');
    lines.push('}');
    lines.push("add_filter( 'nav_menu_css_class', 'nkk_nav_menu_css_class', 10, 4 );");
    lines.push('');
    lines.push('function nkk_nav_menu_link_attributes( $atts, $item, $args, $depth ) {');
    lines.push('    global $nkk_nav_flat_classes;');
    lines.push("    if ( empty( $args->theme_location ) || ! isset( $nkk_nav_flat_classes[ $args->theme_location ] ) ) {");
    lines.push('        return $atts;');
    lines.push('    }');
    lines.push("    $a_class = $nkk_nav_flat_classes[ $args->theme_location ]['a'];");
    lines.push('    if ( $a_class ) {');
    lines.push("        $atts['class'] = $a_class;");
    lines.push('    }');
    lines.push('    return $atts;');
    lines.push('}');
    lines.push("add_filter( 'nav_menu_link_attributes', 'nkk_nav_menu_link_attributes', 10, 4 );");
    lines.push('');
  }

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

  // --- グループ化ナビ(footer等)のWalker。data-navの入れ子構造(見出し+ul)を再現する ---
  // divClass/ulClass/liClass/aClass はモックから読み取った実class(nav-structure.js)。
  // 生成時に確定する静的文字列としてPHPソースへ直接埋め込む(items_wrapと違い、Walkerの
  // start_el/start_lvlは変換器がPHPコードそのものを生成するため、フラットナビのような
  // 実行時フィルタは不要。headingClassは元々このように埋め込まれていたが、divClass/ulClassは
  // これまでパース済みなのに未使用のまま捨てられていた取りこぼしだったため、併せて修正する)。
  const grouped = [...model.navInfo.entries()].filter(([, info]) => info.kind === 'grouped');
  if (grouped.length > 0) {
    const sample = grouped[0][1].groups[0];
    const headingTag = sample.headingTag;
    const headingClassAttr = sample.headingClass ? ` class="${sample.headingClass}"` : '';
    const divClassAttr = sample.divClass ? ` class="${sample.divClass}"` : '';
    const ulClassAttr = sample.ulClass ? ` class="${sample.ulClass}"` : '';
    const liClassAttr = sample.liClass ? ` class="${sample.liClass}"` : '';
    const aClassAttr = sample.aClass ? ` class="${sample.aClass}"` : '';
    lines.push('/**');
    lines.push(' * data-nav="footer" のような「<div><h?>見出し</h?><ul>…</ul></div>」の繰り返し構造を');
    lines.push(' * wp_nav_menu() で再現するための Walker。トップレベルの菜单项目=見出し(リンクなし表示)、');
    lines.push(' * 子項目=実リンクという2階層メニューを wp-admin 側で組む運用を前提にする。');
    lines.push(' * vocabulary.md 5章はnavの入れ子構造を定義していないため、この構造は変換器側の判断。');
    lines.push(' */');
    lines.push('class Nkk_Grouped_Nav_Walker extends Walker_Nav_Menu {');
    lines.push('    public function start_lvl( &$output, $depth = 0, $args = null ) {');
    lines.push(`        $output .= '<ul${ulClassAttr}>';`);
    lines.push('    }');
    lines.push('    public function end_lvl( &$output, $depth = 0, $args = null ) {');
    lines.push("        $output .= '</ul>';");
    lines.push('    }');
    lines.push('    public function start_el( &$output, $item, $depth = 0, $args = null, $id = 0 ) {');
    lines.push('        if ( 0 === $depth ) {');
    lines.push(`            $output .= '<div${divClassAttr}>';`);
    lines.push(`            $output .= '<${headingTag}${headingClassAttr}>' . esc_html( $item->title ) . '</${headingTag}>';`);
    lines.push('        } else {');
    lines.push(`            $output .= '<li${liClassAttr}>';`);
    lines.push(`            $output .= '<a${aClassAttr} href="' . esc_url( $item->url ) . '">' . esc_html( $item->title ) . '</a>';`);
    lines.push("            $output .= '</li>';");
    lines.push('        }');
    lines.push('    }');
    lines.push('    public function end_el( &$output, $item, $depth = 0, $args = null ) {');
    lines.push('        if ( 0 === $depth ) {');
    lines.push("            $output .= '</div>';");
    lines.push('        }');
    lines.push('    }');
    lines.push('}');
    lines.push('');
  }

  // --- inc/ の読み込み ---
  lines.push('foreach ( glob( get_template_directory() . \'/inc/*.php\' ) as $nkk_inc_file ) {');
  lines.push('    require_once $nkk_inc_file;');
  lines.push('}');
  lines.push('');

  return lines.join('\n');
}

module.exports = { generateFunctionsPhp };
