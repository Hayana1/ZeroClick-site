// Oups.js (version ULTRA gamifiée, couleurs et style conservés)
import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  AlertTriangle,
  Lock,
  Eye,
  CheckCircle,
  XCircle,
  ChevronDown,
  Trophy,
  Target,
  Star,
  Crown,
  Timer,
  Award,
  Sparkles,
  Rocket,
} from "lucide-react";

/* ------------------------ Typewriter ------------------------ */
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

function classNames(...a) {
  return a.filter(Boolean).join(" ");
}

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

/* ====================================================================== */

// Petits utilitaires de jeu
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

export default function Oups() {
  /** Hero CTA */
  const ctaFull = "Test de cybersécurité!";
  const { text: typedCTA, done: typedDone } = useTypewriter(ctaFull, 28, 250);

  /** Gamification State */
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0); // 0-100
  const [streak, setStreak] = useState(0);
  const [timer, setTimer] = useState(45); // compte à rebours pour le quiz
  const [expandedSection, setExpandedSection] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [quizStep, setQuizStep] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);

  // Quêtes (objectifs rapides)
  const quests = useMemo(
    () => [
      { id: "q1", label: "Identifier 3 signes de phishing", done: streak >= 1 },
      {
        id: "q2",
        label: "Répondre juste à 2 questions d'affilée",
        done: streak >= 2,
      },
      { id: "q3", label: "Atteindre 200 points", done: score >= 200 },
    ],
    [streak, score]
  );

  // Quiz simple (gamifié) — sans changer la palette
  const QUIZ = [
    {
      q: "Quel indice est le PLUS suspect dans un email ?",
      choices: [
        "Signature avec logo",
        "URL masquée avec un domaine étrange",
        "Formule de politesse classique",
        "Aucune faute",
      ],
      correct: 1,
      explain:
        "Survolez les liens : si le domaine réel ne correspond pas à l'expéditeur, c'est un drapeau rouge.",
      tile: "link-warning",
    },
    {
      q: "La meilleure première action face à un message pressant ?",
      choices: [
        "Cliquer vite avant de perdre l'accès",
        "Répondre avec ses infos",
        "Vérifier l'expéditeur et prendre du recul",
        "Télécharger la pièce jointe pour vérifier",
      ],
      correct: 2,
      explain:
        "L'urgence est une tactique courante. Validez l'expéditeur et la demande via un canal officiel.",
      tile: "time-pressure",
    },
    {
      q: "Que faire APRÈS avoir cliqué par erreur ?",
      choices: [
        "Ignorer si rien ne s'affiche",
        "Changer ses mots de passe et prévenir l'IT",
        "Transférer à des collègues",
        "Redémarrer 10 fois l'ordi",
      ],
      correct: 1,
      explain:
        "Agissez vite : changez vos mots de passe critiques et prévenez l'équipe IT pour limiter l'impact.",
      tile: "first-aid",
    },
  ];

  // Timer pour le quiz
  useEffect(() => {
    if (quizStep >= QUIZ.length) return; // fini
    if (answered) return; // pause pendant feedback
    if (timer <= 0) {
      handleAnswer(-1); // temps écoulé = faux
      return;
    }
    const id = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer, quizStep, answered]);

  const xpToLevel = useMemo(() => 100, []);

  function addToast(text, type = "success") {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2200);
  }

  function grantReward(isCorrect) {
    if (isCorrect) {
      const add = 120 - quizStep * 20; // points décroissants
      const newScore = score + add;
      const newXp = xp + 40;
      const newStreak = streak + 1;
      setScore(newScore);
      setXp(newXp >= xpToLevel ? newXp - xpToLevel : newXp);
      if (newXp >= xpToLevel) {
        setLevel((l) => l + 1);
        addToast("Niveau supérieur !", "level");
        pulseFireworks();
      }
      setStreak(newStreak);
      if (newStreak === 2) addToast("Série x2 !", "streak");
      if (newScore >= 200) addToast("Objectif 200 pts atteint !", "goal");
    } else {
      setStreak(0);
    }
  }

  function pulseFireworks() {
    setShowFireworks(true);
    setTimeout(() => setShowFireworks(false), 1200);
  }

  function handleAnswer(idx) {
    if (answered) return;
    setAnswered(true);
    const item = QUIZ[quizStep];
    const isCorrect = idx === item.correct;

    grantReward(isCorrect);
    addToast(
      isCorrect ? "+ Réponse correcte" : "Mauvaise réponse",
      isCorrect ? "success" : "error"
    );

    setTimeout(() => {
      setQuizStep((s) => s + 1);
      setTimer(45);
      setAnswered(false);
    }, 900);
  }

  const progress = clamp((xp / xpToLevel) * 100, 0, 100);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const finished = quizStep >= QUIZ.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100 relative overflow-hidden">
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

      {/* HUD (score / niveau / timer) */}
      <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <PixelIcon name="shield" size={24} />
          <span className="text-gray-300 text-sm">Niveau</span>
          <span className="px-2 py-0.5 rounded-md bg-gray-700/70 border border-gray-600 text-purple-200 text-sm font-semibold">
            {level}
          </span>
        </div>
        <div className="flex-1 max-w-xl mx-4">
          <div className="text-xs text-gray-400 mb-1 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-300" />
            Expérience
          </div>
          <div className="w-full h-2 rounded-full bg-gray-700 overflow-hidden border border-gray-600">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 80, damping: 20 }}
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-400"
            />
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-300" />
            <span className="text-gray-200 font-semibold">{score}</span>
          </div>
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-purple-300" />
            <span className="text-gray-200 font-semibold">
              {clamp(timer, 0, 99)}s
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-300" />
            <span className="text-gray-200 font-semibold">
              Série x{Math.max(1, streak)}
            </span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-20 bg-[radial-gradient(70%_50%_at_50%_0%,rgba(139,92,246,0.3),transparent)]" />
        <div className="mx-auto max-w-7xl px-6 py-10 md:py-16 flex flex-col items-center text-center">
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
            animate={{ opacity: 1, y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="mt-8 rounded-3xl overflow-hidden shadow-2xl"
          >
            <PixelIcon name="boo" size={150} />
          </motion.div>

          <div className="mt-8 max-w-2xl">
            <div className="mt-4 flex flex-col items-center">
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

            {/* Ruban de quêtes rapides */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-3">
              {quests.map((q) => (
                <div
                  key={q.id}
                  className={classNames(
                    "rounded-xl border p-3 flex items-center gap-3",
                    "bg-gray-800/80 border-gray-700"
                  )}
                >
                  <PixelIcon name={q.done ? "check" : "quest"} size={22} />
                  <span
                    className={classNames(
                      "text-sm",
                      q.done ? "text-green-300" : "text-gray-300"
                    )}
                  >
                    {q.label}
                  </span>
                  {q.done ? (
                    <CheckCircle className="w-4 h-4 text-green-400 ml-auto" />
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quiz Gamifié */}
      <section className="mx-auto max-w-4xl px-6 pb-4">
        <div className="bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Challenge Anti‑Phishing
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Star className="w-4 h-4 text-yellow-300" />
              {quizStep + 1}/{QUIZ.length}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!finished ? (
              <motion.div
                key={quizStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <div className="flex items-start gap-3">
                  <PixelIcon name={QUIZ[quizStep].tile} size={26} />
                  <p className="text-lg text-gray-200 font-medium">
                    {QUIZ[quizStep].q}
                  </p>
                </div>
                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {QUIZ[quizStep].choices.map((c, idx) => (
                    <button
                      key={idx}
                      disabled={answered}
                      onClick={() => handleAnswer(idx)}
                      className={classNames(
                        "w-full text-left p-4 rounded-xl border transition",
                        "bg-gray-800/70 border-gray-700 text-gray-200 hover:bg-gray-800 hover:border-gray-600",
                        answered &&
                          idx === QUIZ[quizStep].correct &&
                          "border-green-400",
                        answered &&
                          idx !== QUIZ[quizStep].correct &&
                          "opacity-60"
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                <AnimatePresence>
                  {answered && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="mt-4 p-4 rounded-xl bg-purple-900/20 border border-purple-700/30 text-purple-200"
                    >
                      <div className="flex items-start gap-3">
                        <Eye className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm">{QUIZ[quizStep].explain}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="text-center"
              >
                <div className="flex justify-center mb-4">
                  <Crown className="w-10 h-10 text-yellow-300" />
                </div>
                <h3 className="text-2xl font-bold text-white">Bravo !</h3>
                <p className="mt-2 text-gray-300">
                  Vous avez terminé le challenge. Score final :{" "}
                  <span className="text-indigo-300 font-semibold">
                    {score} pts
                  </span>
                </p>
                <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="rounded-xl border p-4 bg-gray-800/80 border-gray-700">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Trophy className="w-4 h-4 text-yellow-300" /> Score
                    </div>
                    <div className="text-2xl font-bold text-white">{score}</div>
                  </div>
                  <div className="rounded-xl border p-4 bg-gray-800/80 border-gray-700">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Award className="w-4 h-4 text-purple-300" /> Niveau
                    </div>
                    <div className="text-2xl font-bold text-white">{level}</div>
                  </div>
                  <div className="rounded-xl border p-4 bg-gray-800/80 border-gray-700">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Star className="w-4 h-4 text-indigo-300" /> Série max
                    </div>
                    <div className="text-2xl font-bold text-white">
                      x{Math.max(1, streak)}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-center">
                  <a
                    href="#formation"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-purple-700/40 bg-purple-900/20 text-purple-200 hover:bg-purple-900/30 transition"
                  >
                    <Rocket className="w-5 h-5" /> Continuer la formation
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Section éducative (accordéons) */}
      <section id="formation" className="mx-auto max-w-4xl px-6 py-10">
        <div className="bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-700">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center">
            Apprenez à reconnaître les emails de phishing
          </h2>

          <div className="space-y-4">
            {/* Section 1 */}
            <div className="bg-gray-750 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection("signes")}
                className="w-full p-4 text-left flex justify-between items-center text-purple-300 font-semibold"
              >
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Signes révélateurs d'un email de phishing
                </span>
                <ChevronDown
                  className={classNames(
                    "h-5 w-5 transform transition-transform",
                    expandedSection === "signes" ? "rotate-180" : ""
                  )}
                />
              </button>

              {expandedSection === "signes" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="px-4 pb-4"
                >
                  <ul className="space-y-3 text-gray-300">
                    {[
                      "Expéditeur inconnu ou adresse email suspecte",
                      "Fautes d'orthographe et grammaire médiocre",
                      "Sentiment d'urgence ou menace",
                      "Demande d'informations personnelles",
                      "Liens ou pièces jointes suspects",
                    ].map((t, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <XCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </div>

            {/* Section 2 */}
            <div className="bg-gray-750 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection("prevention")}
                className="w-full p-4 text-left flex justify-between items-center text-purple-300 font-semibold"
              >
                <span className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Mesures de prévention
                </span>
                <ChevronDown
                  className={classNames(
                    "h-5 w-5 transform transition-transform",
                    expandedSection === "prevention" ? "rotate-180" : ""
                  )}
                />
              </button>

              {expandedSection === "prevention" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="px-4 pb-4"
                >
                  <ul className="space-y-3 text-gray-300">
                    {[
                      "Vérifiez toujours l'adresse de l'expéditeur",
                      "Survolez les liens avant de cliquer",
                      "Ne communiquez jamais vos identifiants",
                      "Utilisez l'authentification à deux facteurs",
                      "Signalez les emails suspects au service informatique",
                    ].map((t, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </div>

            {/* Section 3 */}
            <div className="bg-gray-750 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection("que-faire")}
                className="w-full p-4 text-left flex justify-between items-center text-purple-300 font-semibold"
              >
                <span className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Que faire si vous cliquez sur un lien suspect?
                </span>
                <ChevronDown
                  className={classNames(
                    "h-5 w-5 transform transition-transform",
                    expandedSection === "que-faire" ? "rotate-180" : ""
                  )}
                />
              </button>

              {expandedSection === "que-faire" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="px-4 pb-4"
                >
                  <ol className="space-y-3 text-gray-300 list-decimal pl-5">
                    <li>Déconnectez-vous immédiatement d'Internet</li>
                    <li>Scannez votre appareil avec un antivirus</li>
                    <li>Changez vos mots de passe importants</li>
                    <li>Surveillez vos comptes pour toute activité suspecte</li>
                    <li>Signalez l'incident à votre service informatique</li>
                  </ol>
                </motion.div>
              )}
            </div>
          </div>

          <div className="mt-8 p-4 bg-purple-900/20 rounded-lg border border-purple-700/30">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-6 w-6 text-purple-400 mt-0.5 flex-shrink-0" />
              <p className="text-purple-200">
                <strong>Rappel important :</strong> Votre vigilance est la
                première ligne de défense contre les cybermenaces. Restez
                attentifs aux signes d'alerte et suivez les procédures de
                sécurité établies par votre organisation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Toasts gamifiés */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 space-y-2 w-[90%] max-w-md z-50">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={classNames(
                "px-4 py-3 rounded-xl border shadow-lg",
                "bg-gray-900/90 border-gray-700 text-gray-200"
              )}
            >
              <div className="flex items-center gap-3">
                {t.type === "success" && (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                )}
                {t.type === "error" && (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                {t.type === "level" && (
                  <Crown className="w-5 h-5 text-yellow-300" />
                )}
                {t.type === "streak" && (
                  <Target className="w-5 h-5 text-indigo-300" />
                )}
                {t.type === "goal" && (
                  <Trophy className="w-5 h-5 text-yellow-300" />
                )}
                <span className="text-sm">{t.text}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Fireworks (subtiles) */}
      <AnimatePresence>
        {showFireworks && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed inset-0 z-40"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(147,51,234,0.15),transparent_60%)]" />
          </motion.div>
        )}
      </AnimatePresence>

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
        @keyframes blink { 0%, 50% { opacity: 1; } 50.01%, 100% { opacity: 0; } }
        body { font-family: "Titillium Web", sans-serif; }
        .bg-gray-750 { background-color: #2d3748; }
      `}</style>
    </div>
  );
}
