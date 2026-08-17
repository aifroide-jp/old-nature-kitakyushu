#!/usr/bin/env node
'use strict';

// 検証ゲートを一括で流す。**最初に落ちたところで止める。**
//
//   node proposal/gate.js [mockupDir] [オプション]
//
//     --allow-unresolved-links  未解決の内部リンクを警告に落として変換を続行する
//     --visual                  ピクセル比較も実行する（遅いので既定では走らせない）
//
// 個々のツールは README.md の「ゲート一覧」に説明がある。ここはその順番を固定するだけで、
// 検査の中身は一切持たない（持つと N 個目の実装になる）。
//
// --allow-unresolved-links について:
//   本番案件ではモック＝全ページなので、未解決リンクは本当の不具合であり、
//   このオプションを使う理由が無い。
//   一方この PoC は 51ページ中 11ページだけを書き直したサンプルなので、
//   書いていないページへのリンクは解決しなくて当然であり、恒久的に必要になる。
//   どちらの意味で渡しているかを、実行のたびに出力へ明示する。

const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = __dirname;
const argv = process.argv.slice(2);
const allowUnresolved = argv.includes('--allow-unresolved-links');
const withVisual = argv.includes('--visual');
const mockupDir = argv.find((a) => !a.startsWith('--')) || path.join(ROOT, 'mockup-real');

const themeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nkk-gate-theme-'));

const steps = [];
function step(name, cmd, args, opts = {}) {
  steps.push({ name, cmd, args, ...opts });
}

// 1. ルール自体が健全か（語彙・lint・プロンプトの3者が揃っているか）
step('ルール同期', 'node', [path.join(ROOT, 'check-rule-sync.js')]);

// 2. モックが規約に適合しているか
step('lint', 'node', [path.join(ROOT, 'lint', 'lint.js'), mockupDir]);

// 3. アクセシビリティ（モック段階で通す）
step('a11y', 'node', [path.join(ROOT, 'a11y', 'check.js'), mockupDir]);

// 4. テキストの取りこぼしがゼロか／acf-map.yaml が出るか
step('scan', 'node', [
  path.join(ROOT, 'scan', 'scan.js'),
  mockupDir,
  path.join(ROOT, 'scan', 'out-gate'),
]);

// 5. テーマ生成
step(
  '変換',
  'node',
  [
    path.join(ROOT, 'converter', 'convert.js'),
    mockupDir,
    themeDir,
    ...(allowUnresolved ? ['--allow-unresolved-links'] : []),
  ]
);

// 6. 生成物の検証（宣言の出力漏れ／class の消失）
step('フィールド突合', 'node', [path.join(ROOT, 'converter', 'verify-coverage.js'), mockupDir, themeDir]);
step('構造忠実性', 'node', [path.join(ROOT, 'converter', 'verify-structure.js'), mockupDir, themeDir]);

// 7. PHP の構文（php が無い環境ではスキップし、スキップした旨を必ず出す）
step('php -l', null, null, { php: true });

// 8. 見た目（既定では走らせない。--visual で有効化）
if (withVisual) step('ピクセル比較', 'node', [path.join(ROOT, 'visual-check', 'compare.js')]);

function runPhpLint() {
  const probe = spawnSync('php', ['-v'], { encoding: 'utf8' });
  if (probe.status !== 0) {
    return { status: 0, output: '', skipped: 'php が見つからないためスキップしました' };
  }
  const files = [];
  (function walk(d) {
    if (!fs.existsSync(d)) return;
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.php')) files.push(p);
    }
  })(themeDir);
  if (files.length === 0) return { status: 1, output: 'テーマに .php が1つもありません' };
  const bad = [];
  for (const f of files) {
    const r = spawnSync('php', ['-l', f], { encoding: 'utf8' });
    if (r.status !== 0) bad.push((r.stdout || '') + (r.stderr || ''));
  }
  return { status: bad.length ? 1 : 0, output: bad.join('\n'), note: `${files.length}ファイル` };
}

function main() {
  console.log(`対象: ${mockupDir}`);
  if (allowUnresolved) {
    console.log('※ --allow-unresolved-links: 未解決の内部リンクを警告に落としています。');
    console.log('   本番案件では使わないこと（モック＝全ページなので未解決＝不具合）。');
  }
  console.log('');

  for (const s of steps) {
    const r = s.php
      ? runPhpLint()
      : (() => {
          const p = spawnSync(s.cmd, s.args, { encoding: 'utf8' });
          return { status: p.status, output: (p.stdout || '') + (p.stderr || '') };
        })();

    if (r.status !== 0) {
      console.log(`✗ ${s.name}`);
      console.log('');
      console.log(r.output.trimEnd());
      console.log('');
      console.log(`ここで停止しました。${s.name} を通してから再実行してください。`);
      process.exit(1);
    }
    const tail = r.skipped ? `（${r.skipped}）` : r.note ? `（${r.note}）` : '';
    console.log(`✓ ${s.name}${tail}`);
  }

  console.log('');
  console.log(`全ゲート通過。生成テーマ: ${themeDir}`);
  if (!withVisual) console.log('※ ピクセル比較は未実行です（--visual で実行）。');
  process.exit(0);
}

main();
