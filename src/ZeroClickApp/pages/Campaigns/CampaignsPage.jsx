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
  FiCopy,
  FiCheckCircle,
  FiClock,
  FiEye,
  FiEyeOff,
  FiLink,
} from "react-icons/fi";

// Composant pour l'indicateur de statut
const StatusIndicator = ({ status }) => {
  const statusConfig = {
    saving: { color: "text-blue-500", text: "En cours..." },
    saved: { color: "text-green-500", text: "Sauvegardé" },
    error: { color: "text-red-500", text: "Erreur" },
    idle: { color: "text-gray-400", text: "Non sauvegardé" },
  };

  const config = statusConfig[status] || statusConfig.idle;

  return (
    <div className={`flex items-center text-xs ${config.color} mt-1`}>
      {status === "saving" && <FiClock className="mr-1" size={12} />}
      {status === "saved" && <FiCheckCircle className="mr-1" size={12} />}
      {status === "error" && <FiX className="mr-1" size={12} />}
      {config.text}
    </div>
  );
};

// Composant pour la barre de progression
const ProgressBar = ({ progress, size = "md" }) => {
  const height = size === "sm" ? "h-1.5" : "h-2";

  return (
    <div className="w-full bg-gray-200 rounded-full">
      <div
        className={`bg-blue-600 rounded-full ${height} transition-all duration-300`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

// Composant pour les boutons d'action de groupe
const GroupActions = ({
  onSelectAll,
  onDeselectAll,
  onPreview,
  isPreviewing,
}) => {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onSelectAll}
        className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded-lg hover:bg-green-100 transition-colors flex items-center"
        title="Tout sélectionner"
      >
        <FiCheck size={12} className="mr-1" />
        Tout
      </button>
      <button
        onClick={onDeselectAll}
        className="text-xs bg-red-50 text-red-700 border border-red-200 px-2 py-1 rounded-lg hover:bg-red-100 transition-colors flex items-center"
        title="Tout désélectionner"
      >
        <FiX size={12} className="mr-1" />
        Aucun
      </button>
      <button
        onClick={onPreview}
        className={`text-xs border px-2 py-1 rounded-lg transition-colors flex items-center ${
          isPreviewing
            ? "bg-purple-100 text-purple-700 border-purple-300"
            : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
        }`}
        title="Aperçu des liens"
      >
        {isPreviewing ? <FiEyeOff size={12} /> : <FiEye size={12} />}
        <span className="ml-1">Liens</span>
      </button>
    </div>
  );
};

// Composant pour les stats de campagne
const CampaignStats = ({ campaign, isActive, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`w-full p-4 rounded-xl border-2 cursor-pointer transition-all ${
        isActive
          ? "border-blue-500 bg-blue-50 shadow-md"
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
      }`}
    >
      <div className="font-medium text-gray-900 truncate">{campaign.name}</div>
      <div className="text-xs text-gray-500 mt-1">
        {new Date(campaign.dateCreated).toLocaleDateString("fr-FR")}
      </div>

      <div className="mt-3">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Progression</span>
          <span>{campaign.progress}%</span>
        </div>
        <ProgressBar progress={campaign.progress} />
      </div>

      <div className="flex justify-between mt-3 text-xs">
        <div className="flex items-center text-green-600">
          <FiSend size={12} className="mr-1" />
          <span>{campaign.sentCount ?? 0} envoyés</span>
        </div>
        <div className="flex items-center text-blue-600">
          <FiCpu size={12} className="mr-1" />
          <span>{campaign.clickCount ?? 0} clics</span>
        </div>
      </div>
    </div>
  );
};

// Composants UI helpers
const Toolbar = ({ dept, setDept, q, setQ, activeCampaign, departments }) => {
  return (
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
};

const EmptyStateNoCampaign = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-8 text-center">
      <FiMail size={48} className="mx-auto text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-700 mb-2">
        Aucune campagne sélectionnée
      </h3>
      <p className="text-gray-500">
        Sélectionnez ou créez une campagne pour commencer.
      </p>
    </div>
  );
};

const EmptyStateNoEmployees = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-8 text-center">
      <FiUsers size={48} className="mx-auto text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-700 mb-2">
        Aucun employé trouvé
      </h3>
      <p className="text-gray-500">
        Ajustez vos filtres pour afficher les employés.
      </p>
    </div>
  );
};

const Modal = ({ children, onClose }) => {
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
};

const BlockingSpinner = ({ text }) => {
  return (
    <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-40">
      <div className="bg-white rounded-lg shadow-md px-6 py-4 flex items-center gap-3">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
        <span>{text}</span>
      </div>
    </div>
  );
};

const ToastError = ({ messageTitle, messageBody, onClose }) => {
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
};

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  }
}

function previewUrl(url) {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/");
    const token = parts[parts.length - 1] || "";
    return `${u.origin}${parts.slice(0, -1).join("/")}/${token.slice(0, 8)}…`;
  } catch {
    return url.slice(0, 24) + "…";
  }
}

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
    setThemeForGroup,
    addCampaign,
    removeCampaign,
    sentMap = {},
    themesByGroup = {},
    bulkSetGroupSent,
    copiedMap = {},
    markLinkCopied,
    trackingLinks = {},
    fetchTrackingLinks,
  } = useCampaignsStore();

  const [q, setQ] = useState("");
  const [dept, setDept] = useState("Tous");
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [expandedGroups, setExpandedGroups] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showLinkPreviews, setShowLinkPreviews] = useState({});
  const [selectedBatchIds, setSelectedBatchIds] = useState(new Set());

  // état local "edit buffer" des thèmes + statut "saving" par groupe
  const [themeDrafts, setThemeDrafts] = useState({});
  const [themeSaving, setThemeSaving] = useState({});

  // ✅ compute activeCampaign BEFORE any effect that uses it
  const activeCampaign = useMemo(
    () => campaigns.find((c) => c._id === activeId) || null,
    [campaigns, activeId]
  );

  // ✅ departments list for the Toolbar
  const departments = useMemo(() => {
    const s = new Set(employees.map((e) => e.department || "—"));
    return ["Tous", ...Array.from(s).sort()];
  }, [employees]);

  /* ------------------ bootstrap ------------------ */
  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  useEffect(() => {
    if (!tenantId || !activeCampaign) return;
    const belongsToTenant =
      String(activeCampaign.tenantId) === String(tenantId);
    if (!belongsToTenant) return; // évite l'appel 404 pendant le switch

    fetchTrackingLinks(tenantId, activeCampaign._id);
  }, [tenantId, activeCampaign, fetchTrackingLinks]);

  useEffect(() => {
    if (tenantId) {
      fetchEmployees(tenantId);
      fetchCampaigns(tenantId);
    }
  }, [tenantId, fetchEmployees, fetchCampaigns]);

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

  const toggleSelectBatch = (id) => {
    setSelectedBatchIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isBatchSelected = (id) => selectedBatchIds.has(id);
  const clearBatchSelection = () => setSelectedBatchIds(new Set());

  const deleteSelectedBatches = async () => {
    if (!tenantId) return;
    const ids = Array.from(selectedBatchIds);
    if (ids.length === 0) return;

    if (
      !confirm(`Supprimer ${ids.length} campagne(s) ? Action irréversible.`)
    ) {
      return;
    }
    try {
      await api.bulkDeleteBatches(tenantId, ids);
      clearBatchSelection();
      await fetchCampaigns(tenantId); // rafraîchit la liste
    } catch (e) {
      console.error(e);
      alert(e.message || "Échec suppression");
    }
  };

  /* ------------------ filtres & groupes ------------------ */

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
    return Array.from(map.entries());
  }, [filtered]);

  const toggleGroup = (groupName) => {
    setExpandedGroups((prev) => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  // Fonction pour basculer l'affichage des liens
  const toggleLinkPreview = (groupName) => {
    setShowLinkPreviews((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
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
    setThemeSaving((s) => ({ ...s, [groupName]: "idle" }));
  };

  const persistTheme = async (groupName) => {
    if (!tenantId || !activeCampaign) return;
    const value = themeDrafts[groupName] ?? "";
    try {
      setThemeSaving((s) => ({ ...s, [groupName]: "saving" }));
      await setThemeForGroup(tenantId, activeCampaign._id, groupName, value);
      setThemeSaving((s) => ({ ...s, [groupName]: "saved" }));
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
      <aside className="w-full md:w-80 bg-white rounded-xl shadow-sm p-5 flex flex-col">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl mr-10  font-semibold text-gray-800">
            Campagnes
          </h2>
          <button
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 transition-colors shadow-sm hover:shadow-md"
            onClick={() => setShowCreate(true)}
          >
            <FiPlus size={16} />
            <span>Nouvelle</span>
          </button>
        </div>

        <div className="space-y-3 overflow-auto flex-grow">
          {campaignStats.map((c) => (
            <div key={c._id} className="flex items-start gap-2">
              <input
                type="checkbox"
                className="mt-1 cursor-pointer"
                checked={isBatchSelected(c._id)}
                onChange={() => toggleSelectBatch(c._id)}
                onClick={(e) => e.stopPropagation()}
              />
              <div className="flex-1">
                <CampaignStats
                  campaign={c}
                  isActive={c._id === activeId}
                  onClick={() => tenantId && setActive(tenantId, c._id)}
                />
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
            {selectedBatchIds.size > 0 && (
              <div className="mt-3">
                <button
                  className="w-full mt-2 text-gray-500 hover:text-gray-700 text-sm"
                  onClick={clearBatchSelection}
                >
                  Annuler la sélection
                </button>
              </div>
            )}
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
          departments={departments}
        />

        {!activeCampaign && <EmptyStateNoCampaign />}

        {activeCampaign && (
          <div className="space-y-4">
            {groups.map(([groupName, rows]) => {
              const isExpanded = expandedGroups[groupName] !== false;
              const draftValue =
                themeDrafts[groupName] ?? campaignThemes[groupName] ?? "";
              const saveState = themeSaving[groupName] || "idle";
              const campaignSentMap = sentMap[activeCampaign._id] || {};
              const sentCount = rows.filter(
                (row) => campaignSentMap[row._id]
              ).length;
              const progress = Math.round(
                (sentCount / Math.max(rows.length, 1)) * 100
              );
              const isPreviewing = showLinkPreviews[groupName];

              return (
                <section
                  key={groupName}
                  className="bg-white rounded-xl shadow-sm overflow-hidden"
                >
                  {/* En-tête du groupe */}
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
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-gray-500">
                              {rows.length} employé(s)
                            </span>
                            <span className="text-sm text-green-600">
                              {sentCount} envoyé(s)
                            </span>
                            <span className="text-sm text-blue-600">
                              {progress}% complété
                            </span>
                          </div>
                          <div className="w-32 mt-1">
                            <ProgressBar progress={progress} size="sm" />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Champ de thème avec indicateur de statut */}
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-2">
                            <input
                              className="w-56 border border-gray-200 rounded-lg px-3 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="Thème de la semaine…"
                              value={draftValue}
                              onChange={(e) =>
                                handleThemeChange(groupName, e.target.value)
                              }
                              onBlur={() => persistTheme(groupName)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                persistTheme(groupName);
                              }}
                              className="p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                              title="Sauvegarder le thème"
                            >
                              <FiSave size={16} />
                            </button>
                          </div>
                          <StatusIndicator status={saveState} />
                        </div>

                        {/* Actions de groupe */}
                        <GroupActions
                          onSelectAll={() => {
                            bulkSetGroupSent(
                              tenantId,
                              activeCampaign._id,
                              rows.map((r) => r._id),
                              true
                            );
                          }}
                          onDeselectAll={() => {
                            bulkSetGroupSent(
                              tenantId,
                              activeCampaign._id,
                              rows.map((r) => r._id),
                              false
                            );
                          }}
                          onPreview={(e) => {
                            e.stopPropagation();
                            toggleLinkPreview(groupName);
                          }}
                          isPreviewing={isPreviewing}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Liste des employés (contenu expandable) */}
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
                              {isPreviewing && <Th>Lien de tracking</Th>}
                              <Th>Actions</Th>
                            </tr>
                          </thead>
                          <tbody>
                            {rows.map((e) => {
                              const checked =
                                !!sentMap[activeCampaign._id]?.[e._id];
                              const url =
                                trackingLinks[activeCampaign._id]?.[e._id];
                              const isCopied =
                                !!copiedMap[activeCampaign._id]?.[e._id];

                              return (
                                <tr
                                  key={e._id}
                                  className="border-t hover:bg-gray-50 transition-colors group"
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
                                          className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${
                                            checked
                                              ? "bg-blue-500 border-blue-500"
                                              : "border-gray-300 group-hover:border-blue-300"
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
                                  {isPreviewing && (
                                    <Td>
                                      {url ? (
                                        <div className="flex items-center gap-2">
                                          <FiLink
                                            size={12}
                                            className="text-gray-400"
                                          />
                                          <span className="text-xs font-mono text-gray-600 truncate max-w-[120px]">
                                            {url.split("/").pop()}
                                          </span>
                                        </div>
                                      ) : (
                                        <span className="text-gray-400 text-xs">
                                          —
                                        </span>
                                      )}
                                    </Td>
                                  )}
                                  <Td>
                                    <div className="flex items-center gap-2">
                                      <button
                                        className={`p-1.5 rounded-lg transition-colors ${
                                          isCopied
                                            ? "text-green-600 bg-green-50"
                                            : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                                        }`}
                                        disabled={!url || isCopied}
                                        onClick={async () => {
                                          if (!url) return;
                                          const ok = await copyToClipboard(url);
                                          if (ok) {
                                            markLinkCopied(
                                              activeCampaign._id,
                                              e._id,
                                              url.split("/").pop()
                                            );
                                          }
                                        }}
                                        title="Copier le lien de tracking"
                                      >
                                        {isCopied ? (
                                          <FiCheckCircle size={16} />
                                        ) : (
                                          <FiCopy size={16} />
                                        )}
                                      </button>
                                    </div>
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
