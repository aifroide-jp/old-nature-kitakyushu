'use strict';

const { DERIVABLE_TAGS, TAG_TO_TYPE, VALID_ACF_TYPES } = require('./constants');

// data-acf / data-acf-url を持つ要素1個を解析し、
//   - ACFフィールド定義（name/type/defaultValue）
//   - テンプレート側の置換編集（EditListへ積む [start,end,replacement]）
// を1回で求める。型導出・デフォルト値抽出・置換範囲の決定はすべてここに集約する
// （vocabulary.md 2.1/2.2 の唯一の実装箇所にする＝二重管理しない）。
//
// 戻り値: { fields: [{name, type, defaultValue}], edits: [{start,end,replacement}] }
// 想定外の構造（型が導出できない・置換対象のテキストノードが複数に分裂している等）は
// errors に積んで null 相当（fields:[], edits:[]）を返す。呼び出し側は最後に errors.throwIfAny()。

function directChildren(el) {
  return el.children || [];
}

function significantTextNodes(el) {
  return directChildren(el).filter((c) => c.type === 'text' && (c.data || '').trim() !== '');
}

// 意味を持たない純粋な整形タグ。これらが挟まってテキストが分裂している場合は
// 「1つの編集単位が改行や強調で区切られているだけ」なので、内側まるごとを
// 1フィールドとして扱う（値は HTML を含む）。
// 日本語の見出しは <br> で改行位置を制御するのが常態であり、
// これを表現できない語彙は実用にならない（実測: index.html で6箇所）。
// <a> は行き先という別の情報を持つため、ここには含めない（未決事項1の対象のまま）。
const FORMATTING_TAGS = new Set(['br', 'strong', 'em', 'b', 'i', 'small', 'sub', 'sup', 'wbr', 'u', 'mark']);

function isFormattingOnly(el) {
  return directChildren(el).every(
    (c) =>
      c.type === 'text' ||
      (c.type === 'tag' && FORMATTING_TAGS.has((c.name || '').toLowerCase()) && isFormattingOnly(c))
  );
}

function deriveType(tag, dataAcfType) {
  if (dataAcfType !== undefined) {
    if (!VALID_ACF_TYPES.includes(dataAcfType)) return { error: `data-acf-type="${dataAcfType}" は無効です(有効値: ${VALID_ACF_TYPES.join('/')})` };
    return { type: dataAcfType };
  }
  if (DERIVABLE_TAGS.includes(tag)) {
    return { type: TAG_TO_TYPE[tag] };
  }
  return { error: `<${tag}> は型を導出できないタグのため data-acf-type が必須です` };
}

function phpFieldOutput(name, kind) {
  // kind: 'echo-attr'（属性値に埋め込む）は呼び出し側で組み立てるためここでは
  // インラインテキスト用の the_field() 呼び出し文字列だけを返す。
  return `<?php the_field(${JSON.stringify(name).replace(/"/g, "'")}); ?>`;
}

// 要素1個から ACF フィールドと編集内容を抽出する。
// opts.imageFallbackPath: image型のとき assets/ 配下の静的フォールバック相対パス
function analyzeField(page, $, el, opts, errors) {
  const $el = $(el);
  const tag = (el.name || '').toLowerCase();
  const name = $el.attr('data-acf');
  const hasUrl = $el.attr('data-acf-url') !== undefined;
  const loc = el.sourceCodeLocation;
  const line = loc ? loc.startLine : null;
  const results = { fields: [], edits: [] };

  // --- data-acf（本文/画像フィールド） ---
  if (name !== undefined) {
    const explicitType = $el.attr('data-acf-type');
    const derived = deriveType(tag, explicitType);
    if (derived.error) {
      errors.add(page.relPath, line, `data-acf="${name}": ${derived.error}`);
      return results;
    }
    const type = derived.type;

    if (type === 'image') {
      if (tag !== 'img') {
        errors.add(page.relPath, line, `data-acf="${name}": data-acf-type="image" は <img> 以外では未対応です`);
        return results;
      }
      const src = $el.attr('src');
      const alt = $el.attr('alt');
      if (!src) {
        errors.add(page.relPath, line, `data-acf="${name}": <img> に src がありません`);
        return results;
      }
      results.fields.push({ name, type: 'image', defaultValue: null });
      const varUrl = `$${name}_url`;
      const varAlt = `$${name}_alt`;
      const fallbackUrl = `get_template_directory_uri() . '/assets/${src.replace(/^\/?(images\/)?/, 'images/')}'`;
      const fallbackAlt = JSON.stringify(alt || '').replace(/"/g, "'");
      const phpBlock =
        `<?php $${name} = get_field('${name}'); ` +
        `${varUrl} = $${name} ? $${name}['url'] : ${fallbackUrl}; ` +
        `${varAlt} = $${name} ? $${name}['alt'] : ${fallbackAlt}; ?>\n`;
      results.edits.push({ start: loc.startOffset, end: loc.startOffset, replacement: phpBlock });

      const srcLoc = loc.attrs && loc.attrs.src;
      if (!srcLoc) {
        errors.add(page.relPath, line, `data-acf="${name}": src 属性の位置が取得できません`);
        return results;
      }
      // src="..." の値部分（クォート含む）を丸ごと置換する
      const srcAttrText = page.html.slice(srcLoc.startOffset, srcLoc.endOffset);
      const eqIdx = srcAttrText.indexOf('=');
      const valueStart = srcLoc.startOffset + eqIdx + 1; // クォート開始位置の直前まで含む "=
      results.edits.push({
        start: srcLoc.startOffset,
        end: srcLoc.endOffset,
        replacement: `src="<?php echo esc_url( ${varUrl} ); ?>"`,
      });

      const altLoc = loc.attrs && loc.attrs.alt;
      if (altLoc) {
        results.edits.push({
          start: altLoc.startOffset,
          end: altLoc.endOffset,
          replacement: `alt="<?php echo esc_attr( ${varAlt} ); ?>"`,
        });
      } else {
        results.edits.push({ start: loc.startTag.endOffset - 1, end: loc.startTag.endOffset - 1, replacement: ` alt="<?php echo esc_attr( ${varAlt} ); ?>"` });
      }
    } else if (type === 'wysiwyg') {
      if (!loc.startTag || !loc.endTag) {
        errors.add(page.relPath, line, `data-acf="${name}": data-acf-type="wysiwyg" は開始・終了タグを持つ要素にのみ使用できます`);
        return results;
      }
      const innerStart = loc.startTag.endOffset;
      const innerEnd = loc.endTag.startOffset;
      const defaultValue = page.html.slice(innerStart, innerEnd).trim();
      results.fields.push({ name, type: 'wysiwyg', defaultValue });
      results.edits.push({ start: innerStart, end: innerEnd, replacement: phpFieldOutput(name) });
    } else if (type === 'url') {
      // <a data-acf="X" data-acf-type="url"> のような明示ケース。href/srcを対象にする。
      const targetAttr = loc.attrs && loc.attrs.href ? 'href' : loc.attrs && loc.attrs.src ? 'src' : null;
      if (!targetAttr) {
        errors.add(page.relPath, line, `data-acf="${name}": data-acf-type="url" ですが href/src 属性がありません`);
        return results;
      }
      const attrLoc = loc.attrs[targetAttr];
      const defaultValue = $el.attr(targetAttr);
      results.fields.push({ name, type: 'url', defaultValue });
      results.edits.push({
        start: attrLoc.startOffset,
        end: attrLoc.endOffset,
        replacement: `${targetAttr}="<?php the_field('${name}'); ?>"`,
      });
    } else {
      // text / textarea: 要素直下の「意味のある」テキストノードちょうど1個だけを対象にする。
      // 兄弟に data-deco 等の固定要素(例: sr-onlyの補助テキスト)が混在していても、
      // それらは無編集のまま温存する(=このPoCで発見した構造。vocabulary.mdは未定義)。
      const sig = significantTextNodes(el);
      if (sig.length === 0) {
        errors.add(page.relPath, line, `data-acf="${name}": 直下にテキストが見つかりません(型は${type})`);
        return results;
      }
      if (sig.length > 1) {
        // <br> 等の整形タグで区切られているだけなら、内側まるごとを1フィールドにする。
        if (isFormattingOnly(el) && loc.startTag && loc.endTag) {
          const start = loc.startTag.endOffset;
          const end = loc.endTag.startOffset;
          const defaultValue = page.html.slice(start, end).trim();
          results.fields.push({ name, type, defaultValue });
          results.edits.push({ start, end, replacement: phpFieldOutput(name) });
          return results;
        }
        errors.add(
          page.relPath,
          line,
          `data-acf="${name}": 直下のテキストノードが${sig.length}個に分裂しています(要素間にタグが挟まる構造は未定義。vocabulary.md 未決事項1と同種の問題)`
        );
        return results;
      }
      const node = sig[0];
      const defaultValue = (node.data || '').trim();
      results.fields.push({ name, type, defaultValue });
      results.edits.push({
        start: node.sourceCodeLocation.startOffset,
        end: node.sourceCodeLocation.endOffset,
        replacement: phpFieldOutput(name),
      });
    }
  }

  // --- data-acf-url（<a> の href。data-acf と併存可） ---
  if (hasUrl) {
    if (tag !== 'a') {
      errors.add(page.relPath, line, `data-acf-url は <a> 以外では未対応です(<${tag}>)`);
      return results;
    }
    const urlName = $el.attr('data-acf-url');
    const hrefLoc = loc.attrs && loc.attrs.href;
    if (!hrefLoc) {
      errors.add(page.relPath, line, `data-acf-url="${urlName}": href 属性がありません`);
      return results;
    }
    const defaultValue = $el.attr('href');
    results.fields.push({ name: urlName, type: 'url', defaultValue });
    results.edits.push({
      start: hrefLoc.startOffset,
      end: hrefLoc.endOffset,
      replacement: `href="<?php the_field('${urlName}'); ?>"`,
    });
  }

  return results;
}

module.exports = { analyzeField, significantTextNodes, directChildren, deriveType };
