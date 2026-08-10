'use strict';

// data-cf7-* から CF7 6.x のフォーム本文文字列を生成する(vocabulary.md 6章)。
// CF7 6.x の属性順序の制約(placeholder "…" は無引用オプションより後ろ)をここで保証する。
// data-cf7 の <a>(固定リンク)は render.js と同じ resolveFixedHref で解決/検証する。

const { EditList } = require('../edits');
const { resolveHrefExpr } = require('../link-resolve');

function dataAttrNames(el) {
  return Object.keys(el.attribs || {}).filter((k) => k.startsWith('data-'));
}

function buildTag(kind, name, required, classAttr, idAttr, placeholder, extra) {
  const parts = [`${kind}${required ? '*' : ''}`, name];
  if (classAttr) parts.push(`class:${classAttr}`);
  if (idAttr) parts.push(`id:${idAttr}`);
  if (extra) parts.push(...extra);
  // CF7 6.x: クォート付きの値は無引用オプションより後ろに置く(placeholder は必ず最後)。
  if (placeholder) parts.push(`placeholder "${placeholder}"`);
  return `[${parts.join(' ')}]`;
}

function fieldTagFor(page, $, el, errors) {
  const tag = (el.name || '').toLowerCase();
  const $el = $(el);
  const name = $el.attr('data-cf7-field');
  const required = $el.attr('data-cf7-required') !== undefined;
  const classAttr = $el.attr('class');
  const idAttr = $el.attr('id');
  const placeholder = $el.attr('placeholder');
  const line = el.sourceCodeLocation ? el.sourceCodeLocation.startLine : null;

  if (tag === 'select') {
    const options = [];
    $el.find('option').each((_, opt) => {
      const text = $(opt).text();
      if (text) options.push(`"${text}"`);
    });
    return buildTag('select', name, required, classAttr, idAttr, placeholder, options);
  }

  if (tag === 'textarea') {
    return buildTag('textarea', name, required, classAttr, idAttr, placeholder);
  }

  if (tag === 'input') {
    const type = ($el.attr('type') || 'text').toLowerCase();
    if (type === 'checkbox') {
      // vocabulary.md 未決事項6: [acceptance] と [checkbox] の区別は未定義。
      // data-cf7-required 付きの単一チェックボックスは「同意」の意味と判断し [acceptance] を採用する
      // (本PoCでの変換器側判断。report item5で明記する)。
      if (!required) {
        errors.add(page.relPath, line, `data-cf7-field="${name}": data-cf7-required の無いチェックボックスは[checkbox]/[acceptance]のどちらか未定義のため未対応です`);
        return null;
      }
      return `[acceptance ${name}]`;
    }
    if (['text', 'email', 'tel', 'url', 'number', 'date'].includes(type)) {
      return buildTag(type, name, required, classAttr, idAttr, placeholder);
    }
    errors.add(page.relPath, line, `data-cf7-field="${name}": input[type="${type}"] のCF7タグ変換は未対応です`);
    return null;
  }

  errors.add(page.relPath, line, `data-cf7-field="${name}": <${tag}> のCF7タグ変換は未対応です`);
  return null;
}

// data-cf7 要素の中身全体を、CF7の「フォーム」タブ本文として使えるHTML文字列に変換する。
// 戻り値: { body, varDecls }。
// 固定リンクの href 解決結果はここでは <?php ?> を埋め込めない(この文字列は
// PHPのヒアドキュメントとしてそのままCF7投稿のフォーム本文=DBの文字列値になるため、
// 実行時に評価されるPHPタグを書いても「文字列としての<?php ... ?>」がそのまま保存されて
// しまう=事実上のデッドコードになる)。そのため呼び出し側で事前に評価した変数への
// 埋め込み( "{$var}" )に置き換え、変数宣言は varDecls として別途返す。
function buildCf7FormBody(page, model, formEl, errors) {
  const $ = page.$;
  const loc = formEl.sourceCodeLocation;
  const base = loc.startTag.endOffset;
  const raw = page.html.slice(base, loc.endTag.startOffset);
  const editList = new EditList(raw);
  const varDecls = [];
  let varSeq = 0;

  function addAbs(start, end, replacement) {
    editList.replace(start - base, end - base, replacement);
  }

  function stripAllDataAttrs(node) {
    const nloc = node.sourceCodeLocation;
    if (!nloc || !nloc.attrs) return;
    for (const key of dataAttrNames(node)) {
      const aloc = nloc.attrs[key];
      if (!aloc) continue;
      let start = aloc.startOffset;
      const end = aloc.endOffset;
      if (page.html[start - 1] === ' ') start -= 1;
      addAbs(start, end, '');
    }
  }

  function visit(node) {
    if (!node || node.type !== 'tag') return;
    const attrs = node.attribs || {};
    const nloc = node.sourceCodeLocation;

    if ('data-cf7-field' in attrs) {
      const tagText = fieldTagFor(page, $, node, errors);
      if (tagText !== null) addAbs(nloc.startOffset, nloc.endOffset, tagText);
      return;
    }

    stripAllDataAttrs(node);

    if ((node.name || '').toLowerCase() === 'a' && $(node).attr('data-acf-url') === undefined) {
      const hrefLoc = nloc.attrs && nloc.attrs.href;
      if (hrefLoc) {
        const href = $(node).attr('href');
        const phpExpr = resolveHrefExpr(page, nloc.startLine, href, model.linkRegistry, errors);
        if (phpExpr) {
          varSeq += 1;
          const varName = `$nkk_cf7_link_${varSeq}`;
          varDecls.push(`${varName} = ${phpExpr};`);
          addAbs(hrefLoc.startOffset, hrefLoc.endOffset, `href="{${varName}}"`);
        }
      }
    }

    for (const c of node.children || []) visit(c);
  }

  for (const c of formEl.children || []) visit(c);

  return { body: editList.apply().trim(), varDecls };
}

// inc/seed-cf7.php: WPCF7_ContactForm::get_template()+set_properties() でフォームを作成する。
function generateSeedCf7Php(model, errors) {
  const forms = [];
  for (const [name, entry] of model.forms) {
    const body = buildCf7FormBody(entry.page, model, entry.el, errors);
    forms.push({ name, body });
  }

  const lines = [];
  lines.push('<?php');
  lines.push('/**');
  lines.push(' * inc/seed-cf7.php');
  lines.push(' * data-cf7 から生成した Contact Form 7 定義(vocabulary.md 6章)。');
  lines.push(' * CF7 6.x では WPCF7_ContactForm::set_form() が存在しないため set_properties() を使う。');
  lines.push(' */');
  lines.push('');
  lines.push('if ( ! defined( \'ABSPATH\' ) ) { exit; }');
  lines.push('');
  lines.push('function nkk_seed_cf7_forms() {');
  lines.push('    if ( ! class_exists( \'WPCF7_ContactForm\' ) ) { return; }');
  lines.push('');
  for (const f of forms) {
    lines.push(`    if ( null === get_page_by_title( '${f.name}', OBJECT, 'wpcf7_contact_form' ) ) {`);
    for (const decl of f.body.varDecls) lines.push(`        ${decl}`);
    lines.push(`        $cf7 = WPCF7_ContactForm::get_template( array( 'title' => '${f.name}' ) );`);
    lines.push('        $cf7->set_properties( array(');
    // ヒアドキュメント(クォート無し FORM)を使い、固定リンクの解決結果である
    // 上記 $nkk_cf7_link_N 変数だけを "{$var}" 補間で展開する。それ以外はプレーンテキストとして扱う。
    lines.push('            \'form\' => <<<FORM');
    lines.push(f.body.body);
    lines.push('FORM,');
    lines.push('        ) );');
    lines.push('        $cf7->save();');
    lines.push('    }');
  }
  lines.push('}');
  lines.push('add_action( \'admin_init\', \'nkk_seed_cf7_forms\' );');
  lines.push('');
  return lines.join('\n');
}

module.exports = { generateSeedCf7Php, buildCf7FormBody };
