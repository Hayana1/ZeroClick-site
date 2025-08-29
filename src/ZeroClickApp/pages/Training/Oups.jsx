import React, { useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import scenarios from "../../../../backend/data/scenarios.json";
import { api } from "../../lib/api";

// Pixel-style image helper (reuse your /Tiles/* assets)
const PixelIcon = ({ name, size = 24, className = "" }) => (
  <img
    src={`/Tiles/${name}.png`}
    alt={name}
    width={size}
    height={size}
    className={`pixel ${className}`}
    style={{ imageRendering: "pixelated" }}
  />
);

function Badge({ children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs border ${className}`}
    >
      {children}
    </span>
  );
}

function StepTypeTag({ type }) {
  const map = {
    tip: {
      label: "Astuce",
      color: "text-purple-200 border-purple-500/30 bg-purple-900/20",
    },
    mcq: {
      label: "Quiz",
      color: "text-indigo-200 border-indigo-500/30 bg-indigo-900/20",
    },
    info: {
      label: "Info",
      color: "text-sky-200 border-sky-500/30 bg-sky-900/20",
    },
  };
  const t = map[type] || {
    label: (type || "STEP").toUpperCase(),
    color: "text-gray-200 border-gray-500/30 bg-gray-800/40",
  };
  return <Badge className={t.color}>{t.label}</Badge>;
}

export default function TrainingOups() {
  const { scenarioId = "unknown" } = useParams();
  const [sp] = useSearchParams();
  const sendId = sp.get("send") || "";

  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [ack, setAck] = useState("");

  const scenario = useMemo(
    () => scenarios.find((s) => s.id === scenarioId) || null,
    [scenarioId]
  );
  const steps = useMemo(() => scenario?.training?.steps || [], [scenario]);

  const progressPct = steps.length
    ? Math.round(((done ? steps.length : 0) / steps.length) * 100)
    : 0;

  async function onComplete() {
    setSaving(true);
    setError("");
    setAck("");
    try {
      const totalScore = 0; // brancher quiz plus tard
      const res = await api.completeTraining({
        sendId,
        scenarioId,
        totalScore,
      });
      setDone(true);
      setAck(res?.rewardXp ? `+${res.rewardXp} XP` : "Enregistré ✅");
    } catch (e) {
      setError(e?.message || "Erreur d'envoi");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen text-gray-100 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-800 relative overflow-hidden">
      {/* Glow background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        aria-hidden
      >
        <div className="absolute -top-24 left-1/3 w-[42rem] h-[42rem] bg-purple-700/40 blur-[140px] rounded-full" />
        <div className="absolute -bottom-24 right-1/4 w-[36rem] h-[36rem] bg-indigo-600/30 blur-[140px] rounded-full" />
      </div>

      {/* Header / trust bar */}
      <div className="bg-gradient-to-r from-purple-900/70 to-indigo-900/70 border-b border-purple-800/40 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-center gap-3">
          <p className="text-sm text-purple-200">
            Formation anti‑phishing — Simulation encadrée
          </p>
        </div>
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-10 md:pt-14">
        <div className="flex flex-col items-center text-center">
          <div className="text-3xl md:text-4xl lg:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-indigo-300">
            Oups ! Vous avez cliqué…
          </div>
          <div className="mt-6 opacity-90">
            <PixelIcon name="boo" size={120} />
          </div>
          <p className="mt-6 max-w-2xl text-gray-300">
            Ne vous inquiétez pas, ceci est une simulation. Transformons
            l'erreur en réflexes solides — en quelques minutes.
          </p>
        </div>
      </section>

      {/* Scenario header card */}
      <section className="mx-auto max-w-4xl px-6 mt-10">
        <div className="rounded-2xl border border-gray-700/60 bg-gray-900/70 backdrop-blur-md p-5">
          <div className="flex flex-wrap items-start gap-4 justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-white">
                {scenario?.name || "Scénario inconnu"}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge className="text-gray-300 border-gray-600/50 bg-gray-800/60">
                  ID{" "}
                  <span className="font-mono ml-1 text-gray-200">
                    {scenarioId}
                  </span>
                </Badge>
                {scenario?.category && (
                  <Badge className="text-indigo-200 border-indigo-500/30 bg-indigo-900/20">
                    catégorie{" "}
                    <span className="ml-1 font-medium text-indigo-100">
                      {scenario.category}
                    </span>
                  </Badge>
                )}
                {steps?.length > 0 && (
                  <Badge className="text-emerald-200 border-emerald-500/30 bg-emerald-900/20">
                    {steps.length} étape(s)
                  </Badge>
                )}
              </div>
            </div>
            <div className="w-full md:w-64">
              <div className="text-xs text-gray-400 mb-1">Progression</div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-400"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              {ack && (
                <div className="mt-2 text-xs text-emerald-300">{ack}</div>
              )}
              {error && (
                <div className="mt-2 text-xs text-red-400">{error}</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-4xl px-6 mt-6 pb-16">
        {scenario ? (
          <div className="grid grid-cols-1 gap-4">
            {steps.map((step, idx) => (
              <article
                key={idx}
                className="rounded-2xl border border-gray-700 bg-gray-900/60 p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <StepTypeTag type={step.type} />
                    <h3 className="text-base md:text-lg font-semibold text-white">
                      {step.title}
                    </h3>
                  </div>
                  <span className="text-xs text-gray-400">Étape {idx + 1}</span>
                </div>
                {step.content && (
                  <p className="mt-2 text-gray-300 leading-relaxed">
                    {step.content}
                  </p>
                )}
                {Array.isArray(step.options) && (
                  <ul className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                    {step.options.map((o, i) => (
                      <li
                        key={i}
                        className="px-3 py-2 rounded-lg border border-gray-700 bg-gray-800/70 text-gray-200 text-sm"
                      >
                        {o}
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-gray-700 bg-gray-900/60 p-6 text-gray-300">
            Ce scénario n'existe pas dans le catalogue.
          </div>
        )}

        <div className="mt-8 flex items-center gap-3">
          <button
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium shadow-lg shadow-purple-900/20 disabled:opacity-60"
            onClick={onComplete}
            disabled={saving || !sendId}
          >
            {saving
              ? "Enregistrement…"
              : done
              ? "Terminé ✔"
              : "Terminer la formation"}
          </button>
          {!sendId && (
            <span className="text-gray-400 text-sm">
              Paramètre <span className="font-mono">send</span> manquant
            </span>
          )}
        </div>
      </section>

      <footer className="mt-6 border-t border-gray-800/70 bg-gray-950/60 py-6">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-gray-400">
            Programme de sensibilisation — {new Date().getFullYear()}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Simulation pédagogique. Aucune donnée sensible n'est collectée.
          </p>
        </div>
      </footer>

      <style>{`
        body { font-family: "Titillium Web", ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Cantarell, Noto Sans, sans-serif; }
      `}</style>
    </div>
  );
}
