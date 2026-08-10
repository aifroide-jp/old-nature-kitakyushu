'use strict';

// L10: data-cf7-submit がフォーム内にちょうど1個
const { mk } = require('../lib/issue');

function run(page) {
  const issues = [];
  const $ = page.$;

  $('[data-cf7]').each((_, el) => {
    const $el = $(el);
    const submits = $el.find('[data-cf7-submit]');
    const line = page.lineOf($el);
    if (submits.length !== 1) {
      issues.push(
        mk(
          page,
          'L10',
          'error',
          line,
          `data-cf7="${$el.attr('data-cf7')}" 内の data-cf7-submit が${submits.length}個です(ちょうど1個である必要があります)`
        )
      );
    }
  });

  return issues;
}

module.exports = { run };
