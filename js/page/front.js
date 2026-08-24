// トップページ専用。ヒーロースライドショー。
// 元は各ページの <script> にインラインで入っており、10ページ全部に同じものが複製され
// ていた。.hero-slide が無いページでは activateSlide(slides[0]) が Uncaught TypeError
// になっていた（非トップ9ページで実測）。トップ専用なのでここに切り出す。
// ヒーロースライドショー
(function () {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');
  let current = 0;
  let timer;

  function activateSlide(slide) {
    // scale(1.12) からスタートして scale(1.0) へゆっくり引く
    slide.style.transition = 'opacity 1.2s ease';
    slide.style.transform = 'scale(1.12)';
    slide.offsetHeight; // reflow
    slide.style.transition = 'opacity 1.2s ease, transform 7s ease-out';
    slide.style.transform = 'scale(1.0)';
  }

  function deactivateSlide(slide) {
    // フェードアウト中はtransformを固定、完了後にリセット
    const currentScale = getComputedStyle(slide).transform;
    slide.style.transition = 'opacity 1.2s ease';
    slide.style.transform = currentScale;
    setTimeout(() => {
      slide.style.transition = '';
      slide.style.transform = 'scale(1.12)';
    }, 1200);
  }

  function goTo(index) {
    const prev = slides[current];
    prev.classList.remove('is-active');
    dots[current].classList.remove('is-active');
    dots[current].setAttribute('aria-selected', 'false');
    deactivateSlide(prev);
    current = index;
    slides[current].classList.add('is-active');
    dots[current].classList.add('is-active');
    dots[current].setAttribute('aria-selected', 'true');
    activateSlide(slides[current]);
  }

  function next() {
    goTo((current + 1) % slides.length);
  }

  function startTimer() {
    timer = setInterval(next, 5000);
  }

  // ドットクリックで手動切り替え
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      clearInterval(timer);
      goTo(i);
      startTimer();
    });
  });

  // 最初のスライドもズームアウト開始
  activateSlide(slides[0]);
  startTimer();
})();
