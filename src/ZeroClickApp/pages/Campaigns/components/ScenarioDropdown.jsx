import React, { useMemo, useState } from "react";
import scenarios from "../../../../../backend/data/scenarios.json";

/*
Props:
- value: { id?, category? } | null
- onChange: (val: { id, category } | null) => void

Fonctions:
- Recherche texte (id/nom/catégorie)
- Filtres: catégorie, difficulté
- Affiche: "category · id — name"
*/
const ScenarioDropdown = ({ value = null, onChange, usedScenarioIds }) => {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Toutes");
  const [diff, setDiff] = useState("Toutes");
  const [ptype, setPtype] = useState("Tous");

  const catLabel = (c) => {
    const m = {
      "it-saas": "IT / SaaS",
      finance: "Finance",
      rh: "Ressources Humaines",
      support: "Support",
      "b2b-supplier": "B2B / Fournisseurs",
      education: "Éducation",
      "business-development": "Business Dev",
      "events-partnership": "Évènements / Partenariats",
    };
    return m[c] || c || "—";
  };

  const iconForPayload = (p) => {
    const k = String(p || "").toLowerCase();
    const map = {
      login: "🔐",
      cta: "➡️",
      pdf: "📄",
      docx: "📝",
      excel: "📊",
      form: "🧾",
      gdrive: "🟩",
      onedrive: "🟦",
      attachment: "📎",
      plaintext: "✉️",
    };
    return map[k] || "➡️";
  };

  const stars = (d) => {
    const n = Math.max(1, Math.min(5, Number(d || 1)));
    return "★".repeat(n) + "☆".repeat(5 - n);
  };

  const categories = useMemo(() => {
    const s = new Set((scenarios || []).map((s) => s.category || "—"));
    return ["Toutes", ...Array.from(s).sort()];
  }, []);

  const payloadTypes = useMemo(() => {
    const s = new Set((scenarios || []).map((x) => x.payloadType || "cta"));
    return ["Tous", ...Array.from(s).sort()];
  }, []);

  const difficulties = ["Toutes", 1, 2, 3, 4, 5];

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return (scenarios || [])
      .filter((s) => (cat === "Toutes" ? true : s.category === cat))
      .filter((s) => (ptype === "Tous" ? true : (s.payloadType || "cta") === ptype))
      .filter((s) => (diff === "Toutes" ? true : String(s.difficulty) === String(diff)))
      .filter((s) => {
        if (!qq) return true;
        return (
          s.id.toLowerCase().includes(qq) ||
          (s.name || "").toLowerCase().includes(qq) ||
          (s.category || "").toLowerCase().includes(qq)
        );
      })
      .slice(0, 500);
  }, [q, cat, diff, ptype]);

  const grouped = useMemo(() => {
    const map = new Map(); // category -> [scenarios]
    for (const s of filtered) {
      const k = s.category || "—";
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(s);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => (a.name || a.id).localeCompare(b.name || b.id));
    }
    return Array.from(map.entries()).sort((a, b) =>
      catLabel(a[0]).localeCompare(catLabel(b[0]))
    );
  }, [filtered]);

  return (
    <div className="flex flex-wrap items-center gap-2 max-w-full">
      <div className="relative min-w-0">
        <input
          className="w-64 sm:w-72 max-w-full border border-gray-200 rounded-lg px-3 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Rechercher un scénario (id/nom/catégorie)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          list="scenario-options"
        />
        <datalist id="scenario-options">
        {filtered.map((s) => (
          <option
            key={s.id}
            value={`${catLabel(s.category)} · ${s.id} — ${s.name}${usedScenarioIds && (usedScenarioIds.has?.(s.id) || usedScenarioIds[s.id]) ? " · déjà envoyé" : ""}`}
          />
        ))}
      </datalist>
      </div>

      <select
        className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        value={cat}
        onChange={(e) => setCat(e.target.value)}
        title="Filtrer par catégorie"
      >
        {categories.map((c) => (
          <option key={c} value={c}>
            {c === "Toutes" ? "Toutes catégories" : catLabel(c)}
          </option>
        ))}
      </select>

      <select
        className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        value={ptype}
        onChange={(e) => setPtype(e.target.value)}
        title="Filtrer par type de contenu"
      >
        {payloadTypes.map((p) => (
          <option key={p} value={p}>
            {p === "Tous" ? "Tous contenus" : p}
          </option>
        ))}
      </select>

      <select
        className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        value={diff}
        onChange={(e) => setDiff(e.target.value)}
        title="Filtrer par difficulté"
      >
        {difficulties.map((d) => (
          <option key={d} value={d}>
            {String(d)}
          </option>
        ))}
      </select>

      <select
        className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 w-64 sm:w-80 md:w-[30rem] max-w-full min-w-0"
        value={value?.id || ""}
        onChange={(e) => {
          const id = e.target.value || null;
          if (!id) return onChange?.(null);
          const s = scenarios.find((x) => x.id === id);
          if (!s) return onChange?.(null);
          onChange?.({ id: s.id, category: s.category || null });
        }}
      >
        <option value="">— Aucun scénario —</option>
        {grouped.map(([category, arr]) => (
          <optgroup key={category} label={catLabel(category)}>
            {arr.map((s) => {
              const used = !!(usedScenarioIds && (usedScenarioIds.has?.(s.id) || usedScenarioIds[s.id]));
              const icon = iconForPayload(s.payloadType);
              const diffStars = stars(s.difficulty);
              const pt = s.payloadType || "cta";
              const text = `${icon} ${s.name} • ${s.id} • ${pt} • ${diffStars}${used ? " • déjà envoyé" : ""}`;
              return (
                <option key={s.id} value={s.id} data-used={used}>
                  {text}
                </option>
              );
            })}
          </optgroup>
        ))}
      </select>
    </div>
  );
};

export default ScenarioDropdown;
