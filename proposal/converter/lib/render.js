'use strict';

const { EditList } = require('./edits');
const { analyzeField } = require('./field-extract');
const { resolveFixedHref } = require('./link-resolve');

// data-* で始まる属性をすべて洗い出す(値は問わない。属性名だけで判定する)。
function dataAttrNames(el) {
  return Object.keys(el.attribs || {}).filter((k) => k.startsWith('data-'));
}

// 部分木(el 配下)を、data-* 宣言をすべて WordPress の呼び出しへ変換した文字列として描画する。
// includeSelf=true なら el 自身のタグも出力に含める(header/footer/共通セクション用)。
// includeSelf=false なら el の「中身」だけを出力する(<main> の中身をページ本体として使う場合)。
function renderFragment(page, model, el, includeSelf, errors) {
  const loc = el.sourceCodeLocation;
  const base = includeSelf ? loc.startOffset : loc.startTag.endOffset;
  const sliceEnd = includeSelf ? loc.endOffset : loc.endTag.startOffset;
  const raw = page.html.slice(base, sliceEnd);
  const editList = new EditList(raw);

  function addAbs(start, end, replacement) {
    editList.replace(start - base, end - base, replacement);
  }

  function stripAllDataAttrs(node) {
    const nloc = node.sourceCodeLocation;
    if (!nloc || !nloc.attrs) return;
    for (const key of dataAttrNames(node)) {
      const aloc = nloc.attrs[key];
      if (!aloc) continue;
      let start = aloc.startOffset;
      const end = aloc.endOffset;
      if (page.html[start - 1] === ' ') start -= 1;
      addAbs(start, end, '');
    }
  }

  function buildNavCall(name, navInfo) {
    if (navInfo.kind === 'flat') {
      return (
        `<?php wp_nav_menu( array( 'theme_location' => '${name}', 'container' => false, ` +
        `'items_wrap' => '<ul class="${navInfo.ulClass}">%3$s</ul>', 'fallback_cb' => false ) ); ?>`
      );
    }
    return (
      `<?php wp_nav_menu( array( 'theme_location' => '${name}', 'container' => false, ` +
      `'items_wrap' => '%3$s', 'walker' => new Nkk_Grouped_Nav_Walker(), 'fallback_cb' => false ) ); ?>`
    );
  }

  function visit(node) {
    if (!node || node.type !== 'tag') return;
    const attrs = node.attribs || {};
    const nloc = node.sourceCodeLocation;
    const line = nloc ? nloc.startLine : null;

    // data-loop-sample: デザイン確認用ダミー。丸ごと破棄する(vocabulary.md 3章)。
    if ('data-loop-sample' in attrs) {
      addAbs(nloc.startOffset, nloc.endOffset, '');
      return;
    }

    // data-cf7: フォーム全体を CF7 ショートコードに置換する(vocabulary.md 6章)。
    if ('data-cf7' in attrs) {
      const name = attrs['data-cf7'];
      addAbs(nloc.startOffset, nloc.endOffset, `<?php echo do_shortcode( '[contact-form-7 title="${name}"]' ); ?>`);
      return;
    }

    // ネストした data-common (例: cta-band): テンプレートパーツ呼び出しに置換する。
    if ('data-common' in attrs) {
      const name = attrs['data-common'];
      addAbs(nloc.startOffset, nloc.endOffset, `<?php get_template_part( 'template-parts/common-${name}' ); ?>`);
      return;
    }

    stripAllDataAttrs(node);

    // data-nav: 中身を丸ごと wp_nav_menu() 呼び出しに置換する(実際のURL/文言はwp-adminの
    // メニュー設定に委ねる。ichiki.md「nav要素はWPカスタムメニューへ変換する」と整合)。
    if ('data-nav' in attrs) {
      const name = attrs['data-nav'];
      const navInfo = model.navInfo.get(name);
      if (!navInfo) {
        errors.add(page.relPath, line, `data-nav="${name}" の内部構造を解析できなかったため出力できません`);
        return;
      }
      addAbs(nloc.startTag.endOffset, nloc.endTag.startOffset, buildNavCall(name, navInfo));
      return;
    }

    // data-loop: WP_Query ループへ置換する。data-loop-item を1個だけ残し、前後に
    // クエリの開始/終了を挿入する。data-loop-sample の兄弟は通常の再帰で破棄される。
    if ('data-loop' in attrs) {
      const cpt = attrs['data-loop'];
      const order = attrs['data-loop-order'] || 'date_desc';
      const count = attrs['data-loop-count'] || '-1';
      const cptEntry = model.cptMap.get(cpt);
      if (!cptEntry || !cptEntry.canonicalSingle) {
        errors.add(page.relPath, line, `data-loop="${cpt}" に対応する data-page="single" data-cpt="${cpt}" のページが存在しません(L08相当)`);
        return;
      }
      const items = (node.children || []).filter((c) => c.type === 'tag' && 'data-loop-item' in (c.attribs || {}));
      if (items.length !== 1) {
        errors.add(page.relPath, line, `data-loop="${cpt}" 直下の data-loop-item が${items.length}個です(ちょうど1個である必要があります)`);
        return;
      }
      const item = items[0];
      const orderMap = { date_desc: ['date', 'DESC'], date_asc: ['date', 'ASC'], menu_order: ['menu_order', 'ASC'] };
      const pair = orderMap[order];
      if (!pair) {
        errors.add(page.relPath, line, `data-loop-order="${order}" は無効です(date_desc/date_asc/menu_orderのいずれか)`);
        return;
      }
      const countNum = Number(count);
      if (!Number.isInteger(countNum)) {
        errors.add(page.relPath, line, `data-loop-count="${count}" は整数である必要があります`);
        return;
      }
      const qv = `$nkk_loop_${cpt}`;
      const openPhp =
        `<?php ${qv} = new WP_Query( array( 'post_type' => 'nkk_${cpt}', 'posts_per_page' => ${countNum}, ` +
        `'orderby' => '${pair[0]}', 'order' => '${pair[1]}' ) ); if ( ${qv}->have_posts() ) : while ( ${qv}->have_posts() ) : ${qv}->the_post(); ?>`;
      const closePhp = `<?php endwhile; wp_reset_postdata(); endif; ?>`;
      addAbs(item.sourceCodeLocation.startOffset, item.sourceCodeLocation.startOffset, openPhp);
      addAbs(item.sourceCodeLocation.endOffset, item.sourceCodeLocation.endOffset, closePhp);
      for (const c of node.children || []) visit(c);
      return;
    }

    const hasAcf = 'data-acf' in attrs;
    const hasAcfUrl = 'data-acf-url' in attrs;
    let skipRecurse = false;

    if (hasAcf || hasAcfUrl) {
      const { fields, edits } = analyzeField(page, page.$, node, {}, errors);
      for (const e of edits) addAbs(e.start, e.end, e.replacement);
      const acfField = fields.find((f) => f.name === attrs['data-acf']);
      if (acfField && (acfField.type === 'wysiwyg' || acfField.type === 'image')) skipRecurse = true;
    } else if ((node.name || '').toLowerCase() === 'a') {
      const hrefLoc = nloc.attrs && nloc.attrs.href;
      if (hrefLoc) {
        const href = page.$(node).attr('href');
        const edit = resolveFixedHref(page, { ...hrefLoc, startLine: line }, href, model.linkRegistry, errors);
        if (edit) addAbs(edit.start, edit.end, edit.replacement);
      }
    }

    if (!skipRecurse) {
      for (const c of node.children || []) visit(c);
    }
  }

  if (includeSelf) {
    stripAllDataAttrs(el);
  }
  for (const c of el.children || []) visit(c);

  return editList.apply();
}

module.exports = { renderFragment };
