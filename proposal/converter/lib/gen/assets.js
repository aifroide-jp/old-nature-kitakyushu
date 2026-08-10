'use strict';

const fs = require('fs');
const path = require('path');

function copyDirRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(s, d);
    } else if (entry.isFile()) {
      fs.copyFileSync(s, d);
    }
  }
}

// css/ と images/ を assets/ 配下へコピーする(vocabulary.md 10章)。
// images/meta.yaml は lint 専用のメタ情報であり配信物ではないため除外する。
function copyAssets(mockupDir, outDir, errors) {
  const cssSrc = path.join(mockupDir, 'css');
  const imagesSrc = path.join(mockupDir, 'images');

  if (!fs.existsSync(cssSrc)) {
    errors.add('(assets)', null, 'css/ ディレクトリが見つかりません');
  } else {
    copyDirRecursive(cssSrc, path.join(outDir, 'assets', 'css'));
  }

  if (!fs.existsSync(imagesSrc)) {
    errors.add('(assets)', null, 'images/ ディレクトリが見つかりません');
  } else {
    copyDirRecursive(imagesSrc, path.join(outDir, 'assets', 'images'));
    const metaPath = path.join(outDir, 'assets', 'images', 'meta.yaml');
    if (fs.existsSync(metaPath)) fs.rmSync(metaPath);
  }
}

module.exports = { copyAssets };
