import React from "react";
import { FiMail } from "react-icons/fi";

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

export default EmptyStateNoCampaign;

