import React, { useState } from "react";
import { motion } from "framer-motion";
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

  const fadeIn = {
    hidden: { opacity: 0, y: 24 },
    visible: (delay = 0) => ({
      opacity: 1,
      y: 0,
      transition: { delay, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
    }),
  };

  if (state.succeeded) {
    return (
      <motion.section
        className="relative px-4 py-24 overflow-hidden bg-[#F5F7FF]"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        custom={0}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white via-[#EEF1FF] to-white opacity-70" />
        <motion.div
          className="relative max-w-3xl mx-auto text-center bg-white border border-slate-200 rounded-3xl shadow-xl px-10 py-14"
          variants={fadeIn}
          custom={0.1}
        >
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 mb-8 shadow-lg">
            <Check className="w-12 h-12 text-white" strokeWidth={1.5} />
          </div>

          <h2 className="text-3xl md:text-4xl font-semibold mb-6 text-slate-900">
            Demo request received — we’re on it.
          </h2>

          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Thanks for trusting us with your human-risk rehearsal. Expect a message in the next few hours with your 48-hour pilot schedule and OSINT intake checklist.
          </p>

          <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl mb-10 text-left">
            <div className="flex items-start gap-4">
              <Zap className="w-6 h-6 text-indigo-500 flex-shrink-0 mt-1" strokeWidth={1.5} />
              <div>
                <p className="text-base font-semibold text-slate-900 mb-2">
                  Want to jump the line?
                </p>
                <p className="text-sm text-slate-600">
                  Share any live phishing examples or voice/SMS scams you have at
                  <span className="font-mono bg-white px-3 py-1.5 rounded-lg text-indigo-600 border border-slate-200 inline-flex items-center gap-2 ml-2">
                    hello@ZeroClick.tech
                    <Send className="w-4 h-4" />
                  </span>
                  and we’ll prioritise your pilot prep.
                </p>
              </div>
            </div>
          </div>

          <div className="inline-flex items-center text-sm text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-200">
            <Clock className="w-4 h-4 mr-2" strokeWidth={2} />
            Typical response time: <span className="font-semibold ml-1">under 2 hours</span>
          </div>
        </motion.div>
      </motion.section>
    );
  }

  return (
    <motion.section
      className="relative px-4 py-24 overflow-hidden bg-[#F5F7FF]"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeIn}
      custom={0}
    >
      {/* Animated decorative elements */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-indigo-200 to-purple-200"
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
        <motion.div
          className="bg-white border border-slate-200 p-8 md:p-10 rounded-3xl shadow-2xl relative overflow-hidden"
          variants={fadeIn}
          custom={0.1}
        >
          <div className="absolute -top-28 -right-20 w-64 h-64 rounded-full bg-indigo-200/30 blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-28 -left-24 w-72 h-72 rounded-full bg-purple-200/30 blur-3xl animate-pulse animation-delay-2000"></div>

          <div className="relative z-10">
            <span className="relative z-10 flex items-center justify-center gap-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 px-4 py-2 rounded-full mb-6">
              <PixelIcon name="fantome" size={32} />
              Redirect stays on your existing demo flow
            </span>

            <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-slate-900 text-center">
              Ready to run your authorized 48-hour pilot?
            </h2>
            <p className="text-base text-slate-600 text-center mb-8 max-w-2xl mx-auto">
              Complete the quick intake below. We keep your demo redirect intact, share the OSINT findings, and schedule the first AI-powered simulation without disrupting your current funnel.
            </p>

            <div className="mb-8">
              <div className="flex justify-between mb-2 text-xs font-medium">
                <span className="text-slate-500">Step {currentStep} of 3</span>
                <span className="text-indigo-500">{Math.round((currentStep / 3) * 100)}% complete</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-700 ease-out"
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
                    className="block text-sm font-medium text-slate-600 flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4 text-indigo-500" strokeWidth={2.5} />
                    Your work email *
                  </label>
                  <span className="text-xs text-indigo-500 bg-indigo-50 px-2 py-1 rounded-full">
                    Step 1/3
                  </span>
                </div>
                <input
                  id="email"
                  type="email"
                  name="email"
                  className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3.5 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
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
                  <label className="block text-sm font-medium text-slate-600 flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-indigo-500" strokeWidth={2.5} />
                    Suspicious emails you see each month *
                  </label>
                  <span className="text-xs text-indigo-500 bg-indigo-50 px-2 py-1 rounded-full">
                    Step 2/3
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {["1-5", "5-10", "10-20", "20+"].map((option) => (
                    <div
                      key={option}
                      className="flex items-center p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-400 transition-all cursor-pointer group"
                      onClick={() => document.getElementById(option).click()}
                    >
                      <input
                        id={option}
                        name="emails_month"
                        type="radio"
                        value={option}
                        className="h-4 w-4 border-slate-300 text-indigo-500 focus:ring-2 focus:ring-indigo-200"
                        required
                        onFocus={() => setCurrentStep(2)}
                      />
                      <label
                        htmlFor={option}
                        className="ml-3 text-sm font-medium text-slate-600 group-hover:text-slate-900 cursor-pointer"
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
                    className="w-1/2 group bg-white border border-slate-200 text-slate-600 font-medium py-3.5 px-6 rounded-xl transition-all hover:border-indigo-300 flex items-center justify-center"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2 text-indigo-500 group-hover:-translate-x-0.5 transition-transform" />
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
                  <label className="block text-sm font-medium text-slate-600 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-500" strokeWidth={2.5} />
                    How urgent does this feel today? *
                  </label>
                  <span className="text-xs text-indigo-500 bg-indigo-50 px-2 py-1 rounded-full">
                    Step 3/3
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                    Mild
                  </span>
                  <span className="flex items-center gap-1">
                    Critical
                    <div className="w-2 h-2 rounded-full bg-rose-400"></div>
                  </span>
                </div>
                <input
                  type="range"
                  name="stress_level"
                  min="1"
                  max="10"
                  className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-indigo-500 [&::-webkit-slider-thumb]:to-purple-500"
                  required
                  onFocus={() => setCurrentStep(3)}
                />
                <div className="flex justify-between text-xs text-indigo-500 mt-1 px-1">
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
                    className="block text-sm font-medium text-slate-600 flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4 text-indigo-500" strokeWidth={2.5} />
                    Tell us more (optional)
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={3}
                    className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3.5 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                    placeholder="e.g. ‘We keep seeing payroll scams targeting finance’"
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
                    className="w-1/2 group bg-white border border-slate-200 text-slate-600 font-medium py-3.5 px-6 rounded-xl transition-all hover:border-indigo-300 flex items-center justify-center"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2 text-indigo-500 group-hover:-translate-x-0.5 transition-transform" />
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

            <div className="mt-10 pt-6 border-t border-slate-200">
              <div className="flex flex-wrap justify-center gap-6 text-slate-500 text-sm">
                <div className="flex items-center bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                  <Lock className="w-4 h-4 text-indigo-500 mr-2" strokeWidth={2} />
                  <span>Data encrypted end-to-end</span>
                </div>
                <div className="flex items-center bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                  <Gift className="w-4 h-4 text-purple-500 mr-2" strokeWidth={2} />
                  <span>3 simulations free in the pilot</span>
                </div>
                <div className="flex items-center bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                  <Clock className="w-4 h-4 text-indigo-500 mr-2" strokeWidth={2} />
                  <span>No commitment, cancel anytime</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
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
    </motion.section>
  );
}
