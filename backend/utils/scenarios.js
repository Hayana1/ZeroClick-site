// backend/utils/scenarios.js
// Lightweight helpers around scenarios.json for validation and simple rendering.
const fs = require("fs");
const path = require("path");

const SCENARIOS_PATH = path.join(__dirname, "../data/scenarios.json");

function readRawScenarios() {
  try {
    const raw = fs.readFileSync(SCENARIOS_PATH, "utf8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}

function nonEmptyString(x) {
  return typeof x === "string" && x.trim().length > 0;
}

const allowedPayloadTypes = new Set([
  "pdf",
  "docx",
  "excel",
  "cta",
  "login",
  "gdrive",
  "onedrive",
  "form",
  "attachment",
  "plaintext",
]);

const allowedStyleHints = new Set([
  "sobre",
  "institutionnel",
  "startup",
  "marketing",
  "saas",
]);

function validateScenario(s) {
  const errors = [];
  if (!nonEmptyString(s?.id)) errors.push("id manquant");
  if (!nonEmptyString(s?.name)) errors.push("name manquant");
  if (!nonEmptyString(s?.category)) errors.push("category manquant");

  // difficulty: 1..5 (optional but recommended)
  if (s?.difficulty !== undefined) {
    const d = Number(s.difficulty);
    if (!Number.isFinite(d) || d < 1 || d > 5)
      errors.push("difficulty doit être entre 1 et 5");
  }

  // Optional hints
  if (s?.payloadType && !allowedPayloadTypes.has(String(s.payloadType))) {
    errors.push(
      `payloadType invalide: ${s.payloadType} (autorisés: ${Array.from(
        allowedPayloadTypes
      ).join(", ")})`
    );
  }
  if (s?.styleHint && !allowedStyleHints.has(String(s.styleHint))) {
    errors.push(
      `styleHint invalide: ${s.styleHint} (autorisés: ${Array.from(
        allowedStyleHints
      ).join(", ")})`
    );
  }

  // email
  if (!s?.email || typeof s.email !== "object") {
    errors.push("email manquant (subject + html ou mjml)");
  } else {
    if (!nonEmptyString(s.email.subject)) errors.push("email.subject manquant");
    const hasHtml = nonEmptyString(s.email.html);
    const hasMjml = nonEmptyString(s.email.mjml);
    if (!(hasHtml || hasMjml)) errors.push("email.html ou email.mjml requis");
  }

  // training (optional but recommended)
  if (s?.training) {
    const t = s.training;
    if (!nonEmptyString(t?.id)) errors.push("training.id manquant");
    if (!nonEmptyString(t?.title)) errors.push("training.title manquant");
    if (!Array.isArray(t?.steps) || t.steps.length === 0)
      errors.push("training.steps doit être une liste non vide");
    if (t?.reward) {
      const xp = Number(t.reward.xp);
      if (!Number.isFinite(xp) || xp < 0) errors.push("training.reward.xp invalide");
      if (!nonEmptyString(t.reward.badge)) errors.push("training.reward.badge manquant");
    }
  }

  // Heuristics (au moins un lien cliquable soit en HTML, soit en MJML)
  const html = String(s?.email?.html || "");
  const mjml = String(s?.email?.mjml || "");
  const hasHtmlAnchor = /<a\s+[^>]*href=(["']).+?\1/i.test(html);
  const hasMjmlHref = /href=(["']).+?\1/i.test(mjml);
  if (!(hasHtmlAnchor || hasMjmlHref)) {
    errors.push("email doit contenir au moins un lien (HTML <a> ou MJML href)");
  }

  return errors;
}

function validateAll(scenarios = readRawScenarios()) {
  const seen = new Set();
  const report = [];
  for (const s of scenarios) {
    const errs = validateScenario(s);
    if (s && s.id) {
      if (seen.has(s.id)) errs.push("id en double");
      seen.add(s.id);
    }
    // Convenience flags
    const html = String(s?.email?.html || "");
    const mjml2 = String(s?.email?.mjml || "");
    const hasTracking = /\{\{\s*trackingUrl\s*\}\}/i.test(html) || /\{\{\s*trackingUrl\s*\}\}/i.test(mjml2);
    const hasPreheader = nonEmptyString(s?.email?.preheader);
    report.push({ id: s?.id || "(inconnu)", errors: errs, warnings: [
      !hasPreheader ? "email.preheader recommandé" : null,
      !hasTracking ? "utiliser {{trackingUrl}} recommandé" : null,
    ].filter(Boolean), meta: { hasTracking, hasPreheader } });
  }
  return report;
}

// very small templating for a few variables
function renderEmail(scenario, ctx = {}) {
  const s = scenario || {};
  const email = s.email || {};
  const today = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  const vars = {
    trackingUrl: ctx.trackingUrl || "https://example.local/t/TOKEN",
    "employee.name": ctx.employee?.name || "Prénom Nom",
    "employee.email": ctx.employee?.email || "prenom.nom@exemple.com",
    "brand.name": ctx.brand?.name || ctx.brand?.displayName || "Société",
    today: todayStr,
  };
  const replaceVars = (str) =>
    String(str || "").replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_, key) => {
      return Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : "";
    });

  return {
    subject: replaceVars(email.subject || s.name || s.id || "(Sujet)"),
    preheader: replaceVars(email.preheader || ""),
    html: replaceVars(email.html || ""),
  };
}

module.exports = {
  SCENARIOS_PATH,
  readRawScenarios,
  validateScenario,
  validateAll,
  renderEmail,
  allowedPayloadTypes: Array.from(allowedPayloadTypes),
  allowedStyleHints: Array.from(allowedStyleHints),
};
