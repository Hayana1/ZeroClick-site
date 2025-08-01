import React from "react";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-[rgb(15,15,25)] border-t border-[rgb(60,60,80)] py-8 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="text-gray-400 text-sm mb-4 md:mb-0">
          © {new Date().getFullYear()} ZeroClick. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
