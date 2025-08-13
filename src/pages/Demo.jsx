import React, { useEffect, useMemo, useRef, useState } from "react";
import { AlertOctagon, ShieldCheck } from "lucide-react";

export default function ZeroClickShockToCalm({
  redirectPath = "/demo",
  shockMs = 2500,
  breatheMs = 3000,
  preventMs = 3500,
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
    <main className="min-h-screen w-full font-sans overflow-hidden">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes breatheCycle { 
          0% { transform: scale(0.95); opacity: 0.9; } 
          50% { transform: scale(1.05); opacity: 1; } 
          100% { transform: scale(0.95); opacity: 0.9; } 
        }
        @keyframes progressBar { 0% { width: 0%; } 100% { width: 100%; } }
        .fade-in { animation: fadeIn 0.6s cubic-bezier(0.22, 0.61, 0.36, 1); }
        .breathe { animation: breatheCycle 3.5s ease-in-out infinite; }
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
    <section className="relative flex h-screen w-full items-center justify-center bg-gradient-to-br from-gray-900 to-black text-red-400">
      {/* Effet de bruit numérique */}
      <div
        className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMwMDAiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIyIiBmaWxsPSIjMzAwIiBvcGFjaXR5PSIwLjEiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPiUjMDE2MDs8L3RleHQ+PC9zdmc+')] opacity-20"
        aria-hidden
      />

      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-red-800/60 bg-gradient-to-br from-gray-900 to-black p-8 backdrop-blur-sm">
        <div className="mb-6 flex items-center gap-4">
          <div className="rounded-xl bg-red-900/40 p-3 text-red-500">
            <AlertOctagon className="h-8 w-8" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-red-400">
            VOS FICHIERS ONT ÉTÉ <span className="text-red-300">CHIFFRÉS</span>
          </h1>
        </div>

        <p className="mb-8 text-lg text-red-300/80">
          Un accès non autorisé a chiffré vos données. Pour restaurer vos
          fichiers,
          <span className="block mt-1 font-medium">
            suivez les instructions ci-dessous.
          </span>
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: "État", value: "Bloqué", color: "text-red-400" },
            { label: "Fichiers", value: "1 284", color: "text-red-300" },
            { label: "Délai", value: "00:00:10", color: "text-red-500" },
          ].map((item, index) => (
            <div
              key={index}
              className="rounded-xl border border-red-800/50 bg-red-950/20 p-4 transition-all hover:bg-red-950/40"
            >
              <p className="text-sm text-red-500">{item.label}</p>
              <p className={`mt-1 text-lg font-medium ${item.color}`}>
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 h-1 w-full overflow-hidden rounded-full bg-red-900/30">
          <div className="h-full bg-red-500/80" style={{ width: "35%" }} />
        </div>
      </div>
    </section>
  );
}

function BreatheScreen() {
  return (
    <section className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-100">
      <div className="mx-auto w-full max-w-2xl rounded-3xl border border-white/80 bg-white/90 p-10 shadow-xl backdrop-blur-sm">
        <div className="mb-10 text-center">
          <h2 className="text-5xl font-bold text-cyan-800">Respirez.</h2>
          <p className="mt-4 text-xl text-cyan-600">
            Ce n'était qu'un{" "}
            <span className="font-semibold text-cyan-700">
              exercice de sensibilisation
            </span>
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-8">
          <div className="relative">
            <div className="breathe h-56 w-56 rounded-full bg-gradient-to-br from-cyan-400 to-teal-400 shadow-lg" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-40 w-40 rounded-full bg-white/30 backdrop-blur-sm" />
            </div>
          </div>

          <div className="text-center">
            <p className="text-xl font-medium text-gray-700">
              Inspirez{" "}
              <span className="font-bold text-cyan-600">4 secondes</span>
            </p>
            <div className="my-2 h-1 w-48 rounded-full bg-cyan-100">
              <div className="h-full w-2/3 bg-cyan-400 rounded-full" />
            </div>
            <p className="text-lg text-gray-600">
              Expirez{" "}
              <span className="font-medium text-cyan-600">4 secondes</span>
            </p>
          </div>

          <p className="text-sm text-cyan-700/70">
            Aucune donnée n'a été collectée. Votre poste est sécurisé.
          </p>
        </div>
      </div>
    </section>
  );
}

function PreventScreen() {
  return (
    <section className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100">
      <div className="mx-auto w-full max-w-2xl rounded-3xl border border-white/80 bg-white/90 p-10 shadow-xl backdrop-blur-sm">
        <div className="mb-6 flex items-start gap-4">
          <div className="rounded-xl bg-teal-100 p-3 text-teal-700">
            <ShieldCheck className="h-8 w-8" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">
              Aujourd'hui un test.{" "}
              <span className="text-teal-600">Demain, peut-être pas.</span>
            </h3>
            <p className="mt-2 text-gray-600">
              Vous allez être redirigé vers une démonstration de protection
            </p>
          </div>
        </div>

        <div className="my-8 space-y-4">
          {[
            "Identifier les domaines à risque en un coup d'œil",
            "Bloquer les téléchargements suspects automatiquement",
            "Former vos équipes sans friction",
          ].map((item, index) => (
            <div key={index} className="flex items-start">
              <div className="mr-3 mt-1 h-2 w-2 rounded-full bg-teal-500" />
              <p className="text-gray-700">{item}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-full bg-gray-200">
          <div className="progress-bar h-2 rounded-full bg-teal-500" />
        </div>

        <p className="mt-4 text-center text-sm text-gray-500">
          Redirection en cours...
        </p>
      </div>
    </section>
  );
}
