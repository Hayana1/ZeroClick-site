// src/ZeroClickApp/components/TenantPicker.jsx
import React, { useEffect } from "react";
import { useTenantStore } from "../store/useTenantStore";

export default function TenantPicker() {
  const { tenants, tenantId, fetchTenants, setTenant } = useTenantStore();
  useEffect(() => {
    if (!tenants.length) fetchTenants();
  }, []);
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs opacity-80">Entreprise :</span>
      <select
        className="text-black rounded px-2 py-1"
        value={tenantId || ""}
        onChange={(e) => setTenant(e.target.value)}
      >
        <option value="" disabled>
          Sélectionner…
        </option>
        {tenants.map((t) => (
          <option key={t._id} value={t._id}>
            {t.name}
          </option>
        ))}
      </select>
      {!tenants.length && (
        <span className="text-xs text-red-600">Aucune entreprise. Créez-en une d'abord.</span>
      )}
    </div>
  );
}
