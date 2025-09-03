import React, { useEffect, useMemo, useState } from "react";
import { useTenantStore } from "../../store/useTenantStore";
import { useEmployeesStore } from "../../store/useEmployeesStore";
import { useCampaignsStore } from "../../store/useCampaignsStore";
import {
  FiPlus,
  FiTrash2,
  FiCheck,
  FiX,
  FiUsers,
  FiMail,
  FiChevronDown,
  FiChevronUp,
  FiSave,
  FiCopy,
  FiCheckCircle,
  FiLink,
  FiRefreshCw,
} from "react-icons/fi";
import Toolbar from "./components/Toolbar";
import StatusIndicator from "./components/StatusIndicator";
import GroupActions from "./components/GroupActions";
import CampaignStats from "./components/CampaignStats";
import ProgressBar from "./components/ProgressBar";
import ScenarioDropdown from "./components/ScenarioDropdown";
import EmptyStateNoCampaign from "./components/EmptyStateNoCampaign";
import EmptyStateNoEmployees from "./components/EmptyStateNoEmployees";
import Modal from "./components/Modal";
import BlockingSpinner from "./components/BlockingSpinner";
import ToastError from "./components/ToastError";
import { Th, Td } from "./components/TableCells";

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
    setScenarioForGroup,
    addCampaign,
    removeCampaign,
    sentMap = {},
    themesByGroup = {},
    groupConfigs = {},
    bulkSetGroupSent,
    copiedMap = {},
    markLinkCopied,
    trackingLinks = {},
    fetchTrackingLinks,
    scenarioUsageByEmployee,
    fetchScenarioUsage,
    emailTemplatesByCampaign = {},
    attachmentsByCampaign = {},
    fetchAttachments,
    uploadAttachment,
    deleteAttachment,
    renderMjml,
    saveMjml,
    brands,
    identities,
    fetchBrands,
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
  const [scenarioDrafts, setScenarioDrafts] = useState({}); // { [groupName]: { id, category } }
  const [themeSaving, setThemeSaving] = useState({});
  const [brandDrafts, setBrandDrafts] = useState({}); // { [groupName]: brandId }
  const [identityDrafts, setIdentityDrafts] = useState({}); // { [groupName]: identityJson }
  // MJML UI state
  const [mjmlDrafts, setMjmlDrafts] = useState({}); // { [groupName]: string }
  const [previewHtml, setPreviewHtml] = useState({}); // { [groupName]: string }
  const [activeView, setActiveView] = useState({}); // { [groupName]: 'editor' | 'preview' }
  const [mjmlErrors, setMjmlErrors] = useState({}); // { [groupName]: array|string }
  const [mjmlOpen, setMjmlOpen] = useState({}); // { [groupName]: boolean }
  const [aiLoading, setAiLoading] = useState({}); // { [groupName]: boolean }
  const [aiError, setAiError] = useState({}); // { [groupName]: string }
  const [mjmlCopied, setMjmlCopied] = useState({}); // { [groupName]: boolean }
  const [seedDrafts, setSeedDrafts] = useState({}); // { [groupName]: number }
  const [designDrafts, setDesignDrafts] = useState({}); // { [groupName]: 'sobre'|'institutionnel'|'saas'|'marketing'|'plain' }
  // Attachments UX state
  const [dragOverGroup, setDragOverGroup] = useState(null); // groupName | null
  const [uploadingGroup, setUploadingGroup] = useState(null); // groupName | null
  const [uploadError, setUploadError] = useState({}); // { [groupName]: string }

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
    fetchBrands();
  }, [fetchTenants, fetchBrands]);

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

  useEffect(() => {
    if (!tenantId || employees.length === 0) return;
    fetchScenarioUsage(
      tenantId,
      employees.map((e) => e._id)
    );
  }, [tenantId, employees, fetchScenarioUsage]);

  // thèmes actuels de la campagne (venant du store → Mongo)
  const campaignThemes = useMemo(() => {
    if (!activeCampaign) return {};
    return (themesByGroup && themesByGroup[activeCampaign._id]) || {};
  }, [themesByGroup, activeCampaign]);

  // configs actuelles (scenarioId/category/theme) de la campagne
  const campaignGroupConfigs = useMemo(() => {
    if (!activeCampaign) return {};
    return (groupConfigs && groupConfigs[activeCampaign._id]) || {};
  }, [groupConfigs, activeCampaign]);

  const emailTemplatesForCampaign = useMemo(() => {
    if (!activeCampaign) return {};
    return emailTemplatesByCampaign?.[activeCampaign._id] || {};
  }, [activeCampaign, emailTemplatesByCampaign]);

  const attachmentsForCampaign = useMemo(() => {
    if (!activeCampaign) return {};
    return attachmentsByCampaign?.[activeCampaign._id] || {};
  }, [activeCampaign, attachmentsByCampaign]);

  const formatBytes = (n) => {
    const x = Number(n || 0);
    if (x < 1024) return `${x} o`;
    if (x < 1024*1024) return `${(x/1024).toFixed(1)} Ko`;
    if (x < 1024*1024*1024) return `${(x/1024/1024).toFixed(1)} Mo`;
    return `${(x/1024/1024/1024).toFixed(1)} Go`;
  };
  const iconForExt = (name = "") => {
    const ext = String(name).toLowerCase().split(".").pop();
    if (ext === 'pdf') return '📄';
    if (ext === 'doc' || ext === 'docx') return '📝';
    if (ext === 'xls' || ext === 'xlsx' || ext === 'csv') return '📊';
    if (ext === 'ppt' || ext === 'pptx') return '📈';
    return '📎';
  };

  // quand on change de campagne, on recharge le buffer local avec les valeurs persistées
  useEffect(() => {
    if (!activeCampaign) return;
    setThemeDrafts({ ...(campaignThemes || {}) });
    // Init scénarios depuis les configs
    const sc = {};
    const nextBrands = {};
    const nextIdentities = {};
    const cfg = campaignGroupConfigs || {};
    for (const [g, v] of Object.entries(cfg)) {
      if (v && (v.scenarioId || v.category))
        sc[g] = { id: v.scenarioId || "", category: v.category || "" };
      if (v && v.brandId) nextBrands[g] = v.brandId;
      if (v && v.identity) {
        try {
          nextIdentities[g] = JSON.stringify(v.identity);
        } catch {}
      }
    }
    setScenarioDrafts(sc);
    setBrandDrafts(nextBrands);
    setIdentityDrafts(nextIdentities);
    setThemeSaving({}); // reset des états de sauvegarde
    // Précharger brouillons MJML et previews depuis le store
    const tpls =
      useCampaignsStore.getState().emailTemplatesByCampaign?.[
        activeCampaign._id
      ] || {};
    const nextMjml = {};
    const nextHtml = {};
    for (const k of Object.keys(tpls)) {
      nextMjml[k] = tpls[k]?.mjmlSource || "";
      nextHtml[k] = tpls[k]?.htmlRendered || "";
    }
    setMjmlDrafts(nextMjml);
    setPreviewHtml(nextHtml);
    setActiveView({});
    setMjmlErrors({});
  }, [activeCampaign, campaignThemes, campaignGroupConfigs]);

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
    setExpandedGroups((prev) => {
      const next = !prev[groupName];
      // when expanding, fetch attachments list once
      if (next && tenantId && activeCampaign?._id) {
        fetchAttachments(tenantId, activeCampaign._id, groupName).catch(() => {});
      }
      return { ...prev, [groupName]: next };
    });
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

  const handleScenarioChange = (groupName, val) => {
    setScenarioDrafts((d) => ({
      ...d,
      [groupName]: val || { id: "", category: "" },
    }));
    setThemeSaving((s) => ({ ...s, [groupName]: "idle" }));
  };

  const persistGroupConfig = async (groupName) => {
    if (!tenantId || !activeCampaign) return;
    const theme = themeDrafts[groupName] ?? "";
    const sc = scenarioDrafts[groupName] || {};
    const brandId = brandDrafts[groupName] || undefined;
    let identity;
    try {
      identity = identityDrafts[groupName]
        ? JSON.parse(identityDrafts[groupName])
        : undefined;
    } catch {}
    const payload = {
      theme,
      scenarioId: sc.id || undefined,
      category: sc.category || undefined,
      brandId,
      identity,
    };
    try {
      setThemeSaving((s) => ({ ...s, [groupName]: "saving" }));
      await setScenarioForGroup(
        tenantId,
        activeCampaign._id,
        groupName,
        payload
      );
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
      <main className="flex-1 min-w-0 overflow-x-hidden">
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
          <div className="space-y-4 min-w-0">
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
              const tpl = emailTemplatesForCampaign[groupName] || {};
              const tplSavedAt = tpl.updatedAt ? new Date(tpl.updatedAt) : null;
              const hasTpl = !!tpl.htmlRendered;

              return (
                <section
                  key={groupName}
                  className="bg-white rounded-xl shadow-sm overflow-hidden min-w-0"
                >
                  {/* En-tête du groupe */}
                  <div
                    className="p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleGroup(groupName)}
                  >
                    <div className="flex items-start lg:items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-start lg:items-center gap-3 min-w-0">
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
                        <div className="min-w-0">
                          <h3 className="font-medium text-gray-900">
                            {groupName}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                              <FiUsers /> {rows.length} employé(s)
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                              <FiMail /> {sentCount} envoyé(s)
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                              <FiCheckCircle /> {progress}% complété
                            </span>
                          </div>
                          <div className="w-40 mt-1">
                            <ProgressBar progress={progress} size="sm" />
                          </div>
                        </div>
                      </div>

                      <div
                        className="flex items-center gap-3 flex-wrap justify-end max-w-full"
                        onClick={(e) => e.stopPropagation()}
                      >
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

                  {/* Bandeau configuration du groupe (affiché quand développé) */}
                  {isExpanded && (
                    <div
                      className="px-4 pt-3 pb-2 bg-gray-50 border-b"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="grid gap-3 md:grid-cols-2 items-start">
                        {/* Choix du scénario */}
                        <div className="min-w-0">
                          {(() => {
                            const usedSet = new Set();
                            for (const emp of rows) {
                              const list =
                                scenarioUsageByEmployee?.[emp._id] || [];
                              for (const sid of list) usedSet.add(sid);
                            }
                            return (
                              <ScenarioDropdown
                                value={scenarioDrafts[groupName] || null}
                                onChange={(val) =>
                                  handleScenarioChange(groupName, val)
                                }
                                usedScenarioIds={usedSet}
                              />
                            );
                          })()}
                          {(() => {
                            const selectedScenarioId =
                              scenarioDrafts[groupName]?.id ||
                              campaignGroupConfigs[groupName]?.scenarioId ||
                              "";
                            if (!selectedScenarioId) return null;
                            const alreadyCount = rows.filter((emp) =>
                              (
                                scenarioUsageByEmployee?.[emp._id] || []
                              ).includes(selectedScenarioId)
                            ).length;
                            const text =
                              alreadyCount > 0
                                ? `${alreadyCount}/${rows.length} ont déjà reçu ce scénario`
                                : `Nouveau scénario pour ce groupe`;
                            return (
                              <div className="mt-2 space-y-2">
                                <div
                                  className={`text-xs inline-flex items-center px-2 py-0.5 rounded-full ${
                                    alreadyCount > 0
                                      ? "bg-orange-100 text-orange-700"
                                      : "bg-green-100 text-green-700"
                                  }`}
                                >
                                  {text}
                                </div>
                                <div className="text-xs text-blue-700">
                                  Template :{" "}
                                  {hasTpl ? "✓ enregistré" : "—"}
                                  {tplSavedAt && hasTpl
                                    ? ` (maj: ${tplSavedAt.toLocaleDateString()} ${tplSavedAt.toLocaleTimeString()})`
                                    : ""}
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                        {/* Thème + sauvegarde */}
                        <div className="flex items-center gap-2 flex-wrap md:justify-end">
                          <input
                            className="w-full md:w-auto border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Thème…"
                            value={draftValue}
                            onChange={(e) =>
                              handleThemeChange(groupName, e.target.value)
                            }
                            onBlur={() => persistGroupConfig(groupName)}
                          />
                          {/* Brand selector */}
                          <div className="flex items-center gap-2">
                            <select
                              className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm max-w-[260px]"
                              value={brandDrafts[groupName] || ""}
                              onChange={(e) => {
                                const v = e.target.value || "";
                                setBrandDrafts((s) => ({
                                  ...s,
                                  [groupName]: v,
                                }));
                                setThemeSaving((s) => ({
                                  ...s,
                                  [groupName]: "idle",
                                }));
                              }}
                            >
                              <option value="">Brand…</option>
                              {(() => {
                                const pools = new Map();
                                (brands || []).forEach((b) => {
                                  const pool = b.pool || "Divers";
                                  if (!pools.has(pool)) pools.set(pool, []);
                                  pools.get(pool).push(b);
                                });
                                return Array.from(pools.entries()).map(
                                  ([pool, arr]) => (
                                    <optgroup key={pool} label={pool}>
                                      {arr.map((b) => (
                                        <option
                                          key={b.id || b._id || b.slug}
                                          value={b.id || b._id || b.slug}
                                        >
                                          {b.displayName || b.name}
                                        </option>
                                      ))}
                                    </optgroup>
                                  )
                                );
                              })()}
                            </select>
                            {(() => {
                              const selId =
                                brandDrafts[groupName] ||
                                campaignGroupConfigs[groupName]?.brandId;
                              const b = (brands || []).find(
                                (x) =>
                                  String(x.id || x._id || x.slug) ===
                                  String(selId)
                              );
                              if (!b || !b.logoUrl) return null;
                              return (
                                <img
                                  src={b.logoUrl}
                                  alt={b.displayName || b.name}
                                  className="w-6 h-6 rounded"
                                />
                              );
                            })()}
                          </div>
                          {/* Identity selector */}
                          <div className="flex items-center gap-2">
                            <select
                              className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm max-w-[260px]"
                              value={identityDrafts[groupName] || ""}
                              onChange={(e) => {
                                const v = e.target.value || "";
                                setIdentityDrafts((s) => ({
                                  ...s,
                                  [groupName]: v,
                                }));
                                setThemeSaving((s) => ({
                                  ...s,
                                  [groupName]: "idle",
                                }));
                              }}
                            >
                              <option value="">Identity…</option>
                              {(identities || []).map((id, idx) => (
                                <option key={idx} value={JSON.stringify(id)}>
                                  {(id.firstName || "") +
                                    " " +
                                    (id.lastName || "")}{" "}
                                  {id.role ? `— ${id.role}` : ""}
                                </option>
                              ))}
                            </select>
                          </div>
                          <button
                            onClick={() => persistGroupConfig(groupName)}
                            className="px-3 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                            title="Sauvegarder la configuration"
                          >
                            <span className="inline-flex items-center gap-1">
                              <FiSave /> Sauver
                            </span>
                          </button>
                          <StatusIndicator status={saveState} />
                        </div>
                      </div>

                      {/* Attachments moved under MJML editor/preview panel */}
                    </div>
                  )}

                  {/* MJML panel moved below recap banner */}
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

                      {(() => {
                        const selectedScenarioId =
                          scenarioDrafts[groupName]?.id ||
                          campaignGroupConfigs[groupName]?.scenarioId ||
                          "";
                        const hasTheme = Boolean(
                          draftValue && draftValue.trim()
                        );
                        const hasScenario = Boolean(selectedScenarioId);
                        if (!hasTheme && !hasScenario) return null;
                        return (
                          <div
                            className="p-3 text-sm bg-blue-50 text-blue-800 border-t flex items-center justify-between cursor-pointer flex-wrap gap-2 overflow-x-hidden"
                            role="button"
                            aria-expanded={!!mjmlOpen[groupName]}
                            onClick={() =>
                              setMjmlOpen((s) => ({
                                ...s,
                                [groupName]: !s[groupName],
                              }))
                            }
                            title="Afficher/Masquer le panneau MJML"
                          >
                            <div className="flex-1 min-w-0 overflow-hidden break-words">
                              {hasScenario && (
                                <>
                                  <span className="font-medium">Scénario:</span>{" "}
                                  <span className="font-mono break-all">
                                    {selectedScenarioId}
                                  </span>
                                </>
                              )}
                              {hasScenario && hasTheme && (
                                <span className="mx-2 text-blue-400">•</span>
                              )}
                              {hasTheme && (
                                <>
                                  <span className="font-medium">Thème:</span>{" "}
                                  <span className="break-words inline-block max-w-full align-middle">{draftValue}</span>
                                </>
                              )}
                            </div>
                            <div className="ml-3 flex-shrink-0">
                              {mjmlOpen[groupName] ? (
                                <FiChevronUp />
                              ) : (
                                <FiChevronDown />
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      {/* MJML panel rendered after recap banner */}
                      {mjmlOpen[groupName] && (
                        <div
                          className="px-4 py-3 bg-gray-50 border-t overflow-x-hidden break-words"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <button
                              className={`px-3 py-1.5 text-xs rounded ${
                                (activeView[groupName] || "editor") === "editor"
                                  ? "bg-blue-600 text-white"
                                  : "bg-white border text-gray-700"
                              }`}
                              onClick={() =>
                                setActiveView((s) => ({
                                  ...s,
                                  [groupName]: "editor",
                                }))
                              }
                            >
                              Édition HTML
                            </button>
                            <button
                              className={`px-3 py-1.5 text-xs rounded ${
                                (activeView[groupName] || "editor") ===
                                "preview"
                                  ? "bg-blue-600 text-white"
                                  : "bg-white border text-gray-700"
                              }`}
                              onClick={() =>
                                setActiveView((s) => ({
                                  ...s,
                                  [groupName]: "preview",
                                }))
                              }
                            >
                              Aperçu
                            </button>
                            <div className="ml-auto flex items-center gap-2 flex-wrap">
                              <button
                                className="px-3 py-1.5 text-xs rounded bg-blue-100 text-blue-800 hover:bg-blue-200"
                                onClick={async () => {
                                  try {
                                    const src =
                                      mjmlDrafts[groupName] ??
                                      (tpl.mjmlSource || "");
                                    const out = await renderMjml(
                                      tenantId,
                                      activeCampaign._id,
                                      groupName,
                                      src
                                    );
                                    setPreviewHtml((p) => ({
                                      ...p,
                                      [groupName]: out.html || "",
                                    }));
                                    setMjmlErrors((e) => ({
                                      ...e,
                                      [groupName]: out.errors || [],
                                    }));
                                    setActiveView((s) => ({
                                      ...s,
                                      [groupName]: "preview",
                                    }));
                                  } catch (e) {
                                    setMjmlErrors((m) => ({
                                      ...m,
                                      [groupName]: [
                                        e.message || "Erreur rendu MJML",
                                      ],
                                    }));
                                  }
                                }}
                              >
                                Prévisualiser
                              </button>
                              <button
                                className="px-3 py-1.5 text-xs rounded bg-blue-600 text-white hover:bg-blue-700"
                                onClick={async () => {
                                  try {
                                    let html = previewHtml[groupName] || "";
                                    const src =
                                      mjmlDrafts[groupName] ??
                                      (tpl.mjmlSource || "");
                                    if (!html) {
                                      const out = await renderMjml(
                                        tenantId,
                                        activeCampaign._id,
                                        groupName,
                                        src
                                      );
                                      html = out.html || "";
                                      setPreviewHtml((p) => ({
                                        ...p,
                                        [groupName]: html,
                                      }));
                                      setMjmlErrors((e) => ({
                                        ...e,
                                        [groupName]: out.errors || [],
                                      }));
                                    }
                                    await saveMjml(
                                      tenantId,
                                      activeCampaign._id,
                                      groupName,
                                      src,
                                      html,
                                      {
                                        brandId: brandDrafts[groupName] || campaignGroupConfigs[groupName]?.brandId || undefined,
                                        identity: (function(){ try { return identityDrafts[groupName] ? JSON.parse(identityDrafts[groupName]) : undefined; } catch { return undefined; }})(),
                                        seed: seedDrafts[groupName] ?? 0,
                                        designVariant: designDrafts[groupName] || undefined,
                                      }
                                    );
                                    alert("Template enregistré");
                                  } catch (e) {
                                    alert(
                                      e.message || "Erreur enregistrement MJML"
                                    );
                                  }
                                }}
                              >
                                Enregistrer
                              </button>
                            </div>
                          </div>
                          {(activeView[groupName] || "editor") === "editor" && (
                            <div>
                              <div className="flex items-center gap-2 mb-2 text-xs text-gray-600">
                                <span>Scénario:</span>
                                <span className="font-mono">
                                  {scenarioDrafts[groupName]?.id ||
                                    campaignGroupConfigs[groupName]
                                      ?.scenarioId ||
                                    "—"}
                                </span>
                                <span className="mx-2 text-gray-300">•</span>
                                <span>Locale: fr</span>
                              </div>
                              <div className="flex items-center gap-2 mb-2">
                                <button
                                  className="px-3 py-1.5 text-xs rounded bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60"
                                  disabled={!!aiLoading[groupName]}
                                  onClick={async () => {
                                    setAiError((e) => ({
                                      ...e,
                                      [groupName]: "",
                                    }));
                                    setAiLoading((s) => ({
                                      ...s,
                                      [groupName]: true,
                                    }));
                                    try {
                                      const sid =
                                        scenarioDrafts[groupName]?.id ||
                                        campaignGroupConfigs[groupName]
                                          ?.scenarioId ||
                                        "";
                                      if (!sid)
                                        throw new Error(
                                          "Sélectionne d’abord un scénario"
                                        );
                                      const actionUrl =
                                        "https://example.com/action";
                                      const brandId =
                                        brandDrafts[groupName] ||
                                        campaignGroupConfigs[groupName]
                                          ?.brandId ||
                                        undefined;
                                      let identity;
                                      try {
                                        identity = identityDrafts[groupName]
                                          ? JSON.parse(
                                              identityDrafts[groupName]
                                            )
                                          : undefined;
                                      } catch {}
                                      const mj = await useCampaignsStore
                                        .getState()
                                        .generateMjml(
                                          tenantId,
                                          activeCampaign._id,
                                          groupName,
                                          {
                                            scenarioId: sid,
                                            brandId,
                                            identity,
                                            locale: "fr",
                                            tone: "formal",
                                            ctaLabel:
                                              "Confirmer la mise à jour",
                                            actionUrl,
                                            seed: seedDrafts[groupName] ?? 0,
                                            designVariant: designDrafts[groupName] || undefined,
                                            fallbackLogoUrl:
                                              "https://via.placeholder.com/120x40?text=Logo",
                                          }
                                        );
                                      setMjmlDrafts((s) => ({
                                        ...s,
                                        [groupName]: mj,
                                      }));
                                      setActiveView((v) => ({
                                        ...v,
                                        [groupName]: "editor",
                                      }));
                                    } catch (e) {
                                      setAiError((er) => ({
                                        ...er,
                                        [groupName]:
                                          e.message || "Échec génération IA",
                                      }));
                                      alert(
                                        `Échec génération IA: ${
                                          e.message || ""
                                        }`
                                      );
                                    } finally {
                                      setAiLoading((s) => ({
                                        ...s,
                                        [groupName]: false,
                                      }));
                                    }
                                  }}
                                >
                                  {aiLoading[groupName]
                                    ? "Génération…"
                                    : "Générer avec IA"}
                                </button>
                                <select
                                  className="px-2 py-1.5 text-xs rounded border text-gray-700"
                                  value={designDrafts[groupName] || ''}
                                  onChange={(e) => setDesignDrafts((s) => ({ ...s, [groupName]: e.target.value }))}
                                  title="Style du courriel"
                                >
                                  <option value="">Style (auto)</option>
                                  <option value="sobre">Sobre</option>
                                  <option value="institutionnel">Institutionnel</option>
                                  <option value="saas">SaaS / Startup</option>
                                  <option value="marketing">Marketing B2B</option>
                                  <option value="plain">Texte simple</option>
                                </select>
                                <button
                                  type="button"
                                  className="p-2 rounded border border-gray-200 text-gray-600 hover:text-blue-700 hover:border-blue-400"
                                  aria-label="Copier le MJML"
                                  title="Copier le MJML"
                                  onClick={async () => {
                                    const src =
                                      mjmlDrafts[groupName] ??
                                      (tpl.mjmlSource || "");
                                    const ok = await copyToClipboard(src);
                                    if (ok) {
                                      setMjmlCopied((m) => ({
                                        ...m,
                                        [groupName]: true,
                                      }));
                                      setTimeout(() => {
                                        setMjmlCopied((m) => ({
                                          ...m,
                                          [groupName]: false,
                                        }));
                                      }, 1200);
                                    }
                                  }}
                                >
                                  {mjmlCopied[groupName] ? (
                                    <FiCheckCircle
                                      size={14}
                                      className="text-green-600"
                                    />
                                  ) : (
                                    <FiCopy size={14} />
                                  )}
                                </button>
                                <button
                                  type="button"
                                  className="px-2 py-1.5 text-xs rounded border text-gray-700 hover:bg-gray-50 flex items-center gap-1"
                                  title="Régénérer (seed +1)"
                                  onClick={async () => {
                                    const sid =
                                      scenarioDrafts[groupName]?.id ||
                                      campaignGroupConfigs[groupName]?.scenarioId || '';
                                    if (!sid) return alert('Sélectionne d’abord un scénario');
                                    const nextSeed = (seedDrafts[groupName] ?? 0) + 1;
                                    setSeedDrafts((s) => ({ ...s, [groupName]: nextSeed }));
                                    setAiLoading((s) => ({ ...s, [groupName]: true }));
                                    try {
                                      const brandId = brandDrafts[groupName] || campaignGroupConfigs[groupName]?.brandId || undefined;
                                      let identity;
                                      try { identity = identityDrafts[groupName] ? JSON.parse(identityDrafts[groupName]) : undefined; } catch {}
                                      const actionUrl = 'https://example.com/action';
                                      const mj = await useCampaignsStore.getState().generateMjml(
                                        tenantId,
                                        activeCampaign._id,
                                        groupName,
                                        {
                                          scenarioId: sid,
                                          brandId,
                                          identity,
                                          locale: 'fr',
                                          tone: 'formal',
                                          ctaLabel: 'Confirmer la mise à jour',
                                          actionUrl,
                                          seed: nextSeed,
                                          designVariant: designDrafts[groupName] || undefined,
                                          fallbackLogoUrl: 'https://via.placeholder.com/120x40?text=Logo',
                                        }
                                      );
                                      setMjmlDrafts((s) => ({ ...s, [groupName]: mj }));
                                      setActiveView((v) => ({ ...v, [groupName]: 'editor' }));
                                    } catch (e) {
                                      alert(e.message || 'Échec régénération');
                                    } finally {
                                      setAiLoading((s) => ({ ...s, [groupName]: false }));
                                    }
                                  }}
                                >
                                  <FiRefreshCw />
                                  <span>Régénérer</span>
                                </button>
                                {aiError[groupName] && (
                                  <span className="text-xs text-red-600">
                                    {aiError[groupName]}
                                  </span>
                                )}
                              </div>
                              <textarea
                                className="w-full h-56 border rounded-lg p-3 font-mono text-xs leading-5"
                                placeholder="Collez ici votre HTML (ou MJML)…"
                                value={
                                  mjmlDrafts[groupName] ??
                                  (tpl.mjmlSource || "")
                                }
                                onChange={(e) =>
                                  setMjmlDrafts((s) => ({
                                    ...s,
                                    [groupName]: e.target.value,
                                  }))
                                }
                              />
                              {Array.isArray(mjmlErrors[groupName]) &&
                                mjmlErrors[groupName].length > 0 && (
                                  <div className="mt-2 p-2 bg-orange-50 text-orange-800 text-xs rounded">
                                    <div className="font-medium mb-1">
                                      Erreurs MJML:
                                    </div>
                                    <ul className="list-disc pl-5">
                                      {mjmlErrors[groupName].map((er, idx) => (
                                        <li key={idx}>
                                          {typeof er === "string"
                                            ? er
                                            : JSON.stringify(er)}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                            </div>
                          )}
                          {(activeView[groupName] || "editor") === "preview" && (
                            <div className="border rounded-lg overflow-hidden">
                              {/* Attachments summary for preview (no inline rendering, just list) */}
                              {Array.isArray(attachmentsForCampaign[groupName]) && attachmentsForCampaign[groupName].length > 0 && (
                                <div className="px-3 py-2 bg-amber-50 border-b text-sm text-amber-900 flex items-center gap-2 flex-wrap">
                                  <span>Pièces jointes liées au thème:</span>
                                  {attachmentsForCampaign[groupName].map((att) => (
                                    <a key={att.filename} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border hover:bg-amber-100" href={att.url} target="_blank" rel="noreferrer" title="Ouvrir dans un nouvel onglet">
                                      <span>{iconForExt(att.originalName || att.filename)}</span>
                                      <span className="truncate max-w-[160px]">{att.originalName || att.filename}</span>
                                      <span className="text-xs text-gray-500">{formatBytes(att.size)}</span>
                                    </a>
                                  ))}
                                </div>
                              )}
                              <iframe
                                title={`preview-${groupName}`}
                                className="w-full min-h-[360px] bg-white"
                                sandbox="allow-same-origin allow-scripts"
                                srcDoc={
                                  previewHtml[groupName] ||
                                  '<p style="padding:16px;color:#666">Aucune prévisualisation encore…</p>'
                                }
                              />
                            </div>
                          )}
                          {/* Attachments (upload + list) positioned below MJML editor/preview */}
                          <div className="mt-3 p-3 border rounded bg-white">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-sm font-medium text-gray-700">Pièces jointes (PDF/DOCX/XLSX…)</div>
                              <div className="text-xs text-gray-500">Max 10 Mo</div>
                            </div>
                            <div
                              className={`mb-3 border-2 rounded-lg p-4 text-center cursor-pointer transition max-w-full ${
                                dragOverGroup === groupName ? 'border-blue-500 bg-blue-50' : 'border-dashed border-gray-300 hover:border-blue-300'
                              }`}
                              onDragOver={(e) => { e.preventDefault(); setDragOverGroup(groupName); }}
                              onDragLeave={() => setDragOverGroup(null)}
                              onDrop={(e) => {
                                e.preventDefault();
                                setDragOverGroup(null);
                                const f = e.dataTransfer.files?.[0];
                                if (!f) return;
                                (async () => {
                                  if (f.size > 10*1024*1024) { setUploadError((m)=>({...m,[groupName]: 'Fichier > 10 Mo'})); return; }
                                  setUploadingGroup(groupName);
                                  setUploadError((m)=>({...m,[groupName]: ''}));
                                  const reader = new FileReader();
                                  reader.onload = async () => {
                                    try {
                                      await uploadAttachment(tenantId, activeCampaign._id, groupName, { name: f.name, type: f.type, dataUrl: String(reader.result||'') });
                                    } catch (err) {
                                      setUploadError((m)=>({...m,[groupName]: err.message || 'Échec upload'}));
                                    } finally { setUploadingGroup(null); }
                                  };
                                  reader.readAsDataURL(f);
                                })();
                              }}
                              onClick={() => {
                                const inp = document.createElement('input');
                                inp.type = 'file';
                                inp.accept = '.pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                                inp.onchange = (e) => {
                                  const f = e.target.files?.[0];
                                  if (!f) return;
                                  if (f.size > 10*1024*1024) { setUploadError((m)=>({...m,[groupName]: 'Fichier > 10 Mo'})); return; }
                                  setUploadingGroup(groupName);
                                  setUploadError((m)=>({...m,[groupName]: ''}));
                                  const reader = new FileReader();
                                  reader.onload = async () => {
                                    try {
                                      await uploadAttachment(tenantId, activeCampaign._id, groupName, { name: f.name, type: f.type, dataUrl: String(reader.result||'') });
                                    } catch (err) {
                                      setUploadError((m)=>({...m,[groupName]: err.message || 'Échec upload'}));
                                    } finally { setUploadingGroup(null); }
                                  };
                                  reader.readAsDataURL(f);
                                };
                                inp.click();
                              }}
                              title="Cliquer ou glisser un fichier ici"
                            >
                              {uploadingGroup === groupName ? (
                                <div className="text-sm text-blue-700">Téléversement en cours…</div>
                              ) : (
                                <div className="text-sm text-gray-600">Déposez un fichier ici ou cliquez pour choisir</div>
                              )}
                            </div>
                            {uploadError[groupName] && (
                              <div className="text-xs text-red-600 mb-2">{uploadError[groupName]}</div>
                            )}
                            <ul className="divide-y border rounded">
                              {Array.isArray(attachmentsForCampaign[groupName]) && attachmentsForCampaign[groupName].length > 0 ? (
                                attachmentsForCampaign[groupName].map((att) => (
                                  <li key={att.filename} className="flex items-center justify-between px-3 py-2 text-sm">
                                    <div className="min-w-0 flex items-center gap-2">
                                      <span className="shrink-0">{iconForExt(att.originalName || att.filename)}</span>
                                      <a className="text-blue-600 hover:underline truncate" href={att.url} target="_blank" rel="noreferrer">
                                        {att.originalName || att.filename}
                                      </a>
                                      <span className="text-gray-500 text-xs shrink-0">{formatBytes(att.size)}</span>
                                    </div>
                                    <button
                                      className="text-red-600 hover:underline"
                                      onClick={async () => {
                                        if (!confirm('Supprimer cette pièce jointe ?')) return;
                                        try {
                                          await deleteAttachment(tenantId, activeCampaign._id, groupName, att.filename);
                                        } catch (e) {
                                          alert(e.message || 'Suppression impossible');
                                        }
                                      }}
                                    >
                                      Supprimer
                                    </button>
                                  </li>
                                ))
                              ) : (
                                <li className="px-3 py-2 text-sm text-gray-500">Aucune pièce jointe</li>
                              )}
                            </ul>
                          </div>
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

// Th/Td déplacés dans ./components/TableCells
