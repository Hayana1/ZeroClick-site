import React from "react";
export default function ErrorBanner({ message }) {
  return (
    <div className="bg-red-50 text-red-800 border border-red-200 px-3 py-2 rounded">
      {message}
    </div>
  );
}
