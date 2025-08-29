import React from "react";
import { FiX } from "react-icons/fi";

const ToastError = ({ messageTitle, messageBody, onClose }) => {
  return (
    <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-md flex items-start gap-3 max-w-md z-30">
      <div className="mt-0.5">
        <FiX size={18} className="text-red-500" />
      </div>
      <div>
        <p className="font-medium">{messageTitle}</p>
        <p className="text-sm">{messageBody}</p>
      </div>
      <button
        onClick={onClose}
        className="ml-4 text-red-500 hover:text-red-700"
      >
        <FiX size={18} />
      </button>
    </div>
  );
};

export default ToastError;

