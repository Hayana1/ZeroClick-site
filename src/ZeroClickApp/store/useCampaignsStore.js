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
  copiedMap: {},
  trackingLinks: {},

  /* ===================== LOAD LIST ===================== */
  fetch: async (tenantId) => {
    set({ loading: true, error: null });
    try {
      const rows = await api.listBatches(tenantId);

      const sent = {};
      const themes = {};
      for (const c of rows) {
        sent[c._id] = c.selections || {};
        themes[c._id] = c.themesByGroup || {};
      }

      set({
        campaigns: rows,
        activeId: rows[0]?._id || null,
        sentMap: sent,
        themesByGroup: themes,
        loading: false,
      });
    } catch (e) {
      set({
        error: e.message || "Erreur chargement campagnes",
        loading: false,
      });
    }
  },

  /* ===================== SET ACTIVE ===================== */
  setActive: async (tenantId, campaignId) => {
    set({ activeId: campaignId });
    const { sentMap, themesByGroup, copiedMap, trackingLinks } = get();

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
}));
