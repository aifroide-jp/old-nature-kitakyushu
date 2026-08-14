'use strict';

// vocabulary.md 2.2:
//   data-acf-url の無い <a> は固定リンクとして、変換器が href をパーマリンクへ機械的に解決する。
//   モック内ファイルへの相対パスは data-page-id / data-cpt から一意に解決できる。
//   外部URL・#アンカー・mailto: はそのまま通す。解決できなければエラー。
//
// v0.1 の実例（役割を終えて削除済みの制約モック）は "../about/x.html" ではなく "/about/x.html" という
// サイトルート絶対パスを使っている。vocabulary.md の例は前者のみを示しており、
// この違いは vocabulary.md 未記載のギャップ（本PoCで発見した点として報告する）。
// 本実装はどちらの形式も同じ「サイトパス」に正規化して解決する。

const path = require('path');

function sitePathForRel(rel) {
  if (rel === 'index.html') return '';
  if (rel.endsWith('/index.html')) return rel.slice(0, -'index.html'.length);
  return rel;
}

// 現在ページ(currentRel)からの href を、モックのファイルツリー基準の「サイトパス」に正規化する。
// 戻り値: { kind: 'anchor'|'scheme'|'external'|'internal', sitePath?, raw }
function classifyHref(href, currentRel) {
  if (href.startsWith('#')) return { kind: 'anchor', raw: href };
  if (/^(mailto|tel):/i.test(href)) return { kind: 'scheme', raw: href };
  if (/^https?:\/\//i.test(href)) return { kind: 'external', raw: href };
  if (href.startsWith('//')) return { kind: 'external', raw: href };

  const clean = href.split('#')[0].split('?')[0];

  if (clean.startsWith('/')) {
    let sp = clean.slice(1);
    if (sp !== '' && sp.endsWith('/index.html')) sp = sp.slice(0, -'index.html'.length);
    return { kind: 'internal', sitePath: sp, raw: href };
  }

  // 現在ページ相対のパス。"../about/x.html"(vocabulary.md の例と同形)に加え、
  // "spots/index.html" のような "./"/"../" 接頭辞の無いサブディレクトリ相対形式も
  // v0.1 mockup(ルート絶対パス→階層相対パス移行後)で使われている。どちらも
  // path.posix.join(currentDir, clean) で同じに解決できるため、接頭辞の有無で
  // 分岐する必要は無い(以前は接頭辞が無いと 'unknown' 扱いになり、ルート直下ページ
  // からサブディレクトリへの固定リンクが軒並み解決不能になっていた)。
  const currentDir = path.posix.dirname(currentRel);
  let resolved = path.posix.normalize(path.posix.join(currentDir, clean));
  // サイトルートを指す形を空文字（front のサイトパス）に寄せる。
  // normalize() は末尾スラッシュを保つため "./" が返ることがあり、
  // '.' だけを見ているとヘッダーのロゴリンク(href="./")や
  // 下層からのトップリンク(href="../../")が軒並み解決不能になっていた。
  if (resolved.startsWith('./')) resolved = resolved.slice(2);
  if (resolved === '.') resolved = '';
  if (resolved.endsWith('/index.html')) resolved = resolved.slice(0, -'index.html'.length);
  else if (resolved === 'index.html') resolved = '';
  return { kind: 'internal', sitePath: resolved, raw: href };
}

// pages: model 構築中に集めた {relPath, dataPage, pageId, cpt} の配列
function buildLinkRegistry(pages) {
  const registry = new Map();
  for (const p of pages) {
    const sitePath = sitePathForRel(p.relPath);
    let descriptor;
    if (p.dataPage === 'front') descriptor = { kind: 'front' };
    else if (p.dataPage === 'page') descriptor = { kind: 'page', pageId: p.pageId };
    else if (p.dataPage === 'archive') descriptor = { kind: 'archive', cpt: p.cpt };
    else if (p.dataPage === 'single') descriptor = { kind: 'single', cpt: p.cpt };
    registry.set(sitePath, descriptor);
  }
  return registry;
}

function phpForDescriptor(descriptor) {
  switch (descriptor.kind) {
    case 'front':
      return "esc_url( home_url( '/' ) )";
    case 'page':
      return `esc_url( nkk_get_page_permalink( '${descriptor.pageId}' ) )`;
    case 'archive':
      return `esc_url( get_post_type_archive_link( 'nkk_${descriptor.cpt}' ) )`;
    case 'single':
      return `esc_url( nkk_get_single_permalink( 'nkk_${descriptor.cpt}' ) )`;
    default:
      throw new Error(`phpForDescriptor: unknown kind ${descriptor.kind}`);
  }
}

// 固定href(data-acf-url の無いもの)を解決し、PHP式(例: "esc_url( home_url('/') )")を返す。
// パススルー対象(#/mailto:/tel:/外部URL)は null を返す。解決できない場合は errors に積んで
// undefined を返す(フォールバックしない。呼び出し側は undefined を「編集しない」で扱ってよいが、
// これはエラーが既に記録された結果であり、最終的に非ゼロ終了する)。
function resolveHrefExpr(page, line, href, linkRegistry, errors) {
  const cls = classifyHref(href, page.relPath);

  if (cls.kind === 'anchor' || cls.kind === 'scheme' || cls.kind === 'external') {
    return null;
  }

  if (cls.kind === 'unknown') {
    errors.add(page.relPath, line, `href="${href}" の形式を解決できません(相対パス/絶対パス/外部URL/#/mailto:/tel: のいずれでもありません)`);
    return undefined;
  }

  const descriptor = linkRegistry.get(cls.sitePath);
  if (!descriptor) {
    const msg = `href="${href}" はモック内のどのページにも解決できません(サイトパス "${cls.sitePath || '/'}" 相当のページが存在しません)`;
    if (errors.allowUnresolvedLinks) {
      // 一時的なエスケープハッチ。null を返すと href をそのまま残す（外部URL等と同じ扱い）。
      errors.warn(page.relPath, line, msg + ' → href をそのまま残しました');
      return null;
    }
    errors.add(page.relPath, line, msg);
    return undefined;
  }

  return phpForDescriptor(descriptor);
}

// 固定リンク <a>（data-acf-url の無いもの）の href を解決し、EditList 用の編集を返す。
// テンプレート本体(直接PHPが実行される文脈)専用。CF7フォーム本文(文字列として保存される
// 文脈)では使えない -> lib/gen/cf7.js は resolveHrefExpr を直接使う。
function resolveFixedHref(page, hrefLoc, href, linkRegistry, errors) {
  const phpExpr = resolveHrefExpr(page, hrefLoc.startLine, href, linkRegistry, errors);
  if (!phpExpr) return null;
  return { start: hrefLoc.startOffset, end: hrefLoc.endOffset, replacement: `href="<?php echo ${phpExpr}; ?>"` };
}

module.exports = { sitePathForRel, classifyHref, buildLinkRegistry, phpForDescriptor, resolveFixedHref, resolveHrefExpr };
