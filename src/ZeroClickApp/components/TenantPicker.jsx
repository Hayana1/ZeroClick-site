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
        {tenants.map((t) => (
          <option key={t._id} value={t._id}>
            {t.name}
          </option>
        ))}
      </select>
    </div>
  );
}
