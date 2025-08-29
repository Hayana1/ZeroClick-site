import React from "react";
import { FiSend, FiCpu } from "react-icons/fi";
import ProgressBar from "./ProgressBar";

const CampaignStats = ({ campaign, isActive, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`w-full p-4 rounded-xl border-2 cursor-pointer transition-all ${
        isActive
          ? "border-blue-500 bg-blue-50 shadow-md"
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
      }`}
    >
      <div className="font-medium text-gray-900 truncate">{campaign.name}</div>
      <div className="text-xs text-gray-500 mt-1">
        {new Date(campaign.dateCreated).toLocaleDateString("fr-FR")}
      </div>

      <div className="mt-3">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Progression</span>
          <span>{campaign.progress}%</span>
        </div>
        <ProgressBar progress={campaign.progress} />
      </div>

      <div className="flex justify-between mt-3 text-xs">
        <div className="flex items-center text-green-600">
          <FiSend size={12} className="mr-1" />
          <span>{campaign.sentCount ?? 0} envoyés</span>
        </div>
        <div className="flex items-center text-blue-600">
          <FiCpu size={12} className="mr-1" />
          <span>{campaign.clickCount ?? 0} clics</span>
        </div>
      </div>
    </div>
  );
};

export default CampaignStats;

