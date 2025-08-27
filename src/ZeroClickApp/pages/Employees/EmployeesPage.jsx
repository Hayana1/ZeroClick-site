import React, { useEffect, useState } from "react";
import { useTenantStore } from "../../store/useTenantStore";
import { useEmployeesStore } from "../../store/useEmployeesStore";
import ErrorBanner from "../../components/ErrorBanner";
import LoadingOverlay from "../../components/LoadingOverlay";

export default function EmployeesPage() {
  const { tenantId, tenants, fetchTenants } = useTenantStore();
  const { list, loading, error, fetch, add, remove } = useEmployeesStore();
  const [form, setForm] = useState({ name: "", email: "", department: "" });

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  useEffect(() => {
    if (tenantId) fetch(tenantId);
  }, [tenantId, fetch]);

  const activeTenant =
    tenants.find((t) => t._id === tenantId || t.id === tenantId) || null;

  // tri visuel stable
  const sortedList = [...list].sort((a, b) => {
    const d = (a.department || "").localeCompare(b.department || "");
    if (d !== 0) return d;
    return (a.name || "").localeCompare(b.name || "");
  });

  const submit = async () => {
    if (!tenantId) return alert("Choisis d'abord une entreprise");
    if (!form.name || !form.email) return alert("Nom et email obligatoires");
    await add(tenantId, form);
    setForm({ name: "", email: "", department: "" });
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Employés</h2>
        <div className="text-sm text-gray-600">
          Entreprise active :{" "}
          <span className="font-medium">
            {activeTenant?.name || activeTenant?.slug || tenantId || "—"}
          </span>
        </div>
      </header>

      {!tenantId && (
        <p className="text-gray-500">
          Crée puis sélectionne une entreprise pour gérer ses employés.
        </p>
      )}

      {error && <ErrorBanner message={error} />}

      <section className="bg-white rounded shadow p-4 space-y-3">
        <h3 className="font-semibold">Ajouter un employé</h3>
        <div className="grid md:grid-cols-3 gap-3">
          <input
            className="border rounded px-3 py-2"
            placeholder="Nom complet"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            disabled={!tenantId}
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            disabled={!tenantId}
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="Département (optionnel)"
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            disabled={!tenantId}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={submit}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={!tenantId}
          >
            Ajouter
          </button>
          <button
            onClick={() => tenantId && fetch(tenantId)}
            className="bg-gray-100 text-gray-800 px-4 py-2 rounded border disabled:opacity-50"
            title="Rafraîchir la liste"
            disabled={!tenantId}
          >
            Rafraîchir
          </button>
        </div>
      </section>

      <section className="bg-white rounded shadow p-4">
        <h3 className="font-semibold mb-2">
          Liste des employés ({sortedList.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <Th>Nom</Th>
                <Th>Email</Th>
                <Th>Département</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {sortedList.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-gray-500">
                    {tenantId
                      ? "Aucun employé"
                      : "Aucun employé (sélectionne une entreprise)"}
                  </td>
                </tr>
              )}
              {sortedList.map((e) => (
                <tr key={e._id} className="border-t">
                  <Td>{e.name}</Td>
                  <Td>{e.email}</Td>
                  <Td>{e.department || "—"}</Td>
                  <Td>
                    <button
                      onClick={() => remove(e._id)}
                      className="text-red-600 hover:underline"
                      disabled={!tenantId}
                    >
                      Supprimer
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {loading && <LoadingOverlay />}
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
  return <td className="px-3 py-2 align-top">{children}</td>;
}
