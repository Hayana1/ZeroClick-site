// src/ZeroClickApp/store/useTenantStore.js
import { create } from "zustand";
import { api } from "../lib/api";

export const useTenantStore = create((set, get) => ({
  tenants: [],
  tenantId: null,
  loading: false,
  error: null,

  fetchTenants: async () => {
    try {
      set({ loading: true, error: null });
      const tenants = await api.listTenants();
      // auto-sélection premier tenant si aucun
      set((s) => ({
        tenants,
        tenantId: s.tenantId || tenants[0]?._id || null,
      }));
    } catch (e) {
      set({ error: e.message || "Erreur tenants" });
    } finally {
      set({ loading: false });
    }
  },

  setTenant: (id) => set({ tenantId: id }),

  createTenant: async (payload) => {
    const created = await api.createTenant(payload);
    set((s) => {
      const tenants = [created, ...s.tenants];
      return { tenants, tenantId: created._id };
    });
  },

  deleteTenant: async (id) => {
    await api.deleteTenant(id);
    set((s) => {
      const tenants = s.tenants.filter((t) => t._id !== id);
      const tenantId = s.tenantId === id ? tenants[0]?._id || null : s.tenantId;
      return { tenants, tenantId };
    });
  },
}));
