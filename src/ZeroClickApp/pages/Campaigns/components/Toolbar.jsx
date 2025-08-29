import React from "react";
import TenantPicker from "../../../components/TenantPicker";
import { FiFilter, FiSearch, FiBarChart2 } from "react-icons/fi";

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

export default Toolbar;
