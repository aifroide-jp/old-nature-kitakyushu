'use strict';
// pa11y-ci の実行結果（JSON）を読む。未実行（ファイル無し）は null を返し、
// それを「NG」や「0件」と偽装しないこと。
const fs = require('fs');

function readA11yReport(reportPath) {
  if (!fs.existsSync(reportPath)) return null;

  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  } catch (e) {
    return null;
  }

  const entries = Array.isArray(raw)
    ? raw
    : (raw.results || raw.pages || raw.reports || []);

  const map = new Map();
  for (const entry of entries) {
    if (!entry) continue;
    const url = entry.pageUrl || entry.documentTitle || entry.url;
    if (!url) continue;
    const issues = entry.issues || entry.violations || [];
    const count = Array.isArray(issues) ? issues.length : (typeof issues === 'number' ? issues : 0);
    map.set(url, { violations: count });
  }

  return map;
}

module.exports = { readA11yReport };
