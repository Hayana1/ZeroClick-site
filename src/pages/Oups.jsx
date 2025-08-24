// Oups.js
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Trophy,
  Award,
  Star,
  Activity,
  Users,
  MousePointerClick,
  Percent,
  CalendarClock,
} from "lucide-react";

const API_BASE_URL = "http://localhost:7300/api";

/* ------------------------ Typewriter (inchangé) ------------------------ */
function useTypewriter(fullText, speed = 35, startDelay = 200) {
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    let intervalId;
    const start = setTimeout(() => {
      intervalId = setInterval(() => {
        setText(fullText.slice(0, i + 1));
        i++;
        if (i >= fullText.length) {
          clearInterval(intervalId);
          setDone(true);
        }
      }, speed);
    }, startDelay);

    return () => {
      clearTimeout(start);
      if (intervalId) clearInterval(intervalId);
    };
  }, [fullText, speed, startDelay]);

  return { text, done };
}

/* ------------------------ Helpers ------------------------ */
function torontoDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("fr-CA", {
    timeZone: "America/Toronto",
    dateStyle: "short",
    timeStyle: "medium",
  });
}

function classNames(...a) {
  return a.filter(Boolean).join(" ");
}

/* ====================================================================== */

export default function Oups() {
  /** Hero CTA */
  const ctaFull = "Félicitations pour votre vigilance !";
  const { text: typedCTA, done: typedDone } = useTypewriter(ctaFull, 28, 250);

  /** UI state */
  const [mode, setMode] = useState("total"); // "total" | "month"
  const [monthKey, setMonthKey] = useState(() => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${d.getFullYear()}-${mm}`; // "YYYY-MM"
  });

  /** Data state */
  const [allTimeRows, setAllTimeRows] = useState([]);
  const [monthRows, setMonthRows] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [batches, setBatches] = useState([]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  /* ------------------------ Fetch data ------------------------ */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setErr("");

        const [allTimeRes, employeesRes, batchesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/leaderboard/all-time?limit=500`),
          fetch(`${API_BASE_URL}/employees`),
          fetch(`${API_BASE_URL}/batches`),
        ]);
        if (!allTimeRes.ok) throw new Error("Erreur API leaderboard (total)");
        if (!employeesRes.ok) throw new Error("Erreur API employés");
        if (!batchesRes.ok) throw new Error("Erreur API campagnes");

        const [allTimeData, employeesData, batchesData] = await Promise.all([
          allTimeRes.json(),
          employeesRes.json(),
          batchesRes.json(),
        ]);
        if (!cancelled) {
          setAllTimeRows(Array.isArray(allTimeData) ? allTimeData : []);
          setEmployees(Array.isArray(employeesData) ? employeesData : []);
          setBatches(Array.isArray(batchesData) ? batchesData : []);
        }
      } catch (e) {
        if (!cancelled) setErr(e?.message || String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /** Fetch month ranking when monthKey or mode changes to "month" */
  useEffect(() => {
    if (mode !== "month") return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const [Y, M] = monthKey.split("-").map(Number);
        const res = await fetch(
          `${API_BASE_URL}/leaderboard/month?year=${Y}&month=${M}&limit=500`
        );
        if (!res.ok) throw new Error("Erreur API leaderboard (mois)");
        const data = await res.json();
        if (!cancelled)
          setMonthRows(Array.isArray(data?.rows) ? data.rows : []);
      } catch (e) {
        if (!cancelled) setErr(e?.message || String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mode, monthKey]);

  /* ------------------------ Derived metrics ------------------------ */
  const currentRows = mode === "total" ? allTimeRows : monthRows;

  const maxClicks = useMemo(
    () =>
      Math.max(
        ...currentRows.map((r) =>
          mode === "total" ? r.clicksAllTime || 0 : r.clicksInMonth || 0
        ),
        1
      ),
    [currentRows, mode]
  );

  // Adapt rows to UI "score" with extra info
  const ranking = useMemo(() => {
    const rows = currentRows || [];
    // on prépare la liste avec notre score de vigilance
    const adapted = rows.map((r) => {
      const clicks =
        mode === "total" ? r.clicksAllTime || 0 : r.clicksInMonth || 0;
      const parts =
        mode === "total"
          ? r.participationsAllTime || 0
          : r.participationsInMonth || 0;
      const last =
        mode === "total" ? r.lastClickAtAllTime : r.lastClickAtInMonth;

      const safe = Math.max(0, parts - clicks);
      const vigilanceRate = parts > 0 ? safe / parts : 0; // 1.0 = parfait (0 clic)
      const score = Math.round(vigilanceRate * 100); // 0..100

      let trend = "steady";
      if (vigilanceRate >= 0.66) trend = "up";
      else if (vigilanceRate < 0.33) trend = "down";

      return {
        name: r.name || r.email,
        email: r.email,
        department: r.department || "—",
        clicks, // incidents
        parts, // expositions
        vigilanceRate, // 0..1
        last, // date du dernier clic (si existe)
        score, // 0..100
        trend,
      };
    });

    // tri: +vigilance, +participations, +ancien dernier clic
    adapted.sort((a, b) => {
      if (b.vigilanceRate !== a.vigilanceRate)
        return b.vigilanceRate - a.vigilanceRate;
      if (b.parts !== a.parts) return b.parts - a.parts;
      const aTime = a.last ? new Date(a.last).getTime() : 0;
      const bTime = b.last ? new Date(b.last).getTime() : 0;
      return aTime - bTime; // plus ancien (plus petit) d'abord
    });

    return adapted;
  }, [currentRows, mode]);

  // Global KPIs
  const kpis = useMemo(() => {
    const totalCampaigns = batches.length;
    const totalEmployees = employees.length;
    const totalClicks = batches.reduce(
      (acc, b) => acc + (b.clickCount || 0),
      0
    );
    const totalSent = batches.reduce(
      (acc, b) => acc + (b.totalEmployees || 0),
      0
    );
    const globalCTR = totalSent > 0 ? (totalClicks / totalSent) * 100 : 0;
    return { totalCampaigns, totalEmployees, totalClicks, globalCTR };
  }, [batches, employees]);

  /* ====================================================================== */

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-violet-50 text-slate-900">
      {/* Trust banner */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600">
        <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-center gap-3">
          <ShieldCheck className="h-5 w-5 text-white" />
          <p className="text-sm text-white/90">
            Formation à la lutte contre la fraude par courriel — Test de
            sécurité
          </p>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-80 bg-[radial-gradient(70%_50%_at_50%_0%,rgba(139,92,246,0.1),transparent)]" />
        <div className="mx-auto max-w-7xl px-6 py-14 md:py-20 flex flex-col items-center text-center">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold leading-snug"
          >
            <span className="block mt-1 text-slate-800">
              Oups ! Vous avez cliqué...
            </span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 rounded-3xl overflow-hidden shadow-xl"
          >
            <img
              src="https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif"
              alt="GIF humoristique sur la cybersécurité"
              className="w-full max-w-md mx-auto rounded-2xl"
            />
          </motion.div>

          <div className="mt-8 max-w-2xl">
            <div className="mt-8 flex flex-col items-center">
              <span className="inline-flex items-center text-xl font-semibold text-violet-700">
                {typedCTA || ctaFull}
                <span
                  className={classNames(
                    "ml-1 inline-block w-[1ch]",
                    typedDone ? "opacity-0" : "opacity-80"
                  )}
                  style={{ animation: "blink 1s steps(1,end) infinite" }}
                  aria-hidden
                >
                  |
                </span>
              </span>
            </div>

            <p className="mt-6 text-lg text-slate-700">
              Ne vous inquiétez pas, il s'agit d'une simulation de formation
              pour la lutte contre la fraude par courriel.
            </p>
          </div>
        </div>
      </section>

      {/* KPIs */}
      <section className="mx-auto max-w-7xl px-6 -mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex items-center gap-3">
            <Activity className="h-6 w-6 text-violet-600" />
            <div>
              <div className="text-slate-500 text-xs">Campagnes</div>
              <div className="text-xl font-semibold">{kpis.totalCampaigns}</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex items-center gap-3">
            <Users className="h-6 w-6 text-violet-600" />
            <div>
              <div className="text-slate-500 text-xs">Employés</div>
              <div className="text-xl font-semibold">{kpis.totalEmployees}</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex items-center gap-3">
            <MousePointerClick className="h-6 w-6 text-violet-600" />
            <div>
              <div className="text-slate-500 text-xs">Clics totaux</div>
              <div className="text-xl font-semibold">{kpis.totalClicks}</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex items-center gap-3">
            <Percent className="h-6 w-6 text-violet-600" />
            <div>
              <div className="text-slate-500 text-xs">CTR global</div>
              <div className="text-xl font-semibold">
                {kpis.globalCTR.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Classement */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-amber-500" />
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
                Classement des Vigilants
              </h2>
            </div>

            {/* Mode switch */}
            <div className="flex items-center gap-3">
              <div
                className={classNames(
                  "inline-flex rounded-lg border border-slate-200 p-1 bg-slate-50",
                  "shadow-sm"
                )}
              >
                <button
                  onClick={() => setMode("total")}
                  className={classNames(
                    "px-3 py-1.5 text-sm rounded-md",
                    mode === "total"
                      ? "bg-white text-slate-900 shadow"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  Total
                </button>
                <button
                  onClick={() => setMode("month")}
                  className={classNames(
                    "px-3 py-1.5 text-sm rounded-md flex items-center gap-1",
                    mode === "month"
                      ? "bg-white text-slate-900 shadow"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  <CalendarClock className="h-4 w-4" /> Mois
                </button>
              </div>

              {/* Sélecteur mois */}
              {mode === "month" && (
                <input
                  type="month"
                  value={monthKey}
                  onChange={(e) => setMonthKey(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm shadow-sm"
                />
              )}
            </div>
          </div>

          <p className="text-center text-slate-600 mb-8">
            {mode === "total"
              ? "Classement global basé sur l’ensemble des campagnes."
              : `Classement du mois — ${monthKey}`}
          </p>

          {/* Loading / error */}
          {err && (
            <div className="mb-6 text-center text-red-600 text-sm">{err}</div>
          )}
          {loading && (
            <div className="mb-6 text-center text-slate-500 text-sm">
              Chargement…
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-violet-100">
                  <th className="p-3 text-left font-semibold text-violet-800">
                    Position
                  </th>
                  <th className="p-3 text-left font-semibold text-violet-800">
                    Employé
                  </th>
                  <th className="p-3 text-left font-semibold text-violet-800">
                    Département
                  </th>
                  <th className="p-3 text-left font-semibold text-violet-800">
                    {mode === "total" ? "Clics (Total)" : "Clics (Mois)"}
                  </th>
                  <th className="p-3 text-left font-semibold text-violet-800">
                    Score
                  </th>
                  <th className="p-3 text-left font-semibold text-violet-800">
                    Progression
                  </th>
                  <th className="p-3 text-left font-semibold text-violet-800">
                    Dernier clic
                  </th>
                  <th className="p-3 text-left font-semibold text-violet-800">
                    Badge
                  </th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((employee, index) => (
                  <tr
                    key={employee.email + index}
                    className="border-b border-slate-100 hover:bg-violet-50 transition-colors"
                  >
                    <td className="p-3 font-medium">
                      <div className="flex items-center">
                        {index === 0 && (
                          <Trophy className="h-5 w-5 text-amber-500 mr-2" />
                        )}
                        {index === 1 && (
                          <Award className="h-5 w-5 text-gray-400 mr-2" />
                        )}
                        {index === 2 && (
                          <Award className="h-5 w-5 text-amber-700 mr-2" />
                        )}
                        {index > 2 && <span className="ml-2">{index + 1}</span>}
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🧑‍💼</span>
                        <div>
                          <div className="font-medium">{employee.name}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3">{employee.department}</td>

                    <td className="p-3">
                      <span className="font-semibold">{employee.clicks}</span>
                    </td>

                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-200 rounded-full h-2.5">
                          <div
                            className="bg-violet-600 h-2.5 rounded-full"
                            style={{ width: `${employee.score}%` }}
                          />
                        </div>
                        <span className="font-semibold">{employee.score}%</span>
                      </div>
                    </td>

                    <td className="p-3">
                      {employee.trend === "up" && (
                        <span className="text-green-600 font-medium">
                          ↑ En progression
                        </span>
                      )}
                      {employee.trend === "down" && (
                        <span className="text-red-600 font-medium">
                          ↓ À améliorer
                        </span>
                      )}
                      {employee.trend === "steady" && (
                        <span className="text-blue-600 font-medium">
                          → Stable
                        </span>
                      )}
                    </td>

                    <td className="p-3">{torontoDateTime(employee.last)}</td>

                    <td className="p-3">
                      {index === 0 && (
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-sm">
                          <Star className="h-4 w-4" /> Champion anti-fraude
                        </span>
                      )}
                      {index === 1 && (
                        <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm">
                          <Star className="h-4 w-4" /> Expert vigilance
                        </span>
                      )}
                      {index === 2 && (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-full text-sm">
                          <Star className="h-4 w-4" /> Apprenti sage
                        </span>
                      )}
                      {index > 2 && employee.score >= 80 && (
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                          Bon élève
                        </span>
                      )}
                      {index > 2 && employee.score < 80 && (
                        <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                          En formation
                        </span>
                      )}
                    </td>
                  </tr>
                ))}

                {!loading && !err && ranking.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-slate-500">
                      Aucun résultat à afficher pour l’instant.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-10 border-t border-slate-200 bg-white py-7">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-slate-600">
            Programme de formation à la sécurité — {new Date().getFullYear()}
          </p>
          <p className="text-sm text-slate-500 mt-2">
            Cette simulation fait partie de notre programme continu de
            sensibilisation à la sécurité informatique.
          </p>
        </div>
      </footer>

      {/* Tiny CSS for cursor blink */}
      <style>{`
        @keyframes blink { 
          0%, 50% { opacity: 1; } 
          50.01%, 100% { opacity: 0; } 
        }
      `}</style>
    </div>
  );
}
