import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  PlayCircle,
  CheckCircle2,
  ChevronDown,
  X,
} from "lucide-react";

// Hook simple de machine à écrire
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

export default function DemoZeroClick({
  videoSrc = "/videos/zeroclick-demo.mp4",
  poster = "/images/zeroclick-poster.jpg",
  calendlyUrl = "https://calendly.com/hello-zeroclick/30min",
}) {
  const [showSticky, setShowSticky] = useState(false);
  const [openCalendly, setOpenCalendly] = useState(false);
  const slotsLeft = useMemo(() => Math.max(2, 7 - new Date().getDay()), []);

  useEffect(() => {
    const onScroll = () =>
      setShowSticky(window.scrollY > window.innerHeight * 0.35);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Texte animé pour le CTA principal
  const ctaFull = "Essayez la démo ZeroClick en 1 clic";
  const { text: typedCTA, done: typedDone } = useTypewriter(ctaFull, 28, 250);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-violet-50 text-slate-900">
      {/* Trust banner */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600">
        <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-center gap-3">
          <ShieldCheck className="h-5 w-5 text-white" />
          <p className="text-sm text-white/90">
            Simulation ZeroClick : aucun risque réel. Objectif : vous montrer
            comment éviter la prochaine attaque.
          </p>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-80 bg-[radial-gradient(70%_50%_at_50%_0%,rgba(139,92,246,0.1),transparent)]" />
        <div className="mx-auto max-w-7xl px-6 py-14 md:py-20 grid md:grid-cols-2 gap-12 items-center">
          <div className="max-w-2xl">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-2xl md:text-3xl lg:text-4xl font-semibold leading-snug text-center md:text-left"
            >
              <span className="block mt-1 text-slate-700">
                Analysez vos liens avant de cliquer dessus avec{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 font-bold">
                  ZeroClick
                </span>
                .
              </span>
            </motion.h1>

            <p className="mt-6 text-md text-slate-700 max-w-xl">
              Protégez votre entreprise contre les attaques par hameçonnage sans
              changer les habitudes de vos équipes.
            </p>

            <ul className="mt-7 space-y-3 text-sm text-slate-600">
              {[
                "Analyse des liens avant le clic (pré-clic)",
                "Déploiement en 5 minutes — aucune formation nécessaire",
                "Intégration transparente (email, web et SMS)",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-violet-600 flex-shrink-0 mt-0.5" />
                  <span className="text-lg">{t}</span>
                </li>
              ))}
            </ul>

            {/* CTA avec machine à écrire */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setOpenCalendly(true)}
                className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-base font-semibold text-white bg-violet-600 hover:bg-violet-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
                aria-live="polite"
              >
                <span className="inline-flex items-center">
                  {typedCTA || ctaFull}
                  <span
                    className={`ml-1 inline-block w-[1ch] ${
                      typedDone ? "opacity-0" : "opacity-80"
                    }`}
                    style={{
                      animation: "blink 1s steps(1,end) infinite",
                    }}
                    aria-hidden
                  >
                    |
                  </span>
                </span>
              </button>
            </div>

            {/* Coordonnées directes */}
            <div className="mt-4 text-sm text-slate-600 space-y-1">
              <p>
                📞{" "}
                <a
                  href="tel:5147738545"
                  className="text-violet-700 hover:underline"
                >
                  514&nbsp;773&nbsp;8545
                </a>
              </p>
              <p>
                📧{" "}
                <a
                  href="mailto:hello@zeroclick.tech"
                  className="text-violet-700 hover:underline"
                >
                  hello@zeroclick.tech
                </a>
              </p>
            </div>
          </div>

          {/* Video card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative group rounded-3xl bg-white/90 backdrop-blur-sm shadow-xl ring-1 ring-violet-100 overflow-hidden"
          >
            <div className="relative rounded-2xl overflow-hidden aspect-[16/9]">
              <video
                className="h-full w-full object-cover"
                src="pub.mp4"
                poster={poster}
                playsInline
                autoPlay
                muted
                loop
                controls
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-white to-violet-50">
              <div className="flex items-center gap-3 text-slate-700">
                <PlayCircle className="h-6 w-6 text-violet-600" />
                <span className="text-base font-medium">
                  Démonstration (0:35)
                </span>
              </div>
              <button
                onClick={() => setOpenCalendly(true)}
                className="text-base font-semibold text-violet-700 hover:text-violet-800 underline decoration-2 underline-offset-4"
              >
                Réserver une démo
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Calendly Modal */}
      <AnimatePresence>
        {openCalendly && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto"
          >
            <div
              className="fixed inset-0 bg-black/70"
              onClick={() => setOpenCalendly(false)}
            />
            <div className="relative min-h-screen flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden"
              >
                <div className="absolute top-4 right-4 z-10">
                  <button
                    onClick={() => setOpenCalendly(false)}
                    className="p-2 rounded-full bg-white text-slate-700 hover:bg-violet-50 transition-colors"
                    aria-label="Fermer le module de réservation"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="h-[700px]">
                  <iframe
                    src={calendlyUrl}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    className="rounded-2xl"
                    title="Calendly Scheduling"
                  />
                </div>
                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 text-center text-white text-sm">
                  <ShieldCheck className="inline-block mr-2" />
                  <span>Créneau sécurisé — Aucun spam ne vous sera envoyé</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky CTA bottom bar */}
      <AnimatePresence>
        {showSticky && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed inset-x-0 bottom-6 z-40 px-4"
          >
            <div className="mx-auto max-w-3xl rounded-2xl border border-violet-200 bg-white shadow-xl backdrop-blur-lg px-6 py-4 flex items-center gap-4">
              <div className="bg-violet-100 p-2 rounded-full">
                <ShieldCheck className="h-6 w-6 text-violet-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">
                  Votre démonstration personnalisée de 15 minutes
                </p>
                <p className="text-xs text-slate-600">
                  <span className="font-semibold text-violet-700">
                    {slotsLeft} créneaux
                  </span>{" "}
                  disponibles cette semaine
                </p>
              </div>
              <button
                onClick={() => setOpenCalendly(true)}
                className="rounded-xl px-5 py-3 text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 transition-opacity shadow-md"
              >
                Réserver maintenant
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Petite animation CSS pour le curseur */}
      <style>{`
        @keyframes blink { 
          0%, 50% { opacity: 1; } 
          50.01%, 100% { opacity: 0; } 
        }
      `}</style>
    </div>
  );
}
