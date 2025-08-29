import React from "react";
import { FiUsers } from "react-icons/fi";

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

export default EmptyStateNoEmployees;

