'use strict';

// PHP のシングルクォート文字列リテラルとして安全な形にエスケープする。
function phpSingleQuote(str) {
  const s = String(str == null ? '' : str);
  return "'" + s.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
}

// PHP 配列リテラル（連想配列含む）を acf_add_local_field_group() に渡せる形で出力する。
// 値の型に応じて再帰的に整形する。インデントは2スペース刻み。
function phpArrayLiteral(value, indent = 0) {
  const pad = '    '.repeat(indent);
  const padIn = '    '.repeat(indent + 1);

  if (Array.isArray(value)) {
    if (value.length === 0) return 'array()';
    const items = value.map((v) => `${padIn}${phpArrayLiteral(v, indent + 1)},`);
    return `array(\n${items.join('\n')}\n${pad})`;
  }

  if (value && typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length === 0) return 'array()';
    const items = keys.map((k) => `${padIn}${phpSingleQuote(k)} => ${phpArrayLiteral(value[k], indent + 1)},`);
    return `array(\n${items.join('\n')}\n${pad})`;
  }

  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (value === null || value === undefined) return "''";
  return phpSingleQuote(value);
}

// theme_location 名から Walker のクラス名を作る。
// functions.js(定義側)と render.js(呼び出し側)の両方で使うため、ここに一本化する。
// 同じ規則を2箇所で書くと必ずズレる(本検証で実際に起きた)。
function navWalkerClass(location) {
  const safe = String(location)
    .replace(/[^A-Za-z0-9_]/g, '_')
    .replace(/^(\d)/, '_$1');
  const pascal = safe
    .split('_')
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('_');
  return `Nkk_Nav_${pascal}`;
}

module.exports = { phpSingleQuote, phpArrayLiteral, navWalkerClass };
