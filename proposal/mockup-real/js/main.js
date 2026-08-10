// アーバンネイチャー北九州 - メインJS

// aria-live リージョンを通じて画面外に通知する
function announce(message) {
  let region = document.getElementById('js-live-region');
  if (!region) {
    region = document.createElement('div');
    region.id = 'js-live-region';
    region.setAttribute('aria-live', 'polite');
    region.setAttribute('aria-atomic', 'true');
    region.className = 'sr-only';
    document.body.appendChild(region);
  }
  region.textContent = '';
  requestAnimationFrame(() => { region.textContent = message; });
}

document.addEventListener('DOMContentLoaded', () => {

  // ===== ハンバーガーメニュー =====
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');

  if (hamburger && mobileNav) {
    function openMenu() {
      hamburger.classList.add('active');
      mobileNav.classList.add('active');
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      const firstFocusable = mobileNav.querySelector('a, button, [tabindex]:not([tabindex="-1"])');
      if (firstFocusable) firstFocusable.focus();
    }

    function closeMenu() {
      hamburger.classList.remove('active');
      mobileNav.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      hamburger.focus();
    }

    hamburger.addEventListener('click', () => {
      mobileNav.classList.contains('active') ? closeMenu() : openMenu();
    });

    // Escape キーで閉じる
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileNav.classList.contains('active')) closeMenu();
    });

    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });
  }

  // ===== モバイルナビ アコーディオン =====
  document.querySelectorAll('.mobile-nav__toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const children = btn.closest('.mobile-nav__parent').nextElementSibling;
      const isOpen = children.classList.contains('is-open');
      document.querySelectorAll('.mobile-nav__children').forEach(el => el.classList.remove('is-open'));
      document.querySelectorAll('.mobile-nav__toggle').forEach(el => el.setAttribute('aria-expanded', 'false'));
      if (!isOpen) {
        children.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ===== アコーディオン =====
  document.querySelectorAll('.accordion__header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      item.classList.toggle('active', !item.classList.contains('active'));
    });
  });

  // ===== タブフィルタ（events ページ: aria-pressed 管理）=====
  document.querySelectorAll('.tabs').forEach(tabGroup => {
    tabGroup.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        tabGroup.querySelectorAll('.tab').forEach(t => {
          t.classList.remove('active');
          if (t.hasAttribute('aria-pressed')) t.setAttribute('aria-pressed', 'false');
        });
        tab.classList.add('active');
        if (tab.hasAttribute('aria-pressed')) tab.setAttribute('aria-pressed', 'true');
        const category = tab.dataset.category;
        const grid = tabGroup.nextElementSibling;
        if (grid) {
          let count = 0;
          grid.querySelectorAll('[data-category]').forEach(item => {
            const show = category === 'all' || item.dataset.category === category;
            item.style.display = show ? '' : 'none';
            if (show) count++;
          });
          announce(`${count}件を表示中`);
        }
      });
    });
  });

  // ===== スムーススクロール =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return; // プレースホルダーリンクはスキップ
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ===== フォームバリデーション =====
  document.querySelectorAll('form').forEach(form => {
    // aria-live 用エラー表示エリアを各フォームに追加
    let statusEl = form.querySelector('.form-status');
    if (!statusEl) {
      statusEl = document.createElement('p');
      statusEl.className = 'form-status sr-only';
      statusEl.setAttribute('aria-live', 'assertive');
      statusEl.setAttribute('aria-atomic', 'true');
      form.prepend(statusEl);
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const requiredFields = form.querySelectorAll('[required]');
      let valid = true;

      requiredFields.forEach(field => {
        field.classList.remove('error');
        if (!field.value.trim()) {
          field.classList.add('error');
          valid = false;
        }
        if (field.type === 'email' && field.value) {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
            field.classList.add('error');
            valid = false;
          }
        }
      });

      const privacyCheck = form.querySelector('input[name="privacy"]');
      if (privacyCheck && !privacyCheck.checked) {
        valid = false;
        statusEl.textContent = 'プライバシーポリシーへの同意が必要です。';
        privacyCheck.focus();
        return;
      }

      if (valid) {
        statusEl.textContent = '送信が完了しました。';
        form.reset();
      } else {
        const firstError = form.querySelector('.error');
        if (firstError) firstError.focus();
        statusEl.textContent = '入力内容に誤りがあります。赤くなっている項目を確認してください。';
      }
    });
  });

});
