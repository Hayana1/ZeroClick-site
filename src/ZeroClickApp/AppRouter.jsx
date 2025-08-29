// src/ZeroClickApp/AppRouter.jsx
import React, { useState, useEffect } from "react";
import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import TenantsPage from "./pages/Tenants/TenantsPage";
import EmployeesPage from "./pages/Employees/EmployeesPage";
import CampaignsPage from "./pages/Campaigns/CampaignsPage";
import DirectoryPage from "./pages/Directory/DirectoryPage";
import TenantPicker from "./components/TenantPicker";
import ResultsPage from "./pages/Results/ResultsPage";
import TrainingOups from "./pages/Training/Oups";

export default function AppRouter() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // Déterminer l'onglet actif basé sur l'URL
    const path = location.pathname;
    if (path.includes("directory")) setActiveTab("directory");
    else if (path.includes("campaigns")) setActiveTab("campaigns");
    else if (path.includes("results")) setActiveTab("results");
    else if (path.includes("tenants")) setActiveTab("tenants");
    else if (path.includes("employees")) setActiveTab("employees");
  }, [location]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="px-4 pt-4 md:px-6 md:pt-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-4 md:p-5 border border-gray-100">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl w-10 h-10 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">Z</span>
                </div>
                <h1 className="text-xl font-semibold text-gray-800">
                  ZeroClick
                </h1>
              </div>

              {/* Menu mobile */}
              <button
                className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>

              <nav
                className={`${
                  isMenuOpen ? "flex" : "hidden"
                } md:flex w-full md:w-auto flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-1 bg-gray-50 md:bg-transparent rounded-xl p-2 md:p-0`}
              >
                <div className="relative bg-gray-100 md:bg-gray-100 rounded-lg p-1 flex flex-col md:flex-row md:items-center">
                  <div
                    className="absolute bg-white shadow-md rounded-lg transition-all duration-300 ease-out md:h-full"
                    style={{
                      width: isMenuOpen ? "100%" : `calc(100% / 3)`,
                      height: isMenuOpen
                        ? "calc(100% / 3)"
                        : "calc(100% - 0.5rem)",
                      top: isMenuOpen
                        ? activeTab === "directory"
                          ? "0"
                          : activeTab === "campaigns"
                          ? "33.333%"
                          : "66.666%"
                        : "0.25rem",
                      left: isMenuOpen
                        ? "0"
                        : activeTab === "directory"
                        ? "0"
                        : activeTab === "campaigns"
                        ? "33.333%"
                        : "66.666%",
                      opacity:
                        activeTab === "directory" ||
                        activeTab === "campaigns" ||
                        activeTab === "results"
                          ? 1
                          : 0,
                    }}
                  ></div>

                  <Link
                    to="/ZeroApp/directory"
                    className={`relative z-10 px-4 py-3 md:py-2 rounded-lg text-sm font-medium transition-all duration-200 text-center ${
                      activeTab === "directory"
                        ? "text-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Ajout
                  </Link>

                  <Link
                    to="/ZeroApp/campaigns"
                    className={`relative z-10 px-4 py-3 md:py-2 rounded-lg text-sm font-medium transition-all duration-200 text-center ${
                      activeTab === "campaigns"
                        ? "text-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Campagnes
                  </Link>

                  <Link
                    to="/ZeroApp/results"
                    className={`relative z-10 px-4 py-3 md:py-2 rounded-lg text-sm font-medium transition-all duration-200 text-center ${
                      activeTab === "results"
                        ? "text-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Résultats
                  </Link>
                </div>
              </nav>

              <div className="hidden md:block">
                <TenantPicker />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-6">
        <Routes>
          <Route index element={<Navigate to="/ZeroApp/directory" replace />} />
          <Route path="directory" element={<DirectoryPage />} />
          <Route path="tenants" element={<TenantsPage />} />
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="campaigns" element={<CampaignsPage />} />
          <Route path="results" element={<ResultsPage />} />
          <Route path="/training/:scenarioId" element={<TrainingOups />} />
          <Route path="*" element={<Navigate to="/ZeroApp/directory" replace />} />
        </Routes>
      </main>
    </div>
  );
}
