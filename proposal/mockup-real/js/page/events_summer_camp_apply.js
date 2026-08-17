// イベント参加申し込みページ専用。交通手段で「車」を選んだときだけ駐車場の注意書きを出す。
//
// 値の比較が日本語のラベルそのものになっているのは Contact Form 7 の制約による。
// CF7 のラジオは **HTML の value を必ず表示ラベルと同じにする**
// （form-tags-manager.php: values = collect_befores(), labels = values）。
// パイプ記法 "car|車（自家用車）" は value も表示も "car" になり、
// "車（自家用車）|car" は value が「車（自家用車）」でメールだけ car になる。
// つまり value="car" のまま表示を日本語にすることはできない。
//
// そのためモック側の value をラベルと同じ日本語に揃え、CF7 の出力と一致させている。
// （PROJECT-NOTES.md 3「チェックボックス／ラジオは CF7 のマークアップになる」の
//   延長。マークアップだけでなく value も変わるので、値を見る JS は当て直しになる）
document.querySelectorAll('input[name="transport"]').forEach(function (radio) {
  radio.addEventListener('change', function () {
    var note = document.getElementById('parkingNote');
    note.classList.toggle('is-visible', this.value === '車（自家用車）');
  });
});
