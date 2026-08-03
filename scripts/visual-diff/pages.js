/**
 * 比較ページリスト
 * mockup: モックアップの HTML ファイルパス（リポジトリルートからの相対）
 * wp:     WP ローカルの URL パス
 * label:  レポート表示名
 */
module.exports = [
  { label: 'トップ',              mockup: 'index.html',                           wp: '/' },
  { label: '全体像',              mockup: 'about/index.html',                     wp: '/about/' },
  { label: '生物多様性とは？',    mockup: 'about/biodiversity.html',              wp: '/about/biodiversity/' },
  { label: '北九州市の取り組み',  mockup: 'about/strategy.html',                  wp: '/about/strategy/' },
  { label: '自然スポット一覧',    mockup: 'about/spots.html',                     wp: '/about/spots/' },
  { label: '活動拠点',            mockup: 'center/index.html',                    wp: '/center/' },
  { label: 'イベント一覧',        mockup: 'events/index.html',                    wp: '/events/' },
  { label: 'お知らせ一覧',        mockup: 'news/index.html',                      wp: '/news/' },
  { label: 'お問合せ',            mockup: 'contact/index.html',                   wp: '/contact/' },
  { label: '会員募集',            mockup: 'join/index.html',                      wp: '/join/' },
  { label: '自然共生サイト',      mockup: 'nature-symbiosis/index.html',          wp: '/nature-symbiosis/' },
  { label: '地域との繋がり',      mockup: 'network/index.html',                   wp: '/network/' },
  { label: 'みんなの写真展',      mockup: 'photos/index.html',                    wp: '/photos/' },
  // CPT single ページ（seed投入後に有効）
  { label: 'center: 響灘ビオトープ',    mockup: 'center/biotope.html',            wp: '/center/biotope/' },
  { label: 'spot: 平尾台',              mockup: 'about/spots/hiraodai.html',      wp: '/about/spots/hiraodai/' },
  { label: 'event: 平尾台観察会',       mockup: 'events/hiraodai-kansatsukai.html', wp: '/events/hiraodai-kansatsukai/' },
];
