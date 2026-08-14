'use strict';

// vocabulary.md 2.1 の型導出テーブル + 2.2 の <a> (data-acf は text 導出)。
const DERIVABLE_TAGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'li', 'dd', 'td', 'span', 'img', 'a'];

const TAG_TO_TYPE = {
  h1: 'text', h2: 'text', h3: 'text', h4: 'text', h5: 'text', h6: 'text',
  p: 'textarea', li: 'textarea', dd: 'textarea', td: 'textarea', span: 'textarea',
  img: 'image',
  a: 'text',
};

const VALID_ACF_TYPES = ['text', 'textarea', 'wysiwyg', 'url', 'image'];

const VALID_DATA_PAGE = ['front', 'page', 'archive', 'single'];

// data-acf 命名規則: ASCII小文字・数字・アンダースコアのみ、数字始まり禁止
const ACF_NAME_RE = /^[a-z][a-z0-9_]*$/;

const CPT_PREFIX = 'nkk_';



// 本語彙の構造宣言に使う data-* 属性の全一覧。
// 変換器はこれらだけを出力から削除する。
//
// 以前は「data- で始まる属性を全部削除」していたが、これは誤り。
// サイト自身の JS が使う data-* まで消してしまう（実測: イベント一覧のフィルタが
// data-type / data-category / data-target で動いており、生成後に黙って動かなくなる）。
// 語彙が「data-* は全部構造宣言」と暗黙に前提していた。
//
// **語彙に宣言を追加したら、必ずここにも足すこと。** 足し忘れると宣言が
// そのまま HTML に残る（動作は壊れないが出力が汚れる）。
const DECLARATION_ATTRS = new Set([
  'data-page',
  'data-page-id',
  'data-cpt',
  'data-section',
  'data-acf',
  'data-acf-type',
  'data-acf-url',
  'data-loop',
  'data-loop-item',
  'data-loop-sample',
  'data-loop-order',
  'data-loop-count',
  'data-loop-repeat',
  'data-common',
  'data-nav',
  'data-nav-item',
  'data-breadcrumb',
  'data-deco',
  'data-cf7',
  'data-cf7-field',
  'data-cf7-required',
  'data-cf7-acceptance',
  'data-cf7-limit',
  'data-cf7-submit',
]);

module.exports = {
  DERIVABLE_TAGS,
  TAG_TO_TYPE,
  VALID_ACF_TYPES,
  VALID_DATA_PAGE,
  ACF_NAME_RE,
  CPT_PREFIX,
  DECLARATION_ATTRS,
};
