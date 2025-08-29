import React from "react";
import { FiCheck, FiX, FiEye, FiEyeOff } from "react-icons/fi";

const GroupActions = ({ onSelectAll, onDeselectAll, onPreview, isPreviewing }) => {
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

export default GroupActions;

