import React, { useState } from "react";
import { useForm, ValidationError } from "@formspree/react";
import {
  Mail,
  BarChart2,
  Activity,
  MessageSquare,
  Lock,
  Gift,
  Clock,
  ArrowLeft,
  ArrowRight,
  Check,
  Send,
  Zap,
} from "react-feather";

export default function ReadyToTry() {
  const [state, handleSubmit] = useForm("mwpqqwkw");
  const [currentStep, setCurrentStep] = useState(1);
  const [isHovering, setIsHovering] = useState(false);

  if (state.succeeded) {
    return (
      <section className="relative px-4 py-24 overflow-hidden bg-[#0F0F19]">
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-[#8A4FFF] to-[#B47AFF] mb-8 animate-pulse">
            <Check className="w-12 h-12 text-white" strokeWidth={1.5} />
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B47AFF] via-[#9D5AFF] to-[#8A4FFF] animate-gradient">
              Demande envoyée avec succès !
            </span>
          </h2>

          <p className="text-xl text-[#D9C7FF] mb-8 max-w-2xl mx-auto leading-relaxed">
            Notre équipe vous contactera dans les prochaines heures pour
            finaliser votre essai gratuit.
          </p>

          <div className="bg-gradient-to-br from-[#1E1B2B]/80 to-[#2A2342]/80 p-6 rounded-2xl border border-[#8A4FFF]/30 mb-10 backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <Zap
                className="w-6 h-6 text-[#B47AFF] flex-shrink-0 mt-1"
                strokeWidth={1.5}
              />
              <div>
                <p className="text-lg font-medium text-white mb-2">
                  Accélérez le processus
                </p>
                <p className="text-[#D9C7FF]">
                  Envoyez dès maintenant votre première facture à{" "}
                  <span className="font-mono bg-[#1E1B2B] px-3 py-1.5 rounded-lg text-[#B47AFF] border border-[#3A2E5D] inline-flex items-center gap-2">
                    hello@ZeroClick.tech
                    <button className="text-[#8A4FFF] hover:text-[#B47AFF] transition-colors">
                      <Send className="w-4 h-4" />
                    </button>
                  </span>{" "}
                  pour un traitement prioritaire !
                </p>
              </div>
            </div>
          </div>

          <div className="inline-flex items-center text-sm text-[#8A4FFF] bg-[#1E1B2B]/50 px-4 py-2 rounded-full border border-[#8A4FFF]/20">
            <Clock className="w-4 h-4 mr-2" strokeWidth={2} />
            Temps moyen de réponse:{" "}
            <span className="font-semibold ml-1">moins de 2 heures</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative px-4 py-24 overflow-hidden bg-[#0F0F19]">
      {/* Éléments décoratifs animés */}
      <div className="absolute inset-0 overflow-hidden opacity-15">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-[#8A4FFF] to-[#B47AFF]"
            style={{
              width: `${Math.random() * 10 + 4}px`,
              height: `${Math.random() * 10 + 4}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 15 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: Math.random() * 0.5 + 0.1,
            }}
          />
        ))}
      </div>

      <div className="relative max-w-3xl mx-auto">
        <div className="bg-gradient-to-br from-[#1E1B2B] to-[#2A2342] p-8 rounded-2xl border border-[#8A4FFF]/20 shadow-2xl relative overflow-hidden backdrop-blur-sm">
          {/* Effet de lumière animé */}
          <div className="absolute -top-28 -right-28 w-64 h-64 rounded-full bg-[#8A4FFF]/10 blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-[#B47AFF]/10 blur-3xl animate-pulse animation-delay-2000"></div>

          <div className="relative z-10">
            {/* Badge animé */}
            <div className="inline-flex items-center px-4 py-2 mb-6 rounded-full bg-gradient-to-r from-[#8A4FFF]/10 to-[#B47AFF]/10 border border-[#8A4FFF]/30 text-[#D9C7FF] text-sm font-medium animate-bounce">
              <Gift className="w-4 h-4 mr-2 text-[#B47AFF]" strokeWidth={2} />
              ESSAI GRATUIT - 3 FACTURES OFFERTES
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Prêt à{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B47AFF] via-[#9D5AFF] to-[#8A4FFF] animate-gradient">
                transformer votre trésorerie
              </span>{" "}
              ?
            </h2>

            {/* Barre de progression */}
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                <span className="text-xs font-medium text-[#D1C4E9]">
                  Étape {currentStep} sur 3
                </span>
                <span className="text-xs font-medium text-[#8A4FFF]">
                  {Math.round((currentStep / 3) * 100)}% complété
                </span>
              </div>
              <div className="w-full bg-[#1E1B2B] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#8A4FFF] to-[#B47AFF] h-2 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                ></div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Étape 1 - Email */}
              <div
                className={`space-y-6 transition-all duration-500 ease-in-out ${
                  currentStep !== 1
                    ? "opacity-0 absolute h-0 pointer-events-none"
                    : "opacity-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-[#D1C4E9] flex items-center gap-2"
                  >
                    <Mail
                      className="w-4 h-4 text-[#8A4FFF]"
                      strokeWidth={2.5}
                    />
                    Votre email professionnel *
                  </label>
                  <span className="text-xs text-[#8A4FFF] bg-[#8A4FFF]/10 px-2 py-1 rounded-full">
                    Étape 1/3
                  </span>
                </div>
                <input
                  id="email"
                  type="email"
                  name="email"
                  className="w-full bg-[#1E1B2B] border border-[#3A2E5D] rounded-xl px-5 py-3.5 text-white placeholder-[#6B5B8C] focus:border-[#8A4FFF] focus:ring-2 focus:ring-[#8A4FFF]/50 transition-all shadow-inner"
                  placeholder="votre@entreprise.com"
                  required
                  onFocus={() => setCurrentStep(1)}
                />
                <ValidationError
                  prefix="Email"
                  field="email"
                  errors={state.errors}
                />
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="w-full group bg-gradient-to-r from-[#8A4FFF] to-[#9D5AFF] hover:from-[#9D5AFF] hover:to-[#B47AFF] text-white font-medium py-3.5 px-6 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-[#8A4FFF]/40 flex items-center justify-center mt-2"
                >
                  <span>Continuer</span>
                  <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Étape 2 - Taille entreprise */}
              <div
                className={`space-y-6 transition-all duration-500 ease-in-out ${
                  currentStep !== 2
                    ? "opacity-0 absolute h-0 pointer-events-none"
                    : "opacity-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-[#D1C4E9] flex items-center gap-2">
                    <BarChart2
                      className="w-4 h-4 text-[#8A4FFF]"
                      strokeWidth={2.5}
                    />
                    Nombre de factures impayées par mois *
                  </label>
                  <span className="text-xs text-[#8A4FFF] bg-[#8A4FFF]/10 px-2 py-1 rounded-full">
                    Étape 2/3
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {["1-5", "5-10", "10-20", "20+"].map((option) => (
                    <div
                      key={option}
                      className="flex items-center p-4 bg-[#1E1B2B] border border-[#3A2E5D] rounded-xl hover:border-[#8A4FFF] transition-all cursor-pointer group"
                      onClick={() => document.getElementById(option).click()}
                    >
                      <input
                        id={option}
                        name="factures_mois"
                        type="radio"
                        value={option}
                        className="h-4 w-4 border-[#3A2E5D] text-[#8A4FFF] focus:ring-2 focus:ring-[#8A4FFF]/50"
                        required
                        onFocus={() => setCurrentStep(2)}
                      />
                      <label
                        htmlFor={option}
                        className="ml-3 text-sm font-medium text-[#D9C7FF] group-hover:text-white cursor-pointer"
                      >
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="w-1/2 group bg-[#1E1B2B] border border-[#3A2E5D] text-[#D9C7FF] font-medium py-3.5 px-6 rounded-xl transition-all hover:border-[#8A4FFF] flex items-center justify-center"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-0.5 transition-transform" />
                    Retour
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="w-1/2 group bg-gradient-to-r from-[#8A4FFF] to-[#9D5AFF] hover:from-[#9D5AFF] hover:to-[#B47AFF] text-white font-medium py-3.5 px-6 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-[#8A4FFF]/40 flex items-center justify-center"
                  >
                    <span>Continuer</span>
                    <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Étape 3 - Douleur */}
              <div
                className={`space-y-6 transition-all duration-500 ease-in-out ${
                  currentStep !== 3
                    ? "opacity-0 absolute h-0 pointer-events-none"
                    : "opacity-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-[#D1C4E9] flex items-center gap-2">
                    <Activity
                      className="w-4 h-4 text-[#8A4FFF]"
                      strokeWidth={2.5}
                    />
                    À quel point ce problème vous stresse-t-il ? *
                  </label>
                  <span className="text-xs text-[#8A4FFF] bg-[#8A4FFF]/10 px-2 py-1 rounded-full">
                    Étape 3/3
                  </span>
                </div>
                <div className="flex justify-between text-xs text-[#D1C4E9] mb-1">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-[#27C93F]"></div>
                    Peu stressant
                  </span>
                  <span className="flex items-center gap-1">
                    Très stressant
                    <div className="w-2 h-2 rounded-full bg-[#FF5F56]"></div>
                  </span>
                </div>
                <input
                  type="range"
                  name="stress_level"
                  min="1"
                  max="10"
                  className="w-full h-2 bg-[#3A2E5D] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-[#8A4FFF] [&::-webkit-slider-thumb]:to-[#B47AFF]"
                  required
                  onFocus={() => setCurrentStep(3)}
                />
                <div className="flex justify-between text-xs text-[#8A4FFF] mt-1 px-1">
                  {[1, 3, 5, 7, 10].map((num) => (
                    <span
                      key={num}
                      className="w-4 h-4 flex items-center justify-center"
                    >
                      {num}
                    </span>
                  ))}
                </div>

                {/* Message optionnel */}
                <div className="space-y-3 pt-4">
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-[#D1C4E9] flex items-center gap-2"
                  >
                    <MessageSquare
                      className="w-4 h-4 text-[#8A4FFF]"
                      strokeWidth={2.5}
                    />
                    Dites-nous en plus (optionnel)
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={3}
                    className="w-full bg-[#1E1B2B] border border-[#3A2E5D] rounded-xl px-5 py-3.5 text-white placeholder-[#6B5B8C] focus:border-[#8A4FFF] focus:ring-2 focus:ring-[#8A4FFF]/50 transition-all shadow-inner"
                    placeholder="Ex: Principalement des clients B2B, délais de paiement de 60+ jours..."
                  />
                  <ValidationError
                    prefix="Message"
                    field="message"
                    errors={state.errors}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="w-1/2 group bg-[#1E1B2B] border border-[#3A2E5D] text-[#D9C7FF] font-medium py-3.5 px-6 rounded-xl transition-all hover:border-[#8A4FFF] flex items-center justify-center"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-0.5 transition-transform" />
                    Retour
                  </button>
                  <button
                    type="submit"
                    disabled={state.submitting}
                    className={`w-1/2 group bg-gradient-to-r from-[#8A4FFF] to-[#9D5AFF] hover:from-[#9D5AFF] hover:to-[#B47AFF] text-white font-medium py-3.5 px-6 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-[#8A4FFF]/40 flex items-center justify-center ${
                      isHovering ? "animate-pulse" : ""
                    }`}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                  >
                    {state.submitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2 group-hover:translate-y-[-2px] transition-transform" />
                        Envoyer la demande
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-10 pt-6 border-t border-[#3A2E5D]/50">
              <div className="flex flex-wrap justify-center gap-6 text-[#D9C7FF] text-sm">
                <div className="flex items-center bg-[#1E1B2B]/50 px-3 py-1.5 rounded-full">
                  <Lock
                    className="w-4 h-4 text-[#8A4FFF] mr-2"
                    strokeWidth={2}
                  />
                  <span>Données 100% sécurisées</span>
                </div>
                <div className="flex items-center bg-[#1E1B2B]/50 px-3 py-1.5 rounded-full">
                  <Gift
                    className="w-4 h-4 text-[#B47AFF] mr-2"
                    strokeWidth={2}
                  />
                  <span>3 premières factures offertes</span>
                </div>
                <div className="flex items-center bg-[#1E1B2B]/50 px-3 py-1.5 rounded-full">
                  <Clock
                    className="w-4 h-4 text-[#8A4FFF] mr-2"
                    strokeWidth={2}
                  />
                  <span>Sans engagement</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animation CSS */}
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          50% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes animate-gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: animate-gradient 3s ease infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .backdrop-blur-sm {
          backdrop-filter: blur(8px);
        }
      `}</style>
    </section>
  );
}
