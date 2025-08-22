import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, PlayCircle, CheckCircle2, X } from "lucide-react";

// Simple typewriter hook
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
  videoSrc = "/pub.mp4",
  poster = "/images/zeroclick-poster.jpg",
  calendlyUrl = "https://calendly.com/hello-zeroclick/30min",
}) {
  const [openCalendly, setOpenCalendly] = useState(false);

  const ctaFull = "Try the ZeroClick demo in one click";
  const { text: typedCTA, done: typedDone } = useTypewriter(ctaFull, 28, 250);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-violet-50 text-slate-900">
      {/* Trust banner (short text) */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600">
        <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-center gap-3">
          <ShieldCheck className="h-5 w-5 text-white" />
          <p className="text-sm text-white/90">
            ZeroClick simulation — no real risk.
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
              <span className="block mt-1 text-slate-800">
                Check links safely with{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 font-bold">
                  ZeroClick
                </span>
                .
              </span>
            </motion.h1>

            {/* Short copy */}
            <p className="mt-6 text-base text-slate-700 max-w-xl">
              Stop fraud without changing habits.
            </p>

            {/* Short bullets */}
            <ul className="mt-6 space-y-3 text-slate-700">
              {[
                "Pre-click link analysis",
                "Set up in 5 minutes",
                "Email, Web & SMS",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-violet-600 flex-shrink-0 mt-0.5" />
                  <span className="text-base">{t}</span>
                </li>
              ))}
            </ul>

            {/* Typewriter CTA */}
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
                    style={{ animation: "blink 1s steps(1,end) infinite" }}
                    aria-hidden
                  >
                    |
                  </span>
                </span>
              </button>
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
                src={videoSrc}
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
                <span className="text-base font-medium">Demo (0:35)</span>
              </div>
              <button
                onClick={() => setOpenCalendly(true)}
                className="text-base font-semibold text-violet-700 hover:text-violet-800 underline decoration-2 underline-offset-4"
              >
                Book a demo
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Small logos at bottom */}
      <footer className="mt-10 border-t border-slate-200 bg-white py-7">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center justify-center gap-8 opacity-80">
            <img
              src="/HEC.svg.png"
              alt="Partner logo 1"
              className="h-20 w-auto object-contain"
            />
            <img
              src="/millenium.png"
              alt="Partner logo 2"
              className="h-20 w-auto object-contain"
            />
          </div>
        </div>
      </footer>

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
                    aria-label="Close scheduling modal"
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
                  <span>Secure booking — no spam</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
