# Phase2 テスト仕様書（C1: 自動チェック結果つき）

- 入力: acf-map.yaml
- acf-map.yaml 全ページ数: 51
- テストケース数: 27（CPTは代表1件に集約。他は付録参照）

凡例: 「自動OK/自動NG」= 機械的に判定済み／「要目視」= 人が見て判断する項目（Excel/CSVの方はL1向け l1-checklist.tsv を参照。判定列は黄=要目視・未実行（未確定）・赤=自動NGで色分け）

---

## 生物多様性とは？ \| アーバンネイチャー北九州 (/about/biodiversity/ → page-about-biodiversity.php)

URL: http://localhost:10004/about/biodiversity/

| 種別 | 確認内容 | 判定 | 根拠 |
|---|---|---|---|
| 表示確認 | モックアップとの見た目一致（崩れ・文字化け・画像抜けがないか） | <span style="color:#b8860b">要目視</span> | visual-diff未実行 |
| ACF差し替え | ACFデフォルト値がライブページに反映されているか | <span style="color:#c62828">自動NG</span> | 0/14 一致 / 未検出: page_header_title, page_header_text, section_white_title_1, section_white_text_1, section_white_title_2, section_white_text_2, section_white_title_3, section_white_text_3, section_white_title_4, section_white_text_4, section_gray_title_1, section_gray_text_1, section_gray_title_2, section_gray_text_2 |
| リンク遷移 | ページ内リンクの遷移先が生存しているか | 自動OK | 0件確認 |
| レスポンシブ | モバイル表示で文字・画像の重なり／はみ出しがないか | <span style="color:#b8860b">要目視</span> | visual-diff未実行 |
| アクセシビリティ簡易チェック | pa11y-ci（axe-core）によるWCAG 2.0 AA自動検出 | <span style="color:#b8860b">未実行（別途 pa11y-ci を実行してください）</span> | pa11y-report.json が見つからない |

## 全体像 \| アーバンネイチャー北九州 (/about/ → page-about.php)

URL: http://localhost:10004/about/

| 種別 | 確認内容 | 判定 | 根拠 |
|---|---|---|---|
| 表示確認 | モックアップとの見た目一致（崩れ・文字化け・画像抜けがないか） | <span style="color:#b8860b">要目視</span> | visual-diff未実行 |
| ACF差し替え | ACFデフォルト値がライブページに反映されているか | <span style="color:#c62828">自動NG</span> | 0/39 一致 / 未検出: page_header_title, page_header_text, about_intro_title, about_intro_text_1, about_intro_text_2, about_intro_text_3, section_white_title_1, section_white_text_1, section_white_text_2, section_white_title_2, section_white_text_3, section_white_title_3, section_white_text_4, section_white_title_4, section_white_text_5, section_white_title_5, section_white_text_6, section_gray_title_1, section_gray_text_1, section_gray_title_2, section_gray_text_2, section_gray_title_3, section_gray_text_3, section_gray_title_4, section_gray_text_4, section_gray_text_5, section_gray_title_5, section_gray_text_6, about_cycle_title_1, about_cycle_text_1, about_cycle_text_2, about_cycle_title_2, about_cycle_text_3, about_cycle_text_4, about_cycle_title_3, about_cycle_text_5, about_cycle_text_6, about_cycle_title_4, about_cycle_text_7 / image型4件は自動チェック対象外（要目視） |
| リンク遷移 | ページ内リンクの遷移先が生存しているか | 自動OK | 0件確認 |
| レスポンシブ | モバイル表示で文字・画像の重なり／はみ出しがないか | <span style="color:#b8860b">要目視</span> | visual-diff未実行 |
| アクセシビリティ簡易チェック | pa11y-ci（axe-core）によるWCAG 2.0 AA自動検出 | <span style="color:#b8860b">未実行（別途 pa11y-ci を実行してください）</span> | pa11y-report.json が見つからない |

## 北九州市の自然スポット \| アーバンネイチャー北九州 (/about/spots/ → page-about-spots.php)

URL: http://localhost:10004/about/spots/

| 種別 | 確認内容 | 判定 | 根拠 |
|---|---|---|---|
| 表示確認 | モックアップとの見た目一致（崩れ・文字化け・画像抜けがないか） | <span style="color:#b8860b">要目視</span> | visual-diff未実行 |
| ACF差し替え | ACFデフォルト値がライブページに反映されているか | <span style="color:#c62828">自動NG</span> | 0/5 一致 / 未検出: page_header_title, page_header_text, section_white_title, section_white_text_1, section_white_text_2 / image型9件は自動チェック対象外（要目視） |
| リンク遷移 | ページ内リンクの遷移先が生存しているか | 自動OK | 0件確認 |
| レスポンシブ | モバイル表示で文字・画像の重なり／はみ出しがないか | <span style="color:#b8860b">要目視</span> | visual-diff未実行 |
| アクセシビリティ簡易チェック | pa11y-ci（axe-core）によるWCAG 2.0 AA自動検出 | <span style="color:#b8860b">未実行（別途 pa11y-ci を実行してください）</span> | pa11y-report.json が見つからない |

## 合馬竹林公園 \| アーバンネイチャー北九州 (/about/spots/auma/ → single-nkk_spot.php)

URL: http://localhost:10004/about/spots/auma/

※ 同じテンプレートを使う他8件（響灘ビオトープ | アーバンネイチャー北九州、玄海国定公園（若松北海岸） | アーバンネイチャー北九州、平尾台 | アーバンネイチャー北九州、関門海峡 | アーバンネイチャー北九州、紫川 | アーバンネイチャー北九州、皿倉山 | アーバンネイチャー北九州、曽根干潟 | アーバンネイチャー北九州、山田緑地 | アーバンネイチャー北九州）は本ケースの結果に準ずる

| 種別 | 確認内容 | 判定 | 根拠 |
|---|---|---|---|
| 表示確認 | モックアップとの見た目一致（崩れ・文字化け・画像抜けがないか） | <span style="color:#b8860b">要目視</span> | visual-diff未実行 |
| ACF差し替え | ACFデフォルト値がライブページに反映されているか | <span style="color:#c62828">自動NG</span> | 0/6 一致 / 未検出: spot_hero_title, spot_hero_text, section_white_title_1, section_white_text_1, section_white_text_2, section_white_title_2 / image型2件は自動チェック対象外（要目視） |
| リンク遷移 | ページ内リンクの遷移先が生存しているか | 自動OK | 0件確認 |
| レスポンシブ | モバイル表示で文字・画像の重なり／はみ出しがないか | <span style="color:#b8860b">要目視</span> | visual-diff未実行 |
| アクセシビリティ簡易チェック | pa11y-ci（axe-core）によるWCAG 2.0 AA自動検出 | <span style="color:#b8860b">未実行（別途 pa11y-ci を実行してください）</span> | pa11y-report.json が見つからない |

## 北九州市の取り組み \| アーバンネイチャー北九州 (/about/strategy/ → page-about-strategy.php)

URL: http://localhost:10004/about/strategy/

| 種別 | 確認内容 | 判定 | 根拠 |
|---|---|---|---|
| 表示確認 | モックアップとの見た目一致（崩れ・文字化け・画像抜けがないか） | <span style="color:#b8860b">要目視</span> | visual-diff未実行 |
| ACF差し替え | ACFデフォルト値がライブページに反映されているか | <span style="color:#c62828">自動NG</span> | 0/12 一致 / 未検出: page_header_title, page_header_text, section_white_text_1, section_white_title_1, section_white_text_2, section_white_title_2, section_white_text_3, section_white_text_4, section_gray_title_1, section_gray_text_1, section_gray_title_2, section_gray_text_2 / image型11件は自動チェック対象外（要目視） |
| リンク遷移 | ページ内リンクの遷移先が生存しているか | 自動OK | 0件確認 |
| レスポンシブ | モバイル表示で文字・画像の重なり／はみ出しがないか | <span style="color:#b8860b">要目視</span> | visual-diff未実行 |
| アクセシビリティ簡易チェック | pa11y-ci（axe-core）によるWCAG 2.0 AA自動検出 | <span style="color:#b8860b">未実行（別途 pa11y-ci を実行してください）</span> | pa11y-report.json が見つからない |

## 活動ブログ \| アーバンネイチャー北九州 (/blog/ → page-blog.php)

URL: http://localhost:10004/blog/

| 種別 | 確認内容 | 判定 | 根拠 |
|---|---|---|---|
| 表示確認 | モックアップとの見た目一致（崩れ・文字化け・画像抜けがないか） | <span style="color:#b8860b">要目視</span> | visual-diff未実行 |
| ACF差し替え | ACFデフォルト値がライブページに反映されているか | <span style="color:#c62828">自動NG</span> | 0/14 一致 / 未検出: main_content_title, main_content_text, section_white_title_1, section_white_text_1, section_white_title_2, section_white_text_2, section_white_title_3, section_white_text_3, section_white_title_4, section_white_text_4, section_white_title_5, section_white_text_5, section_white_title_6, section_white_text_6 / image型6件は自動チェック対象外（要目視） |
| リンク遷移 | ページ内リンクの遷移先が生存しているか | 自動OK | 0件確認 |
| レスポンシブ | モバイル表示で文字・画像の重なり／はみ出しがないか | <span style="color:#b8860b">要目視</span> | visual-diff未実行 |
| アクセシビリティ簡易チェック | pa11y-ci（axe-core）によるWCAG 2.0 AA自動検出 | <span style="color:#b8860b">未実行（別途 pa11y-ci を実行してください）</span> | pa11y-report.json が見つからない |

## 北九州市響灘ビオトープ \| アーバンネイチャー北九州 (/center/biotope/ → single-nkk_center.php)

URL: http://localhost:10004/center/biotope/

※ 同じテンプレートを使う他9件（響灘緑地グリーンパーク | アーバンネイチャー北九州、北九州市ほたる館 | アーバンネイチャー北九州、いのちのたび博物館 | アーバンネイチャー北九州、到津の森公園 | アーバンネイチャー北九州、香月・黒川ほたる館 | アーバンネイチャー北九州、水環境館 | アーバンネイチャー北九州、ソラランド平尾台 | アーバンネイチャー北九州、タカミヤ環境ミュージアム | アーバンネイチャー北九州、山田緑地 | アーバンネイチャー北九州）は本ケースの結果に準ずる

| 種別 | 確認内容 | 判定 | 根拠 |
|---|---|---|---|
| 表示確認 | モックアップとの見た目一致（崩れ・文字化け・画像抜けがないか） | <span style="color:#b8860b">要目視</span> | visual-diff未実行 |
| ACF差し替え | ACFデフォルト値がライブページに反映されているか | <span style="color:#c62828">自動NG</span> | 0/14 一致 / 未検出: main_content_title, main_content_text, section_white_title_1, section_white_title_2, section_white_title_3, section_white_text_1, section_white_text_2, section_gray_title_1, section_gray_text_1, section_gray_text_2, section_gray_text_3, section_gray_title_2, section_gray_text_4, section_gray_text_5 / image型1件は自動チェック対象外（要目視） |
| リンク遷移 | ページ内リンクの遷移先が生存しているか | 自動OK | 0件確認 |
| レスポンシブ | モバイル表示で文字・画像の重なり／はみ出しがないか | <span style="color:#b8860b">要目視</span> | visual-diff未実行 |
| アクセシビリティ簡易チェック | pa11y-ci（axe-core）によるWCAG 2.0 AA自動検出 | <span style="color:#b8860b">未実行（別途 pa11y-ci を実行してください）</span> | pa11y-report.json が見つからない |

## 活動拠点 \| アーバンネイチャー北九州 (/center/ → page-center.php)

URL: http://localhost:10004/center/

| 種別 | 確認内容 | 判定 | 根拠 |
|---|---|---|---|
| 表示確認 | モックアップとの見た目一致（崩れ・文字化け・画像抜けがないか） | <span style="color:#b8860b">要目視</span> | visual-diff未実行 |
| ACF差し替え | ACFデフォルト値がライブページに反映されているか | <span style="color:#c62828">自動NG</span> | 0/34 一致 / 未検出: main_content_title, main_content_text, section_white_title_1, section_white_text_1, section_white_text_2, section_white_text_3, section_white_text_4, section_white_title_2, section_white_text_5, section_gray_title_1, section_gray_text_1, section_gray_title_2, section_gray_text_2, section_gray_title_3, section_gray_text_3, section_gray_title_4, section_gray_text_4, section_gray_title_5, section_gray_text_5, section_gray_title_6, section_gray_text_6, section_gray_title_7, section_gray_text_7, section_gray_title_8, section_gray_text_8, section_gray_title_9, section_gray_text_9, section_gray_title_10, section_gray_text_10, section_gray_title_11, section_gray_text_11, section_gray_title_12, section_gray_text_12, section_gray_text_13 / image型11件は自動チェック対象外（要目視） |
| リンク遷移 | ページ内リンクの遷移先が生存しているか | 自動OK | 0件確認 |
| レスポンシブ | モバイル表示で文字・画像の重なり／はみ出しがないか | <span style="color:#b8860b">要目視</span> | visual-diff未実行 |
| アクセシビリティ簡易チェック | pa11y-ci（axe-core）によるWCAG 2.0 AA自動検出 | <span style="color:#b8860b">未実行（別途 pa11y-ci を実行してください）</span> | pa11y-report.json が見つからない |

## お問合せ \| アーバンネイチャー北九州 (/contact/ → page-contact.php)

URL: http://localhost:10004/contact/

| 種別 | 確認内容 | 判定 | 根拠 |
|---|---|---|---|
| 表示確認 | モックアップとの見た目一致（崩れ・文字化け・画像抜けがないか） | <span style="color:#b8860b">要目視</span> | visual-diff未実行 |
| ACF差し替え | ACFデフォルト値がライブページに反映されているか | <span style="color:#c62828">自動NG</span> | 0/14 一致 / 未検出: main_content_title, main_content_text, section_gray_title_1, section_gray_title_2, section_gray_text_1, section_gray_text_2, section_gray_text_3, section_gray_text_4, section_gray_text_5, section_gray_text_6, section_gray_text_7, section_gray_text_8, section_gray_text_9, section_gray_text_10 |
| フォーム送信 | Contact Form 7 フォームが描画されているか | <span style="color:#c62828">自動NG</span> | wpcf7-form 未検出 |
| リンク遷移 | ページ内リンクの遷移先が生存しているか | 自動OK | 0件確認 |
| レスポンシブ | モバイル表示で文字・画像の重なり／はみ出しがないか | <span style="color:#b8860b">要目視</span> | visual-diff未実行 |
| アクセシビリティ簡易チェック | pa11y-ci（axe-core）によるWCAG 2.0 AA自動検出 | <span style="color:#b8860b">未実行（別途 pa11y-ci を実行してください）</span> | pa11y-report.json が見つからない |

## 参加申し込み｜企業向け生態系保全体験プログラム ― ビオトープづくり \| アーバンネイチャー北九州 (/events/biotope-kigyo-apply/ → page-event-apply.php)

URL: http://localhost:10004/events/biotope-kigyo-apply/

| 種別 | 確認内容 | 判定 | 根拠 |
|---|---|---|---|
| 表示確認 | モックアップとの見た目一致（崩れ・文字化け・画像抜けがないか） | <span style="color:#b8860b">要目視</span> | visual-diff未実行 |
| ACF差し替え | ACFデフォルト値がライブページに反映されているか | <span style="color:#c62828">自動NG</span> | 0/7 一致 / 未検出: section_white_title, section_white_text, applyform_text_1, applyform_text_2, applyform_text_3, applyform_text_4, footer_text / image型1件は自動チェック対象外（要目視） |
| フォーム送信 | Contact Form 7 フォームが描画されているか | <span style="color:#c62828">自動NG</span> | wpcf7-form 未検出 |
| リンク遷移 | ページ内リンクの遷移先が生存しているか | 自動OK | 0件確認 |
| レスポンシブ | モバイル表示で文字・画像の重なり／はみ出しがないか | <span style="color:#b8860b">要目視</span> | visual-diff未実行 |
| アクセシビリティ簡易チェック | pa11y-ci（axe-core）によるWCAG 2.0 AA自動検出 | <span style="color:#b8860b">未実行（別途 pa11y-ci を実行してください）</span> | pa11y-report.json が見つからない |

## 企業向け生態系保全体験プログラム ― ビオトープづくり \| アーバンネイチャー北九州 (/events/biotope-kigyo/ → single-nkk_event.php)

URL: http://localhost:10004/events/biotope-kigyo/

※ 同じテンプレートを使う他6件（平尾台 春の自然観察会 〜カルスト台地の野草を楽しむ〜 | アーバンネイチャー北九州、平尾台トゥクトゥクで巡る自然ツアー | アーバンネイチャー北九州、平尾台シャボン玉フェスティバル | アーバンネイチャー北九州、曽根干潟クリーンアップ大作戦 2026春 | アーバンネイチャー北九州、夏休み自然体験キャンプ ― 2泊3日で学ぶ北九州の自然 | アーバンネイチャー北九州、子ども自然教室「森の生きもの探検隊」 | アーバンネイチャー北九州）は本ケースの結果に準ずる

| 種別 | 確認内容 | 判定 | 根拠 |
|---|---|---|---|
| 表示確認 | モックアップとの見た目一致（崩れ・文字化け・画像抜けがないか） | <span style="color:#b8860b">要目視</span> | visual-diff未実行 |
| ACF差し替え | ACFデフォルト値がライブページに反映されているか | <span style="color:#c62828">自動NG</span> | 0/14 一致 / 未検出: ev_hero_title, section_white_title_1, section_white_text_1, section_white_text_2, section_white_title_2, section_white_title_3, section_white_text_3, section_white_text_4, section_white_title_4, section_white_text_5, section_white_text_6, section_white_text_7, section_white_title_5, section_white_text_8 / image型11件は自動チェック対象外（要目視） |
| リンク遷移 | ページ内リンクの遷移先が生存しているか | 自動OK | 0件確認 |
| レスポンシブ | モバイル表示で文字・画像の重なり／はみ出しがないか | <span style="color:#b8860b">要目視</span> | visual-diff未実行 |
| アクセシビリティ簡易チェック | pa11y-ci（axe-core）によるWCAG 2.0 AA自動検出 | <span style="color:#b8860b">未実行（別途 pa11y-ci を実行してください）</span> | pa11y-report.json が見つからない |

## 参加申し込み｜平尾台 春の自然観察会 \| アーバンネイチャー北九州 (/events/hiraodai-kansatsukai-apply/ → page-event-apply.php)

URL: http://localhost:10004/events/hiraodai-kansatsukai-apply/

| 種別 | 確認内容 | 判定 | 根拠 |
|---|---|---|---|
| 表示確認 | モックアップとの見た目一致（崩れ・文字化け・画像抜けがないか） | <span style="color:#b8860b">要目視</span> | visual-diff未実行 |
| ACF差し替え | ACFデフォルト値がライブページに反映されているか | <span style="color:#c62828">自動NG</span> | 0/7 一致 / 未検出: section_white_title, section_white_text, applyform_text_1, applyform_text_2, applyform_text_3, applyform_text_4, applyform_text_5 / image型1件は自動チェック対象外（要目視） |
| フォーム送信 | Contact Form 7 フォームが描画されているか | <span style="color:#c62828">自動NG</span> | wpcf7-form 未検出 |
| リンク遷移 | ページ内リンクの遷移先が生存しているか | 自動OK | 0件確認 |
| レスポンシブ | モバイル表示で文字・画像の重なり／はみ出しがないか | <span style="color:#b8860b">要目視</span> | visual-diff未実行 |
| アクセシビリティ簡易チェック | pa11y-ci（axe-core）によるWCAG 2.0 AA自動検出 | <span style="color:#b8860b">未実行（別途 pa11y-ci を実行してください）</span> | pa11y-report.json が見つからない |

## イベント \| アーバンネイチャー北九州 (/events/ → archive-nkk_event.php)

URL: http://localhost:10004/events/

| 種別 | 確認内容 | 判定 | 根拠 |
|---|---|---|---|
| 表示確認 | モックアップとの見た目一致（崩れ・文字化け・画像抜けがないか） | <span style="color:#b8860b">要目視</span> | visual-diff未実行 |
| ACF差し替え | ACFデフォルト値がライブページに反映されているか | <span style="color:#c62828">自動NG</span> | 0/18 一致 / 未検出: main_content_title, main_content_text, section_white_text_1, section_white_text_2, section_white_text_3, section_white_title, eventgrid_title_1, eventgrid_text_1, eventgrid_title_2, eventgrid_text_2, eventgrid_title_3, eventgrid_text_3, eventgrid_title_4, eventgrid_text_4, eventgrid_title_5, eventgrid_text_5, eventgrid_title_6, eventgrid_text_6 / image型6件は自動チェック対象外（要目視） |
| リンク遷移 | ページ内リンクの遷移先が生存しているか | 自動OK | 0件確認 |
| レスポンシブ | モバイル表示で文字・画像の重なり／はみ出しがないか | <span style="color:#b8860b">要目視</span> | visual-diff未実行 |
| アクセシビリティ簡易チェック | pa11y-ci（axe-core）によるWCAG 2.0 AA自動検出 | <span style="color:#b8860b">未実行（別途 pa11y-ci を実行してください）</span> | pa11y-report.json が見つからない |

## 参加申し込み｜曽根干潟クリーンアップ大作戦 2026春 \| アーバンネイチャー北九州 (/events/sone-higata-cleanup-apply/ → page-event-apply.php)

URL: http://localhost:10004/events/sone-higata-cleanup-apply/

| 種別 | 確認内容 | 判定 | 根拠 |
|---|---|---|---|
| 表示確認 | モックアップとの見た目一致（崩れ・文字化け・画像抜けがないか） | <span style="color:#b8860b">要目視</span> | visual-diff未実行 |
| ACF差し替え | ACFデフォルト値がライブページに反映されているか | <span style="color:#c62828">自動NG</span> | 0/8 一致 / 未検出: section_white_title, section_white_text, applyform_text_1, applyform_text_2, applyform_text_3, applyform_text_4, applyform_text_5, footer_text / image型1件は自動チェック対象外（要目視） |
| フォーム送信 | Contact Form 7 フォームが描画されているか | <span style="color:#c62828">自動NG</span> | wpcf7-form 未検出 |
| リンク遷移 | ページ内リンクの遷移先が生存しているか | 自動OK | 0件確認 |
| レスポンシブ | モバイル表示で文字・画像の重なり／はみ出しがないか | <span style="color:#b8860b">要目視</span> | visual-diff未実行 |
| アクセシビリティ簡易チェック | pa11y-ci（axe-core）によるWCAG 2.0 AA自動検出 | <span style="color:#b8860b">未実行（別途 pa11y-ci を実行してください）</span> | pa11y-report.json が見つからない |

## 参加申し込み｜夏休み自然体験キャンプ ― 2泊3日で学ぶ北九州の自然 \| アーバンネイチャー北九州 (/events/summer-camp-apply/ → page-event-apply.php)

URL: http://localhost:10004/events/summer-camp-apply/

| 種別 | 確認内容 | 判定 | 根拠 |
|---|---|---|---|
| 表示確認 | モックアップとの見た目一致（崩れ・文字化け・画像抜けがないか） | <span style="color:#b8860b">要目視</span> | visual-diff未実行 |
| ACF差し替え | ACFデフォルト値がライブページに反映されているか | <span style="color:#c62828">自動NG</span> | 0/7 一致 / 未検出: section_white_title, section_white_text, applyform_text_1, applyform_text_2, applyform_text_3, applyform_text_4, footer_text / image型1件は自動チェック対象外（要目視） |
| フォーム送信 | Contact Form 7 フォームが描画されているか | <span style="color:#c62828">自動NG</span> | wpcf7-form 未検出 |
| リンク遷移 | ページ内リンクの遷移先が生存しているか | 自動OK | 0件確認 |
| レスポンシブ | モバイル表示で文字・画像の重なり／はみ出しがないか | <span style="color:#b8860b">要目視</span> | visual-diff未実行 |
| アクセシビリティ簡易チェック | pa11y-ci（axe-core）によるWCAG 2.0 AA自動検出 | <span style="color:#b8860b">未実行（別途 pa11y-ci を実行してください）</span> | pa11y-report.json が見つからない |

## アーバンネイチャー北九州 \| 都市と自然、近いからこそおもしろい。 (/ → front-page.php)

URL: http://localhost:10004/

| 種別 | 確認内容 | 判定 | 根拠 |
|---|---|---|---|
| 表示確認 | モックアップとの見た目一致（崩れ・文字化け・画像抜けがないか） | <span style="color:#b8860b">要目視</span> | visual-diff未実行 |
| ACF差し替え | ACFデフォルト値がライブページに反映されているか | <span style="color:#c62828">自動NG</span> | 0/70 一致 / 未検出: hero_title, hero_text, persona_text_1, persona_title_1, persona_text_2, persona_text_3, persona_title_2, persona_text_4, persona_text_5, persona_title_3, persona_text_6, persona_text_7, persona_title_4, persona_text_8, section_3_title, section_3_text_1, section_3_text_2, section_3_text_3, section_3_text_4, section_3_text_5, section_3_text_6, section_3_text_7, section_3_text_8, section_3_text_9, section_3_text_10, section_3_text_11, section_3_text_12, section_3_text_13, section_3_text_14, section_3_text_15, section_3_text_16, section_4_title, section_4_text, facilities_title, facilities_text_1, facilities_text_2, facilities_text_3, facilities_text_4, facilities_text_5, facilities_text_6, facilities_text_7, facilities_text_8, facilities_text_9, facilities_text_10, facilities_text_11, network_title_1, network_text_1, network_title_2, network_text_2, network_text_3, events_title_1, events_text_1, events_title_2, events_text_2, events_title_3, events_text_3, events_title_4, events_text_4, section_8_title, section_8_text, photos_title, photos_text, stats_text_1, stats_text_2, stats_text_3, stats_text_4, stats_text_5, stats_text_6, stats_text_7, stats_text_8 / image型26件は自動チェック対象外（要目視） |
| リンク遷移 | ページ内リンクの遷移先が生存しているか | 自動OK | 0件確認 |
| レスポンシブ | モバイル表示で文字・画像の重なり／はみ出しがないか | <span style="color:#b8860b">要目視</span> | visual-diff未実行 |
| アクセシビリティ簡易チェック | pa11y-ci（axe-core）によるWCAG 2.0 AA自動検出 | <span style="color:#b8860b">未実行（別途 pa11y-ci を実行してください）</span> | pa11y-report.json が見つからない |

## 会員募集 \| アーバンネイチャー北九州 (/join/ → page-join.php)

URL: http://localhost:10004/join/

| 種別 | 確認内容 | 判定 | 根拠 |
|---|---|---|---|
| 表示確認 | モックアップとの見た目一致（崩れ・文字化け・画像抜けがないか） | <span style="color:#b8860b">要目視</span> | visual-diff未実行 |
| ACF差し替え | ACFデフォルト値がライブページに反映されているか | <span style="color:#c62828">自動NG</span> | 0/18 一致 / 未検出: main_content_title, main_content_text, section_white_title_1, section_white_text_1, section_white_title_2, section_white_text_2, section_white_title_3, section_white_text_3, section_white_title_4, section_white_text_4, section_white_title_5, section_white_text_5, section_white_title_6, section_white_text_6, section_white_title_7, section_white_text_7, section_gray_title, section_gray_text |
| フォーム送信 | Contact Form 7 フォームが描画されているか | <span style="color:#c62828">自動NG</span> | wpcf7-form 未検出 |
| リンク遷移 | ページ内リンクの遷移先が生存しているか | 自動OK | 0件確認 |
| レスポンシブ | モバイル表示で文字・画像の重なり／はみ出しがないか | <span style="color:#b8860b">要目視</span> | visual-diff未実行 |
| アクセシビリティ簡易チェック | pa11y-ci（axe-core）によるWCAG 2.0 AA自動検出 | <span style="color:#b8860b">未実行（別途 pa11y-ci を実行してください）</span> | pa11y-report.json が見つからない |

## 自然共生サイト \| アーバンネイチャー北九州 (/nature-symbiosis/ → page-nature-symbiosis.php)

URL: http://localhost:10004/nature-symbiosis/

| 種別 | 確認内容 | 判定 | 根拠 |
|---|---|---|---|
| 表示確認 | モックアップとの見た目一致（崩れ・文字化け・画像抜けがないか） | <span style="color:#b8860b">要目視</span> | visual-diff未実行 |
| ACF差し替え | ACFデフォルト値がライブページに反映されているか | <span style="color:#c62828">自動NG</span> | 0/28 一致 / 未検出: main_content_title, main_content_text, section_white_title_1, section_white_text_1, section_white_text_2, section_white_title_2, section_white_text_3, section_white_text_4, section_white_text_5, section_white_text_6, section_white_text_7, section_white_text_8, section_white_text_9, section_white_title_3, section_white_text_10, section_white_text_11, section_white_title_4, section_white_text_12, section_white_text_13, section_white_title_5, section_white_title_6, section_white_text_14, section_white_title_7, section_white_text_15, section_white_title_8, section_white_text_16, section_white_title_9, section_white_text_17 |
| リンク遷移 | ページ内リンクの遷移先が生存しているか | 自動OK | 0件確認 |
| レスポンシブ | モバイル表示で文字・画像の重なり／はみ出しがないか | <span style="color:#b8860b">要目視</span> | visual-diff未実行 |
| アクセシビリティ簡易チェック | pa11y-ci（axe-core）によるWCAG 2.0 AA自動検出 | <span style="color:#b8860b">未実行（別途 pa11y-ci を実行してください）</span> | pa11y-report.json が見つからない |

## 活動実績 \| アーバンネイチャー北九州 (/network/cases/ → page-network-cases.php)

URL: http://localhost:10004/network/cases/

| 種別 | 確認内容 | 判定 | 根拠 |
|---|---|---|---|
| 表示確認 | モックアップとの見た目一致（崩れ・文字化け・画像抜けがないか） | <span style="color:#b8860b">要目視</span> | visual-diff未実行 |
| ACF差し替え | ACFデフォルト値がライブページに反映されているか | <span style="color:#c62828">自動NG</span> | 0/36 一致 / 未検出: main_content_title, main_content_text, section_white_text, section_gray_title_1, section_gray_text_1, section_gray_text_2, section_gray_title_2, section_gray_text_3, section_gray_text_4, section_gray_title_3, section_gray_text_5, section_gray_text_6, section_gray_title_4, section_gray_text_7, section_gray_text_8, section_gray_title_5, section_gray_text_9, section_gray_text_10, section_gray_title_6, section_gray_text_11, section_gray_text_12, section_gray_title_7, section_gray_text_13, section_gray_text_14, section_gray_title_8, section_gray_text_15, section_gray_text_16, section_gray_title_9, section_gray_text_17, section_gray_text_18, section_gray_title_10, section_gray_text_19, section_gray_text_20, section_gray_title_11, section_gray_text_21, section_gray_text_22 / image型3件は自動チェック対象外（要目視） |
| リンク遷移 | ページ内リンクの遷移先が生存しているか | 自動OK | 0件確認 |
| レスポンシブ | モバイル表示で文字・画像の重なり／はみ出しがないか | <span style="color:#b8860b">要目視</span> | visual-diff未実行 |
| アクセシビリティ簡易チェック | pa11y-ci（axe-core）によるWCAG 2.0 AA自動検出 | <span style="color:#b8860b">未実行（別途 pa11y-ci を実行してください）</span> | pa11y-report.json が見つからない |

## 株式会社マイン \| 実践事例 \| アーバンネイチャー北九州 (/network/cases/mine/ → single-nkk_case.php)

URL: http://localhost:10004/network/cases/mine/

※ 同じテンプレートを使う他1件（株式会社ネイチャー | 実践事例 | アーバンネイチャー北九州）は本ケースの結果に準ずる

| 種別 | 確認内容 | 判定 | 根拠 |
|---|---|---|---|
| 表示確認 | モックアップとの見た目一致（崩れ・文字化け・画像抜けがないか） | <span style="color:#b8860b">要目視</span> | visual-diff未実行 |
| ACF差し替え | ACFデフォルト値がライブページに反映されているか | <span style="color:#c62828">自動NG</span> | 0/24 一致 / 未検出: main_content_title, main_content_text, section_white_title_1, section_white_text_1, section_white_text_2, section_white_title_2, section_white_text_3, section_white_text_4, section_white_title_3, section_white_text_5, section_white_text_6, section_white_title_4, section_white_text_7, section_white_text_8, section_white_title_5, section_white_text_9, section_white_text_10, section_white_text_11, section_white_title_6, section_white_text_12, section_white_text_13, section_white_title_7, section_white_text_14, section_white_text_15 / image型2件は自動チェック対象外（要目視） |
| リンク遷移 | ページ内リンクの遷移先が生存しているか | 自動OK | 0件確認 |
| レスポンシブ | モバイル表示で文字・画像の重なり／はみ出しがないか | <span style="color:#b8860b">要目視</span> | visual-diff未実行 |
| アクセシビリティ簡易チェック | pa11y-ci（axe-core）によるWCAG 2.0 AA自動検出 | <span style="color:#b8860b">未実行（別途 pa11y-ci を実行してください）</span> | pa11y-report.json が見つからない |

## 響灘ビオトープ共同事業体 \| アーバンネイチャー北九州 (/network/hibikinadabiotope/ → single-nkk_network.php)

URL: http://localhost:10004/network/hibikinadabiotope/

| 種別 | 確認内容 | 判定 | 根拠 |
|---|---|---|---|
| 表示確認 | モックアップとの見た目一致（崩れ・文字化け・画像抜けがないか） | <span style="color:#b8860b">要目視</span> | visual-diff未実行 |
| ACF差し替え | ACFデフォルト値がライブページに反映されているか | <span style="color:#c62828">自動NG</span> | 0/27 一致 / 未検出: page_header_title, page_header_text, section_white_title_1, section_white_text_1, section_white_text_2, section_white_title_2, section_white_text_3, section_white_title_3, section_white_text_4, section_white_title_4, section_white_text_5, section_white_title_5, section_white_text_6, section_white_title_6, section_white_text_7, section_white_title_7, section_gray_title_1, section_gray_title_2, section_gray_text_1, section_gray_text_2, section_gray_text_3, cta_band_title, footer_text, footer_title_1, footer_title_2, footer_title_3, footer_title_4 / image型2件は自動チェック対象外（要目視） |
| リンク遷移 | ページ内リンクの遷移先が生存しているか | 自動OK | 0件確認 |
| レスポンシブ | モバイル表示で文字・画像の重なり／はみ出しがないか | <span style="color:#b8860b">要目視</span> | visual-diff未実行 |
| アクセシビリティ簡易チェック | pa11y-ci（axe-core）によるWCAG 2.0 AA自動検出 | <span style="color:#b8860b">未実行（別途 pa11y-ci を実行してください）</span> | pa11y-report.json が見つからない |

## 地域との繋がり \| アーバンネイチャー北九州 (/network/ → page-network.php)

URL: http://localhost:10004/network/

| 種別 | 確認内容 | 判定 | 根拠 |
|---|---|---|---|
| 表示確認 | モックアップとの見た目一致（崩れ・文字化け・画像抜けがないか） | <span style="color:#b8860b">要目視</span> | visual-diff未実行 |
| ACF差し替え | ACFデフォルト値がライブページに反映されているか | <span style="color:#c62828">自動NG</span> | 0/17 一致 / 未検出: main_content_title, main_content_text, section_white_title_1, section_white_text_1, section_white_text_2, section_white_text_3, section_white_text_4, section_white_title_2, section_white_text_5, section_gray_title_1, section_gray_text_1, section_gray_title_2, section_gray_text_2, members_title, members_text, join_title, join_text / image型7件は自動チェック対象外（要目視） |
| リンク遷移 | ページ内リンクの遷移先が生存しているか | 自動OK | 0件確認 |
| レスポンシブ | モバイル表示で文字・画像の重なり／はみ出しがないか | <span style="color:#b8860b">要目視</span> | visual-diff未実行 |
| アクセシビリティ簡易チェック | pa11y-ci（axe-core）によるWCAG 2.0 AA自動検出 | <span style="color:#b8860b">未実行（別途 pa11y-ci を実行してください）</span> | pa11y-report.json が見つからない |

## お知らせ \| アーバンネイチャー北九州 (/news/ → archive-nkk_news.php)

URL: http://localhost:10004/news/

| 種別 | 確認内容 | 判定 | 根拠 |
|---|---|---|---|
| 表示確認 | モックアップとの見た目一致（崩れ・文字化け・画像抜けがないか） | <span style="color:#b8860b">要目視</span> | visual-diff未実行 |
| ACF差し替え | ACFデフォルト値がライブページに反映されているか | <span style="color:#c62828">自動NG</span> | 0/4 一致 / 未検出: main_content_title, main_content_text, section_white_title, section_white_text |
| リンク遷移 | ページ内リンクの遷移先が生存しているか | 自動OK | 0件確認 |
| レスポンシブ | モバイル表示で文字・画像の重なり／はみ出しがないか | <span style="color:#b8860b">要目視</span> | visual-diff未実行 |
| アクセシビリティ簡易チェック | pa11y-ci（axe-core）によるWCAG 2.0 AA自動検出 | <span style="color:#b8860b">未実行（別途 pa11y-ci を実行してください）</span> | pa11y-report.json が見つからない |

## アーバンネイチャー北九州のサイトをリニューアルしました \| お知らせ \| アーバンネイチャー北九州 (/news/site-renewal/ → single-nkk_news.php)

URL: http://localhost:10004/news/site-renewal/

| 種別 | 確認内容 | 判定 | 根拠 |
|---|---|---|---|
| 表示確認 | モックアップとの見た目一致（崩れ・文字化け・画像抜けがないか） | <span style="color:#b8860b">要目視</span> | visual-diff未実行 |
| ACF差し替え | ACFデフォルト値がライブページに反映されているか | <span style="color:#c62828">自動NG</span> | 0/9 一致 / 未検出: article_header_title, article_header_text, section_white_text_1, section_white_title_1, section_white_text_2, section_white_title_2, section_white_title_3, section_white_text_3, section_white_text_4 / image型1件は自動チェック対象外（要目視） |
| リンク遷移 | ページ内リンクの遷移先が生存しているか | 自動OK | 0件確認 |
| レスポンシブ | モバイル表示で文字・画像の重なり／はみ出しがないか | <span style="color:#b8860b">要目視</span> | visual-diff未実行 |
| アクセシビリティ簡易チェック | pa11y-ci（axe-core）によるWCAG 2.0 AA自動検出 | <span style="color:#b8860b">未実行（別途 pa11y-ci を実行してください）</span> | pa11y-report.json が見つからない |

## みんなの写真展 \| アーバンネイチャー北九州 (/photos/ → page-photos.php)

URL: http://localhost:10004/photos/

| 種別 | 確認内容 | 判定 | 根拠 |
|---|---|---|---|
| 表示確認 | モックアップとの見た目一致（崩れ・文字化け・画像抜けがないか） | <span style="color:#b8860b">要目視</span> | visual-diff未実行 |
| ACF差し替え | ACFデフォルト値がライブページに反映されているか | <span style="color:#c62828">自動NG</span> | 0/3 一致 / 未検出: main_content_title, main_content_text, section_white_text / image型38件は自動チェック対象外（要目視） |
| リンク遷移 | ページ内リンクの遷移先が生存しているか | 自動OK | 0件確認 |
| レスポンシブ | モバイル表示で文字・画像の重なり／はみ出しがないか | <span style="color:#b8860b">要目視</span> | visual-diff未実行 |
| アクセシビリティ簡易チェック | pa11y-ci（axe-core）によるWCAG 2.0 AA自動検出 | <span style="color:#b8860b">未実行（別途 pa11y-ci を実行してください）</span> | pa11y-report.json が見つからない |

## 写真を投稿する \| みんなの写真展 \| アーバンネイチャー北九州 (/photos/submit/ → page-photos-submit.php)

URL: http://localhost:10004/photos/submit/

| 種別 | 確認内容 | 判定 | 根拠 |
|---|---|---|---|
| 表示確認 | モックアップとの見た目一致（崩れ・文字化け・画像抜けがないか） | <span style="color:#b8860b">要目視</span> | visual-diff未実行 |
| ACF差し替え | ACFデフォルト値がライブページに反映されているか | <span style="color:#c62828">自動NG</span> | 0/8 一致 / 未検出: container_title, container_text, photo_submit_form_title_1, photo_submit_form_text_1, photo_submit_form_title_2, photo_submit_form_text_2, upload_area_text_1, upload_area_text_2 / image型2件は自動チェック対象外（要目視） |
| フォーム送信 | Contact Form 7 フォームが描画されているか | <span style="color:#c62828">自動NG</span> | wpcf7-form 未検出 |
| リンク遷移 | ページ内リンクの遷移先が生存しているか | 自動OK | 0件確認 |
| レスポンシブ | モバイル表示で文字・画像の重なり／はみ出しがないか | <span style="color:#b8860b">要目視</span> | visual-diff未実行 |
| アクセシビリティ簡易チェック | pa11y-ci（axe-core）によるWCAG 2.0 AA自動検出 | <span style="color:#b8860b">未実行（別途 pa11y-ci を実行してください）</span> | pa11y-report.json が見つからない |

## プライバシーポリシー \| アーバンネイチャー北九州 (/privacy/ → page-privacy.php)

URL: http://localhost:10004/privacy/

| 種別 | 確認内容 | 判定 | 根拠 |
|---|---|---|---|
| 表示確認 | モックアップとの見た目一致（崩れ・文字化け・画像抜けがないか） | <span style="color:#b8860b">要目視</span> | visual-diff未実行 |
| ACF差し替え | ACFデフォルト値がライブページに反映されているか | <span style="color:#c62828">自動NG</span> | 0/29 一致 / 未検出: main_content_title, main_content_text, section_white_text_1, section_white_text_2, section_white_title_1, section_white_text_3, section_white_title_2, section_white_text_4, section_white_title_3, section_white_text_5, section_white_title_4, section_white_text_6, section_white_title_5, section_white_text_7, section_white_title_6, section_white_text_8, section_white_text_9, section_white_title_7, section_white_title_8, section_white_text_10, section_white_title_9, section_white_text_11, section_white_title_10, section_white_text_12, section_white_text_13, section_white_text_14, section_white_text_15, section_white_text_16, section_white_text_17 |
| リンク遷移 | ページ内リンクの遷移先が生存しているか | 自動OK | 0件確認 |
| レスポンシブ | モバイル表示で文字・画像の重なり／はみ出しがないか | <span style="color:#b8860b">要目視</span> | visual-diff未実行 |
| アクセシビリティ簡易チェック | pa11y-ci（axe-core）によるWCAG 2.0 AA自動検出 | <span style="color:#b8860b">未実行（別途 pa11y-ci を実行してください）</span> | pa11y-report.json が見つからない |

---

## 付録: テンプレート共有により集約されたページ一覧

- 代表: 合馬竹林公園 | アーバンネイチャー北九州（single-nkk_spot.php） — 集約された他8件:
  - 響灘ビオトープ | アーバンネイチャー北九州（/about/spots/biotope/）
  - 玄海国定公園（若松北海岸） | アーバンネイチャー北九州（/about/spots/genkai/）
  - 平尾台 | アーバンネイチャー北九州（/about/spots/hiraodai/）
  - 関門海峡 | アーバンネイチャー北九州（/about/spots/kanmon/）
  - 紫川 | アーバンネイチャー北九州（/about/spots/murasaki/）
  - 皿倉山 | アーバンネイチャー北九州（/about/spots/sarakurayama/）
  - 曽根干潟 | アーバンネイチャー北九州（/about/spots/sone-higata/）
  - 山田緑地 | アーバンネイチャー北九州（/about/spots/yamada/）
- 代表: 北九州市響灘ビオトープ | アーバンネイチャー北九州（single-nkk_center.php） — 集約された他9件:
  - 響灘緑地グリーンパーク | アーバンネイチャー北九州（/center/greenpark/）
  - 北九州市ほたる館 | アーバンネイチャー北九州（/center/hotarukan/）
  - いのちのたび博物館 | アーバンネイチャー北九州（/center/inochi/）
  - 到津の森公園 | アーバンネイチャー北九州（/center/itouzu/）
  - 香月・黒川ほたる館 | アーバンネイチャー北九州（/center/katsuki-hotaru/）
  - 水環境館 | アーバンネイチャー北九州（/center/mizukankyokan/）
  - ソラランド平尾台 | アーバンネイチャー北九州（/center/soraland/）
  - タカミヤ環境ミュージアム | アーバンネイチャー北九州（/center/takamiya/）
  - 山田緑地 | アーバンネイチャー北九州（/center/yamada/）
- 代表: 企業向け生態系保全体験プログラム ― ビオトープづくり | アーバンネイチャー北九州（single-nkk_event.php） — 集約された他6件:
  - 平尾台 春の自然観察会 〜カルスト台地の野草を楽しむ〜 | アーバンネイチャー北九州（/events/hiraodai-kansatsukai/）
  - 平尾台トゥクトゥクで巡る自然ツアー | アーバンネイチャー北九州（/events/hiraodai-tuk-tuk/）
  - 平尾台シャボン玉フェスティバル | アーバンネイチャー北九州（/events/sample/）
  - 曽根干潟クリーンアップ大作戦 2026春 | アーバンネイチャー北九州（/events/sone-higata-cleanup/）
  - 夏休み自然体験キャンプ ― 2泊3日で学ぶ北九州の自然 | アーバンネイチャー北九州（/events/summer-camp/）
  - 子ども自然教室「森の生きもの探検隊」 | アーバンネイチャー北九州（/events/yamada-kodomo-kyoshitsu/）
- 代表: 株式会社マイン | 実践事例 | アーバンネイチャー北九州（single-nkk_case.php） — 集約された他1件:
  - 株式会社ネイチャー | 実践事例 | アーバンネイチャー北九州（/network/cases/nature/）
- 代表: 響灘ビオトープ共同事業体 | アーバンネイチャー北九州（single-nkk_network.php） — 集約された他0件:
  - （なし）
- 代表: アーバンネイチャー北九州のサイトをリニューアルしました | お知らせ | アーバンネイチャー北九州（single-nkk_news.php） — 集約された他0件:
  - （なし）

## ⚠ 要確認

以下は seed-posts.php に対応する投稿が見つからない、またはページ種別を判定できないため、手動確認が必要です。

- 平尾台シャボン玉フェスティバル | アーバンネイチャー北九州（events/sample.html） — seed-posts.php に対応投稿なし
