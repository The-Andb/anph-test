import * as fs from 'fs';
import * as path from 'path';

const ROOT_DIR = path.resolve(__dirname, '../../');
const DASHBOARD_PATH = path.join(ROOT_DIR, 'andb-test/DASHBOARD.md');

const backendCoveragePath = path.join(ROOT_DIR, 'andb-test/coverage/aio/coverage-summary.json');
const frontendCoveragePath = path.join(ROOT_DIR, 'andb-desktop/coverage/coverage-summary.json');

function getCoverage(filePath: string) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return data.total;
  } catch (e) {
    return null;
  }
}

function formatPercent(val: any) {
  if (!val) return 'N/A';
  return `${val.pct}% (${val.covered}/${val.total})`;
}

const backend = getCoverage(backendCoveragePath);
const frontend = getCoverage(frontendCoveragePath);

const content = `# 🚀 The Andb Test Report Dashboard

Generated on: ${new Date().toLocaleString()}

## 📊 Code Coverage Summary

| Component | Statements | Branches | Functions | Lines |
| :--- | :--- | :--- | :--- | :--- |
| **Backend (Core & CLI)** | ${formatPercent(backend?.statements)} | ${formatPercent(backend?.branches)} | ${formatPercent(backend?.functions)} | ${formatPercent(backend?.lines)} |
| **Frontend (Desktop UI)** | ${formatPercent(frontend?.statements)} | ${formatPercent(frontend?.branches)} | ${formatPercent(frontend?.functions)} | ${formatPercent(frontend?.lines)} |

---

## ✅ Test Execution Checklist

- [x] **Unit Tests**: Core logic, Parsers, Migrators.
- [x] **Integration Tests**: MySQL Docker, SSH Tunneling.
- [x] **E2E Tests**: CLI Playground Matrix.
- [x] **UI Unit Tests**: Vitest Components.
- [x] **UI E2E Tests**: Playwright Flows.

---

## 📂 Detailed Reports

- [Core/CLI Coverage HTML](file://${path.join(ROOT_DIR, 'andb-test/coverage/aio/index.html')})
- [Desktop UI Coverage HTML](file://${path.join(ROOT_DIR, 'andb-desktop/coverage/index.html')})

---
> [!TIP]
> Run \`npm run test:master:aio\` followed by \`npm run report:dashboard\` to update this view.
`;

fs.writeFileSync(DASHBOARD_PATH, content);
console.log(`✅ Dashboard generated at: ${DASHBOARD_PATH}`);
