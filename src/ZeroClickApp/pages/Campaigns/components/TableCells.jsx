import React from "react";

export function Th({ children }) {
  return (
    <th className="text-left font-medium px-4 py-3 text-gray-700 whitespace-nowrap">
      {children}
    </th>
  );
}

export function Td({ children, className = "" }) {
  return <td className={`px-4 py-3 align-middle ${className}`}>{children}</td>;
}
