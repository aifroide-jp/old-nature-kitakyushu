#!/usr/bin/env node
'use strict';

// 語彙（vocabulary.md）・lint 実装（lint/rules/*.js）・生成プロンプト（prompts/*.md）の
// 3者にズレが無いかを、ルールID（L01〜）の存在で機械的に照合する。
//
// なぜ要るか: 同じルールを複数箇所で実装・記述すると必ず乖離する。
// 実際に本検証中、相対パス化の際に lint だけ直して変換器が取り残され、
// 18件のエラーで停止した。文章で「二重管理しない」と書いても守られない。
//
// このチェックは「IDが3者に存在するか」しか見ない（内容の一致までは見ない）。
// ID の欠落＝どこかを更新し忘れた、という最も起きやすい事故だけを確実に捕まえる。

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const VOCAB = path.join(ROOT, 'vocabulary.md');
const RULES_DIR = path.join(ROOT, 'lint', 'rules');
const PROMPT = path.join(ROOT, 'prompts', 'mockup-generation.md');

const idsIn = (text) => new Set((text.match(/\bL\d{2}\b/g) || []));

function main() {
  const vocab = idsIn(fs.readFileSync(VOCAB, 'utf8'));
  const prompt = idsIn(fs.readFileSync(PROMPT, 'utf8'));

  // lint 側は「ルールIDを実際に発行しているか」で見る（コメントだけの言及は数えない）。
  // 発行の書き方は2通りある:
  //   - mk(page, 'L01', ...) の第2引数            … 単一ページのルール
  //   - { rule: 'L16', ... } / 引数として 'L09'   … ページ横断のルール
  // どちらも「コード中に文字列リテラルとして現れる」ので、コメント行を除いた上で拾う。
  const impl = new Set();
  for (const f of fs.readdirSync(RULES_DIR)) {
    if (!f.endsWith('.js')) continue;
    const src = fs
      .readFileSync(path.join(RULES_DIR, f), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .split('\n')
      .filter((l) => !/^\s*\/\//.test(l))
      .join('\n');
    for (const m of src.matchAll(/'(L\d{2})'/g)) impl.add(m[1]);
  }

  const all = [...new Set([...vocab, ...prompt, ...impl])].sort();
  const rows = all.map((id) => ({
    id,
    vocabulary: vocab.has(id),
    lint: impl.has(id),
    prompt: prompt.has(id),
  }));

  const bad = rows.filter((r) => !(r.vocabulary && r.lint && r.prompt));

  console.log('ルールID   語彙  lint  プロンプト');
  for (const r of rows) {
    const mark = (b) => (b ? ' ○ ' : ' ✗ ');
    console.log(`  ${r.id}    ${mark(r.vocabulary)}  ${mark(r.lint)}  ${mark(r.prompt)}`);
  }
  console.log('');
  if (bad.length === 0) {
    console.log(`RESULT: 3者すべてに揃っています（${rows.length}ルール）`);
    process.exit(0);
  }
  console.log(`RESULT: ${bad.length}件のズレがあります`);
  for (const r of bad) {
    const missing = [
      !r.vocabulary && 'vocabulary.md',
      !r.lint && 'lint 実装',
      !r.prompt && 'プロンプト',
    ].filter(Boolean);
    console.log(`  ${r.id}: ${missing.join(' / ')} に無い`);
  }
  process.exit(1);
}

main();
