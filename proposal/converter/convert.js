#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const { findHtmlFiles } = require('./lib/discover');
const { loadPage } = require('./lib/load-page');
const { ErrorCollector } = require('./lib/errors');
const { buildModel } = require('./lib/model');
const { copyAssets } = require('./lib/gen/assets');
const {
  generatePageAcf,
  generateFrontAcf,
  generateCptAcf,
  generateCptArchiveAcf,
  generateSiteOptionsAcf,
} = require('./lib/gen/acf');
const { generateFunctionsPhp } = require('./lib/gen/functions');
const { generateSeedCf7Php } = require('./lib/gen/cf7');
const {
  generateHeaderPhp,
  generateFooterPhp,
  generateCommonTemplateParts,
  generateFrontPageTemplate,
  generatePageTemplates,
  generateSiteOptionsPageTemplate,
  generateCptTemplates,
  generateStyleCss,
} = require('./lib/gen/templates');

function main() {
  const argv = process.argv.slice(2);
  // --allow-unresolved-links: 未解決の内部リンクをエラーではなく警告にする。
  // 設計原則3（エスケープハッチを作らない）に反するため、**既定では無効**。
  // モックのページを揃える途中で WordPress 上の動作確認まで先に進めるための一時措置で、
  // 全ページが揃ったら外す。渡した場合は生成後に必ず警告の要約を出す。
  const allowUnresolvedLinks = argv.includes('--allow-unresolved-links');
  const [mockupDirArg, outDirArg] = argv.filter((a) => !a.startsWith('--'));
  if (!mockupDirArg || !outDirArg) {
    console.error('使い方: node convert.js <mockupDir> <outDir> [--allow-unresolved-links]');
    process.exit(2);
  }
  const mockupDir = path.resolve(mockupDirArg);
  const outDir = path.resolve(outDirArg);

  if (!fs.existsSync(mockupDir)) {
    console.error(`入力ディレクトリが存在しません: ${mockupDir}`);
    process.exit(2);
  }

  const files = findHtmlFiles(mockupDir);
  if (files.length === 0) {
    console.error(`HTMLファイルが見つかりません: ${mockupDir}`);
    process.exit(2);
  }

  const pages = files.map((f) => loadPage(f.abs, f.rel));
  const errors = new ErrorCollector();
  errors.allowUnresolvedLinks = allowUnresolvedLinks;

  let model;
  const outputFiles = new Map(); // relPath -> content

  try {
    model = buildModel(pages, errors);

    // ページ固有 JS は css/page/*.css と同じ規約（js/page/<id>.js があれば enqueue する）。
    // 実在するファイルだけを対象にする（無いファイルを読み込ませない）。
    model.pageJs = new Set();
    const pageJsDir = path.join(mockupDir, 'js', 'page');
    if (fs.existsSync(pageJsDir)) {
      for (const name of fs.readdirSync(pageJsDir)) {
        if (name.endsWith('.js')) model.pageJs.add(name.slice(0, -3));
      }
    }

    // --- functions.php / style.css ---
    outputFiles.set('functions.php', generateFunctionsPhp(model, errors));
    outputFiles.set('style.css', generateStyleCss());

    // --- header.php / footer.php / template-parts ---
    const headerPhp = generateHeaderPhp(model, errors);
    if (headerPhp) outputFiles.set('header.php', headerPhp);
    const footerPhp = generateFooterPhp(model, errors);
    if (footerPhp) outputFiles.set('footer.php', footerPhp);
    for (const part of generateCommonTemplateParts(model, errors)) {
      outputFiles.set(part.filename, part.content);
    }

    // --- front-page.php / page-*.php ---
    const front = generateFrontPageTemplate(model, errors);
    if (front) outputFiles.set(front.filename, front.content);
    for (const p of generatePageTemplates(model, errors)) outputFiles.set(p.filename, p.content);
    const siteOptionsTpl = generateSiteOptionsPageTemplate();
    outputFiles.set(siteOptionsTpl.filename, siteOptionsTpl.content);

    // --- archive-*.php / single-*.php ---
    for (const t of generateCptTemplates(model, errors)) outputFiles.set(t.filename, t.content);

    // --- inc/acf-*.php ---
    if (model.front && model.front.ownFields.length > 0) {
      const php = generateFrontAcf(model.front.ownFields, errors);
      if (php) outputFiles.set('inc/acf-front.php', php);
    }
    for (const [pageId, entry] of model.pageMap) {
      const php = generatePageAcf(pageId, entry.fields, errors);
      if (php) outputFiles.set(`inc/acf-${pageId}.php`, php);
    }
    for (const [cpt, entry] of model.cptMap) {
      if (entry.fields && entry.fields.length > 0) {
        outputFiles.set(`inc/acf-${cpt}.php`, generateCptAcf(cpt, entry.fields, !!entry.archivePage, errors));
      }
      if (entry.archiveFields && entry.archiveFields.length > 0) {
        outputFiles.set(`inc/acf-${cpt}-archive.php`, generateCptArchiveAcf(cpt, entry.archiveFields, errors));
      }
    }
    outputFiles.set('inc/acf-site-options.php', generateSiteOptionsAcf(model.siteOptionFields, errors));

    // --- inc/seed-cf7.php ---
    outputFiles.set('inc/seed-cf7.php', generateSeedCf7Php(model, errors));

    errors.throwIfAny();
  } catch (e) {
    if (e.isConversionError) {
      console.error(e.message);
      process.exit(1);
    }
    throw e;
  }

  // --- ここまでエラー無し。ファイルを書き出す(全部成功するまでテーマを書き出さない) ---
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  for (const [rel, content] of outputFiles) {
    const abs = path.join(outDir, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content, 'utf8');
  }
  copyAssets(mockupDir, outDir, errors);
  if (errors.hasErrors) {
    console.error(errors.report());
    process.exit(1);
  }

  console.log(`生成完了: ${outDir}`);
  console.log(`ファイル数: ${outputFiles.size + 1 /* style.css 等込み概算 */}`);
  // 警告は生成が成功しても必ず出す（緩めたことが見逃されないようにする）
  const wr = errors.warningReport();
  if (wr) console.log(wr);
}

main();
