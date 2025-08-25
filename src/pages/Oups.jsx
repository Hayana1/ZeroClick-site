// Oups.js (version améliorée)
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
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:7300/api";

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
  const ctaFull = "Test de cybersécurité!";
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100">
      {/* Trust banner */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 border-b border-gray-700">
        <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-center gap-3">
          <ShieldCheck className="h-5 w-5 text-purple-300" />
          <p className="text-sm text-purple-200">
            Formation à la lutte contre la fraude par courriel — Test de
            sécurité
          </p>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-20 bg-[radial-gradient(70%_50%_at_50%_0%,rgba(139,92,246,0.3),transparent)]" />
        <div className="mx-auto max-w-7xl px-6 py-14 md:py-20 flex flex-col items-center text-center">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold leading-snug bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-indigo-300"
          >
            <span className="block mt-1">Oups ! Vous avez cliqué...</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 rounded-3xl overflow-hidden shadow-2xl"
          >
            <img
              src="https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif"
              alt="GIF humoristique sur la cybersécurité"
              className="w-full max-w-md mx-auto rounded-2xl"
            />
          </motion.div>

          <div className="mt-8 max-w-2xl">
            <div className="mt-8 flex flex-col items-center">
              <span className="inline-flex items-center text-xl font-semibold text-purple-300">
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

            <p className="mt-6 text-lg text-gray-300">
              Ne vous inquiétez pas, il s'agit d'une simulation de formation
              pour la lutte contre la fraude par courriel.
            </p>
          </div>
        </div>
      </section>

      {/* KPIs */}
      <section className="mx-auto max-w-7xl px-6 -mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-xl p-5 shadow-lg border border-gray-700 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-900/30">
              <Activity className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <div className="text-gray-400 text-xs">Campagnes</div>
              <div className="text-xl font-semibold text-white">
                {kpis.totalCampaigns}
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-5 shadow-lg border border-gray-700 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-900/30">
              <Users className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <div className="text-gray-400 text-xs">Employés</div>
              <div className="text-xl font-semibold text-white">
                {kpis.totalEmployees}
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-5 shadow-lg border border-gray-700 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-900/30">
              <MousePointerClick className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <div className="text-gray-400 text-xs">Clics totaux</div>
              <div className="text-xl font-semibold text-white">
                {kpis.totalClicks}
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-5 shadow-lg border border-gray-700 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-900/30">
              <Percent className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <div className="text-gray-400 text-xs">CTR global</div>
              <div className="text-xl font-semibold text-white">
                {kpis.globalCTR.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Classement */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 border border-gray-700">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Trophy className="h-6 w-6 text-amber-400" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Classement des Vigilants
              </h2>
            </div>

            {/* Mode switch */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div
                className={classNames(
                  "inline-flex rounded-lg border border-gray-700 p-1 bg-gray-700",
                  "shadow-sm"
                )}
              >
                <button
                  onClick={() => setMode("total")}
                  className={classNames(
                    "px-3 py-1.5 text-sm rounded-md transition-colors",
                    mode === "total"
                      ? "bg-purple-700 text-white shadow"
                      : "text-gray-300"
                  )}
                >
                  Total
                </button>
                <button
                  onClick={() => setMode("month")}
                  className={classNames(
                    "px-3 py-1.5 text-sm rounded-md flex items-center gap-1 transition-colors",
                    mode === "month"
                      ? "bg-purple-700 text-white shadow"
                      : "text-gray-300 "
                  )}
                >
                  <CalendarClock className="h-4 w-4" /> Mois
                </button>
              </div>

              {/* Sélecteur mois */}
              {mode === "month" && (
                <div className="relative">
                  <CalendarClock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="month"
                    value={monthKey}
                    onChange={(e) => setMonthKey(e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          <p className="text-center text-gray-400 mb-8">
            {mode === "total"
              ? "Classement global basé sur l'ensemble des campagnes."
              : `Classement du mois — ${monthKey}`}
          </p>

          {/* Loading / error */}
          {err && (
            <div className="mb-6 text-center text-red-400 text-sm">{err}</div>
          )}
          {loading && (
            <div className="mb-6 flex justify-center">
              <div className="animate-pulse flex space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <div className="w-3 h-3 bg-purple-500 rounded-full animation-delay-200"></div>
                <div className="w-3 h-3 bg-purple-500 rounded-full animation-delay-400"></div>
              </div>
            </div>
          )}

          <div className="overflow-x-auto rounded-lg border border-gray-700">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-black">
                  <th className="p-3 text-left font-medium text-gray-700 text-xs uppercase tracking-wider">
                    Position
                  </th>
                  <th className="p-3 text-left font-medium text-gray-700 text-xs uppercase tracking-wider">
                    Employé
                  </th>
                  <th className="p-3 text-left font-medium text-gray-700 text-xs uppercase tracking-wider">
                    Département
                  </th>
                  <th className="p-3 text-left font-medium text-gray-700 text-xs uppercase tracking-wider">
                    {mode === "total" ? "Clics (Total)" : "Clics (Mois)"}
                  </th>
                  <th className="p-3 text-left font-medium text-gray-700 text-xs uppercase tracking-wider">
                    Score
                  </th>
                  <th className="p-3 text-left font-medium text-gray-700 text-xs uppercase tracking-wider">
                    Progression
                  </th>
                  <th className="p-3 text-left font-medium text-gray-700 text-xs uppercase tracking-wider">
                    Dernier clic
                  </th>
                  <th className="p-3 text-left font-medium text-gray-700 text-xs uppercase tracking-wider">
                    Badge
                  </th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((employee, index) => (
                  <tr
                    key={employee.email + index}
                    className="border-b border-gray-700  transition-colors"
                  >
                    <td className="p-3 font-medium text-white">
                      <div className="flex items-center">
                        {index === 0 && (
                          <Trophy className="h-5 w-5 text-amber-400 mr-2" />
                        )}
                        {index === 1 && (
                          <Award className="h-5 w-5 text-gray-300 mr-2" />
                        )}
                        {index === 2 && (
                          <Award className="h-5 w-5 text-amber-600 mr-2" />
                        )}
                        {index > 2 && <span className="ml-2">{index + 1}</span>}
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-900/30 flex items-center justify-center">
                          <span className="text-sm">🧑‍💼</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-100">
                            {employee.name}
                          </div>
                          <div className="text-xs text-gray-400">
                            {employee.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3 text-gray-300">{employee.department}</td>

                    <td className="p-3">
                      <span className="font-semibold text-gray-100">
                        {employee.clicks}
                      </span>
                      <span className="text-xs text-gray-700 ml-1">
                        / {employee.parts}
                      </span>
                    </td>

                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${employee.score}%` }}
                          />
                        </div>
                        <span className="font-semibold text-gray-100 text-sm w-10">
                          {employee.score}%
                        </span>
                      </div>
                    </td>

                    <td className="p-3">
                      {employee.trend === "up" && (
                        <span className="inline-flex items-center gap-1 text-green-400 font-medium text-sm">
                          <TrendingUp className="h-4 w-4" /> Progression
                        </span>
                      )}
                      {employee.trend === "down" && (
                        <span className="inline-flex items-center gap-1 text-red-400 font-medium text-sm">
                          <TrendingDown className="h-4 w-4" /> À améliorer
                        </span>
                      )}
                      {employee.trend === "steady" && (
                        <span className="inline-flex items-center gap-1 text-blue-400 font-medium text-sm">
                          <Minus className="h-4 w-4" /> Stable
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-sm text-gray-400">
                      {torontoDateTime(employee.last)}
                    </td>

                    <td className="p-3">
                      {index === 0 && (
                        <span className="inline-flex items-center gap-1 bg-amber-400/10 text-amber-300 px-2.5 py-1 rounded-full text-xs border border-amber-400/20">
                          <Star className="h-3.5 w-3.5" /> Champion
                        </span>
                      )}
                      {index === 1 && (
                        <span className="inline-flex items-center gap-1 bg-gray-400/10 text-gray-300 px-2.5 py-1 rounded-full text-xs border border-gray-400/20">
                          <Star className="h-3.5 w-3.5" /> Expert
                        </span>
                      )}
                      {index === 2 && (
                        <span className="inline-flex items-center gap-1 bg-amber-600/10 text-amber-400 px-2.5 py-1 rounded-full text-xs border border-amber-600/20">
                          <Star className="h-3.5 w-3.5" /> Apprenti
                        </span>
                      )}
                      {index > 2 && employee.score >= 80 && (
                        <span className="inline-flex items-center gap-1 bg-green-400/10 text-green-300 px-2.5 py-1 rounded-full text-xs border border-green-400/20">
                          Bon élève
                        </span>
                      )}
                      {index > 2 && employee.score < 80 && (
                        <span className="inline-flex items-center gap-1 bg-blue-400/10 text-blue-300 px-2.5 py-1 rounded-full text-xs border border-blue-400/20">
                          En formation
                        </span>
                      )}
                    </td>
                  </tr>
                ))}

                {!loading && !err && ranking.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-gray-500">
                      Aucun résultat à afficher pour l'instant.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-10 border-t border-gray-800 bg-gray-900 py-7">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-gray-400">
            Programme de formation à la sécurité — {new Date().getFullYear()}
          </p>
          <p className="text-sm text-gray-500 mt-2">
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
        body {
          font-family: "Titillium Web", sans-serif;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        .bg-gray-750 {
          background-color: #2d3748;
        }
      `}</style>
    </div>
  );
}
