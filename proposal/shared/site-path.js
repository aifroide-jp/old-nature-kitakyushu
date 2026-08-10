'use strict';

// href/src の値を、ページの位置に依存しない「サイトパス」表記に正規化する。
//
// vocabulary.md 4章(data-common)/5章(data-nav)は、同名の共通要素の内容が全ページで
// バイト単位で同一であることを要求している。しかし v0.1 で href/src をサイトルート絶対
// パスからページ階層に応じた相対パス(例: "/css/base.css" → "../css/base.css")へ変更した
// ため、同じ共通ヘッダー/フッターでもページの深さによって正しい相対パス表記が変わる
// (例: ホームリンクは index.html から見て "index.html"、about/strategy.html から見て
// "../index.html")。これは同じリンク先を指す正当な違いであり、共通領域のコンテンツ差分
// ではない。比較する前に本関数で「mockupルートからのサイトパス」表記へ正規化する。
//
// proposal/lint（rules/common-nav.js の L09）と proposal/converter（lib/model.js の
// data-common / data-nav 一致検証）の両方から参照される。二重実装しないこと
// (vocabulary.md 冒頭の原則)。
const path = require('path');

// 外部URL・#アンカー・mailto:/tel:・data: はそのまま返す(位置に依存しないため)。
function normalizeAttrValue(value, pageRelPath) {
  if (/^(#|https?:\/\/|\/\/|mailto:|tel:|data:)/i.test(value)) return value;
  const [withoutHash] = value.split('#');
  const clean = withoutHash.split('?')[0];
  if (clean.startsWith('/')) return clean.slice(1) || 'index.html'; // 万一まだ絶対パスが残っていた場合の保険
  const currentDir = path.posix.dirname(pageRelPath); // ルート直下ページは "."
  const joined = currentDir === '.' ? clean : `${currentDir}/${clean}`;
  return path.posix.normalize(joined);
}

// outerHTML文字列中の href/src 属性値をすべて normalizeAttrValue() で正規化する。
// data-common / data-nav 要素のページ横断バイト比較に使う(比較専用。出力には使わない)。
function normalizeOuterForCompare(outerHtml, pageRelPath) {
  return outerHtml.replace(/(href|src)="([^"]*)"/g, (m, attr, val) => {
    return `${attr}="${normalizeAttrValue(val, pageRelPath)}"`;
  });
}

module.exports = { normalizeAttrValue, normalizeOuterForCompare };
