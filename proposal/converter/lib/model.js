'use strict';

const { VALID_DATA_PAGE, CPT_PREFIX } = require('./constants');
const { analyzeField } = require('./field-extract');
const { sitePathForRel, buildLinkRegistry } = require('./link-resolve');
const { analyzeNavStructure } = require('./nav-structure');
// data-common / data-nav のページ横断バイト比較は、比較前に href/src を「mockupルート
// からのサイトパス」へ正規化する必要がある(v0.1 でパスをルート絶対から階層相対に変更した
// ため、深さによって同じリンク先でも文字列表現が変わる)。proposal/lint(L09)と同一ロジック
// を proposal/shared/site-path.js に一本化しており、ここでは二重実装しない。
const { normalizeOuterForCompare } = require('../../shared/site-path');

function outerHtml(page, el) {
  const loc = el.sourceCodeLocation;
  return loc ? page.html.slice(loc.startOffset, loc.endOffset) : null;
}

// data-common / data-nav 部分木の下に data-acf を持つ要素だけを集める（浅いスキャン用）。
// ネストした data-common / data-loop の内側は呼び出し側で除外範囲として渡す。
function collectFieldsShallow(page, $, rootEl, errors, excludeSet) {
  const fields = [];
  const walk = (el) => {
    if (!el || el.type !== 'tag') return;
    if (excludeSet && excludeSet.has(el)) return;
    const $el = $(el);
    if ($el.attr('data-acf') !== undefined || $el.attr('data-acf-url') !== undefined) {
      const { fields: f } = analyzeField(page, $, el, {}, errors);
      fields.push(...f);
    }
    for (const child of el.children || []) walk(child);
  };
  for (const child of rootEl.children || []) walk(child);
  return fields;
}

// rootEl 配下で、指定した data-* 属性を持つ要素を列挙する（ネストしても内側まで探す）。
function findAll(rootEl, $, attrName) {
  const out = [];
  const walk = (el) => {
    if (!el || el.type !== 'tag') return;
    if (el.attribs && Object.prototype.hasOwnProperty.call(el.attribs, attrName)) out.push(el);
    for (const child of el.children || []) walk(child);
  };
  for (const child of rootEl.children || []) walk(child);
  return out;
}

// data-loop-item 配下(1個のみ想定)の子孫にある要素集合を「除外セット」として作る
// （その cpt 側で登録済みのフィールドなので、ページ独自フィールドの集計からは外す）。
function descendantsSet(el) {
  const set = new Set();
  const walk = (n) => {
    if (!n) return;
    set.add(n);
    for (const c of n.children || []) walk(c);
  };
  walk(el);
  return set;
}

function buildModel(pages, errors) {
  const model = {
    pages,
    front: null,
    pageMap: new Map(), // pageId -> { page, fields }
    cptMap: new Map(), // cpt -> { archivePage, singlePages: [], fields, canonicalSingle }
    commonMap: new Map(), // name -> { el, page, html, fields }
    navMap: new Map(), // name -> { el, page, kind, ulClass, groups }
    forms: new Map(), // cf7 name -> { el, page }
    linkRegistry: null,
  };

  // --- 1. body 属性を確定し、ページ種別を仕分ける ---
  for (const page of pages) {
    const $ = page.$;
    const body = $('body').get(0);
    if (!body) {
      errors.add(page.relPath, 1, '<body> が見つかりません');
      continue;
    }
    const dataPage = $(body).attr('data-page');
    if (!VALID_DATA_PAGE.includes(dataPage)) {
      errors.add(page.relPath, page.lineOf($(body)), `data-page="${dataPage}" が無効です`);
      continue;
    }
    page.dataPage = dataPage;
    page.pageId = $(body).attr('data-page-id');
    page.cpt = $(body).attr('data-cpt');

    if (dataPage === 'page' && !page.pageId) {
      errors.add(page.relPath, page.lineOf($(body)), 'data-page="page" ですが data-page-id がありません');
      continue;
    }
    if ((dataPage === 'archive' || dataPage === 'single') && !page.cpt) {
      errors.add(page.relPath, page.lineOf($(body)), `data-page="${dataPage}" ですが data-cpt がありません`);
      continue;
    }

    const main = $('#main-content').get(0) || $('main').get(0);
    if (!main) {
      errors.add(page.relPath, 1, '<main id="main-content"> が見つかりません');
      continue;
    }
    page.mainEl = main;

    if (dataPage === 'front') {
      if (model.front) errors.add(page.relPath, 1, `data-page="front" のページが複数あります(先: ${model.front.relPath})`);
      model.front = page;
    } else if (dataPage === 'page') {
      if (model.pageMap.has(page.pageId)) {
        errors.add(page.relPath, 1, `data-page-id="${page.pageId}" が重複しています(先: ${model.pageMap.get(page.pageId).page.relPath})`);
      }
      model.pageMap.set(page.pageId, { page, fields: [] });
    } else if (dataPage === 'archive') {
      const entry = model.cptMap.get(page.cpt) || { archivePage: null, singlePages: [], fields: null };
      if (entry.archivePage) errors.add(page.relPath, 1, `data-cpt="${page.cpt}" の archive ページが複数あります(先: ${entry.archivePage.relPath})`);
      entry.archivePage = page;
      model.cptMap.set(page.cpt, entry);
    } else if (dataPage === 'single') {
      const entry = model.cptMap.get(page.cpt) || { archivePage: null, singlePages: [], fields: null };
      entry.singlePages.push(page);
      model.cptMap.set(page.cpt, entry);
    }
  }

  errors.throwIfAny();

  // --- 2. リンク解決レジストリ（サイトパス→ページ種別）を先に作る ---
  model.linkRegistry = buildLinkRegistry(pages.filter((p) => p.dataPage));

  // --- 3. data-common / data-nav をページ横断で集約し、内容が同一であることを検証する ---
  for (const page of pages) {
    const $ = page.$;
    for (const el of findAll($('body').get(0), $, 'data-common')) {
      const name = $(el).attr('data-common');
      const html = normalizeOuterForCompare(outerHtml(page, el), page.relPath);
      const entry = model.commonMap.get(name);
      if (!entry) {
        model.commonMap.set(name, { el, page, html, tag: (el.name || '').toLowerCase() });
      } else if (entry.html !== html) {
        errors.add(
          page.relPath,
          page.lineOf($(el)),
          `data-common="${name}" の内容が ${entry.page.relPath} と一致しません(vocabulary.md 4章: 全ページでバイト単位同一が必須)`
        );
      }
    }
    for (const el of findAll($('body').get(0), $, 'data-nav')) {
      const name = $(el).attr('data-nav');
      const html = normalizeOuterForCompare(outerHtml(page, el), page.relPath);
      const entry = model.navMap.get(name);
      if (!entry) {
        model.navMap.set(name, { el, page, html });
      } else if (entry.html !== html) {
        errors.add(
          page.relPath,
          page.lineOf($(el)),
          `data-nav="${name}" の内容が ${entry.page.relPath} と一致しません(vocabulary.md 5章: 同名navは全ページで一致が必須)`
        );
      }
    }
    for (const el of findAll($('body').get(0), $, 'data-cf7')) {
      const name = $(el).attr('data-cf7');
      if (!model.forms.has(name)) model.forms.set(name, { el, page });
    }
  }

  errors.throwIfAny();

  // --- 4. CPT ごとのフィールド集合を確定する（複数 single がある場合は構造一致を検証） ---
  for (const [cpt, entry] of model.cptMap) {
    if (entry.singlePages.length === 0) {
      // L08 相当: 対応する single が無い data-loop はテンプレート生成時に検出してエラーにする。
      continue;
    }
    const canonical = entry.singlePages[0];
    const excluded = new Set();
    for (const commonEl of findAll(canonical.mainEl, canonical.$, 'data-common')) {
      for (const n of descendantsSet(commonEl)) excluded.add(n);
    }
    const canonicalFields = collectFieldsShallow(canonical, canonical.$, canonical.mainEl, errors, excluded);
    entry.fields = canonicalFields;
    entry.canonicalSingle = canonical;

    for (const other of entry.singlePages.slice(1)) {
      const otherExcluded = new Set();
      for (const commonEl of findAll(other.mainEl, other.$, 'data-common')) {
        for (const n of descendantsSet(commonEl)) otherExcluded.add(n);
      }
      const otherFields = collectFieldsShallow(other, other.$, other.mainEl, errors, otherExcluded);
      const a = canonicalFields.map((f) => `${f.name}:${f.type}`).sort();
      const b = otherFields.map((f) => `${f.name}:${f.type}`).sort();
      if (JSON.stringify(a) !== JSON.stringify(b)) {
        errors.add(
          other.relPath,
          1,
          `data-cpt="${cpt}" の single ページ間でフィールド構成が一致しません(${canonical.relPath}: [${a.join(',')}] / ${other.relPath}: [${b.join(',')}])。1つの CPT に対し single テンプレートは1つしか生成できません`
        );
      }
    }
  }

  errors.throwIfAny();

  // --- 5. common(header/footer/cta等) 直下のフィールド = site-options フィールド ---
  model.siteOptionFields = [];
  const seenSiteOptionNames = new Set();
  for (const [name, entry] of model.commonMap) {
    const fields = collectFieldsShallow(entry.page, entry.page.$, entry.el, errors, null);
    for (const f of fields) {
      if (!seenSiteOptionNames.has(f.name)) {
        seenSiteOptionNames.add(f.name);
        model.siteOptionFields.push(f);
      }
    }
    entry.fields = fields;
  }

  // --- 6. front / page の「自分自身のフィールド」（common・loop-item の中身を除く） ---
  function ownFieldsOf(page) {
    const excluded = new Set();
    for (const commonEl of findAll(page.mainEl, page.$, 'data-common')) {
      for (const n of descendantsSet(commonEl)) excluded.add(n);
    }
    for (const loopItemEl of findAll(page.mainEl, page.$, 'data-loop-item')) {
      for (const n of descendantsSet(loopItemEl)) excluded.add(n);
    }
    // loop-item の親要素自体(data-loop)も除外セットに含める必要はない(data-acfを持たないため)
    return collectFieldsShallow(page, page.$, page.mainEl, errors, excluded);
  }

  if (model.front) {
    model.front.ownFields = ownFieldsOf(model.front);
  }
  for (const entry of model.pageMap.values()) {
    entry.fields = ownFieldsOf(entry.page);
  }
  for (const entry of model.cptMap.values()) {
    if (entry.archivePage) {
      entry.archiveFields = ownFieldsOf(entry.archivePage);
    }
  }

  errors.throwIfAny();

  // --- 6.5 nav の内部構造(flat/grouped)を確定する ---
  model.navInfo = new Map();
  for (const [name, entry] of model.navMap) {
    const info = analyzeNavStructure(entry.page, entry.page.$, entry.el, errors);
    if (info) model.navInfo.set(name, info);
  }

  errors.throwIfAny();

  // --- 7. skip-link: data-* 宣言は無いが全ページ同一内容の定型要素。header.php に固定配置する ---
  function directBodyChild(page, matcher) {
    const body = page.$('body').get(0);
    for (const c of (body && body.children) || []) {
      if (c.type === 'tag' && matcher(c)) return c;
    }
    return null;
  }
  // 比較は正規化した値で行うが、出力(header.php)に使うのは最初に見つかったページの
  // 生HTMLのまま(既存の生成物を変えないため)。
  let skipLinkRawHtml;
  let skipLinkNormalizedHtml;
  for (const page of pages) {
    if (!page.dataPage) continue;
    const el = directBodyChild(page, (c) => c.attribs && c.attribs.class === 'skip-link');
    const rawHtml = el ? outerHtml(page, el) : null;
    const normalizedHtml = rawHtml ? normalizeOuterForCompare(rawHtml, page.relPath) : null;
    if (skipLinkRawHtml === undefined) {
      skipLinkRawHtml = rawHtml;
      skipLinkNormalizedHtml = normalizedHtml;
    } else if (skipLinkNormalizedHtml !== normalizedHtml) {
      errors.add(
        page.relPath,
        1,
        'skip-link(<a class="skip-link">)の内容が他ページと一致しません。data-common宣言はありませんが暗黙の共通要素として扱うにはページ間一致が必要です'
      );
    }
  }
  model.skipLinkHtml = skipLinkRawHtml || null;

  errors.throwIfAny();

  return model;
}

module.exports = { buildModel, outerHtml, findAll, descendantsSet, sitePathForRel };
