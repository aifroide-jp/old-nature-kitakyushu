'use strict';

// L20 (warn): data-acf の無いテキストノードの一覧(=更新対象外になる文言)。
// 運用上いちばん重要なレポートのため、件数だけでなく実際の文字列・file:line を全件出す。
const { mk } = require('../lib/issue');

const SKIP_TAGS = new Set(['script', 'style', 'template', 'svg', 'noscript']);

function isDecorative(ancestors) {
  return ancestors.some((el) => {
    if (!el.attribs) return false;
    if (el.attribs['aria-hidden'] === 'true') return true;
    if (Object.prototype.hasOwnProperty.call(el.attribs, 'data-deco')) return true;
    return false;
  });
}

function isCovered(ancestors) {
  // ancestors のいずれかに data-acf があれば(wysiwyg のまとまりごと ACF 化されている等)
  // その配下のテキストは「更新対象」とみなす。
  return ancestors.some((el) => el.attribs && Object.prototype.hasOwnProperty.call(el.attribs, 'data-acf'));
}

// ACF 以外の仕組みで編集可能・または変換時に破棄されるため、
// 「更新対象外の文言」レポート(L20)に載せてはいけない領域。
// ここを除外しないとレポートの過半がノイズになり、お客様との合意に使えなくなる。
const MANAGED_ELSEWHERE = [
  'data-nav', // WP カスタムメニューで編集する
  'data-cf7', // CF7 のフォーム定義側で編集する
  'data-loop-sample', // デザイン確認用ダミー。変換器が破棄する
  'data-breadcrumb', // 祖先は固定リンク・現在地は投稿タイトル。どちらも編集対象ではない
];

function isManagedElsewhere(ancestors) {
  return ancestors.some(
    (el) =>
      el.attribs && MANAGED_ELSEWHERE.some((a) => Object.prototype.hasOwnProperty.call(el.attribs, a))
  );
}

function walk(node, ancestors, page, issues) {
  if (!node) return;

  if (node.type === 'tag') {
    const tag = (node.name || '').toLowerCase();
    if (SKIP_TAGS.has(tag)) return;
    const chain = [node, ...ancestors];
    if (node.children) {
      for (const child of node.children) walk(child, chain, page, issues);
    }
    return;
  }

  if (node.type === 'text') {
    const text = (node.data || '').trim();
    if (!text) return;
    if (isDecorative(ancestors)) return;
    if (isCovered(ancestors)) return;
    if (isManagedElsewhere(ancestors)) return;

    const loc = node.sourceCodeLocation;
    const line = loc ? loc.startLine : null;
    const normalized = text.replace(/\s+/g, ' ');
    issues.push(mk(page, 'L20', 'warn', line, `data-acf の無いテキスト: "${normalized}"`));
  }
}

function run(page) {
  const issues = [];
  const body = page.$('body').get(0);
  if (!body) return issues;
  walk(body, [], page, issues);
  return issues;
}

module.exports = { run };
