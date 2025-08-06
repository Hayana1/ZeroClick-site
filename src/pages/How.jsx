import React from "react";
import { useTranslation } from "react-i18next";

export default function How() {
  const { t } = useTranslation();
  const steps = [
    {
      number: 1,
      title: t("how.steps.0.title"),
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
      ),
      description: t("how.steps.0.description"),
    },
    {
      number: 2,
      title: t("how.steps.1.title"),
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      description: t("how.steps.1.description"),
    },
    {
      number: 3,
      title: t("how.steps.2.title"),
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
      description: t("how.steps.2.description"),
    },
  ];

  return (
    <section className="px-6 py-20 max-w-6xl mx-auto relative">
      {/* Élément décoratif */}
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[rgb(180,100,255)]/10 blur-3xl -z-10"></div>

      <div className="text-center mb-16">
        <span className="inline-block px-3 py-1 mb-4 rounded-full bg-[rgb(180,100,255)]/10 border border-[rgb(180,100,255)]/30 text-[rgb(180,100,255)] text-xs font-medium">
          {t("how.badge")}
        </span>
        <h2 className="text-3xl md:text-3xl font-bold leading-tight">
          {t("how.title.part1")} <br />
          <span className="text-[rgb(180,100,255)]">
            {t("how.title.part2")}
          </span>
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {steps.map((step, index) => (
          <div
            key={index}
            className="group relative bg-[rgb(40,40,40)] p-8 rounded-xl border border-[rgb(70,70,70)] hover:border-[rgb(180,100,255)]/30 transition-all duration-300 hover:-translate-y-2"
          >
            {/* Numéro d'étape */}
            <div className="absolute -top-5 -left-5 w-10 h-10 rounded-full bg-[rgb(180,100,255)] flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform">
              {step.number}
            </div>

            {/* Icône */}
            <div className="text-[rgb(180,100,255)] mb-6 group-hover:text-[rgb(200,120,255)] transition-colors">
              {step.icon}
            </div>

            <h3 className="text-xl font-bold mb-3 group-hover:text-white transition-colors">
              {step.title}
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed group-hover:text-gray-100 transition-colors">
              {step.description}
            </p>

            {/* Ligne décorative */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[rgb(180,100,255)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        ))}
      </div>

      {/* Note de bas de section */}
      <div className="mt-16 text-center max-w-2xl mx-auto">
        <p className="text-gray-400 text-sm">
          <span className="text-[rgb(180,100,255)] font-medium">
            {t("how.note.highlight")}
          </span>{" "}
          {t("how.note.rest")}
        </p>
      </div>
    </section>
  );
}
