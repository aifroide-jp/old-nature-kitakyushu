'use strict';

// 変換器のエラー方針（vocabulary.md 0章3節・10章）:
// 宣言が見つからない・想定外の構造・置換元が見つからない場合は、
// 黙って握りつぶさず・デフォルトにフォールバックせず、エラーを蓄積してから
// 非ゼロ終了する。1件見つかった時点で即死しない（全件を一度に報告し、
// 手直しの往復回数を減らす）。

class ErrorCollector {
  constructor() {
    this.errors = [];
  }

  add(file, line, message) {
    this.errors.push({ file, line: line == null ? '-' : line, message });
  }

  get hasErrors() {
    return this.errors.length > 0;
  }

  report() {
    const lines = ['変換エラー: 以下の箇所で変換器が停止しました（黙ってフォールバックしていません）。', ''];
    for (const e of this.errors) {
      lines.push(`  ${e.file}:${e.line}  ${e.message}`);
    }
    lines.push('');
    lines.push(`合計 ${this.errors.length} 件のエラー。テーマは生成していません。`);
    return lines.join('\n');
  }

  throwIfAny() {
    if (this.hasErrors) {
      const err = new Error(this.report());
      err.isConversionError = true;
      throw err;
    }
  }
}

module.exports = { ErrorCollector };
