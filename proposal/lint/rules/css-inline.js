'use strict';

// L11: ページ内 <style> タグが無い
// L12: style="…" 属性が無い
// L13: class 名・data-* 値が全て ASCII (テキストコンテンツは対象外)
const { mk } = require('../lib/issue');

const NON_ASCII_RE = /[^\x00-\x7F]/;

function run(page) {
  const issues = [];
  const $ = page.$;

  $('style').each((_, el) => {
    issues.push(mk(page, 'L11', 'error', page.lineOf($(el)), '<style> タグは禁止されています(css/ 配下のファイルに分離してください)'));
  });

  $('[style]').each((_, el) => {
    const $el = $(el);
    issues.push(
      mk(page, 'L12', 'error', page.attrLineOf($el, 'style'), `style="${$el.attr('style')}" のようなインライン style 属性は禁止されています`)
    );
  });

  $('*').each((_, el) => {
    if (!el.attribs) return;
    const $el = $(el);
    for (const [attrName, value] of Object.entries(el.attribs)) {
      if (attrName !== 'class' && !attrName.startsWith('data-')) continue;
      if (NON_ASCII_RE.test(value)) {
        issues.push(
          mk(page, 'L13', 'error', page.attrLineOf($el, attrName), `${attrName}="${value}" に ASCII 以外の文字が含まれています`)
        );
      }
    }
  });

  return issues;
}

module.exports = { run };
