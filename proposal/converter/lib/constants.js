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

module.exports = {
  DERIVABLE_TAGS,
  TAG_TO_TYPE,
  VALID_ACF_TYPES,
  VALID_DATA_PAGE,
  ACF_NAME_RE,
  CPT_PREFIX,
};
