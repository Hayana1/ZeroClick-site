// src/ZeroClickApp/pages/Results/ResultsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  FiBarChart2,
  FiChevronDown,
  FiChevronUp,
  FiCpu,
  FiFilter,
  FiMail,
  FiSearch,
  FiUsers,
} from "react-icons/fi";
import TenantPicker from "../../components/TenantPicker";
import { useTenantStore } from "../../store/useTenantStore";
import { useResultsStore } from "../../store/useResultsStore";

const ProgressBar = ({ value }) => (
  <div className="w-full bg-gray-200 rounded-full h-2">
    <div
      className="bg-blue-600 h-2 rounded-full"
      style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
    />
  </div>
);

function Th({ children }) {
  return (
    <th className="text-left font-medium px-4 py-3 text-gray-700 whitespace-nowrap">
      {children}
    </th>
  );
}
function Td({ children, className = "" }) {
  return <td className={`px-4 py-3 align-middle ${className}`}>{children}</td>;
}

export default function ResultsPage() {
  const { tenantId, fetchTenants } = useTenantStore();
  const {
    overview,
    fetchOverview,
    activeBatchId,
    setActiveBatch,
    batchResults,
    fetchBatchResults,
    loadingOverview,
    errorOverview,
    loadingBatch,
    errorBatch,
  } = useResultsStore();

  const [q, setQ] = useState("");
  const [dept, setDept] = useState("Tous");
  const [expandedDepts, setExpandedDepts] = useState({});

  // tenants + overview
  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);
  useEffect(() => {
    if (tenantId) fetchOverview(tenantId);
  }, [tenantId, fetchOverview]);

  // fetch détails du batch actif si pas en cache
  const activeBatch = useMemo(() => {
    if (!activeBatchId) return null;
    return batchResults[activeBatchId]?.batch || null;
  }, [activeBatchId, batchResults]);

  useEffect(() => {
    if (!tenantId || !activeBatchId) return;
    if (!batchResults[activeBatchId]) {
      fetchBatchResults(tenantId, activeBatchId);
    }
  }, [tenantId, activeBatchId, batchResults, fetchBatchResults]);

  // toolbar: départements calculés depuis les rows du batch actif
  const departments = useMemo(() => {
    const set = new Set();
    const rows = batchResults[activeBatchId]?.rows || [];
    rows.forEach((r) => set.add(r.department || "—"));
    return ["Tous", ...Array.from(set).sort()];
  }, [batchResults, activeBatchId]);

  // filtre texte + département
  const filteredRows = useMemo(() => {
    const rows = batchResults[activeBatchId]?.rows || [];
    const term = q.trim().toLowerCase();
    return rows.map((r) => {
      let employees = r.employees || [];
      if (dept !== "Tous" && (r.department || "—") !== dept) employees = [];
      if (term) {
        employees = employees.filter(
          (e) =>
            (e.name || "").toLowerCase().includes(term) ||
            (e.email || "").toLowerCase().includes(term)
        );
      }
      return { ...r, employees, clickCount: employees.length };
    });
  }, [batchResults, activeBatchId, q, dept]);

  return (
    <div className="flex gap-6 p-6 bg-gray-50 min-h-screen">
      {/* SIDEBAR */}
      <aside className="w-full md:w-80 bg-white rounded-xl shadow-sm p-5 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Résultats</h2>
        </div>

        <div className="space-y-3 overflow-auto flex-grow">
          {loadingOverview && <div className="text-gray-500">Chargement…</div>}
          {errorOverview && (
            <div className="text-red-600 text-sm">{errorOverview}</div>
          )}
          {!loadingOverview &&
            !errorOverview &&
            overview.map((b) => (
              <div
                key={b._id}
                onClick={() => setActiveBatch(b._id)}
                className={`w-full p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  b._id === activeBatchId
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                }`}
              >
                <div className="font-medium text-gray-900 truncate">
                  {b.name}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(b.dateCreated).toLocaleDateString("fr-FR")}
                </div>

                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Progression</span>
                    <span>{b.progress}%</span>
                  </div>
                  <ProgressBar value={b.progress} />
                </div>

                <div className="flex justify-between mt-3 text-xs">
                  <div className="flex items-center text-green-600">
                    <FiUsers size={12} className="mr-1" />
                    <span>{b.totalEmployees ?? 0} employés</span>
                  </div>
                  <div className="flex items-center text-blue-600">
                    <FiCpu size={12} className="mr-1" />
                    <span>{b.clickCount ?? 0} clics</span>
                  </div>
                </div>
              </div>
            ))}
          {(!overview || overview.length === 0) && !loadingOverview && (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
              <FiMail size={24} className="mx-auto mb-2 text-gray-400" />
              <p>Aucun batch</p>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1">
        {/* Toolbar */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <TenantPicker />
            </div>

            <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
              <FiFilter size={16} className="text-gray-500" />
              <select
                className="bg-transparent border-none text-sm focus:outline-none"
                value={dept}
                onChange={(e) => setDept(e.target.value)}
              >
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative flex-1 min-w-[240px]">
              <FiSearch
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Rechercher par nom ou email…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>

            {activeBatch && (
              <div className="ml-auto bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                <FiBarChart2 size={14} className="mr-1" />
                <span className="font-medium">
                  {activeBatch.name} — {activeBatch.clickCount ?? 0} clics
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Contenu batch */}
        {!activeBatchId && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-600">
            Sélectionne un batch à gauche.
          </div>
        )}

        {activeBatchId && loadingBatch && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-600">
            Chargement des détails…
          </div>
        )}

        {activeBatchId && errorBatch && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-red-600">
            {errorBatch}
          </div>
        )}

        {activeBatchId && !loadingBatch && !errorBatch && (
          <div className="space-y-4">
            {(filteredRows || []).map((d) => {
              const key = `${activeBatchId}:${d.department || "—"}`;
              const isOpen = expandedDepts[key] !== false;

              return (
                <section
                  key={key}
                  className="bg-white rounded-xl shadow-sm overflow-hidden"
                >
                  <div
                    className="p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() =>
                      setExpandedDepts((p) => ({ ...p, [key]: !isOpen }))
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span
                          className={`p-2 rounded-lg ${
                            isOpen
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {isOpen ? (
                            <FiChevronUp size={18} />
                          ) : (
                            <FiChevronDown size={18} />
                          )}
                        </span>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {d.department || "—"}
                          </h3>
                          <div className="text-sm text-blue-700 mt-1">
                            <FiCpu className="inline mr-1" />
                            {d.clickCount ?? 0} clics
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <Th>
                              <FiUsers size={14} /> Nom
                            </Th>
                            <Th>
                              <FiMail size={14} /> Email
                            </Th>
                            <Th>Département</Th>
                            <Th>1er clic</Th>
                            <Th>IP</Th>
                            <Th>UA</Th>
                            <Th>Bot ?</Th>
                          </tr>
                        </thead>
                        <tbody>
                          {(d.employees || []).map((e) => (
                            <tr
                              key={e._id}
                              className="border-t hover:bg-gray-50"
                            >
                              <Td className="font-medium">{e.name}</Td>
                              <Td className="text-gray-700">{e.email}</Td>
                              <Td className="text-gray-500">
                                {e.department || "—"}
                              </Td>
                              <Td className="text-gray-600">
                                {e.firstClickAt
                                  ? new Date(e.firstClickAt).toLocaleString(
                                      "fr-FR"
                                    )
                                  : "—"}
                              </Td>
                              <Td className="text-gray-600">{e.ip || "—"}</Td>
                              <Td className="text-gray-500 truncate max-w-[260px]">
                                {e.userAgent || "—"}
                              </Td>
                              <Td className="text-gray-600">
                                {e.isLikelyBot ? "Oui" : "Non"}
                              </Td>
                            </tr>
                          ))}
                          {(!d.employees || d.employees.length === 0) && (
                            <tr>
                              <td
                                colSpan={7}
                                className="text-center text-gray-500 py-6"
                              >
                                Aucun résultat pour ce filtre.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
