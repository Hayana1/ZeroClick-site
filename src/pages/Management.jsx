import React, { useState, useEffect } from "react";
import "./EmailCampaignPlatform.css";

// URL de base de l'API - à modifier selon votre configuration
const API_BASE_URL = "http://localhost:7300/api";

const EmailCampaignPlatform = () => {
  // États pour la gestion des données
  const [employees, setEmployees] = useState([]);
  const [batches, setBatches] = useState([]);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    department: "",
  });
  const [newBatch, setNewBatch] = useState({
    name: "",
    date: "",
    employees: [],
  });
  const [activeTab, setActiveTab] = useState("employees");
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Charger les employés depuis l'API
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/employees`);
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des employés");
      }
      const data = await response.json();
      setEmployees(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Charger les batches depuis l'API
  const fetchBatches = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/batches`);
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des campagnes");
      }
      const data = await response.json();
      setBatches(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    fetchEmployees();
    fetchBatches();
  }, []);

  // Fonctions pour gérer les employés
  const addEmployee = async () => {
    if (newEmployee.name && newEmployee.email) {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/employees`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newEmployee),
        });

        if (!response.ok) {
          throw new Error("Erreur lors de l'ajout de l'employé");
        }

        const addedEmployee = await response.json();
        setEmployees([...employees, addedEmployee]);
        setNewEmployee({ name: "", email: "", department: "" });
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const deleteEmployee = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de l'employé");
      }

      setEmployees(employees.filter((employee) => employee._id !== id));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fonctions pour gérer les batchs
  const createBatch = async () => {
    if (newBatch.name && newBatch.date && newBatch.employees.length > 0) {
      try {
        setLoading(true);

        // Convertir les IDs d'employés en format attendu par le backend
        const batchData = {
          ...newBatch,
          employeeIds: newBatch.employees,
        };

        const response = await fetch(`${API_BASE_URL}/batches`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(batchData),
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la création de la campagne");
        }

        const addedBatch = await response.json();
        setBatches([...batches, addedBatch]);
        setNewBatch({ name: "", date: "", employees: [] });
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const deleteBatch = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/batches/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de la campagne");
      }

      setBatches(batches.filter((batch) => batch._id !== id));
      if (selectedBatch && selectedBatch._id === id) {
        setSelectedBatch(null);
      }
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour obtenir les détails d'un batch
  const getBatchDetails = async (batchId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/batches/${batchId}`);

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des détails de la campagne");
      }

      const batch = await response.json();
      return batch;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour afficher les détails d'un batch
  const showBatchDetails = async (batchId) => {
    const details = await getBatchDetails(batchId);
    if (details) {
      setSelectedBatch(details);
    }
  };

  // Fonction pour générer un lien de tracking
  const generateTrackingLink = (batchId, employeeId, originalUrl) => {
    return `${API_BASE_URL}/clicks/track?batchId=${batchId}&employeeId=${employeeId}&link=${encodeURIComponent(
      originalUrl
    )}`;
  };

  // Rendu du composant
  return (
    <div className="campaign-platform">
      <header className="platform-header">
        <h1>Plateforme de Gestion des Campagnes d'Envoi</h1>
        <p>
          Suivez vos envois de courriels et les interactions de vos employés
        </p>
      </header>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Chargement...</p>
        </div>
      )}

      <nav className="platform-nav">
        <button
          className={activeTab === "employees" ? "active" : ""}
          onClick={() => setActiveTab("employees")}
        >
          Gestion des Employés
        </button>
        <button
          className={activeTab === "batches" ? "active" : ""}
          onClick={() => setActiveTab("batches")}
        >
          Campagnes d'Envoi
        </button>
        <button
          className={activeTab === "analytics" ? "active" : ""}
          onClick={() => setActiveTab("analytics")}
        >
          Analytics
        </button>
      </nav>

      <main className="platform-main">
        {activeTab === "employees" && (
          <div className="employees-section">
            <h2>Gestion des Employés</h2>

            <div className="add-employee-form">
              <h3>Ajouter un employé</h3>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Nom complet"
                  value={newEmployee.name}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, name: e.target.value })
                  }
                />
                <input
                  type="email"
                  placeholder="Adresse email"
                  value={newEmployee.email}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, email: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Département (optionnel)"
                  value={newEmployee.department}
                  onChange={(e) =>
                    setNewEmployee({
                      ...newEmployee,
                      department: e.target.value,
                    })
                  }
                />
                <button onClick={addEmployee}>Ajouter</button>
              </div>
            </div>

            <div className="employees-list">
              <h3>Liste des employés ({employees.length})</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Email</th>
                      <th>Département</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((employee) => (
                      <tr key={employee._id}>
                        <td>{employee.name}</td>
                        <td>{employee.email}</td>
                        <td>{employee.department}</td>
                        <td>
                          <button
                            className="delete-btn"
                            onClick={() => deleteEmployee(employee._id)}
                          >
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "batches" && (
          <div className="batches-section">
            <div className="batches-overview">
              <h2>Campagnes d'Envoi</h2>

              <div className="batch-stats">
                <div className="stat-card">
                  <h3>{batches.length}</h3>
                  <p>Campagnes créées</p>
                </div>
                <div className="stat-card">
                  <h3>
                    {batches.reduce((acc, batch) => acc + batch.sentCount, 0)}
                  </h3>
                  <p>Emails envoyés</p>
                </div>
                <div className="stat-card">
                  <h3>
                    {batches.length > 0
                      ? (
                          (batches.reduce(
                            (acc, batch) =>
                              batch.totalEmployees > 0
                                ? acc + batch.clickCount / batch.totalEmployees
                                : acc,
                            0
                          ) /
                            batches.length) *
                          100
                        ).toFixed(2)
                      : 0}
                    %
                  </h3>
                  <p>Taux de clics moyen</p>
                </div>
              </div>

              <div className="create-batch-form">
                <h3>Créer une nouvelle campagne</h3>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Nom de la campagne"
                    value={newBatch.name}
                    onChange={(e) =>
                      setNewBatch({ ...newBatch, name: e.target.value })
                    }
                  />
                  <input
                    type="date"
                    value={newBatch.date}
                    onChange={(e) =>
                      setNewBatch({ ...newBatch, date: e.target.value })
                    }
                  />
                  <div className="employee-selection">
                    <h4>Sélectionner les employés à inclure:</h4>
                    {employees.map((employee) => (
                      <label key={employee._id} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={newBatch.employees.includes(employee._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewBatch({
                                ...newBatch,
                                employees: [
                                  ...newBatch.employees,
                                  employee._id,
                                ],
                              });
                            } else {
                              setNewBatch({
                                ...newBatch,
                                employees: newBatch.employees.filter(
                                  (id) => id !== employee._id
                                ),
                              });
                            }
                          }}
                        />
                        {employee.name} - {employee.email}
                      </label>
                    ))}
                  </div>
                  <button onClick={createBatch}>Créer la campagne</button>
                </div>
              </div>
            </div>

            <div className="batches-list">
              <h3>Campagnes existantes</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Date</th>
                      <th>Envoyés</th>
                      <th>Clics</th>
                      <th>Taux</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batches.map((batch) => (
                      <tr
                        key={batch._id}
                        className={
                          selectedBatch?._id === batch._id ? "selected" : ""
                        }
                      >
                        <td>{batch.name}</td>
                        <td>
                          {new Date(batch.dateCreated).toLocaleDateString()}
                        </td>
                        <td>
                          {batch.sentCount}/{batch.totalEmployees}
                        </td>
                        <td>{batch.clickCount}</td>
                        <td>
                          {batch.totalEmployees > 0
                            ? (
                                (batch.clickCount / batch.totalEmployees) *
                                100
                              ).toFixed(2)
                            : 0}
                          %
                        </td>
                        <td>
                          <button
                            className="view-btn"
                            onClick={() => showBatchDetails(batch._id)}
                          >
                            Détails
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => deleteBatch(batch._id)}
                          >
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {selectedBatch && (
              <div className="batch-details">
                <h3>Détails de la campagne: {selectedBatch.name}</h3>
                <button
                  className="close-btn"
                  onClick={() => setSelectedBatch(null)}
                >
                  ×
                </button>

                <div className="details-grid">
                  <div className="detail-card">
                    <h4>Statistiques globales</h4>
                    <p>
                      Date:{" "}
                      {new Date(selectedBatch.dateCreated).toLocaleDateString()}
                    </p>
                    <p>
                      Emails envoyés: {selectedBatch.sentCount}/
                      {selectedBatch.totalEmployees}
                    </p>
                    <p>Nombre de clics: {selectedBatch.clickCount}</p>
                    <p>
                      Taux de clics:{" "}
                      {selectedBatch.totalEmployees > 0
                        ? (
                            (selectedBatch.clickCount /
                              selectedBatch.totalEmployees) *
                            100
                          ).toFixed(2)
                        : 0}
                      %
                    </p>
                  </div>

                  <div className="detail-card">
                    <h4>Employés inclus</h4>
                    <div className="table-container">
                      <table>
                        <thead>
                          <tr>
                            <th>Nom</th>
                            <th>Email</th>
                            <th>Département</th>
                            <th>Statut</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedBatch.employees &&
                            selectedBatch.employees.map((employee) => (
                              <tr key={employee._id}>
                                <td>{employee.name}</td>
                                <td>{employee.email}</td>
                                <td>{employee.department}</td>
                                <td>
                                  <span className="status-badge sent">
                                    Envoyé
                                  </span>
                                  <span className="status-badge clicked">
                                    A cliqué
                                  </span>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="analytics-section">
            <h2>Analytics et Statistiques</h2>

            <div className="analytics-cards">
              <div className="analytics-card">
                <h3>Performance des campagnes</h3>
                <div className="chart-placeholder">
                  <p>Graphique des taux d'ouverture et de clics par campagne</p>
                </div>
              </div>

              <div className="analytics-card">
                <h3>Top employés engageants</h3>
                <div className="chart-placeholder">
                  <p>Liste des employés avec le plus d'interactions</p>
                </div>
              </div>
            </div>

            <div className="data-export">
              <h3>Exporter les données</h3>
              <div className="export-options">
                <button>Exporter les employés (CSV)</button>
                <button>Exporter les campagnes (CSV)</button>
                <button>Exporter les statistiques (PDF)</button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="platform-footer">
        <p>Plateforme de Gestion des Campagnes d'Envoi © 2025</p>
      </footer>
    </div>
  );
};

export default EmailCampaignPlatform;
