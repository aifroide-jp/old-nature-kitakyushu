'use strict';

// data-nav 要素の内部構造を「flat」(単一 <ul><li><a>)か「grouped」
// (<div><h2>見出し</h2><ul><li><a></ul></div> の繰り返し)かに分類する。
// vocabulary.md 5章は data-nav の内容一致しか規定しておらず、内部構造の形は未定義。
// この2形状以外は変換器が判断できないためエラーにする（本PoCで発見したギャップ）。
//
// <li> / <a> の class も併せて読み取る(2024-xx バグ修正: 以前は <ul> の class しか
// 読み取っておらず、生成テーマ側で <li class="site-nav__item"> が wp_nav_menu() の
// 既定クラスに置き換わって消えていた)。全項目で class が一致することを機械的に確認し、
// 一致しない場合は「推測」せずエラーにする(決定的変換の原則)。

function tagChildren(el) {
  return (el.children || []).filter((c) => c.type === 'tag');
}

function classOf(el) {
  const c = el.attribs && el.attribs.class;
  return c || null;
}

// ul 直下がすべて <li> で、各 <li> 直下にちょうど1つの <a> がある前提を検証しつつ、
// li class / a class を読み取る。全項目で一致しない場合は null を返しエラーを積む。
function readListItemClasses(page, line, ul, contextLabel, errors) {
  const ulChildren = tagChildren(ul);
  const lis = ulChildren.filter((c) => c.name === 'li');
  if (lis.length === 0 || lis.length !== ulChildren.length) {
    errors.add(page.relPath, line, `${contextLabel} の <ul> 直下がすべて <li> ではありません`);
    return null;
  }

  const liClasses = new Set(lis.map((li) => classOf(li) || ''));
  if (liClasses.size > 1) {
    errors.add(
      page.relPath,
      line,
      `${contextLabel} の <li> の class が項目ごとに異なるため機械的に判定できません(候補: ${[...liClasses].join(' / ')})`
    );
    return null;
  }
  const liClass = [...liClasses][0] || null;

  const aClasses = new Set();
  for (const li of lis) {
    const as = tagChildren(li).filter((c) => c.name === 'a');
    if (as.length !== 1) {
      errors.add(page.relPath, line, `${contextLabel} の <li> 直下に <a> がちょうど1つではありません`);
      return null;
    }
    aClasses.add(classOf(as[0]) || '');
  }
  if (aClasses.size > 1) {
    errors.add(
      page.relPath,
      line,
      `${contextLabel} の <a> の class が項目ごとに異なるため機械的に判定できません(候補: ${[...aClasses].join(' / ')})`
    );
    return null;
  }
  const aClass = [...aClasses][0] || null;

  return { liClass, aClass };
}

function analyzeNavStructure(page, $, navEl, errors) {
  const line = page.lineOf($(navEl));
  const children = tagChildren(navEl);

  if (children.length === 1 && children[0].name === 'ul') {
    const ul = children[0];
    const ulClass = ul.attribs && ul.attribs.class;
    if (!ulClass) {
      errors.add(page.relPath, line, 'data-nav 直下の <ul> に class がありません(items_wrap の生成に必要)');
      return null;
    }
    const itemClasses = readListItemClasses(page, line, ul, 'data-nav の <ul>', errors);
    if (!itemClasses) return null;
    return { kind: 'flat', ulClass, liClass: itemClasses.liClass, aClass: itemClasses.aClass };
  }

  if (children.length > 0 && children.every((c) => c.name === 'div')) {
    const groups = [];
    for (const div of children) {
      const inner = tagChildren(div);
      if (inner.length !== 2 || !/^h[1-6]$/.test(inner[0].name) || inner[1].name !== 'ul') {
        errors.add(
          page.relPath,
          line,
          'data-nav="footer" のグループ構造が <div><h?>見出し</h?><ul>...</ul></div> の形になっていません(未対応の構造)'
        );
        return null;
      }
      const ul = inner[1];
      const itemClasses = readListItemClasses(page, line, ul, 'data-nav="footer" の <ul>', errors);
      if (!itemClasses) return null;
      groups.push({
        divClass: classOf(div),
        headingTag: inner[0].name,
        headingClass: classOf(inner[0]),
        ulClass: classOf(ul),
        liClass: itemClasses.liClass,
        aClass: itemClasses.aClass,
      });
    }
    return { kind: 'grouped', groups };
  }

  errors.add(
    page.relPath,
    line,
    'data-nav の内部構造を認識できません(対応形式: 単一<ul>のフラットナビ、または<div><h?><ul></div>の繰り返しのグループナビ)'
  );
  return null;
}

module.exports = { analyzeNavStructure };
