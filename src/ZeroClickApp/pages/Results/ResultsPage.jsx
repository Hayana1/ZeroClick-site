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
import { api as apiClient } from "../../lib/api";

const ProgressBar = ({ value, color = "blue" }) => (
  <div className="w-full bg-gray-200 rounded-full h-2">
    <div
      className={`h-2 rounded-full bg-gradient-to-r from-${color}-500 to-${color}-600`}
      style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
    />
  </div>
);

const StatCard = ({ label, value, subtitle, tone = "blue" }) => (
  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
    <div className="text-xs text-gray-500">{label}</div>
    <div className="mt-1 text-2xl font-semibold text-gray-900">{value}</div>
    {subtitle ? (
      <div className={`mt-1 text-xs text-${tone}-700`}>{subtitle}</div>
    ) : null}
  </div>
);

const Pill = ({ children, tone = "gray" }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-${tone}-100 text-${tone}-700`}>{children}</span>
);

const Funnel = ({ total = 0, sent = 0, clicked = 0, trained = 0 }) => {
  const w = (n) => (total > 0 ? Math.round((n / total) * 100) : 0);
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="text-sm font-medium text-gray-900 mb-3">Entonnoir de conversion</div>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs text-gray-600 mb-1"><span>Envoyés</span><span>{sent} ({w(sent)}%)</span></div>
          <ProgressBar value={w(sent)} color="blue" />
        </div>
        <div>
          <div className="flex justify-between text-xs text-gray-600 mb-1"><span>Clics</span><span>{clicked} ({w(clicked)}%)</span></div>
          <ProgressBar value={w(clicked)} color="indigo" />
        </div>
        <div>
          <div className="flex justify-between text-xs text-gray-600 mb-1"><span>Formations complétées</span><span>{trained} ({w(trained)}%)</span></div>
          <ProgressBar value={w(trained)} color="emerald" />
        </div>
      </div>
    </div>
  );
};

// -------- Monthly chart (bars: sent, line: click rate) --------
const MonthlyChart = ({ data = [] }) => {
  const months = data.slice(-12); // last 12 months
  const maxSent = Math.max(1, ...months.map((d) => d.sent || 0));
  const w = 560;
  const h = 200;
  const padL = 36; const padR = 36; const padT = 16; const padB = 24;
  const cw = w - padL - padR; const ch = h - padT - padB;
  const bw = months.length ? cw / months.length : cw;
  const x = (i) => padL + i * bw + bw * 0.15;
  const barW = bw * 0.7;
  const ySent = (v) => padT + ch * (1 - (v / maxSent));
  const yRate = (r) => padT + ch * (1 - (Math.max(0, Math.min(100, r)) / 100));
  const linePath = () => {
    if (!months.length) return "";
    return months
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i) + barW / 2} ${yRate(d.rate || 0)}`)
      .join(' ');
  };
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium text-gray-900">Tendances mensuelles (12 mois)</div>
        <div className="flex items-center gap-3 text-xs">
          <div className="inline-flex items-center gap-1 text-gray-600"><span className="inline-block w-3 h-3 bg-blue-500 rounded-sm"></span> Envoyés</div>
          <div className="inline-flex items-center gap-1 text-gray-600"><span className="inline-block w-3 h-0.5 bg-indigo-600"></span> Taux de clic</div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${w} ${h}`} className="min-w-[560px] w-full h-[220px]">
          {/* axes */}
          <line x1={padL} y1={padT+ch} x2={w-padR} y2={padT+ch} stroke="#e5e7eb" />
          <line x1={padL} y1={padT} x2={padL} y2={padT+ch} stroke="#e5e7eb" />
          {/* bars sent */}
          {months.map((d, i) => (
            <rect key={`b-${i}`} x={x(i)} y={ySent(d.sent || 0)} width={barW} height={Math.max(2, padT+ch - ySent(d.sent || 0))} fill="#3b82f6" opacity="0.9" rx="3" />
          ))}
          {/* line rate */}
          <path d={linePath()} fill="none" stroke="#4f46e5" strokeWidth="2" />
          {months.map((d, i) => (
            <circle key={`c-${i}`} cx={x(i)+barW/2} cy={yRate(d.rate||0)} r="3" fill="#4f46e5" />
          ))}
          {/* labels */}
          {months.map((d, i) => (
            <text key={`t-${i}`} x={x(i)+barW/2} y={padT+ch+14} textAnchor="middle" fontSize="10" fill="#6b7280">{d.label}</text>
          ))}
        </svg>
      </div>
    </div>
  );
};

function Th({ children }) {
  return (
    <th className="text-left font-medium px-2 md:px-4 py-3 text-gray-700 whitespace-nowrap">
      {children}
    </th>
  );
}
function Td({ children, className = "" }) {
  return (
    <td className={`px-2 md:px-4 py-3 align-middle ${className}`}>
      {children}
    </td>
  );
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [weekStart, setWeekStart] = useState(() => new Date(Date.now()-7*24*3600*1000).toISOString().slice(0,10));
  const [weekEnd, setWeekEnd] = useState(() => new Date().toISOString().slice(0,10));

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

  // Executive summary (active batch)
  const executive = useMemo(() => {
    const baseRows = batchResults[activeBatchId]?.rows || [];
    const batch = batchResults[activeBatchId]?.batch || null;
    const totalEmployees = Number(batch?.totalEmployees || 0);
    const sentCount = (() => {
      // Approx: if batch has no selections in payload, fallback on clicked unique count
      return Number(batch?.sentCount || 0);
    })();
    let clicked = 0;
    let trained = 0;
    let lastClickAt = null;
    for (const r of baseRows) {
      const emps = r.employees || [];
      clicked += emps.length;
      for (const e of emps) {
        if (e.trainingCompleted) trained += 1;
        if (e.firstClickAt) {
          const d = new Date(e.firstClickAt);
          if (!lastClickAt || d > lastClickAt) lastClickAt = d;
        }
      }
    }
    const clickRate = totalEmployees > 0 ? Math.round((clicked / totalEmployees) * 100) : 0;
    const trainRate = clicked > 0 ? Math.round((trained / clicked) * 100) : 0;
    return { totalEmployees, sentCount, clicked, trained, clickRate, trainRate, lastClickAt };
  }, [batchResults, activeBatchId]);

  // Monthly aggregation (by batch date) from overview
  const monthlyData = useMemo(() => {
    const map = new Map();
    const list = (overview || []).slice();
    for (const b of list) {
      const d = new Date(b.dateCreated || b.date || 0);
      if (!d || isNaN(d)) continue;
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      const cur = map.get(key) || { sent: 0, clicks: 0 };
      cur.sent += Number(b.sentCount || 0);
      cur.clicks += Number(b.clickCount || 0);
      map.set(key, cur);
    }
    // produce last 12 months timeline
    const out = [];
    const now = new Date();
    for (let i=11;i>=0;i--) {
      const d = new Date(now.getFullYear(), now.getMonth()-i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      const e = map.get(key) || { sent: 0, clicks: 0 };
      const rate = e.sent > 0 ? Math.round((e.clicks / e.sent) * 100) : 0;
      const label = d.toLocaleDateString('fr-FR', { month: 'short' });
      out.push({ key, label, sent: e.sent, rate });
    }
    return out;
  }, [overview]);

  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-6 p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Bouton pour ouvrir/fermer la sidebar sur mobile */}
      <div className="md:hidden flex justify-between items-center mb-4 bg-white p-3 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800">Résultats</h2>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-lg bg-gray-100 text-gray-700"
        >
          {isSidebarOpen ? "Fermer" : "Batches"}
        </button>
      </div>

      {/* SIDEBAR */}
      <aside
        className={`${
          isSidebarOpen ? "block" : "hidden"
        } md:block w-full md:w-80 bg-white rounded-xl shadow-sm p-4 md:p-5 flex flex-col`}
      >
        <div className="hidden md:flex items-center justify-between mb-4">
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
                onClick={() => {
                  setActiveBatch(b._id);
                  setIsSidebarOpen(false); // Fermer la sidebar sur mobile après sélection
                }}
                className={`w-full p-3 md:p-4 rounded-xl border-2 cursor-pointer transition-all ${
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
        <div className="mt-4 border-t pt-3">
          <h4 className="font-semibold text-gray-800 text-sm mb-2">Export hebdo</h4>
          <div className="flex gap-2 items-center">
            <input type="date" className="border rounded px-2 py-1 text-sm" value={weekStart} onChange={(e) => setWeekStart(e.target.value)} />
            <input type="date" className="border rounded px-2 py-1 text-sm" value={weekEnd} onChange={(e) => setWeekEnd(e.target.value)} />
          </div>
          <a
            href={tenantId ? apiClient.resultsWeeklyCsvUrl(tenantId, weekStart, weekEnd) : '#'}
            className={`mt-2 block text-center px-3 py-2 rounded text-white ${tenantId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'}`}
            download
          >
            Télécharger CSV (7 jours)
          </a>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 min-w-0 overflow-x-hidden">
        {/* Executive summary cards */}
        {activeBatch && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
            <StatCard label="Employés" value={executive.totalEmployees} />
            <StatCard label="Envoyés" value={executive.sentCount || 0} />
            <StatCard label="Clics" value={executive.clicked} subtitle={`${executive.clickRate}% du total`} tone="blue" />
            <StatCard label="Formations" value={executive.trained} subtitle={`${executive.trainRate}% des cliquants`} tone="emerald" />
            <div className="hidden lg:block"><Funnel total={executive.totalEmployees} sent={executive.sentCount||0} clicked={executive.clicked} trained={executive.trained} /></div>
          </div>
        )}
        {/* Monthly chart for the tenant (based on batches overview) */}
        <div className="mb-4 md:mb-6">
          <MonthlyChart data={monthlyData} />
        </div>
        {/* Toolbar */}
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-5 mb-4 md:mb-6 sticky top-4 z-10">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-start md:items-center">
            <div className="w-full md:flex-1">
              <TenantPicker />
            </div>

            <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 w-full md:w-auto">
              <FiFilter size={16} className="text-gray-500 flex-shrink-0" />
              <select
                className="bg-transparent border-none text-sm focus:outline-none w-full"
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

            <div className="relative w-full md:flex-1">
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
              <div className="ml-auto bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center w-full md:w-auto justify-center md:justify-start mt-2 md:mt-0 shadow-sm">
                <FiBarChart2 size={14} className="mr-1" />
                <span className="font-medium truncate">
                  {activeBatch.name} — {activeBatch.clickCount ?? 0} clics
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Contenu batch */}
        {!activeBatchId && (
          <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 text-center text-gray-600">
            Sélectionne un batch à gauche.
          </div>
        )}

        {activeBatchId && loadingBatch && (
          <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 text-center text-gray-600">
            Chargement des détails…
          </div>
        )}

        {activeBatchId && errorBatch && (
          <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 text-center text-red-600">
            {errorBatch}
          </div>
        )}

        {activeBatchId && !loadingBatch && !errorBatch && (
          <div className="space-y-4 min-w-0">
            {(filteredRows || []).map((d) => {
              const key = `${activeBatchId}:${d.department || "—"}`;
              const isOpen = expandedDepts[key] !== false;

              return (
                <section
                  key={key}
                  className="bg-white rounded-xl shadow-sm overflow-hidden min-w-0"
                >
                  <div
                    className="p-3 md:p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() =>
                      setExpandedDepts((p) => ({ ...p, [key]: !isOpen }))
                    }
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`p-1 md:p-2 rounded-lg ${
                            isOpen
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {isOpen ? (
                            <FiChevronUp size={16} className="md:w-[18px]" />
                          ) : (
                            <FiChevronDown size={16} className="md:w-[18px]" />
                          )}
                        </span>
                        <div className="min-w-0">
                          <h3 className="font-medium text-gray-900 text-sm md:text-base break-words">
                            {d.department || "—"}
                          </h3>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 mt-1 break-words">
                            <div className="text-xs md:text-sm text-blue-700 flex items-center gap-2">
                              <FiCpu className="inline" />
                              <span>{d.clickCount ?? 0} clics</span>
                              <span className="hidden sm:inline">·</span>
                              <div className="w-24"><ProgressBar value={(() => { const t = executive.totalEmployees || 0; return t>0 ? Math.round(((d.clickCount||0)/t)*100) : 0; })()} color="indigo"/></div>
                            </div>
                            {(d.config?.theme || d.config?.scenarioId) && (
                              <div className="text-[11px] md:text-xs text-gray-600 break-words">
                                {d.config?.theme && (
                                  <>
                                    <span className="font-medium">Thème:</span> <Pill tone="blue">{d.config.theme}</Pill>
                                  </>
                                )}
                                {d.config?.scenarioId && (
                                  <>
                                    {d.config?.theme ? " · " : ""}
                                    <span className="font-medium">Scénario:</span> <Pill tone="gray">{d.config?.category || "—"}</Pill> <span className="text-gray-400">·</span> <span className="font-mono break-all text-gray-700">{d.config.scenarioId}</span>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs md:text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <Th>
                              <FiUsers
                                size={12}
                                className="md:size-[14px] inline mr-1"
                              />{" "}
                              Nom
                            </Th>
                            <Th>
                              <FiMail
                                size={12}
                                className="md:size-[14px] inline mr-1"
                              />{" "}
                              Email
                            </Th>
                            <Th className="hidden sm:table-cell">
                              Département
                            </Th>
                            <Th className="hidden lg:table-cell">1er clic</Th>
                            <Th className="hidden md:table-cell">Formation</Th>
                            <Th className="hidden xl:table-cell">IP</Th>
                            <Th className="hidden xl:table-cell">UA</Th>
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
                              <Td className="text-gray-500 hidden sm:table-cell">
                                {e.department || "—"}
                              </Td>
                              <Td className="text-gray-600 hidden lg:table-cell">
                                {e.firstClickAt
                                  ? new Date(e.firstClickAt).toLocaleString(
                                      "fr-FR"
                                    )
                                  : "—"}
                              </Td>
                              <Td className="text-gray-600 hidden md:table-cell">
                                {e.trainingCompleted ? <Pill tone="emerald">Oui</Pill> : <Pill tone="gray">Non</Pill>}
                              </Td>
                              <Td className="text-gray-600 hidden xl:table-cell">
                                {e.ip || "—"}
                              </Td>
                              <Td className="text-gray-500 truncate max-w-[120px] xl:max-w-[260px] hidden xl:table-cell" title={e.userAgent || ''}>
                                {e.userAgent || "—"}
                              </Td>
                              <Td className="text-gray-600">
                                {e.isLikelyBot ? <Pill tone="red">Oui</Pill> : <Pill tone="emerald">Non</Pill>}
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
