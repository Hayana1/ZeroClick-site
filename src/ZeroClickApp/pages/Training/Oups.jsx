import React, { useEffect, useMemo, useState } from "react";
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
  const [totalPoints, setTotalPoints] = useState(null);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [employeeName, setEmployeeName] = useState("");
  const [recentHistory, setRecentHistory] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const firstName = useMemo(() => (employeeName || "").split(" ")[0] || "", [employeeName]);

  const scenario = useMemo(
    () => scenarios.find((s) => s.id === scenarioId) || null,
    [scenarioId]
  );
  const steps = useMemo(() => scenario?.training?.steps || [], [scenario]);
  const [answers, setAnswers] = useState({}); // { [stepIdx]: optionIdx }
  const totalMcq = useMemo(
    () => steps.reduce((n, s) => n + (s?.type === "mcq" ? 1 : 0), 0),
    [steps]
  );
  const answeredCount = useMemo(
    () => Object.keys(answers).length,
    [answers]
  );

  const progressPct = totalMcq
    ? Math.round((answeredCount / totalMcq) * 100)
    : 0;

  // Charger infos employé (points + historique) via sendId
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!sendId) return;
      try {
        const data = await api.getTrainingSend(sendId);
        if (!mounted) return;
        setEmployeeName(data?.employee?.name || "");
        setTotalPoints(data?.employee?.trainingPoints ?? null);
        setRecentHistory(Array.isArray(data?.employee?.trainingHistory) ? data.employee.trainingHistory : []);
      } catch (_) {}
    })();
    return () => {
      mounted = false;
    };
  }, [sendId]);

  async function onComplete() {
    setSaving(true);
    setError("");
    setAck("");
    try {
      // Score = somme des points des MCQ correctes (par défaut 10)
      let totalScore = 0;
      steps.forEach((step, idx) => {
        if (step?.type === "mcq") {
          const picked = answers[idx];
          if (typeof picked === "number" && picked === step.correctIndex) {
            totalScore += Number(step.points || 10);
          }
        }
      });
      const res = await api.completeTraining({
        sendId,
        scenarioId,
        totalScore,
      });
      setDone(true);
      if (res && typeof res.totalPoints !== "undefined") {
        setTotalPoints(res.totalPoints);
        setEarnedPoints(res.pointsEarned || 0);
        setAck(`+${res.pointsEarned || 0} pts · total ${res.totalPoints}`);
        // Confetti si seuil franchi
        const prev = Number(totalPoints || 0);
        const next = Number(res.totalPoints || 0);
        const milestones = [50, 100, 200, 300, 500];
        const crossed = milestones.find((m) => prev < m && next >= m);
        if (crossed) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 1500);
        }
      } else {
        setAck(res?.rewardXp ? `+${res.rewardXp} XP` : "Enregistré ✅");
      }
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
            {firstName ? `Oups ${firstName}, tu es tombé dans le piège…` : "Oups ! Vous avez cliqué…"}
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
            <div className="w-full md:w-72">
              <div className="text-xs text-gray-400 mb-1">Progression</div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-400"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="mt-2 text-xs text-indigo-300">
                ⚡ Points cumulés: {totalPoints ?? "—"}
                {done && earnedPoints > 0 && (
                  <span className="ml-2 text-emerald-300">
                    (+{earnedPoints})
                  </span>
                )}
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

      {/* Gamified summary card */}
      <section className="mx-auto max-w-4xl px-6 mt-6">
        <div className="rounded-2xl border border-gray-700 bg-gray-900/70 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-gray-300">
              <span className="mr-2">🏆 Niveau:</span>
              <span className="font-semibold text-indigo-300">
                {(() => {
                  const p = Number(totalPoints || 0);
                  if (p >= 200) return "3";
                  if (p >= 100) return "2";
                  if (p >= 50) return "1";
                  return "0";
                })()}
              </span>
            </div>
            <div className="text-sm text-gray-300">
              <span className="mr-2">📜 Derniers scénarios:</span>
              <span className="font-mono text-gray-200">
                {recentHistory && recentHistory.length
                  ? recentHistory
                      .map((h) => `${h.scenarioId}${typeof h.score === "number" ? `(+${h.score})` : ""}`)
                      .join(" · ")
                  : "—"}
              </span>
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
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                {step.options.map((o, i) => {
                  const picked = answers[idx];
                  const isSelected = picked === i;
                  const isCorrect =
                    typeof step.correctIndex === "number" && i === step.correctIndex;
                  const selectedIsCorrect =
                    typeof picked === "number" && picked === step.correctIndex;
                  const base =
                    "w-full text-left px-3 py-2 rounded-lg border transition text-sm";
                  const idle = "bg-gray-800/70 border-gray-700 text-gray-200 hover:bg-gray-800 hover:border-gray-600";
                  const ok = "bg-emerald-900/20 border-emerald-600/40 text-emerald-200";
                  const ko = "bg-red-900/20 border-red-600/40 text-red-200";
                  const cls = isSelected ? (selectedIsCorrect ? ok : ko) : idle;
                  return (
                    <button
                      key={i}
                      type="button"
                      className={`${base} ${cls}`}
                      onClick={() =>
                        setAnswers((prev) => ({ ...prev, [idx]: i }))
                      }
                    >
                      {o}
                      {isSelected && (
                        <span className="ml-2 text-xs opacity-80">
                          {selectedIsCorrect
                            ? "✔ Correct"
                            : isCorrect
                            ? "(bonne réponse)"
                            : "✖"}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
            {step?.type === "mcq" && typeof answers[idx] === "number" && (
              <div className="mt-2 text-xs text-gray-400">
                {answers[idx] === step.correctIndex
                  ? "Bonne réponse !"
                  : `Mauvaise réponse — Bonne réponse : ${step.options?.[step.correctIndex] ?? "(indisponible)"}`}
              </div>
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

      {/* Confetti simple */}
      {showConfetti && (
        <div className="pointer-events-none fixed inset-0 z-50">
          <div className="absolute inset-0 animate-pulse" style={{ background: "radial-gradient(ellipse at center, rgba(99,102,241,0.25), transparent 60%)" }} />
        </div>
      )}

      <style>{`
        body { font-family: "Titillium Web", ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Cantarell, Noto Sans, sans-serif; }
      `}</style>
    </div>
  );
}
