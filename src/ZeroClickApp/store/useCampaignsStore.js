// src/ZeroClickApp/store/useCampaignsStore.js
import { create } from "zustand";
import { api } from "../lib/api";

export const useCampaignsStore = create((set, get) => ({
  campaigns: [],
  activeId: null,
  loading: false,
  error: null,

  // Maps en mémoire (par campagne)
  // sentMap: { [campaignId]: { [employeeId]: boolean } }
  // themesByGroup: { [campaignId]: { [groupName]: string } }
  // copiedMap: { [campaignId]: { [employeeId]: true } }
  // trackingLinks: { [campaignId]: { [employeeId]: "https://..." } }
  sentMap: {},
  themesByGroup: {},
  groupConfigs: {},
  copiedMap: {},
  trackingLinks: {},
  scenarioUsageByEmployee: {}, // { [employeeId]: [scenarioId, ...] }
  emailTemplatesByCampaign: {}, // { [campaignId]: { [groupName]: { mjmlSource, htmlRendered, updatedAt } } }
  attachmentsByCampaign: {}, // { [campaignId]: { [groupName]: [ { filename, url, size, ... } ] } }
  brands: [],
  identities: [],

  /* ===================== LOAD LIST ===================== */
  fetch: async (tenantId) => {
    set({ loading: true, error: null });
    try {
      const rows = await api.listBatches(tenantId);

      const sent = {};
      const themes = {};
      const configs = {};
      const emailTpls = {};
      const attachments = {};
      for (const c of rows) {
        sent[c._id] = c.selections || {};
        themes[c._id] = c.themesByGroup || {};
        configs[c._id] = c.groupConfigs || {};
        emailTpls[c._id] = c.emailTemplates || {};
        attachments[c._id] = c.attachmentsByGroup || {};
      }

      set({
        campaigns: rows,
        activeId: rows[0]?._id || null,
        sentMap: sent,
        themesByGroup: themes,
        loading: false,
        groupConfigs: configs,
        emailTemplatesByCampaign: emailTpls,
        attachmentsByCampaign: attachments,
      });
    } catch (e) {
      set({
        error: e.message || "Erreur chargement campagnes",
        loading: false,
      });
    }
  },

  /* ===================== ATTACHMENTS ===================== */
  fetchAttachments: async (tenantId, campaignId, groupName) => {
    const list = await api.listAttachments(tenantId, campaignId, groupName);
    const all = get().attachmentsByCampaign || {};
    const perCamp = all[campaignId] || {};
    set({ attachmentsByCampaign: { ...all, [campaignId]: { ...perCamp, [groupName]: list } } });
    return list;
  },
  uploadAttachment: async (tenantId, campaignId, groupName, file) => {
    // file: { name, type, dataUrl }
    const { name, type, dataUrl } = file;
    const entry = await api.uploadAttachment(tenantId, campaignId, groupName, {
      filename: name,
      mimeType: type,
      contentBase64: dataUrl,
    });
    const all = get().attachmentsByCampaign || {};
    const perCamp = all[campaignId] || {};
    const list = perCamp[groupName] || [];
    set({ attachmentsByCampaign: { ...all, [campaignId]: { ...perCamp, [groupName]: [...list, entry] } } });
    return entry;
  },
  deleteAttachment: async (tenantId, campaignId, groupName, filename) => {
    await api.deleteAttachment(tenantId, campaignId, groupName, filename);
    const all = get().attachmentsByCampaign || {};
    const perCamp = all[campaignId] || {};
    const next = (perCamp[groupName] || []).filter((x) => x.filename !== filename);
    set({ attachmentsByCampaign: { ...all, [campaignId]: { ...perCamp, [groupName]: next } } });
    return true;
  },

  /* ===================== BRANDS ===================== */
  fetchBrands: async () => {
    try {
      const data = await api.getBrands();
      const list = Array.isArray(data) ? data : (data.items || []);
      const identities = Array.isArray(data?.identities) ? data.identities : [];
      set({ brands: list, identities });
    } catch (e) {
      set({ error: e.message || 'Erreur chargement brands', brands: [], identities: [] });
    }
  },

  /* ===================== SET ACTIVE ===================== */
  setActive: async (tenantId, campaignId) => {
    set({ activeId: campaignId });
    const { sentMap, themesByGroup, groupConfigs, copiedMap, trackingLinks, attachmentsByCampaign } = get();

    // hydrate selections si manquant
    if (!sentMap[campaignId]) {
      try {
        const map = await api.getSelectionMap(tenantId, campaignId);
        set({ sentMap: { ...get().sentMap, [campaignId]: map } });
      } catch {
        set({ sentMap: { ...get().sentMap, [campaignId]: {} } });
      }
    }

    // garantir l'existence des maps dérivées
    if (!themesByGroup[campaignId]) {
      set({ themesByGroup: { ...themesByGroup, [campaignId]: {} } });
    }
    if (!copiedMap[campaignId]) {
      set({ copiedMap: { ...copiedMap, [campaignId]: {} } });
    }
    if (!trackingLinks[campaignId]) {
      set({ trackingLinks: { ...trackingLinks, [campaignId]: {} } });
    }
    if (!groupConfigs[campaignId]) {
      set({ groupConfigs: { ...groupConfigs, [campaignId]: {} } });
    }
    if (!get().emailTemplatesByCampaign[campaignId]) {
      set({ emailTemplatesByCampaign: { ...get().emailTemplatesByCampaign, [campaignId]: {} } });
    }
    if (!attachmentsByCampaign[campaignId]) {
      set({ attachmentsByCampaign: { ...attachmentsByCampaign, [campaignId]: {} } });
    }
  },

  /* ===================== TOGGLE SENT ===================== */
  toggleSent: async (tenantId, campaignId, employeeId) => {
    const prev = get().sentMap[campaignId] || {};
    const nextVal = !prev[employeeId];

    // optimistic
    set({
      sentMap: {
        ...get().sentMap,
        [campaignId]: { ...prev, [employeeId]: nextVal },
      },
    });

    try {
      await api.saveSelection(tenantId, campaignId, employeeId, nextVal);
    } catch (e) {
      // rollback
      set({
        sentMap: { ...get().sentMap, [campaignId]: prev },
        error: e.message || "Échec de sauvegarde de la sélection",
      });
    }
  },

  /* ===================== THEME BY GROUP ===================== */
  setThemeForGroup: async (tenantId, campaignId, groupName, value) => {
    const prevAll = get().themesByGroup;
    const prev = prevAll[campaignId] || {};
    const nextForCampaign = { ...prev, [groupName]: value };
    const nextAll = { ...prevAll, [campaignId]: nextForCampaign };

    // optimistic
    set({ themesByGroup: nextAll });

    try {
      await api.patchTheme(tenantId, campaignId, groupName, value);
    } catch (e) {
      // rollback
      set({
        themesByGroup: prevAll,
        error: e.message || "Erreur sauvegarde thème",
      });
      throw e;
    }
  },

  /* ===================== GROUP CONFIG (theme/scenario) ===================== */
  setScenarioForGroup: async (
    tenantId,
    campaignId,
    groupName,
    { theme, scenarioId, category, brandId, identity } = {}
  ) => {
    const prevConfigsAll = get().groupConfigs;
    const prevConfigs = prevConfigsAll[campaignId] || {};
    const nextGroupCfg = {
      ...(prevConfigs[groupName] || {}),
      ...(theme !== undefined ? { theme } : {}),
      ...(scenarioId !== undefined ? { scenarioId } : {}),
      ...(category !== undefined ? { category } : {}),
      ...(brandId !== undefined ? { brandId } : {}),
      ...(identity !== undefined ? { identity } : {}),
    };
    const nextConfigsAll = {
      ...prevConfigsAll,
      [campaignId]: { ...prevConfigs, [groupName]: nextGroupCfg },
    };

    // garder themesByGroup à jour pour compat
    const prevThemesAll = get().themesByGroup;
    const prevThemes = prevThemesAll[campaignId] || {};
    const nextThemes =
      theme !== undefined ? { ...prevThemes, [groupName]: theme || "" } : prevThemes;
    const nextThemesAll = { ...prevThemesAll, [campaignId]: nextThemes };

    // optimistic
    set({ groupConfigs: nextConfigsAll, themesByGroup: nextThemesAll });

    try {
      const res = await api.patchGroupConfig(
        tenantId,
        campaignId,
        groupName,
        { theme, scenarioId, category, brandId, identity },
        true
      );
      // normaliser retour
      set({
        groupConfigs: { ...get().groupConfigs, [campaignId]: res.groupConfigs || {} },
        themesByGroup: { ...get().themesByGroup, [campaignId]: res.themesByGroup || {} },
      });
    } catch (e) {
      // rollback
      set({ groupConfigs: prevConfigsAll, themesByGroup: prevThemesAll, error: e.message || "Erreur sauvegarde config" });
      throw e;
    }
  },

  /* ===================== MARK LINK COPIED ===================== */
  markLinkCopied: async (campaignId, employeeId, token) => {
    const all = get().copiedMap || {};
    const perCampaign = all[campaignId] || {};

    // optimistic
    set({
      copiedMap: {
        ...all,
        [campaignId]: { ...perCampaign, [employeeId]: true },
      },
    });

    try {
      // Si ton API attend { token }, adapte ici :
      await api.markLinkCopied(token);
    } catch (e) {
      // rollback optionnel
      const current = { ...(get().copiedMap[campaignId] || {}) };
      delete current[employeeId];
      set({
        copiedMap: { ...get().copiedMap, [campaignId]: current },
        error: e.message || "Erreur marquage lien copié",
      });
    }
  },

  /* ===================== CREATE / DELETE ===================== */
  addCampaign: async (tenantId, payload) => {
    const created = await api.createBatch(tenantId, payload);

    set({
      campaigns: [created, ...get().campaigns],
      activeId: created._id,
      sentMap: { ...get().sentMap, [created._id]: created.selections || {} },
      themesByGroup: {
        ...get().themesByGroup,
        [created._id]: created.themesByGroup || {},
      },
      // init pour éviter undefined
      copiedMap: { ...get().copiedMap, [created._id]: {} },
      trackingLinks: { ...get().trackingLinks, [created._id]: {} },
    });

    return created;
  },

  removeCampaign: async (id) => {
    await api.deleteBatch(id);
    const rest = get().campaigns.filter((c) => c._id !== id);

    const sent = { ...get().sentMap };
    const themes = { ...get().themesByGroup };
    const copied = { ...get().copiedMap };
    const links = { ...get().trackingLinks };
    delete sent[id];
    delete themes[id];
    delete copied[id];
    delete links[id];

    set({
      campaigns: rest,
      activeId: rest[0]?._id || null,
      sentMap: sent,
      themesByGroup: themes,
      copiedMap: copied,
      trackingLinks: links,
    });
  },

  /* ===================== BULK GROUP SENT ===================== */
  bulkSetGroupSent: async (tenantId, campaignId, employeeIds, value) => {
    const all = get().sentMap;
    const prev = all[campaignId] || {};
    const next = { ...prev };
    for (const id of employeeIds) next[id] = !!value;

    // optimistic
    set({ sentMap: { ...all, [campaignId]: next } });

    try {
      // ENVOIE LA MAP FUSIONNÉE pour cette campagne
      await api.putSelections(tenantId, campaignId, next);
    } catch (e) {
      // rollback
      set({
        sentMap: { ...get().sentMap, [campaignId]: prev },
        error: e.message || "Échec mise à jour de groupe",
      });
    }
  },

  /* ===================== TRACKING LINKS ===================== */
  fetchTrackingLinks: async (tenantId, campaignId) => {
    try {
      const rows = await api.getTargets(tenantId, campaignId); // [{ employeeId, url }]
      const map = {};
      for (const t of rows || []) map[t.employeeId] = t.url;
      set({
        trackingLinks: {
          ...get().trackingLinks,
          [campaignId]: map,
        },
      });
    } catch (e) {
      set({ error: e.message || "Erreur chargement liens de tracking" });
      // garantir au moins une map vide pour éviter undefined dans le composant
      set({
        trackingLinks: {
          ...get().trackingLinks,
          [campaignId]: get().trackingLinks[campaignId] || {},
        },
      });
    }
  },

  /* ===================== SCENARIO USAGE (for UI) ===================== */
  fetchScenarioUsage: async (tenantId, employeeIds = []) => {
    try {
      const data = await api.getScenarioUsage(tenantId, employeeIds);
      // merge (préserve ce qu'on a déjà)
      set({
        scenarioUsageByEmployee: {
          ...get().scenarioUsageByEmployee,
          ...data,
        },
      });
    } catch (e) {
      set({ error: e.message || "Erreur chargement historique scénarios" });
    }
  },

  /* ===================== MJML RENDER / SAVE ===================== */
  renderMjml: async (tenantId, campaignId, groupName, mjmlSource) => {
    const res = await api.renderMjml(tenantId, campaignId, {
      groupName,
      mjmlSource,
    });
    return res; // { html, errors }
  },

  saveMjml: async (tenantId, campaignId, groupName, mjmlSource, htmlRendered, metadata) => {
    const res = await api.saveMjml(tenantId, campaignId, {
      groupName,
      mjmlSource,
      htmlRendered,
      ...(metadata ? { metadata } : {}),
    });
    // merge retour
    const all = get().emailTemplatesByCampaign || {};
    set({
      emailTemplatesByCampaign: {
        ...all,
        [campaignId]: res.emailTemplates || all[campaignId] || {},
      },
    });
    return res;
  },

  /* ===================== AI GENERATE MJML ===================== */
  generateMjml: async (
    tenantId,
    campaignId,
    groupName,
    params = {}
  ) => {
    const payload = { groupName, ...params };
    const res = await api.generateMjml(tenantId, campaignId, payload);
    const mjml = String(res?.mjml || "");
    return mjml;
  },
}));
