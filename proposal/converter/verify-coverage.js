#!/usr/bin/env node
'use strict';

// data-acf 宣言数 vs the_field()/get_field() 出力数の突合チェック(独立検証)。
// proposal/mockup の生HTMLを直接正規表現で走査して「宣言されたフィールド名」を求め、
// 生成済みテーマの *.php を直接正規表現で走査して「出力されたフィールド名」を求め、
// 変換器の内部モデルを一切経由せずに突き合わせる(モデルのバグと出力のバグが
// 相殺して一致して見えてしまう事故を避けるため)。

const fs = require('fs');
const path = require('path');
const { findHtmlFiles } = require('./lib/discover');

function declaredFieldsPerPage(mockupDir) {
  const files = findHtmlFiles(mockupDir);
  const perPage = new Map(); // relPath -> Set(name)
  const dataAcfRe = /data-acf="([^"]+)"/g;
  const dataAcfUrlRe = /data-acf-url="([^"]+)"/g;
  for (const f of files) {
    const html = fs.readFileSync(f.abs, 'utf8');
    const names = new Set();
    let m;
    while ((m = dataAcfRe.exec(html))) names.add(m[1]);
    while ((m = dataAcfUrlRe.exec(html))) names.add(m[1]);
    perPage.set(f.rel, names);
  }
  return perPage;
}

function outputFieldNames(themeDir) {
  const names = new Set();
  // the_field()/get_field() の呼び出しだけを「出力された」とみなす。
  // ACFへの登録('name' => '...')は意図的に対象外にする — CLAUDE.mdが指摘する
  // 「ACFに登録したがテンプレートに出力し忘れる」事故を発見するのがこのチェックの目的であり、
  // 登録済みかどうかは無関係(登録だけされて未出力のフィールドを見逃してはいけない)。
  const reList = [/the_field\(\s*'([^']+)'/g, /get_field\(\s*'([^']+)'/g];
  (function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'assets') continue;
        walk(abs);
      } else if (entry.isFile() && entry.name.endsWith('.php')) {
        const text = fs.readFileSync(abs, 'utf8');
        for (const re of reList) {
          let m;
          while ((m = re.exec(text))) names.add(m[1]);
        }
      }
    }
  })(themeDir);
  return names;
}

function main() {
  const [, , mockupDirArg, themeDirArg] = process.argv;
  if (!mockupDirArg || !themeDirArg) {
    console.error('使い方: node verify-coverage.js <mockupDir> <themeDir>');
    process.exit(2);
  }
  const mockupDir = path.resolve(mockupDirArg);
  const themeDir = path.resolve(themeDirArg);

  const perPage = declaredFieldsPerPage(mockupDir);
  const outputNames = outputFieldNames(themeDir);

  let totalDeclared = 0;
  let totalMatched = 0;
  const rows = [];
  for (const [rel, names] of perPage) {
    let matched = 0;
    const missing = [];
    for (const n of names) {
      if (outputNames.has(n)) matched += 1;
      else missing.push(n);
    }
    totalDeclared += names.size;
    totalMatched += matched;
    rows.push({ rel, declared: names.size, matched, missing });
  }

  console.log('=== data-acf 宣言 vs the_field()/get_field() 出力 突合結果(ページ別) ===');
  for (const r of rows) {
    console.log(`${r.rel}: ${r.matched}/${r.declared}` + (r.missing.length ? `  未出力: ${r.missing.join(', ')}` : ''));
  }
  console.log('');
  console.log(`合計: ${totalMatched}/${totalDeclared}`);
  process.exit(totalMatched === totalDeclared ? 0 : 1);
}

main();
