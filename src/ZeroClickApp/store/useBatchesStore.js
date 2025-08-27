// src/ZeroClickApp/store/useBatchesStore.js
import { create } from "zustand";
import { api } from "../lib/api";

export const useBatchesStore = create((set, get) => ({
  list: [],
  current: null,
  loading: false,
  error: null,

  fetch: async (tenantId) => {
    if (!tenantId) return;
    try {
      set({ loading: true, error: null });
      const list = await api.listBatches(tenantId);
      set({ list });
    } catch (e) {
      set({ error: e.message || "Erreur campagnes" });
    } finally {
      set({ loading: false });
    }
  },

  create: async (tenantId, payload) => {
    const added = await api.createBatch(tenantId, {
      name: payload.name,
      date: payload.date,
      employeeIds: payload.employees,
    });
    set((s) => ({ list: [added, ...s.list] }));
  },

  remove: async (id) => {
    await api.deleteBatch(id);
    set((s) => ({
      list: s.list.filter((b) => b._id !== id),
      current: s.current?._id === id ? null : s.current,
    }));
  },

  select: async (id) => {
    const details = await api.getBatch(id);
    set({ current: details });
  },

  clearSelection: () => set({ current: null }),
}));
