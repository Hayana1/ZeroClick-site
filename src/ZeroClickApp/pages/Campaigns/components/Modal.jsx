import React from "react";
import { FiX } from "react-icons/fi";

const Modal = ({ children, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden relative">
        <button
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
          onClick={onClose}
          aria-label="Fermer"
        >
          <FiX size={18} />
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;

