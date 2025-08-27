// src/ZeroClickApp/pages/Campaigns/CampaignsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useTenantStore } from "../../store/useTenantStore";
import { useEmployeesStore } from "../../store/useEmployeesStore";
import { useCampaignsStore } from "../../store/useCampaignsStore";
import TenantPicker from "../../components/TenantPicker";
import {
  FiSend,
  FiCpu,
  FiPlus,
  FiTrash2,
  FiFilter,
  FiSearch,
  FiCheck,
  FiX,
  FiUsers,
  FiMail,
  FiChevronDown,
  FiChevronUp,
  FiBarChart2,
  FiSave,
} from "react-icons/fi";

export default function CampaignsPage() {
  const { tenantId, fetchTenants } = useTenantStore();
  const {
    list: employees,
    fetch: fetchEmployees,
    loading: loadingEmp,
  } = useEmployeesStore();

  const {
    campaigns,
    activeId,
    loading: loadingCamp,
    error,
    fetch: fetchCampaigns,
    setActive,
    toggleSent,
    setThemeForGroup, // <= DOIT appeler api.patchTheme côté store
    addCampaign,
    removeCampaign,
    sentMap,
    themesByGroup,
    bulkSetGroupSent,
  } = useCampaignsStore();

  const [q, setQ] = useState("");
  const [dept, setDept] = useState("Tous");
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [expandedGroups, setExpandedGroups] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // état local "edit buffer" des thèmes + statut "saving" par groupe
  const [themeDrafts, setThemeDrafts] = useState({}); // { [groupName]: value }
  const [themeSaving, setThemeSaving] = useState({}); // { [groupName]: "idle" | "saving" | "saved" | "error" }

  /* ------------------ bootstrap ------------------ */
  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  useEffect(() => {
    if (tenantId) {
      fetchEmployees(tenantId);
      fetchCampaigns(tenantId);
    }
  }, [tenantId, fetchEmployees, fetchCampaigns]);

  const activeCampaign = useMemo(
    () => campaigns.find((c) => c._id === activeId) || null,
    [campaigns, activeId]
  );

  // thèmes actuels de la campagne (venant du store → Mongo)
  const campaignThemes = useMemo(() => {
    if (!activeCampaign) return {};
    return (themesByGroup && themesByGroup[activeCampaign._id]) || {};
  }, [themesByGroup, activeCampaign]);

  // quand on change de campagne, on recharge le buffer local avec les valeurs persistées
  useEffect(() => {
    if (!activeCampaign) return;
    setThemeDrafts({ ...(campaignThemes || {}) });
    setThemeSaving({}); // reset des états de sauvegarde
  }, [activeCampaign, campaignThemes]);

  /* ------------------ filtres & groupes ------------------ */
  const departments = useMemo(() => {
    const s = new Set(employees.map((e) => e.department || "—"));
    return ["Tous", ...Array.from(s).sort()];
  }, [employees]);

  const filtered = useMemo(() => {
    let arr = employees;
    if (dept !== "Tous")
      arr = arr.filter((e) => (e.department || "—") === dept);
    if (q.trim()) {
      const qq = q.trim().toLowerCase();
      arr = arr.filter(
        (e) =>
          (e.name || "").toLowerCase().includes(qq) ||
          (e.email || "").toLowerCase().includes(qq)
      );
    }
    return [...arr].sort((a, b) => {
      const d = (a.department || "—").localeCompare(b.department || "—");
      if (d !== 0) return d;
      return (a.name || "").localeCompare(b.name || "");
    });
  }, [employees, dept, q]);

  const groups = useMemo(() => {
    const map = new Map();
    for (const e of filtered) {
      const g = e.department || "—";
      if (!map.has(g)) map.set(g, []);
      map.get(g).push(e);
    }
    return Array.from(map.entries()); // [ [groupName, employees[]], ... ]
  }, [filtered]);

  const toggleGroup = (groupName) => {
    setExpandedGroups((prev) => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  /* ------------------ actions ------------------ */
  const onCreate = async () => {
    if (!tenantId) return alert("Sélectionne une entreprise");
    if (!newName.trim()) return alert("Nom requis");
    await addCampaign(tenantId, {
      name: newName.trim(),
      employeeIds: employees.map((e) => e._id),
    });
    setShowCreate(false);
    setNewName("");
  };

  const handleDeleteCampaign = async () => {
    if (deleteConfirm) {
      await removeCampaign(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  const handleThemeChange = (groupName, value) => {
    setThemeDrafts((d) => ({ ...d, [groupName]: value }));
    // remet l'état visuel à "idle" quand l'utilisateur retape après un "saved" ou "error"
    setThemeSaving((s) => ({ ...s, [groupName]: "idle" }));
  };

  const persistTheme = async (groupName) => {
    if (!tenantId || !activeCampaign) return;
    const value = themeDrafts[groupName] ?? "";
    try {
      setThemeSaving((s) => ({ ...s, [groupName]: "saving" }));
      await setThemeForGroup(tenantId, activeCampaign._id, groupName, value);
      setThemeSaving((s) => ({ ...s, [groupName]: "saved" }));
      // petit reset de l'indicateur après 1.2s
      setTimeout(() => {
        setThemeSaving((s) =>
          s[groupName] === "saved" ? { ...s, [groupName]: "idle" } : s
        );
      }, 1200);
    } catch (_) {
      setThemeSaving((s) => ({ ...s, [groupName]: "error" }));
    }
  };

  /* ------------------ stats sidebar ------------------ */
  const campaignStats = useMemo(() => {
    return campaigns.map((campaign) => {
      const campaignSentMap = sentMap[campaign._id] || {};
      const sent = Object.values(campaignSentMap).filter(Boolean).length;
      const total = employees.length;
      return {
        ...campaign,
        sentCount: sent,
        totalCount: total,
        progress: total > 0 ? Math.round((sent / total) * 100) : 0,
      };
    });
  }, [campaigns, sentMap, employees]);

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 bg-gray-50 min-h-screen">
      {/* SIDEBAR */}
      <aside className="w-full md:w-80 bg-white rounded-lg shadow-sm p-5 flex flex-col">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold text-gray-800">Campagnes</h2>
          <button
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 transition-colors"
            onClick={() => setShowCreate(true)}
          >
            <FiPlus size={16} />
            <span>Nouvelle</span>
          </button>
        </div>

        <div className="space-y-3 overflow-auto flex-grow">
          {campaignStats.map((c) => (
            <div
              key={c._id}
              onClick={() => tenantId && setActive(tenantId, c._id)}
              className={`w-full p-4 rounded-lg border cursor-pointer transition-all ${
                c._id === activeId
                  ? "border-blue-500 bg-blue-50 shadow-sm"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="font-medium text-gray-900 truncate">{c.name}</div>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(c.dateCreated).toLocaleDateString("fr-FR")}
              </div>

              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Progression</span>
                  <span>{c.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${c.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between mt-3 text-xs">
                <div className="flex items-center text-green-600">
                  <FiSend size={12} className="mr-1" />
                  <span>{c.sentCount ?? 0} envoyés</span>
                </div>
                <div className="flex items-center text-blue-600">
                  <FiCpu size={12} className="mr-1" />
                  <span>{c.clickCount ?? 0} clics</span>
                </div>
              </div>
            </div>
          ))}
          {campaigns.length === 0 && (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
              <FiMail size={24} className="mx-auto mb-2 text-gray-400" />
              <p>Aucune campagne</p>
              <p className="text-sm mt-1">Créez votre première campagne</p>
            </div>
          )}
        </div>

        {activeCampaign && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              className="flex items-center justify-center gap-2 w-full text-red-600 border border-red-200 rounded-lg px-3 py-2 hover:bg-red-50 transition-colors"
              onClick={() => setDeleteConfirm(activeCampaign._id)}
            >
              <FiTrash2 size={16} />
              <span>Supprimer la campagne</span>
            </button>
          </div>
        )}
      </aside>

      {/* MAIN */}
      <main className="flex-1">
        <Toolbar
          dept={dept}
          setDept={setDept}
          q={q}
          setQ={setQ}
          activeCampaign={activeCampaign}
        />

        {!activeCampaign && <EmptyStateNoCampaign />}

        {activeCampaign && (
          <div className="space-y-4">
            {groups.map(([groupName, rows]) => {
              const isExpanded = expandedGroups[groupName] !== false;
              const draftValue =
                themeDrafts[groupName] ?? campaignThemes[groupName] ?? ""; // valeur affichée dans l'input
              const saveState = themeSaving[groupName] || "idle";

              const campaignSentMap =
                (sentMap && activeCampaign && sentMap[activeCampaign._id]) ||
                {};
              const sentCount = rows.filter(
                (row) => campaignSentMap[row._id]
              ).length;

              return (
                <section
                  key={groupName}
                  className="bg-white rounded-lg shadow-sm overflow-hidden"
                >
                  {/* Header de groupe */}
                  <div
                    className="p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleGroup(groupName)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span
                          className={`p-2 rounded-lg ${
                            isExpanded
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {isExpanded ? (
                            <FiChevronUp size={18} />
                          ) : (
                            <FiChevronDown size={18} />
                          )}
                        </span>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {groupName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {rows.length} employé(s) • {sentCount} envoyé(s)
                          </p>
                          {/* mini progression */}
                          <div className="mt-1">
                            <div className="text-[11px] text-gray-500">
                              {Math.round(
                                (sentCount / Math.max(rows.length, 1)) * 100
                              )}
                              %
                            </div>
                            <div className="w-32 h-1.5 bg-gray-200 rounded-full">
                              <div
                                className="h-1.5 bg-blue-600 rounded-full"
                                style={{
                                  width: `${
                                    (sentCount / Math.max(rows.length, 1)) * 100
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Édition du thème du groupe */}
                      <div
                        className="flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          className="w-56 border border-gray-200 rounded-lg px-3 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Thème de la semaine…"
                          value={draftValue}
                          onChange={(e) =>
                            handleThemeChange(groupName, e.target.value)
                          }
                          onBlur={() => persistTheme(groupName)}
                        />
                        {/* Actions de groupe */}
                        <div
                          className="flex items-center gap-2 mr-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            className="text-xs border px-2 py-1 rounded hover:bg-gray-50"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              bulkSetGroupSent(
                                tenantId,
                                activeCampaign._id,
                                rows.map((r) => r._id),
                                true
                              );
                            }}
                          >
                            Tout cocher
                          </button>

                          <button
                            className="text-xs border px-2 py-1 rounded hover:bg-gray-50"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              bulkSetGroupSent(
                                tenantId,
                                activeCampaign._id,
                                rows.map((r) => r._id),
                                false
                              );
                            }}
                          >
                            Tout décocher
                          </button>
                        </div>

                        {/* petit état de sauvegarde */}
                        {saveState === "saving" && (
                          <span className="text-xs text-gray-500">
                            Sauvegarde…
                          </span>
                        )}
                        {saveState === "saved" && (
                          <span className="text-xs text-green-600">
                            Sauvé ✓
                          </span>
                        )}
                        {saveState === "error" && (
                          <span className="text-xs text-red-600">
                            Erreur de sauvegarde
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Liste des employés */}
                  {isExpanded && (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <Th>
                                <FiCheck size={16} />
                              </Th>
                              <Th>
                                <FiUsers size={16} /> Nom
                              </Th>
                              <Th>
                                <FiMail size={16} /> Email
                              </Th>
                              <Th>Département</Th>
                            </tr>
                          </thead>
                          <tbody>
                            {rows.map((e) => {
                              const checked =
                                !!sentMap[activeCampaign._id]?.[e._id];
                              return (
                                <tr
                                  key={e._id}
                                  className="border-t hover:bg-gray-50 transition-colors"
                                >
                                  <Td>
                                    <div className="flex justify-center">
                                      <label className="inline-flex items-center cursor-pointer">
                                        <input
                                          type="checkbox"
                                          className="hidden"
                                          checked={checked}
                                          onChange={() =>
                                            toggleSent(
                                              tenantId,
                                              activeCampaign._id,
                                              e._id
                                            )
                                          }
                                        />
                                        <div
                                          className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                                            checked
                                              ? "bg-blue-500 border-blue-500"
                                              : "border-gray-300"
                                          }`}
                                        >
                                          {checked && (
                                            <FiCheck
                                              size={14}
                                              className="text-white"
                                            />
                                          )}
                                        </div>
                                      </label>
                                    </div>
                                  </Td>
                                  <Td className="font-medium">{e.name}</Td>
                                  <Td className="text-gray-700">{e.email}</Td>
                                  <Td className="text-gray-500">
                                    {e.department || "—"}
                                  </Td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {draftValue && (
                        <div className="p-3 text-sm bg-blue-50 text-blue-800 border-t">
                          <span className="font-medium">Thème appliqué :</span>{" "}
                          {draftValue}
                        </div>
                      )}
                    </>
                  )}
                </section>
              );
            })}

            {groups.length === 0 && <EmptyStateNoEmployees />}
          </div>
        )}
      </main>

      {/* Modal création campagne */}
      {showCreate && (
        <Modal onClose={() => setShowCreate(false)}>
          <div className="p-5 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              Nouvelle campagne
            </h3>
          </div>
          <div className="p-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom de la campagne
            </label>
            <input
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="ex: Campagne RH - Septembre 2025"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
            <p className="mt-4 text-sm text-gray-500">
              La campagne inclura tous les employés de l'entreprise
              sélectionnée. Vous pourrez marquer manuellement les emails
              envoyés.
            </p>
          </div>
          <div className="flex justify-end gap-3 p-5 bg-gray-50">
            <button
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setShowCreate(false)}
            >
              Annuler
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={onCreate}
              disabled={!newName.trim()}
            >
              Créer la campagne
            </button>
          </div>
        </Modal>
      )}

      {/* Modal confirmation suppression */}
      {deleteConfirm && (
        <Modal onClose={() => setDeleteConfirm(null)}>
          <div className="p-5 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              Confirmer la suppression
            </h3>
          </div>
          <div className="p-5">
            <p className="text-gray-700">
              Êtes-vous sûr de vouloir supprimer cette campagne ? Cette action
              est irréversible.
            </p>
          </div>
          <div className="flex justify-end gap-3 p-5 bg-gray-50">
            <button
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setDeleteConfirm(null)}
            >
              Annuler
            </button>
            <button
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              onClick={handleDeleteCampaign}
            >
              Supprimer
            </button>
          </div>
        </Modal>
      )}

      {(loadingEmp || loadingCamp) && <BlockingSpinner text="Chargement..." />}

      {error && (
        <ToastError
          messageTitle="Erreur"
          messageBody={error}
          onClose={() => {}}
        />
      )}
    </div>
  );
}

/* ------------------ UI helpers ------------------ */
function Toolbar({ dept, setDept, q, setQ, activeCampaign }) {
  const departments = ["Tous", "RH", "Finance", "IT", "Direction", "—"];
  return (
    <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
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
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Rechercher un employé..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {activeCampaign && (
          <div className="ml-auto bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
            <FiBarChart2 size={14} className="mr-1" />
            <span className="font-medium">{activeCampaign.name}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyStateNoCampaign() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
      <FiMail size={48} className="mx-auto text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-700 mb-2">
        Aucune campagne sélectionnée
      </h3>
      <p className="text-gray-500">
        Sélectionnez ou créez une campagne pour commencer.
      </p>
    </div>
  );
}

function EmptyStateNoEmployees() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
      <FiUsers size={48} className="mx-auto text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-700 mb-2">
        Aucun employé trouvé
      </h3>
      <p className="text-gray-500">
        Ajustez vos filtres pour afficher les employés.
      </p>
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden relative">
        <button
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
          onClick={onClose}
          aria-label="Fermer"
        >
          <FiX size={18} />
        </button>
        {children}
      </div>
    </div>
  );
}

function BlockingSpinner({ text }) {
  return (
    <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-40">
      <div className="bg-white rounded-lg shadow-md px-6 py-4 flex items-center gap-3">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
        <span>{text}</span>
      </div>
    </div>
  );
}

function ToastError({ messageTitle, messageBody, onClose }) {
  return (
    <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-md flex items-start gap-3 max-w-md z-30">
      <div className="mt-0.5">
        <FiX size={18} className="text-red-500" />
      </div>
      <div>
        <p className="font-medium">{messageTitle}</p>
        <p className="text-sm">{messageBody}</p>
      </div>
      <button
        onClick={onClose}
        className="ml-4 text-red-500 hover:text-red-700"
      >
        <FiX size={18} />
      </button>
    </div>
  );
}

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
