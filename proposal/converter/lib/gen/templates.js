'use strict';

const { renderFragment } = require('../render');
const { CPT_PREFIX } = require('../constants');

function generateHeaderPhp(model, errors) {
  const headerEntry = model.commonMap.get('header');
  if (!headerEntry) {
    errors.add('(model)', null, 'data-common="header" が見つかりません(header.phpを生成できません)');
    return null;
  }
  const headerHtml = renderFragment(headerEntry.page, model, headerEntry.el, true, errors);

  const lines = [];
  lines.push('<!DOCTYPE html>');
  lines.push('<html lang="ja">');
  lines.push('<head>');
  lines.push('<meta charset="UTF-8">');
  lines.push('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
  lines.push('<?php wp_head(); ?>');
  lines.push('</head>');
  lines.push('<body <?php body_class(); ?>>');
  lines.push('<?php wp_body_open(); ?>');
  if (model.skipLinkHtml) lines.push(model.skipLinkHtml);
  lines.push('');
  lines.push(headerHtml);
  lines.push('');
  lines.push('<main id="main-content">');
  lines.push('');
  return lines.join('\n');
}

function generateFooterPhp(model, errors) {
  const footerEntry = model.commonMap.get('footer');
  if (!footerEntry) {
    errors.add('(model)', null, 'data-common="footer" が見つかりません(footer.phpを生成できません)');
    return null;
  }
  const footerHtml = renderFragment(footerEntry.page, model, footerEntry.el, true, errors);

  const lines = [];
  lines.push('</main>');
  lines.push('');
  lines.push(footerHtml);
  lines.push('');
  lines.push('<?php wp_footer(); ?>');
  lines.push('</body>');
  lines.push('</html>');
  return lines.join('\n');
}

// data-common="header"/"footer" 以外(例: "cta")は template-parts/common-<name>.php に切り出す。
function generateCommonTemplateParts(model, errors) {
  const parts = [];
  for (const [name, entry] of model.commonMap) {
    if (name === 'header' || name === 'footer') continue;
    const html = renderFragment(entry.page, model, entry.el, true, errors);
    const content = ['<?php', `/** template-parts/common-${name}.php (data-common="${name}" から生成) */`, '?>', html, ''].join(
      '\n'
    );
    parts.push({ filename: `template-parts/common-${name}.php`, content });
  }
  return parts;
}

function wrapPageBody(templateNameComment, innerHtml) {
  const lines = [];
  lines.push('<?php');
  if (templateNameComment) {
    lines.push('/**');
    lines.push(` * Template Name: ${templateNameComment}`);
    lines.push(' */');
  }
  lines.push('get_header();');
  lines.push('?>');
  lines.push(innerHtml);
  lines.push('<?php get_footer(); ?>');
  return lines.join('\n');
}

function generateFrontPageTemplate(model, errors) {
  if (!model.front) {
    errors.add('(model)', null, 'data-page="front" のページが見つかりません(front-page.phpを生成できません)');
    return null;
  }
  const html = renderFragment(model.front, model, model.front.mainEl, false, errors);
  return { filename: 'front-page.php', content: wrapPageBody(null, html) };
}

// data-common="header" を宣言していないページ（= 自前シェル）は get_header()/get_footer()
// を呼べないので、1枚で完結したドキュメントを出す。
// header.php と同じ scaffold をここでも組むが、<header>/<footer> の中身はページのもの。
function wrapOwnShellPage(model, page, pageId, innerHtml, errors) {
  // includeSelf = true。<header>/<footer> のタグ自体も出力に含める
  // （header.php と同じ扱い。false にすると中身だけになりタグが消える）。
  const headerHtml = renderFragment(page, model, page.ownHeaderEl, true, errors);
  const footerHtml = renderFragment(page, model, page.ownFooterEl, true, errors);

  const lines = [];
  lines.push('<?php');
  lines.push('/**');
  lines.push(` * Template Name: ${pageId}`);
  lines.push(' * サイト共通ヘッダー／フッターを使わないページ。');
  lines.push(' * モックが data-common="header" を宣言していないため、シェルごとこのページのもの。');
  lines.push(' */');
  lines.push('?>');
  lines.push('<!DOCTYPE html>');
  lines.push('<html lang="ja">');
  lines.push('<head>');
  lines.push('<meta charset="UTF-8">');
  lines.push('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
  lines.push('<?php wp_head(); ?>');
  lines.push('</head>');
  lines.push('<body <?php body_class(); ?>>');
  lines.push('<?php wp_body_open(); ?>');
  if (model.skipLinkHtml) lines.push(model.skipLinkHtml);
  lines.push('');
  lines.push(headerHtml);
  lines.push('');
  lines.push('<main id="main-content">');
  lines.push('');
  lines.push(innerHtml);
  lines.push('');
  lines.push('</main>');
  lines.push('');
  lines.push(footerHtml);
  lines.push('');
  lines.push('<?php wp_footer(); ?>');
  lines.push('</body>');
  lines.push('</html>');
  return lines.join('\n');
}

function generatePageTemplates(model, errors) {
  const out = [];
  for (const [pageId, entry] of model.pageMap) {
    const page = entry.page;
    const html = renderFragment(page, model, page.mainEl, false, errors);
    const content = page.ownsShell
      ? wrapOwnShellPage(model, page, pageId, html, errors)
      : wrapPageBody(pageId, html);
    out.push({ filename: `page-${pageId}.php`, content });
  }
  return out;
}

function generateSiteOptionsPageTemplate() {
  const content = [
    '<?php',
    '/**',
    ' * Template Name: site-options',
    ' * サイト共通フィールド(inc/acf-site-options.php)を保持するための非表示ページ。',
    ' * ナビ・検索結果には出さない運用を想定(公開設定は運用側で管理する)。',
    ' */',
    'get_header();',
    '?>',
    '<div class="container"><p>このページはサイト共通設定の保持専用です。</p></div>',
    '<?php get_footer(); ?>',
  ].join('\n');
  return { filename: 'page-site-options.php', content };
}

function generateCptTemplates(model, errors) {
  const out = [];
  for (const [cpt, entry] of model.cptMap) {
    const postType = `${CPT_PREFIX}${cpt}`;

    if (entry.archivePage) {
      const html = renderFragment(entry.archivePage, model, entry.archivePage.mainEl, false, errors);
      out.push({ filename: `archive-${postType}.php`, content: wrapPageBody(null, html) });
    }
    // vocabulary.md 未決事項3: 単一インスタンスCPTのarchiveテンプレート要否は未定義。
    // 対応する data-page="archive" のモックが無いCPT(例: network)は archive-*.php を生成しない
    // (存在しないモックから構造を推測しない)。

    if (entry.canonicalSingle) {
      const html = renderFragment(entry.canonicalSingle, model, entry.canonicalSingle.mainEl, false, errors);
      out.push({ filename: `single-${postType}.php`, content: wrapPageBody(null, html) });
    } else {
      errors.add('(model)', null, `data-cpt="${cpt}" に対応する data-page="single" のページがありません(single-${postType}.phpを生成できません)`);
    }
  }
  return out;
}

function generateStyleCss() {
  return [
    '/*',
    'Theme Name: Nature Kitakyushu (Mockup Converter PoC)',
    'Description: proposal/vocabulary.md 準拠モックアップから proposal/converter が決定的に生成したテーマ。',
    'Version: 0.1.0',
    'Text Domain: nkk',
    '*/',
    '',
  ].join('\n');
}

module.exports = {
  generateHeaderPhp,
  generateFooterPhp,
  generateCommonTemplateParts,
  generateFrontPageTemplate,
  generatePageTemplates,
  generateSiteOptionsPageTemplate,
  generateCptTemplates,
  generateStyleCss,
};
