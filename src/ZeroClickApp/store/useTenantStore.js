// src/ZeroClickApp/store/useTenantStore.js
import { create } from "zustand";
import { api } from "../lib/api";

export const useTenantStore = create((set, get) => ({
  tenants: [],
  tenantId: (typeof window !== 'undefined' && window.localStorage)
    ? (window.localStorage.getItem('zc_tenant') || null)
    : null,
  loading: false,
  error: null,

  fetchTenants: async () => {
    try {
      set({ loading: true, error: null });
      const tenants = await api.listTenants();
      // Préserve tenantId (localStorage) si présent et valide, sinon premier
      set((s) => {
        const saved = (typeof window !== 'undefined' && window.localStorage)
          ? window.localStorage.getItem('zc_tenant')
          : null;
        const exists = tenants.find((t) => t._id === (saved || s.tenantId));
        const tenantId = exists ? exists._id : (tenants[0]?._id || null);
        return { tenants, tenantId };
      });
    } catch (e) {
      set({ error: e.message || "Erreur tenants" });
    } finally {
      set({ loading: false });
    }
  },

  setTenant: (id) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try { window.localStorage.setItem('zc_tenant', id || ''); } catch {}
    }
    set({ tenantId: id });
  },

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
