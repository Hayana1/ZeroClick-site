import React from "react";
import { FiClock, FiCheckCircle, FiX } from "react-icons/fi";

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

export default StatusIndicator;

