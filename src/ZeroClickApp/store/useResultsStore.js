// src/ZeroClickApp/store/useResultsStore.js
import { create } from "zustand";
import { api } from "../lib/api";

export const useResultsStore = create((set, get) => ({
  overview: [], // [{_id,name,dateCreated,totalEmployees,sentCount,clickCount,progress}]
  loadingOverview: false,
  errorOverview: null,

  batchResults: {}, // { [batchId]: { batch, rows } }
  loadingBatch: false,
  errorBatch: null,
  activeBatchId: null,

  setActiveBatch: (batchId) => set({ activeBatchId: batchId }),

  fetchOverview: async (tenantId) => {
    set({ loadingOverview: true, errorOverview: null });
    try {
      const data = await api.resultsOverview(tenantId);
      set({
        overview: data,
        loadingOverview: false,
        activeBatchId: data[0]?._id || null,
      });
    } catch (e) {
      set({
        errorOverview: e.message || "Erreur chargement overview",
        loadingOverview: false,
      });
    }
  },

  fetchBatchResults: async (tenantId, batchId) => {
    set({ loadingBatch: true, errorBatch: null });
    try {
      const data = await api.resultsForBatch(tenantId, batchId);
      set({
        batchResults: { ...get().batchResults, [batchId]: data },
        loadingBatch: false,
      });
    } catch (e) {
      set({
        errorBatch: e.message || "Erreur chargement résultats",
        loadingBatch: false,
      });
    }
  },
}));
