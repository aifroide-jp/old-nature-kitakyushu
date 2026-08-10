#!/usr/bin/env node
'use strict';

// proposal/mockup-real/index.html に制約語彙の宣言（data-*）を付与する。
// 既存のマークアップ・テキスト・class は一切変更せず、属性を足すだけ。
// 見た目が変わらないことは proposal/visual-check/compare.js が保証する。

const fs = require('fs');
const P = __dirname + '/index.html';
let s = fs.readFileSync(P, 'utf8');
let applied = 0;

// 1件だけ置換し、当たらなければ即エラー（黙って進めない）
function one(find, repl) {
  const i = s.indexOf(find);
  if (i < 0) throw new Error('見つかりません: ' + find.slice(0, 90));
  if (s.indexOf(find, i + 1) >= 0) throw new Error('複数一致（曖昧）: ' + find.slice(0, 90));
  s = s.slice(0, i) + repl + s.slice(i + find.length);
  applied++;
}

// 「まだ注釈されていない最初の出現」を置換する。
// 置換すると元の文字列は消える（data-acf 付きになる）ので、
// 常に先頭を取れば DOM 順に 1,2,3… と割り当てられる。
// 絶対番号で指定すると 1件置換するたびに残りの順番がずれて壊れる。
function nth(find, repl) {
  const i = s.indexOf(find);
  if (i < 0) throw new Error('未注釈の出現が残っていません: ' + find.slice(0, 80));
  s = s.slice(0, i) + repl + s.slice(i + find.length);
  applied++;
}

// ---- ページ宣言 ----
one('<body>', '<body data-page="front">');

// ---- 共通領域 ----
one('<header class="header">', '<header class="header" data-common="header">');
one('<footer class="footer">', '<footer class="footer" data-common="footer">');
one('<section class="cta-band fp-u43">', '<section class="cta-band fp-u43" data-common="cta">');

// ---- ナビ ----
one('<nav class="header__nav" aria-label="メインナビゲーション">',
    '<nav class="header__nav" data-nav="global" aria-label="メインナビゲーション">');
one('<nav class="mobile-nav" id="js-mobile-nav" aria-label="モバイルナビゲーション">',
    '<nav class="mobile-nav" id="js-mobile-nav" data-nav="mobile" aria-label="モバイルナビゲーション">');

// ---- セクション宣言（11本。cta-band は common なので data-section 不要） ----
one('<section class="hero">', '<section class="hero" data-section="hero">');
one('<section class="persona">', '<section class="persona" data-section="persona">');
one('<section class="fp-u1">', '<section class="fp-u1" data-section="videos">');
one('<section class="fp-u14">', '<section class="fp-u14" data-section="spots">');
one('<section class="facilities">', '<section class="facilities" data-section="facilities">');
one('<section class="network">', '<section class="network" data-section="network">');
one('<section class="events">', '<section class="events" data-section="events">');
one('<section class="fp-u38">', '<section class="fp-u38" data-section="news">');
one('<section class="photos">', '<section class="photos" data-section="photos">');
one('<section class="stats">', '<section class="stats" data-section="stats">');

// ---- 共通領域のフィールド ----
one('<img src="images/2026/02/logo.png"', '<img data-acf="site_logo" src="images/2026/02/logo.png"');
one('<h2 class="cta-band__title">', '<h2 class="cta-band__title" data-acf="cta_title">');
one('<a href="contact/" class="btn btn--solid-white btn--lg">',
    '<a href="contact/" class="btn btn--solid-white btn--lg" data-acf="cta_button_label" data-acf-url="cta_button_url">');
one('<span class="footer__brand-name">', '<span class="footer__brand-name" data-acf="footer_brand_name" data-acf-type="text">');
one('<p class="footer__desc">', '<p class="footer__desc" data-acf="footer_desc">');
one('<span>&copy; 2026 アーバンネイチャー北九州</span>',
    '<span data-acf="footer_copyright" data-acf-type="text">&copy; 2026 アーバンネイチャー北九州</span>');

// ---- 1. ヒーロー ----
one('<h1 class="hero-catch">', '<h1 class="hero-catch" data-acf="hero_catch">');
one('<p class="hero-sub">', '<p class="hero-sub" data-acf="hero_sub">');

// ---- 2. ペルソナ（4枚） ----
for (let i = 1; i <= 4; i++) {
  nth('<p class="persona-label">', `<p class="persona-label" data-acf="persona_label_${i}">`);
  nth('<h3 class="persona-name">', `<h3 class="persona-name" data-acf="persona_name_${i}">`);
  nth('<p class="persona-desc">', `<p class="persona-desc" data-acf="persona_desc_${i}">`);
  nth('class="persona-arrow">', `class="persona-arrow" data-acf="persona_arrow_${i}">`);
}

// ---- 3. 動画（見出し＋各カードのキャプション・クレジット・書き起こし） ----
// video / iframe / summary は「更新対象外の固定コンテンツ」として宣言しない（スコープ決定）
nth('<h2 class="section-title">', '<h2 class="section-title" data-acf="videos_title">');
nth('<p class="section-subtitle">', '<p class="section-subtitle" data-acf="videos_subtitle">');
for (let i = 1; i <= 3; i++) {
  nth('<p class="fp-u5">', `<p class="fp-u5" data-acf="video_caption_1">`); // 1枚目
  break;
}
one('<p class="fp-u8">', '<p class="fp-u8" data-acf="video_caption_2">');
nth('<p class="fp-u9">', '<p class="fp-u9" data-acf="video_credit_2">');
one('<p lang="en" class="fp-u12">', '<p lang="en" class="fp-u12" data-acf="video_caption_3">');
one('<p class="fp-u13">', '<p class="fp-u13" data-acf="video_credit_3">');
for (let i = 1; i <= 3; i++) {
  nth('<div class="video-transcript__body">',
      `<div class="video-transcript__body" data-acf="video_transcript_${i}" data-acf-type="wysiwyg">`);
}

// ---- 4. 自然スポット（CPT: spot の一覧ループ） ----
nth('<h2 class="section-title">', '<h2 class="section-title" data-acf="spots_title">');
nth('<p class="section-subtitle">', '<p class="section-subtitle" data-acf="spots_subtitle">');
one('<div class="fp-u15">', '<div class="fp-u15" data-loop="spot" data-loop-order="menu_order" data-loop-count="3">');
one('<a href="about/spots/sone-higata.html" class="spot-card-link">',
    '<a href="about/spots/sone-higata.html" class="spot-card-link" data-loop-item>');
one('<a href="about/spots/hiraodai.html" class="spot-card-link">',
    '<a href="about/spots/hiraodai.html" class="spot-card-link" data-loop-sample>');
one('<a href="about/spots/biotope.html" class="spot-card-link">',
    '<a href="about/spots/biotope.html" class="spot-card-link" data-loop-sample>');
one('<img src="images/2025/03/sone-higata.jpg" alt="曽根干潟"',
    '<img data-acf="hero_image" src="images/2025/03/sone-higata.jpg" alt="曽根干潟"');
nth('<div class="fp-u18">', '<div class="fp-u18" data-acf="hero_title" data-acf-type="text">');
nth('<div class="fp-u19">', '<div class="fp-u19" data-acf="hero_lead" data-acf-type="textarea">');

// ---- 5. 活動拠点（CPT: center の一覧ループ） ----
nth('<h2 class="section-title">', '<h2 class="section-title" data-acf="facilities_title">');
nth('<p class="section-subtitle">', '<p class="section-subtitle" data-acf="facilities_subtitle">');
one('<div class="facilities-track">', '<div class="facilities-track" data-loop="center" data-loop-order="menu_order" data-loop-count="10">');
one('<a href="center/takamiya.html" class="facility-card">',
    '<a href="center/takamiya.html" class="facility-card" data-loop-item>');
one('<img src="images/2026/03/takamiya-1.jpg" alt="タカミヤ環境ミュージアム"',
    '<img data-acf="hero_image" src="images/2026/03/takamiya-1.jpg" alt="タカミヤ環境ミュージアム"');
nth('<p class="facility-card-name">', '<p class="facility-card-name" data-acf="hero_title" data-acf-type="text">');
// 2〜10枚目はデザイン確認用サンプル
for (const slug of ['inochi', 'yamada', 'biotope', 'greenpark', 'hotarukan', 'katsuki-hotaru', 'itouzu', 'mizukankyokan', 'soraland']) {
  one(`<a href="center/${slug}.html" class="facility-card">`,
      `<a href="center/${slug}.html" class="facility-card" data-loop-sample>`);
}

// ---- 6. 地域との繋がり（単体カード） ----
nth('<h2 class="section-title">', '<h2 class="section-title" data-acf="network_title">');
nth('<p class="section-subtitle">', '<p class="section-subtitle" data-acf="network_subtitle">');
one('<img src="images/2026/04/mine-450x269.png"', '<img data-acf="network_image" src="images/2026/04/mine-450x269.png"');
one('<span class="fp-u33">', '<span class="fp-u33" data-acf="network_badge" data-acf-type="text">');
one('<h3 class="fp-u34">', '<h3 class="fp-u34" data-acf="network_name">');
one('<p class="fp-u35">', '<p class="fp-u35" data-acf="network_lead">');
one('<p class="fp-u36">', '<p class="fp-u36" data-acf="network_desc">');

// ---- 7. イベント（CPT: event の一覧ループ） ----
nth('<h2 class="section-title">', '<h2 class="section-title" data-acf="events_title">');
nth('<p class="section-subtitle">', '<p class="section-subtitle" data-acf="events_subtitle">');
one('<div class="events-grid">', '<div class="events-grid" data-loop="event" data-loop-order="date_desc" data-loop-count="3">');
nth('<a href="events/" class="event-card">', '<a href="events/" class="event-card" data-loop-item>');
nth('<a href="events/" class="event-card">', '<a href="events/" class="event-card" data-loop-sample>');
nth('<a href="events/" class="event-card">', '<a href="events/" class="event-card" data-loop-sample>');
one('<img src="images/2026/04/カルストジャングル冒険ツアー-2-1024x768-1-450x450.jpg" alt=""',
    '<img data-acf="hero_image" src="images/2026/04/カルストジャングル冒険ツアー-2-1024x768-1-450x450.jpg" alt=""');
nth('<span class="event-date">', '<span class="event-date" data-acf="event_date" data-acf-type="text">');
nth('<h3 class="event-card-title">', '<h3 class="event-card-title" data-acf="hero_title">');
nth('<p class="event-card-meta">', '<p class="event-card-meta" data-acf="event_meta">');

// ---- 8. お知らせ（CPT: news の一覧ループ） ----
nth('<h2 class="section-title">', '<h2 class="section-title" data-acf="news_title">');
nth('<p class="section-subtitle">', '<p class="section-subtitle" data-acf="news_subtitle">');
one('<div class="fp-u39">', '<div class="fp-u39" data-loop="news" data-loop-order="date_desc" data-loop-count="5">');
one('<a href="news/site-renewal.html" class="news-item-link">',
    '<a href="news/site-renewal.html" class="news-item-link" data-loop-item>');
one('<span class="fp-u40">', '<span class="fp-u40" data-acf="news_category" data-acf-type="text">');
one('<span class="fp-u41">', '<span class="fp-u41" data-acf="news_date" data-acf-type="text">');
one('<span class="fp-u42">', '<span class="fp-u42" data-acf="hero_title" data-acf-type="text">');

// ---- 9. みんなの写真展（固定8枠。CLAUDE.md の front-page 仕様どおり動的化しない） ----
nth('<h2 class="section-title">', '<h2 class="section-title" data-acf="photos_title">');
nth('<p class="section-subtitle">', '<p class="section-subtitle" data-acf="photos_subtitle">');
const PHOTOS = [
  ['IMG_8716-450x450.jpg', '海'], ['IMG_8742-450x450.jpg', '山'],
  ['IMG_8789-450x450.jpg', '川'], ['カルガモ-450x450.jpg', '動物'],
  ['カノコソウ-450x450.jpg', '植物'], ['IMG_8808-450x450.jpg', '街と自然'],
  ['IMG_8920-450x450.jpg', '農産品'], ['ヨツボシトンボ-450x450.jpg', '昆虫・その他'],
];
PHOTOS.forEach(([f], i) => {
  one(`<img src="images/2025/04/${f}"`, `<img data-acf="photos_image_${i + 1}" src="images/2025/04/${f}"`);
  nth('<span class="photo-category-name">', `<span class="photo-category-name" data-acf="photos_caption_${i + 1}" data-acf-type="text">`);
});

// ---- 10. 数字バー ----
for (let i = 1; i <= 4; i++) {
  nth('<p class="stat-item-number">', `<p class="stat-item-number" data-acf="stat_number_${i}" data-acf-type="text">`);
  nth('<p class="stat-item-label">', `<p class="stat-item-label" data-acf="stat_label_${i}" data-acf-type="text">`);
}

fs.writeFileSync(P, s, 'utf8');
console.log('付与した宣言: ' + applied + '件');
