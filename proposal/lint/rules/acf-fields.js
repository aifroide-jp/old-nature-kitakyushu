'use strict';

// L03: data-acf 値が命名規則に適合
// L04: data-acf がページ内で重複していない
// L05: 型が導出できないタグに data-acf-type がある(=必須)
// L06: data-acf-type の値が有効な5型のいずれか
const { mk } = require('../lib/issue');
const { DERIVABLE_TAGS, VALID_ACF_TYPES, ACF_NAME_RE } = require('../lib/constants');

function run(page) {
  const issues = [];
  const $ = page.$;
  // data-acf 名の重複はスコープごとに見る。
  // [data-loop-item] の中のフィールドは「そのループが指す CPT の詳細ページ」の
  // 名前空間に属するので、ページ本体や別 CPT のループと同名になって当然である
  // （例: トップに spot / center / event / news の4ループがあれば hero_title は4回出る）。
  // ページ単位で一律に重複判定すると、正しい記述を誤ってエラーにする。
  const scopes = new Map(); // scopeKey -> Map(name -> 初出行)
  const scopeOf = ($el) => {
    const $item = $el.closest('[data-loop-item]');
    if (!$item.length) return 'page';
    const cpt = $item.closest('[data-loop]').attr('data-loop') || '?';
    return `loop:${cpt}`;
  };

  $('[data-acf]').each((_, el) => {
    const $el = $(el);
    const name = $el.attr('data-acf');
    const line = page.attrLineOf($el, 'data-acf');
    const key = scopeOf($el);
    if (!scopes.has(key)) scopes.set(key, new Map());
    const seen = scopes.get(key);

    if (!ACF_NAME_RE.test(name || '')) {
      issues.push(
        mk(page, 'L03', 'error', line, `data-acf="${name}" が命名規則(ASCII小文字・数字・_、数字始まり禁止)に違反しています`)
      );
    }

    if (seen.has(name)) {
      issues.push(
        mk(page, 'L04', 'error', line, `data-acf="${name}" が同一スコープ(${key})内で重複しています(初出: ${seen.get(name)}行目)`)
      );
    } else {
      seen.set(name, line);
    }
  });

  $('[data-acf], [data-acf-type]').each((_, el) => {
    const $el = $(el);
    const tag = (el.name || '').toLowerCase();
    const hasAcf = $el.attr('data-acf') !== undefined;
    const typeVal = $el.attr('data-acf-type');
    const hasType = typeVal !== undefined;

    if (hasAcf && !DERIVABLE_TAGS.includes(tag) && !hasType) {
      issues.push(
        mk(
          page,
          'L05',
          'error',
          page.attrLineOf($el, 'data-acf'),
          `<${tag} data-acf="${$el.attr('data-acf')}"> は型を導出できないタグのため data-acf-type が必須です`
        )
      );
    }

    if (hasType && !VALID_ACF_TYPES.includes(typeVal)) {
      issues.push(
        mk(
          page,
          'L06',
          'error',
          page.attrLineOf($el, 'data-acf-type'),
          `data-acf-type="${typeVal}" は無効です(有効値: ${VALID_ACF_TYPES.join('/')})`
        )
      );
    }
  });

  return issues;
}

module.exports = { run };
