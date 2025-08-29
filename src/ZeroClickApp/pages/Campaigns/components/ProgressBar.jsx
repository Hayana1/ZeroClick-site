import React from "react";

const ProgressBar = ({ progress, size = "md" }) => {
  const height = size === "sm" ? "h-1.5" : "h-2";

  return (
    <div className="w-full bg-gray-200 rounded-full">
      <div
        className={`bg-blue-600 rounded-full ${height} transition-all duration-300`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default ProgressBar;

