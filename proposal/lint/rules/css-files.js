'use strict';

// L17: base.css と page/*.css にセレクタの二重定義が無い
//
// vocabulary.md §7 の css/base.css + css/page/*.css 構成を前提にした検査。
// 現行モックはこの構成(css/style.css 単一ファイル)を採っていないため、
// css/base.css または css/page/ が存在しない場合は比較対象なしとして 0 件を返す
// (既知の制約。最終報告で明記する)。
const fs = require('fs');
const path = require('path');

function extractSelectors(cssText) {
  const results = [];
  const re = /([^{}]+)\{/g;
  let m;
  while ((m = re.exec(cssText)) !== null) {
    const raw = m[1].trim();
    if (!raw || raw.startsWith('@')) continue; // @media 等の前置きはセレクタとして扱わない
    const line = cssText.slice(0, m.index).split('\n').length;
    for (const part of raw.split(',')) {
      const sel = part.trim().replace(/\s+/g, ' ');
      if (sel) results.push({ selector: sel, line });
    }
  }
  return results;
}

function run(pages, rootDir) {
  const issues = [];
  const baseCssPath = path.join(rootDir, 'css', 'base.css');
  const pageCssDir = path.join(rootDir, 'css', 'page');

  if (!fs.existsSync(baseCssPath) || !fs.existsSync(pageCssDir)) {
    return issues;
  }

  const baseSelectors = extractSelectors(fs.readFileSync(baseCssPath, 'utf8'));
  const baseSet = new Set(baseSelectors.map((s) => s.selector));

  const pageFiles = fs.readdirSync(pageCssDir).filter((f) => f.toLowerCase().endsWith('.css'));
  for (const f of pageFiles) {
    const abs = path.join(pageCssDir, f);
    const rel = `css/page/${f}`;
    const selectors = extractSelectors(fs.readFileSync(abs, 'utf8'));
    for (const s of selectors) {
      if (baseSet.has(s.selector)) {
        issues.push({
          file: rel,
          line: s.line,
          rule: 'L17',
          severity: 'error',
          message: `セレクタ "${s.selector}" が css/base.css と ${rel} で二重定義されています`,
        });
      }
    }
  }

  return issues;
}

module.exports = { run, extractSelectors };
