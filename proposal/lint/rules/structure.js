'use strict';

// L01: <body> に data-page がある
// L02: data-page="page" に data-page-id がある / archive・single に data-cpt がある
// L07: data-loop 直下の data-loop-item がちょうど1個
// L19: <section> に class か data-* のいずれか(両方ではない)がある
const { mk } = require('../lib/issue');
const { VALID_DATA_PAGE } = require('../lib/constants');

function run(page) {
  const issues = [];
  const $ = page.$;
  const body = $('body');

  if (body.length === 0) {
    issues.push(mk(page, 'L01', 'error', 1, '<body> が見つかりません'));
    return issues;
  }

  const bodyLine = page.lineOf(body);
  const dataPage = body.attr('data-page');

  if (dataPage === undefined) {
    issues.push(mk(page, 'L01', 'error', bodyLine, '<body> に data-page がありません'));
  } else if (!VALID_DATA_PAGE.includes(dataPage)) {
    issues.push(
      mk(
        page,
        'L01',
        'error',
        page.attrLineOf(body, 'data-page'),
        `data-page="${dataPage}" は無効な値です(front/page/archive/single のいずれか)`
      )
    );
  }

  if (dataPage === 'page' && body.attr('data-page-id') === undefined) {
    issues.push(mk(page, 'L02', 'error', bodyLine, 'data-page="page" ですが data-page-id がありません'));
  }
  if ((dataPage === 'archive' || dataPage === 'single') && body.attr('data-cpt') === undefined) {
    issues.push(mk(page, 'L02', 'error', bodyLine, `data-page="${dataPage}" ですが data-cpt がありません`));
  }

  // L07: data-loop 直下(直接の子)の data-loop-item はちょうど1個
  $('[data-loop]').each((_, el) => {
    const $el = $(el);
    const items = $el.children('[data-loop-item]');
    const line = page.lineOf($el);
    if (items.length !== 1) {
      issues.push(
        mk(
          page,
          'L07',
          'error',
          line,
          `data-loop="${$el.attr('data-loop')}" 直下の data-loop-item が${items.length}個です(ちょうど1個である必要があります)`
        )
      );
    }
  });

  // L19: <section> に class か data-* の少なくとも一方がある(両方あってよい)
  $('section').each((_, el) => {
    const attribs = el.attribs || {};
    const hasClass = Object.prototype.hasOwnProperty.call(attribs, 'class');
    const hasDataAttr = Object.keys(attribs).some((k) => k.startsWith('data-'));
    const line = page.lineOf($(el));
    if (!hasClass && !hasDataAttr) {
      issues.push(mk(page, 'L19', 'error', line, '<section> に class も data-* もありません(命名の手がかりがありません)'));
    }
  });

  return issues;
}

module.exports = { run };
