import React from "react";

const BlockingSpinner = ({ text }) => {
  return (
    <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-40">
      <div className="bg-white rounded-lg shadow-md px-6 py-4 flex items-center gap-3">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
        <span>{text}</span>
      </div>
    </div>
  );
};

export default BlockingSpinner;

