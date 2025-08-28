// src/ZeroClickApp/AppRouter.jsx
import React from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import TenantsPage from "./pages/Tenants/TenantsPage";
import EmployeesPage from "./pages/Employees/EmployeesPage";
import CampaignsPage from "./pages/Campaigns/CampaignsPage";
import DirectoryPage from "./pages/Directory/DirectoryPage"; // ⬅️ nouveau
import TenantPicker from "./components/TenantPicker";
import ResultsPage from "./pages/Results/ResultsPage";

export default function AppRouter() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <h1 className="text-lg font-semibold">ZeroClick — Dashboard</h1>
          <nav className="space-x-4">
            <Link to="/ZeroApp/directory" className="hover:underline">
              Ajout
            </Link>

            <Link to="/ZeroApp/campaigns" className="hover:underline">
              Campagnes
            </Link>

            <Link to="/ZeroApp/results" className="hover:underline">
              Resultats
            </Link>
          </nav>
          <TenantPicker />
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <Routes>
          <Route index element={<Navigate to="/ZeroApp/directory" replace />} />
          <Route path="directory" element={<DirectoryPage />} />
          <Route path="tenants" element={<TenantsPage />} />
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="campaigns" element={<CampaignsPage />} />
          <Route path="results" element={<ResultsPage />} />
          <Route
            path="*"
            element={<Navigate to="/ZeroApp/directory" replace />}
          />
        </Routes>
      </main>
    </div>
  );
}
