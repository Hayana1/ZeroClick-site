import React, { useEffect, useMemo, useState } from "react";
import { useTenantStore } from "../../store/useTenantStore";
import { useEmployeesStore } from "../../store/useEmployeesStore";
import {
  FiPlus,
  FiTrash2,
  FiSearch,
  FiUsers,
  FiBriefcase,
  FiMail,
  FiRefreshCw,
  FiEdit,
  FiCheck,
  FiX,
  FiArrowLeft,
  FiArrowRight,
} from "react-icons/fi";

export default function DirectoryPage() {
  const {
    tenants,
    tenantId,
    fetchTenants,
    setTenant,
    createTenant,
    deleteTenant,
  } = useTenantStore();

  const {
    list: employees,
    loading: loadingEmp,
    error: errorEmp,
    fetch: fetchEmployees,
    add: addEmployee,
    remove: removeEmployee,
  } = useEmployeesStore();

  const [tenantForm, setTenantForm] = useState({ name: "", slug: "" });
  const [empForm, setEmpForm] = useState({
    name: "",
    email: "",
    department: "",
  });
  const [q, setQ] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showCreateTenant, setShowCreateTenant] = useState(false);
  const [activeTab, setActiveTab] = useState("employees");

  // Charger tenants au montage
  useEffect(() => {
    fetchTenants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Charger employés quand tenant change
  useEffect(() => {
    if (tenantId) fetchEmployees(tenantId);
  }, [tenantId, fetchEmployees]);

  const activeTenant =
    tenants.find((t) => t._id === tenantId || t.id === tenantId) || null;

  // Recherche + tri employés (visuel stable)
  const filteredEmployees = useMemo(() => {
    let arr = employees;
    if (q.trim()) {
      const qq = q.toLowerCase();
      arr = arr.filter(
        (e) =>
          (e.name || "").toLowerCase().includes(qq) ||
          (e.email || "").toLowerCase().includes(qq) ||
          (e.department || "").toLowerCase().includes(qq)
      );
    }
    return [...arr].sort((a, b) => {
      const d = (a.department || "").localeCompare(b.department || "");
      if (d !== 0) return d;
      return (a.name || "").localeCompare(b.name || "");
    });
  }, [employees, q]);

  // Actions
  const createTenantSubmit = async () => {
    if (!tenantForm.name || !tenantForm.slug)
      return alert("Nom et slug requis");
    await createTenant(tenantForm);
    setTenantForm({ name: "", slug: "" });
    setShowCreateTenant(false);
  };

  const addEmployeeSubmit = async () => {
    if (!tenantId) return alert("Choisis d'abord une entreprise");
    if (!empForm.name || !empForm.email) return alert("Nom et email requis");
    await addEmployee(tenantId, empForm);
    setEmpForm({ name: "", email: "", department: "" });
  };

  const handleDeleteTenant = async (id) => {
    await deleteTenant(id);
    setShowDeleteConfirm(null);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 bg-gray-50 min-h-screen">
      {/* COLONNE ENTREPRISES */}
      <aside className="w-full lg:w-80 bg-white rounded-xl shadow-sm p-5 h-fit lg:sticky lg:top-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold text-gray-800">Entreprises</h2>
          <button
            onClick={() => setShowCreateTenant(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-2 transition-colors"
          >
            <FiPlus size={16} />
            <span>Nouvelle</span>
          </button>
        </div>

        <div className="space-y-3 max-h-[50vh] overflow-auto">
          {tenants.length === 0 && (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
              <FiBriefcase size={24} className="mx-auto mb-2 text-gray-400" />
              <p>Aucune entreprise</p>
              <p className="text-sm mt-1">Créez votre première entreprise</p>
            </div>
          )}
          {tenants.map((t) => (
            <div
              key={t._id}
              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                tenantId === t._id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
              onClick={() => setTenant(t._id)}
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {t.name}
                </div>
                <div className="text-xs text-gray-500 truncate">{t.slug}</div>
              </div>
              <button
                className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(t._id);
                }}
                title="Supprimer"
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1">
        {/* En-tête */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-1">
                Annuaire des employés
              </h2>
              <p className="text-sm text-gray-600">
                Entreprise active :{" "}
                <span className="font-medium text-blue-600">
                  {activeTenant?.name ||
                    activeTenant?.slug ||
                    "Aucune entreprise sélectionnée"}
                </span>
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <FiSearch
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  className="border border-gray-200 rounded-lg pl-10 pr-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                  placeholder="Rechercher un employé..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  disabled={!tenantId}
                />
              </div>

              <button
                className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                onClick={() => tenantId && fetchEmployees(tenantId)}
                disabled={!tenantId}
                title="Rafraîchir la liste"
              >
                <FiRefreshCw size={16} />
                <span>Rafraîchir</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation par onglets */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
              activeTab === "employees"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("employees")}
          >
            <FiUsers className="inline mr-2" />
            Employés ({filteredEmployees.length})
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
              activeTab === "addEmployee"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("addEmployee")}
            disabled={!tenantId}
          >
            <FiPlus className="inline mr-2" />
            Ajouter un employé
          </button>
        </div>

        {/* Formulaire d'ajout d'employé */}
        {activeTab === "addEmployee" && (
          <section className="bg-white rounded-xl shadow-sm p-5 mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Ajouter un nouvel employé
            </h3>

            {!tenantId ? (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
                Veuillez sélectionner une entreprise pour ajouter un employé.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom complet
                  </label>
                  <input
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Jean Dupont"
                    value={empForm.name}
                    onChange={(e) =>
                      setEmpForm({ ...empForm, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="jean.dupont@example.com"
                    type="email"
                    value={empForm.email}
                    onChange={(e) =>
                      setEmpForm({ ...empForm, email: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Département (optionnel)
                  </label>
                  <input
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Ressources Humaines"
                    value={empForm.department}
                    onChange={(e) =>
                      setEmpForm({ ...empForm, department: e.target.value })
                    }
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setActiveTab("employees")}
                className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-50 mr-3 transition-colors"
              >
                <FiArrowLeft size={16} />
                <span>Retour</span>
              </button>
              <button
                onClick={addEmployeeSubmit}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 transition-colors disabled:opacity-50"
                disabled={!tenantId || !empForm.name || !empForm.email}
              >
                <FiCheck size={16} />
                <span>Ajouter l'employé</span>
              </button>
            </div>
          </section>
        )}

        {/* Liste des employés */}
        {activeTab === "employees" && (
          <section className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-800">
                Liste des employés
              </h3>
              <span className="text-sm text-gray-500 bg-gray-100 rounded-full px-3 py-1">
                {filteredEmployees.length} employé(s)
              </span>
            </div>

            {errorEmp && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {errorEmp}
              </div>
            )}

            {!tenantId ? (
              <div className="text-center py-10 text-gray-500">
                <FiUsers size={48} className="mx-auto mb-3 text-gray-400" />
                <p className="text-lg font-medium mb-1">
                  Aucune entreprise sélectionnée
                </p>
                <p>
                  Veuillez sélectionner ou créer une entreprise pour voir ses
                  employés.
                </p>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <FiUsers size={48} className="mx-auto mb-3 text-gray-400" />
                <p className="text-lg font-medium mb-1">Aucun employé trouvé</p>
                <p>
                  {q
                    ? "Aucun résultat pour votre recherche."
                    : "Cette entreprise n'a pas encore d'employés."}
                </p>
                {!q && (
                  <button
                    onClick={() => setActiveTab("addEmployee")}
                    className="mt-4 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 transition-colors"
                  >
                    <FiPlus size={16} />
                    <span>Ajouter le premier employé</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <Th>
                        <FiUsers className="inline mr-1" /> Nom
                      </Th>
                      <Th>
                        <FiMail className="inline mr-1" /> Email
                      </Th>
                      <Th>Département</Th>
                      <Th>Actions</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map((e) => (
                      <tr
                        key={e._id}
                        className="border-t hover:bg-gray-50 transition-colors"
                      >
                        <Td className="font-medium">{e.name}</Td>
                        <Td className="text-gray-700">{e.email}</Td>
                        <Td>
                          {e.department ? (
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                              {e.department}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </Td>
                        <Td>
                          <button
                            onClick={() => removeEmployee(e._id)}
                            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                            title="Supprimer"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {loadingEmp && (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Chargement...</span>
              </div>
            )}
          </section>
        )}
      </main>

      {/* Modal création d'entreprise */}
      {showCreateTenant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                Nouvelle entreprise
              </h3>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de l'entreprise
                </label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="ex: SmartD Technologies"
                  value={tenantForm.name}
                  onChange={(e) =>
                    setTenantForm({ ...tenantForm, name: e.target.value })
                  }
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug (identifiant unique)
                </label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="ex: smartd"
                  value={tenantForm.slug}
                  onChange={(e) =>
                    setTenantForm({ ...tenantForm, slug: e.target.value })
                  }
                />
                <p className="text-xs text-gray-500 mt-1">
                  Utilisé dans les URLs, doit être unique et sans espaces
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-5 bg-gray-50">
              <button
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => {
                  setShowCreateTenant(false);
                  setTenantForm({ name: "", slug: "" });
                }}
              >
                Annuler
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                onClick={createTenantSubmit}
                disabled={!tenantForm.name || !tenantForm.slug}
              >
                Créer l'entreprise
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression d'entreprise */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                Confirmer la suppression
              </h3>
            </div>

            <div className="p-5">
              <p className="text-gray-700">
                Êtes-vous sûr de vouloir supprimer cette entreprise ? Cette
                action supprimera également tous ses employés et campagnes
                associées.
              </p>
            </div>

            <div className="flex justify-end gap-3 p-5 bg-gray-50">
              <button
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Annuler
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                onClick={() => handleDeleteTenant(showDeleteConfirm)}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
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
