#!/usr/bin/env node
// backend/scripts/validate-scenarios.js
const {
  readRawScenarios,
  validateAll,
  SCENARIOS_PATH,
} = require("../utils/scenarios");

function main() {
  const scenarios = readRawScenarios();
  const report = validateAll(scenarios);
  const ok = report.every((r) => (r.errors || []).length === 0);

  console.log(`Scénarios: ${SCENARIOS_PATH}`);
  console.log(`Total: ${scenarios.length}`);

  let errorCount = 0;
  let warnCount = 0;
  for (const r of report) {
    const e = r.errors || [];
    const w = r.warnings || [];
    if (e.length || w.length) {
      console.log(`\n— ${r.id}`);
      if (e.length) {
        for (const msg of e) {
          console.log(`  [ERREUR] ${msg}`);
          errorCount++;
        }
      }
      if (w.length) {
        for (const msg of w) {
          console.log(`  [AVERT.] ${msg}`);
          warnCount++;
        }
      }
    }
  }

  console.log(`\nRésumé: ${ok ? "OK" : "Avec erreurs"} — erreurs=${errorCount}, avertissements=${warnCount}`);
  process.exit(ok ? 0 : 1);
}

main();

