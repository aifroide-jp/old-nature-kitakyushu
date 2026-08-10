'use strict';

// vocabulary.md 2.1 の型導出テーブル + 2.2 の <a> (data-acf は text 導出)。
// これらのタグに data-acf が付いている場合は data-acf-type を必須としない。
const DERIVABLE_TAGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'li', 'dd', 'td', 'span', 'img', 'a'];

const VALID_ACF_TYPES = ['text', 'textarea', 'wysiwyg', 'url', 'image'];

const VALID_DATA_PAGE = ['front', 'page', 'archive', 'single'];

// data-acf 命名規則: ASCII小文字・数字・アンダースコアのみ、数字始まり禁止
const ACF_NAME_RE = /^[a-z][a-z0-9_]*$/;

module.exports = {
  DERIVABLE_TAGS,
  VALID_ACF_TYPES,
  VALID_DATA_PAGE,
  ACF_NAME_RE,
};
