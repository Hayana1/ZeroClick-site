// src/ZeroClickApp/pages/Tenants/TenantsPage.jsx
import React, { useEffect, useState } from "react";
import { useTenantStore } from "../../store/useTenantStore";

export default function TenantsPage() {
  const {
    tenants,
    tenantId,
    fetchTenants,
    setTenant,
    createTenant,
    deleteTenant,
  } = useTenantStore();
  const [form, setForm] = useState({ name: "", slug: "" });

  useEffect(() => {
    fetchTenants();
  }, []);

  const submit = async () => {
    if (!form.name || !form.slug) return alert("Nom et slug requis");
    await createTenant(form);
    setForm({ name: "", slug: "" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Entreprises</h2>
        <p className="text-gray-600 text-sm">
          Ajoute ou supprime des entreprises (tenants).
        </p>
      </div>

      <div className="bg-white rounded shadow p-4 space-y-3">
        <h3 className="font-semibold">Ajouter une entreprise</h3>
        <div className="grid md:grid-cols-2 gap-3">
          <input
            className="border rounded px-3 py-2"
            placeholder="Nom (ex: SmartD)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="Slug (ex: smartd)"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          />
        </div>
        <button
          onClick={submit}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Créer
        </button>
      </div>

      <div className="bg-white rounded shadow p-4">
        <h3 className="font-semibold mb-3">Liste des entreprises</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <Th>Nom</Th>
                <Th>Slug</Th>
                <Th>Sélection</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {tenants.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-gray-500">
                    Aucune entreprise
                  </td>
                </tr>
              )}
              {tenants.map((t) => (
                <tr key={t._id} className="border-t">
                  <Td>{t.name}</Td>
                  <Td>{t.slug}</Td>
                  <Td>
                    <button
                      onClick={() => setTenant(t._id)}
                      className={`px-2 py-1 rounded border ${
                        tenantId === t._id ? "bg-blue-50 border-blue-300" : ""
                      }`}
                    >
                      Choisir
                    </button>
                  </Td>
                  <Td>
                    <button
                      onClick={() => deleteTenant(t._id)}
                      className="px-2 py-1 rounded border text-red-600"
                    >
                      Supprimer
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
function Th({ children }) {
  return (
    <th className="text-left font-medium px-3 py-2 text-gray-700">
      {children}
    </th>
  );
}
function Td({ children }) {
  return <td className="px-3 py-2">{children}</td>;
}
