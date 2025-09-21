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

export default function ReadyToTry() {
  const [state, handleSubmit] = useForm("mwpqqwkw");
  const [currentStep, setCurrentStep] = useState(1);
  const [isHovering, setIsHovering] = useState(false);

  if (state.succeeded) {
    return (
      <section className="relative px-4 py-24 overflow-hidden bg-gradient-to-b from-[#F6EEFF] via-[#FDFBFF] to-[#F2E7FF] text-[#1F1235]">
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-[#8A4FFF] to-[#B47AFF] mb-8 animate-pulse">
            <Check className="w-12 h-12 text-white" strokeWidth={1.5} />
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#2B1653]">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B47AFF] via-[#9D5AFF] to-[#8A4FFF] animate-gradient">
              Demande envoyée avec succès !
            </span>
          </h2>

          <p className="text-xl text-[#5F4C8C] mb-8 max-w-2xl mx-auto leading-relaxed">
            Notre équipe vous contactera dans les prochaines heures pour
            finaliser votre essai gratuit.
          </p>

          <div className="bg-white/95 p-6 rounded-2xl border border-[#E3D8FF] mb-10 shadow-[0_18px_45px_rgba(138,79,255,0.12)]">
            <div className="flex items-start gap-4">
              <Zap
                className="w-6 h-6 text-[#B47AFF] flex-shrink-0 mt-1"
                strokeWidth={1.5}
              />
              <div>
                <p className="text-lg font-medium text-[#2B1653] mb-2">
                  Accélérez le processus
                </p>
                <p className="text-[#5F4C8C]">
                  Envoyez dès maintenant votre première facture à{" "}
                  <span className="font-mono bg-white px-3 py-1.5 rounded-lg text-[#7F56D0] border border-[#E3D8FF] inline-flex items-center gap-2 shadow-sm">
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

          <div className="inline-flex items-center text-sm text-[#7F56D0] bg-white/80 px-4 py-2 rounded-full border border-[#E3D8FF] shadow-sm">
            <Clock className="w-4 h-4 mr-2" strokeWidth={2} />
            Temps moyen de réponse:{" "}
            <span className="font-semibold ml-1">moins de 2 heures</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative px-4 py-24 overflow-hidden bg-gradient-to-b from-[#F6EEFF] via-[#FDFBFF] to-[#F2E7FF] text-[#1F1235]">
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
        <div className="bg-white/95 p-8 rounded-2xl border border-[#E3D8FF] shadow-[0_22px_55px_rgba(138,79,255,0.14)] relative overflow-hidden">
          {/* Effet de lumière animé */}
          <div className="absolute -top-28 -right-28 w-64 h-64 rounded-full bg-[#E5D9FF] blur-3xl opacity-70 animate-pulse"></div>
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-[#F0E6FF] blur-3xl opacity-70 animate-pulse animation-delay-2000"></div>

          <div className="relative z-10">
            {/* Badge animé */}
            <span className="relative z-10 flex items-center justify-center gap-2">
              <PixelIcon name="fantome" size={35} />
              <span>1-month trial for FREE</span>
            </span>

            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#2B1653]">
              Ready to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B47AFF] via-[#9D5AFF] to-[#8A4FFF] animate-gradient">
                Protect your team from fraud
              </span>{" "}
              ?
            </h2>

            {/* Barre de progression */}
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                <span className="text-xs font-medium text-[#5F4C8C]">
                  Step {currentStep} of 3
                </span>
                <span className="text-xs font-medium text-[#8A4FFF]">
                  {Math.round((currentStep / 3) * 100)}% complete
                </span>
              </div>
              <div className="w-full bg-[#EDE3FF] rounded-full h-2 overflow-hidden">
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
                    className="block text-sm font-medium text-[#5F4C8C] flex items-center gap-2"
                  >
                    <Mail
                      className="w-4 h-4 text-[#8A4FFF]"
                      strokeWidth={2.5}
                    />
                    Your work email *
                  </label>
                  <span className="text-xs text-[#8A4FFF] bg-[#8A4FFF]/10 px-2 py-1 rounded-full">
                    Step 1/3
                  </span>
                </div>
                <input
                  id="email"
                  type="email"
                  name="email"
                  className="w-full bg-white border border-[#E3D8FF] rounded-xl px-5 py-3.5 text-[#2B1653] placeholder-[#8C7BB1] focus:border-[#8A4FFF] focus:ring-2 focus:ring-[#8A4FFF]/30 transition-all shadow-[inset_0_1px_0_rgba(138,79,255,0.12)]"
                  placeholder="your@company.com"
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
                  <span>Continue</span>
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
                  <label className="block text-sm font-medium text-[#5F4C8C] flex items-center gap-2">
                    <BarChart2
                      className="w-4 h-4 text-[#8A4FFF]"
                      strokeWidth={2.5}
                    />
                    Number of suspicious emails per month *
                  </label>
                  <span className="text-xs text-[#8A4FFF] bg-[#8A4FFF]/10 px-2 py-1 rounded-full">
                    Step 2/3
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {["1-5", "5-10", "10-20", "20+"].map((option) => (
                    <div
                      key={option}
                      className="flex items-center p-4 bg-white border border-[#E3D8FF] rounded-xl hover:border-[#C8B4FF] hover:shadow-[0_12px_30px_rgba(138,79,255,0.18)] transition-all cursor-pointer group"
                      onClick={() => document.getElementById(option).click()}
                    >
                      <input
                        id={option}
                        name="factures_mois"
                        type="radio"
                        value={option}
                        className="h-4 w-4 border-[#C8B4FF] text-[#8A4FFF] focus:ring-2 focus:ring-[#8A4FFF]/40"
                        required
                        onFocus={() => setCurrentStep(2)}
                      />
                      <label
                        htmlFor={option}
                        className="ml-3 text-sm font-medium text-[#5F4C8C] group-hover:text-[#2B1653] cursor-pointer"
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
                    className="w-1/2 group bg-white border border-[#E3D8FF] text-[#5F4C8C] font-medium py-3.5 px-6 rounded-xl transition-all hover:border-[#C8B4FF] flex items-center justify-center"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-0.5 transition-transform" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="w-1/2 group bg-gradient-to-r from-[#8A4FFF] to-[#9D5AFF] hover:from-[#9D5AFF] hover:to-[#B47AFF] text-white font-medium py-3.5 px-6 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-[#8A4FFF]/40 flex items-center justify-center"
                  >
                    <span>Continue</span>
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
                  <label className="block text-sm font-medium text-[#5F4C8C] flex items-center gap-2">
                    <Activity
                      className="w-4 h-4 text-[#8A4FFF]"
                      strokeWidth={2.5}
                    />
                    How stressful is this problem for you? *
                  </label>
                  <span className="text-xs text-[#8A4FFF] bg-[#8A4FFF]/10 px-2 py-1 rounded-full">
                    Step 3/3
                  </span>
                </div>
                <div className="flex justify-between text-xs text-[#5F4C8C] mb-1">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-[#27C93F]"></div>
                    Not stressful
                  </span>
                  <span className="flex items-center gap-1">
                    Very stressful
                    <div className="w-2 h-2 rounded-full bg-[#FF5F56]"></div>
                  </span>
                </div>
                <input
                  type="range"
                  name="stress_level"
                  min="1"
                  max="10"
                  className="w-full h-2 bg-[#E3D8FF] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-[#8A4FFF] [&::-webkit-slider-thumb]:to-[#B47AFF]"
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
                    className="block text-sm font-medium text-[#5F4C8C] flex items-center gap-2"
                  >
                    <MessageSquare
                      className="w-4 h-4 text-[#8A4FFF]"
                      strokeWidth={2.5}
                    />
                    Tell us more (optional)
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={3}
                    className="w-full bg-white border border-[#E3D8FF] rounded-xl px-5 py-3.5 text-[#2B1653] placeholder-[#8C7BB1] focus:border-[#8A4FFF] focus:ring-2 focus:ring-[#8A4FFF]/30 transition-all shadow-[inset_0_1px_0_rgba(138,79,255,0.12)]"
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
                    className="w-1/2 group bg-white border border-[#E3D8FF] text-[#5F4C8C] font-medium py-3.5 px-6 rounded-xl transition-all hover:border-[#C8B4FF] flex items-center justify-center"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-0.5 transition-transform" />
                    Return
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
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2 group-hover:translate-y-[-2px] transition-transform" />
                        Submit request
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-10 pt-6 border-t border-[#E3D8FF]">
              <div className="flex flex-wrap justify-center gap-6 text-[#5F4C8C] text-sm">
                <div className="flex items-center bg-white px-3 py-1.5 rounded-full border border-[#E3D8FF] shadow-sm">
                  <Lock
                    className="w-4 h-4 text-[#8A4FFF] mr-2"
                    strokeWidth={2}
                  />
                  <span>100% data secured</span>
                </div>
                <div className="flex items-center bg-white px-3 py-1.5 rounded-full border border-[#E3D8FF] shadow-sm">
                  <Gift
                    className="w-4 h-4 text-[#B47AFF] mr-2"
                    strokeWidth={2}
                  />
                  <span>3 free simulations included</span>
                </div>
                <div className="flex items-center bg-white px-3 py-1.5 rounded-full border border-[#E3D8FF] shadow-sm">
                  <Clock
                    className="w-4 h-4 text-[#8A4FFF] mr-2"
                    strokeWidth={2}
                  />
                  <span>No commitment</span>
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
