// src/ZeroClickApp/store/useCampaignsStore.js
import { create } from "zustand";
import { api } from "../lib/api";

export const useCampaignsStore = create((set, get) => ({
  campaigns: [],
  activeId: null,
  loading: false,
  error: null,

  // Maps en mémoire (par campagne)
  sentMap: {}, // { [campaignId]: { [employeeId]: boolean } }
  themesByGroup: {}, // { [campaignId]: { [groupName]: string } }

  /* -------- LIST + HYDRATE (selections + themes) -------- */
  fetch: async (tenantId) => {
    set({ loading: true, error: null });
    try {
      const rows = await api.listBatches(tenantId);

      // hydrate depuis les champs renvoyés par /batches
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

  /* -------- SET ACTIVE + HYDRATE SI MANQUANT -------- */
  setActive: async (tenantId, campaignId) => {
    set({ activeId: campaignId });
    const { sentMap, themesByGroup } = get();

    // hydrate la sélection si absente
    if (!sentMap[campaignId]) {
      try {
        const map = await api.getSelectionMap(tenantId, campaignId);
        set({ sentMap: { ...get().sentMap, [campaignId]: map } });
      } catch {
        set({ sentMap: { ...get().sentMap, [campaignId]: {} } });
      }
    }

    // (facultatif) si tu avais une route GET /themes, tu pourrais hydrater ici.
    // Mais comme /batches renvoie déjà themesByGroup, on n’a rien à faire
    if (!themesByGroup[campaignId]) {
      set({ themesByGroup: { ...get().themesByGroup, [campaignId]: {} } });
    }
  },

  /* -------- TOGGLE SENT (optimistic) + persist -------- */
  toggleSent: async (tenantId, campaignId, employeeId) => {
    const prev = get().sentMap[campaignId] || {};
    const nextVal = !prev[employeeId];

    // optimistic UI
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

  /* -------- THEME PAR GROUPE (optimistic) + persist -------- */
  setThemeForGroup: async (tenantId, campaignId, groupName, value) => {
    const prevAll = get().themesByGroup;
    const prev = prevAll[campaignId] || {};
    const nextForCampaign = { ...prev, [groupName]: value };
    const nextAll = { ...prevAll, [campaignId]: nextForCampaign };

    // optimistic UI
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

  /* -------- CREATE / DELETE -------- */
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
    });

    return created;
  },

  bulkSetGroupSent: async (tenantId, campaignId, employeeIds, value) => {
    const all = get().sentMap;
    const prev = all[campaignId] || {};
    const next = { ...prev };
    for (const id of employeeIds) next[id] = !!value;

    // optimistic
    set({ sentMap: { ...all, [campaignId]: next } });

    try {
      await api.putSelections(tenantId, campaignId, next); // <- ENVOIE LA MAP FUSIONNÉE
    } catch (e) {
      // rollback
      set({
        sentMap: { ...get().sentMap, [campaignId]: prev },
        error: e.message || "Échec mise à jour de groupe",
      });
    }
  },

  removeCampaign: async (id) => {
    await api.deleteBatch(id);
    const rest = get().campaigns.filter((c) => c._id !== id);

    const sent = { ...get().sentMap };
    const themes = { ...get().themesByGroup };
    delete sent[id];
    delete themes[id];

    set({
      campaigns: rest,
      activeId: rest[0]?._id || null,
      sentMap: sent,
      themesByGroup: themes,
    });
  },
}));
