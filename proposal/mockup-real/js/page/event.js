// イベント一覧の絞り込み（種別・カテゴリ・対象）。
// 元モックはページ内 <script> に書いていたが、L25 に従い分離した。**中身は変えていない。**
//
// 読むのは data-type / data-category / data-target と data-filter-*。
// これらは**サイト自身の JS が使う data-*** であって構造宣言ではないので、
// 変換器は削除しない（shared/declaration-attrs.js が区別する）。

// イベントフィルタ
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('eventGrid');
  // 変換後は js/page/<cpt>.js が**詳細ページでも読まれる**（一覧と共用の規約）。
  // 詳細に eventGrid は無いので、ここで抜けないと例外になる。
  // モックでは一覧にしか読み込んでいなかったため、この分岐が要らなかった。
  if (!grid) return;
  const cards = grid.querySelectorAll('.event-card');
  let activeType = 'all';
  let activeCat = 'all';
  let activeTarget = 'all';

  function filterCards() {
    cards.forEach(card => {
      const matchType = activeType === 'all' || card.dataset.type === activeType;
      const matchCat = activeCat === 'all' || card.dataset.category === activeCat;
      const matchTarget = activeTarget === 'all' || card.dataset.target === activeTarget;
      card.style.display = (matchType && matchCat && matchTarget) ? '' : 'none';
    });
  }

  document.querySelectorAll('[data-filter-type]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-filter-type]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeType = btn.dataset.filterType;
      filterCards();
    });
  });

  document.querySelectorAll('[data-filter-cat]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-filter-cat]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCat = btn.dataset.filterCat;
      filterCards();
    });
  });

  document.querySelectorAll('[data-filter-target]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-filter-target]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTarget = btn.dataset.filterTarget;
      filterCards();
    });
  });
});
  
