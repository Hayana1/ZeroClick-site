import { create } from "zustand";
import { api } from "../lib/api";

export const useEmployeesStore = create((set, get) => ({
  list: [],
  loading: false,
  error: null,

  fetch: async (tenantId) => {
    try {
      set({ loading: true, error: null });
      const rows = await api.listEmployees(tenantId);
      set({ list: rows, loading: false });
    } catch (e) {
      set({ error: e.message || "Erreur chargement employés", loading: false });
    }
  },

  add: async (tenantId, payload) => {
    try {
      set({ error: null });
      const created = await api.createEmployee(tenantId, payload);
      set({ list: [created, ...get().list] });
      return created;
    } catch (e) {
      set({ error: e.message || "Erreur ajout employé" });
      throw e;
    }
  },

  remove: async (id) => {
    try {
      await api.deleteEmployee(id);
      set({ list: get().list.filter((e) => e._id !== id) });
    } catch (e) {
      set({ error: e.message || "Erreur suppression employé" });
      throw e;
    }
  },
}));
