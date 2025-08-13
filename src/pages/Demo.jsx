import React, { useEffect, useMemo, useRef, useState } from "react";
import { AlertOctagon } from "lucide-react";

export default function ZeroClickShockToCalm({
  redirectPath = "/demo",
  shockMs = 3000,
  breatheMs = 2000,
  preventMs = 2000,
}) {
  const [step, setStep] = useState(0);
  const mountedRef = useRef(true);

  const total = useMemo(
    () => shockMs + breatheMs + preventMs,
    [shockMs, breatheMs, preventMs]
  );

  useEffect(() => {
    mountedRef.current = true;

    const t1 = setTimeout(() => mountedRef.current && setStep(1), shockMs);
    const t2 = setTimeout(
      () => mountedRef.current && setStep(2),
      shockMs + breatheMs
    );
    const t3 = setTimeout(() => {
      if (!mountedRef.current) return;
      window.location.replace(redirectPath);
    }, total);

    return () => {
      mountedRef.current = false;
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [redirectPath, shockMs, breatheMs, preventMs, total]);

  return (
    <main className="min-h-screen w-full font-sans">
      <style>{`
        @keyframes scanlines { 0% { background-position: 0 0; } 100% { background-position: 0 8px; } }
        .scanlines { background-image: repeating-linear-gradient( to bottom, rgba(255,255,255,0.04), rgba(255,255,255,0.04) 1px, transparent 1px, transparent 8px ); animation: scanlines 1200ms linear infinite; }
        @keyframes progressBar { 0% { width: 0%; } 100% { width: 100%; } }
        .progress-bar { animation: progressBar ${preventMs}ms linear forwards; }
      `}</style>

      {step === 0 && <ShockScreen />}
      {step === 1 && <BreatheScreen />}
      {step === 2 && <PreventScreen />}
    </main>
  );
}

function ShockScreen() {
  return (
    <section className="relative flex h-screen w-full items-center justify-center bg-black text-red-500">
      <div className="absolute inset-0 scanlines opacity-40" aria-hidden />
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-red-700/50 bg-black/40 p-10 shadow-[0_0_0_1px_rgba(239,68,68,0.25)]">
        <div className="mb-6 flex flex-col items-center gap-3">
          <h1 className="text-transparent bg-clip-text bg-red-900 font-bold text-4xl mb-4">
            Oupss vous avez cliqué
          </h1>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-900/40 p-3 text-red-500">
              <AlertOctagon className="h-6 w-6" />
            </div>
            <h1 className="font-mono text-2xl font-bold tracking-tight text-white">
              VOS FICHIERS ONT ÉTÉ CHIFFRÉS
            </h1>
          </div>
        </div>
        <p className="font-mono text-sm text-white/90 mb-6">
          Un accès non autorisé a chiffré vos données. Pour restaurer vos
          fichiers, suivez les instructions ci-dessous.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-red-800/50 bg-red-950/30 p-4">
            <p className="font-mono text-xs text-white">
              État : <span className="text-red-400">Bloqué</span>
            </p>
          </div>
          <div className="rounded-lg border border-red-800/50 bg-red-950/30 p-4">
            <p className="font-mono text-xs text-white">
              Fichiers : <span className="text-red-400">1 284</span>
            </p>
          </div>
          <div className="rounded-lg border border-red-800/50 bg-red-950/30 p-4">
            <p className="font-mono text-xs text-white">
              Délai : <span className="text-red-400">00:00:10</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function BreatheScreen() {
  return (
    <section className="flex h-screen w-full items-center justify-center bg-white">
      <div className="text-center max-w-2xl px-4">
        <p className="text-4xl md:text-5xl mb-6">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 font-bold">
            Respirez.
          </span>
        </p>
        <p className="text-2xl md:text-3xl text-gray-800">
          Ce n'était qu'un test de sécurité
        </p>
      </div>
    </section>
  );
}

function PreventScreen() {
  return (
    <section className="flex h-screen w-full items-center justify-center bg-white">
      <div className="text-center max-w-2xl px-4">
        <p className="text-4xl md:text-5xl mb-8">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 font-bold">
            Demain, un hacker ne préviendra pas.
          </span>
        </p>

        <div className="mt-12 w-64 mx-auto bg-gray-200 rounded-full h-2">
          <div className="progress-bar h-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600" />
        </div>
        <p className="mt-4 text-gray-500">Redirection en cours...</p>
      </div>
    </section>
  );
}
