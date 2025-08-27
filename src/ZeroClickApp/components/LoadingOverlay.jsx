import React from "react";
export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-40">
      <div className="animate-spin h-6 w-6 border-2 border-gray-400 border-t-transparent rounded-full mr-3" />
      <span className="text-gray-700">Chargement…</span>
    </div>
  );
}
