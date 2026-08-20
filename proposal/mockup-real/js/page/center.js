// 活動拠点の地図（Leaflet + OpenStreetMap）。
// 元モックはページ内 <script> に書いていたが、L25 に従い分離した。
// **中身は変えていない。** 拠点の座標は現状ここにべた書きで、CPT 化はしていない
// （データの持ち方を変えるのは別の判断なので、移設と混ぜない）。

(function () {
  var map = L.map('center-map').setView([33.868, 130.830], 11);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  }).addTo(map);

  var icon = L.divIcon({
    className: '',
    html: '<div class="center-map__pin"></div>',
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -16]
  });

  var spots = [
    { name: 'タカミヤ環境ミュージアム',  lat: 33.8693, lng: 130.8145, url: 'takamiya.html' },
    { name: 'いのちのたび博物館',         lat: 33.8700, lng: 130.8160, url: 'inochi.html' },
    { name: '山田緑地',                   lat: 33.9022, lng: 130.8644, url: 'yamada.html' },
    { name: '北九州市響灘ビオトープ',      lat: 33.9056, lng: 130.7253, url: 'biotope.html' },
    { name: '響灘緑地グリーンパーク',      lat: 33.8972, lng: 130.7561, url: 'greenpark.html' },
    { name: '北九州市ほたる館',           lat: 33.8847, lng: 130.8776, url: 'hotarukan.html' },
    { name: '香月・黒川ほたる館',         lat: 33.8297, lng: 130.7486, url: 'katsuki-hotaru.html' },
    { name: '到津の森公園',              lat: 33.8851, lng: 130.8593, url: 'itouzu.html' },
    { name: '水環境館',                  lat: 33.8822, lng: 130.8798, url: 'mizukankyokan.html' },
    { name: 'ソラランド平尾台',           lat: 33.7933, lng: 130.9139, url: 'soraland.html' }
  ];

  // 行き先の決め方。**リンク自体は常に出す**（モックとしての見た目を保つため）。
  //
  // モックとして開いたときは s.url（モック内のパス）で回遊できる。
  // 変換後は NKK_PERMALINKS（変換器が wp_localize_script で渡す）にスラッグがあれば
  // そのパーマリンクを使う。まだ投稿が無いスラッグは表に載らないので '#' に落とす。
  // 実測: モックのパスをそのまま出していたとき、10件中9件が 404 だった。
  function hrefFor(s) {
    if (typeof NKK_PERMALINKS === 'undefined') return s.url;    // モックとして開いている
    return NKK_PERMALINKS[s.url.replace(/\.html$/, '')] || '#'; // 変換後。未作成は '#'
  }

  spots.forEach(function (s) {
    L.marker([s.lat, s.lng], { icon: icon })
      .addTo(map)
      .bindPopup(
        '<div class="center-map__popup">' +
        '<strong class="center-map__name">' + s.name + '</strong><br>' +
        '<a href="' + hrefFor(s) + '" class="center-map__link">詳しく見る →</a>' +
        '</div>'
      );
  });
})();
