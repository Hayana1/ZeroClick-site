// src/ZeroClickApp/lib/api.js
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:7300/api";

async function req(path, opts = {}) {
  const r = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!r.ok) throw new Error((await r.text()) || `HTTP ${r.status}`);
  return r.status === 204 ? null : r.json();
}

export const api = {
  // Tenants
  listTenants: () => req(`/tenants`),
  createTenant: (body) =>
    req(`/tenants`, { method: "POST", body: JSON.stringify(body) }),
  deleteTenant: (tid) => req(`/tenants/${tid}`, { method: "DELETE" }),

  bulkDeleteBatches: (tenantId, ids) =>
    req(`/tenants/${tenantId}/batches:delete`, {
      method: "POST",
      body: JSON.stringify({ ids }),
    }),

  // Employees (scopé par tenant)
  listEmployees: (tid) => req(`/tenants/${tid}/employees`),
  createEmployee: (tid, body) =>
    req(`/tenants/${tid}/employees`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  deleteEmployee: (id) => req(`/employees/${id}`, { method: "DELETE" }),

  // Batches (scopé par tenant)
  listBatches: (tid) => req(`/tenants/${tid}/batches`),
  createBatch: (tid, body) =>
    req(`/tenants/${tid}/batches`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  deleteBatch: (id) => req(`/batches/${id}`, { method: "DELETE" }),
  getBatch: (id) => req(`/batches/${id}`),

  // Selections (persistées dans Batch.selections)
  getSelectionMap: (tid, bid) =>
    req(`/tenants/${tid}/batches/${bid}/selection`),
  saveSelection: (tid, bid, employeeId, sent) =>
    req(`/tenants/${tid}/batches/${bid}/selection`, {
      method: "PATCH",
      body: JSON.stringify({ employeeId, sent }),
    }),
  putSelections: (tid, bid, selections) =>
    req(`/tenants/${tid}/batches/${bid}/selections`, {
      method: "PUT",
      body: JSON.stringify({ selections }),
    }),

  // Tracking links (toujours via API_BASE_URL)
  getTrackingLinks: (tenantId, batchId) =>
    req(`/tenants/${tenantId}/batches/${batchId}/tracking-links`),

  markLinkCopied: (token) =>
    req(`/tracking/mark-copied`, {
      method: "POST",
      body: JSON.stringify({ token }),
    }),

  getTargets: (tid, bid) => req(`/tenants/${tid}/batches/${bid}/targets`),
  // MJML
  renderMjml: (tid, bid, body) =>
    req(`/tenants/${tid}/batches/${bid}/mjml/render`, {
      method: 'POST',
      body: JSON.stringify(body || {}),
    }),
  saveMjml: (tid, bid, body) =>
    req(`/tenants/${tid}/batches/${bid}/mjml/save`, {
      method: 'PATCH',
      body: JSON.stringify(body || {}),
    }),
  // Usage de scénarios par employé (pour marquage UI)
  getScenarioUsage: (tid, employeeIds = []) => {
    const q = Array.isArray(employeeIds) && employeeIds.length
      ? `?employeeIds=${employeeIds.join(',')}`
      : '';
    return req(`/tenants/${tid}/scenario-usage${q}`);
  },

  // Thèmes (persistés dans Batch.themesByGroup)
  patchTheme: (tid, bid, groupName, value) =>
    req(`/tenants/${tid}/batches/${bid}/theme`, {
      method: "PATCH",
      body: JSON.stringify({ groupName, value }),
    }),
  putThemes: (tid, bid, themes) =>
    req(`/tenants/${tid}/batches/${bid}/themes`, {
      method: "PUT",
      body: JSON.stringify({ themes }),
    }),

  // Config de groupe (theme/scenario)
  patchGroupConfig: (tid, bid, groupName, config, merge = true) =>
    req(`/tenants/${tid}/batches/${bid}/group-config`, {
      method: "PATCH",
      body: JSON.stringify({ groupName, config, merge }),
    }),

  resultsOverview: (tid) => req(`/tenants/${tid}/results/overview`),
  // Détails d’un batch (groupé par département + employés cliquants)
  resultsForBatch: (tid, bid) => req(`/tenants/${tid}/batches/${bid}/results`),

  getResultsSummary: (tid) => req(`/tenants/${tid}/results`),

  // Construit l’URL de clic à partir du backend
  trackingFromToken: (token) => `${API_BASE_URL}/clicks/${token}`,

  // Training (MVP)
  completeTraining: ({ sendId, scenarioId, totalScore }) =>
    req(`/training/complete`, {
      method: "POST",
      body: JSON.stringify({ sendId, scenarioId, totalScore }),
    }),

  // Training: infos employé par sendId (pour header gamifié)
  getTrainingSend: (sendId) => req(`/training/send/${encodeURIComponent(sendId)}`),
};
