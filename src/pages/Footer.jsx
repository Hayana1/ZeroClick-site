import React from "react";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-white border-t border-[#E3D8FF] py-8 px-6 text-[#4B2C83]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="text-sm mb-4 md:mb-0">
          © {new Date().getFullYear()} ZeroClick. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
