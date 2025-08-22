import React, { useState } from "react";
import { useForm } from "@formspree/react";
import {
  Mail,
  Briefcase,
  Users,
  BarChart2,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Zap,
  Lock,
  Gift,
  Clock,
  Send,
  Heart,
} from "react-feather";

export default function ContactForm() {
  const [state, handleSubmit] = useForm("mwpqqwkw");
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [sector, setSector] = useState("");
  const [employees, setEmployees] = useState("");
  const [interest, setInterest] = useState(5);

  // Render floating particles
  const renderParticles = () => (
    <div className="absolute inset-0 overflow-hidden opacity-20">
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-gradient-to-br from-[#8A4FFF] to-[#B47AFF]"
          style={{
            width: `${Math.random() * 8 + 2}px`,
            height: `${Math.random() * 8 + 2}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `float ${Math.random() * 15 + 10}s linear infinite`,
            animationDelay: `${Math.random() * 5}s`,
            opacity: Math.random() * 0.4 + 0.1,
          }}
        />
      ))}
    </div>
  );

  // Render organic shape
  const renderOrganicShape = () => (
    <div className="absolute -top-[30%] -left-[20%] w-[140%] h-[140%] opacity-10">
      <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8A4FFF" />
            <stop offset="100%" stopColor="#B47AFF" />
          </linearGradient>
        </defs>
        <path
          fill="url(#grad1)"
          d="M41.5,-60.8C53.7,-52.4,63.9,-41.3,71.8,-27.1C79.7,-12.9,85.3,4.5,81.2,18.3C77.1,32.1,63.4,42.3,49.1,52.8C34.8,63.3,19.9,74.1,1.9,71.7C-16.2,69.3,-32.3,53.7,-45.2,39.6C-58.1,25.5,-67.7,12.7,-70.3,-2.3C-72.9,-17.3,-68.4,-34.7,-56.9,-46.8C-45.4,-58.9,-26.9,-65.8,-8.1,-59.5C10.7,-53.2,21.4,-33.8,41.5,-60.8Z"
          transform="translate(250 250) scale(1.2)"
        />
      </svg>
    </div>
  );

  if (state.succeeded) {
    return (
      <div className="relative overflow-hidden min-h-screen px-6 py-16 md:py-24 text-center bg-gradient-to-b from-[#0F0F19] to-[#1A1428] flex items-center justify-center">
        {renderParticles()}
        {renderOrganicShape()}

        {/* "Visit our site" button */}
        <div className="absolute top-4 right-4 z-20">
          <a
            href="https://zeroclick.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 px-4 py-2 bg-[#1E1B2B] border border-[#3A2E5D] text-[#D9C7FF] rounded-lg hover:bg-[#2A2342] hover:border-[#8A4FFF] transition-all duration-300"
          >
            <span>Visit our site</span>
            <svg
              className="w-4 h-4 text-[#8A4FFF] group-hover:text-[#B47AFF] group-hover:translate-x-0.5 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              ></path>
            </svg>
          </a>
        </div>

        <div className="relative max-w-md mx-auto z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#8A4FFF] to-[#B47AFF] mb-6 animate-pulse">
            <CheckCircle className="w-10 h-10 text-white" strokeWidth={1.5} />
          </div>

          <h2 className="text-3xl md:text-4xl font-extrabold mb-6 text-white">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B47AFF] via-[#9D5AFF] to-[#8A4FFF] animate-gradient">
              Your request has been sent!
            </span>
          </h2>

          <p className="text-xl text-[#D9C7FF] mb-8 leading-relaxed">
            Our team will contact you within the next few hours to finalize your
            free trial.
          </p>

          <div className="bg-gradient-to-br from-[#1E1B2B]/80 to-[#2A2342]/80 p-6 rounded-2xl border border-[#8A4FFF]/30 mb-8 backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <Zap
                className="w-6 h-6 text-[#B47AFF] flex-shrink-0 mt-1"
                strokeWidth={1.5}
              />
              <div>
                <p className="text-lg font-medium text-white mb-2">
                  Speed things up
                </p>
                <p className="text-[#D9C7FF]">
                  Forward a suspicious email now to{" "}
                  <span className="font-mono bg-[#1E1B2B] px-3 py-1.5 rounded-lg text-[#B47AFF] border border-[#3A2E5D] inline-flex items-center gap-2">
                    hello@zeroclick.tech
                    <button className="text-[#8A4FFF] hover:text-[#B47AFF] transition-colors">
                      <Send className="w-4 h-4" />
                    </button>
                  </span>{" "}
                  and we’ll process it first!
                </p>
              </div>
            </div>
          </div>

          <div className="inline-flex items-center text-sm text-[#8A4FFF] bg-[#1E1B2B]/50 px-4 py-2 rounded-full border border-[#8A4FFF]/20">
            <Clock className="w-4 h-4 mr-2" strokeWidth={2} />
            Avg. response time:{" "}
            <span className="font-semibold ml-1">under 2 hours</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden min-h-screen px-6 py-16 md:py-24 text-center bg-gradient-to-b from-[#0F0F19] to-[#1A1428] flex items-center justify-center">
      {renderParticles()}
      {renderOrganicShape()}

      {/* "Visit our site" button */}
      <div className="absolute top-4 right-4 z-20">
        <a
          href="https://zeroclick.tech"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2 px-4 py-2 bg-[#1E1B2B] border border-[#3A2E5D] text-[#D9C7FF] rounded-lg hover:bg-[#2A2342] hover:border-[#8A4FFF] transition-all duration-300"
        >
          <span>Visit our site</span>
          <svg
            className="w-4 h-4 text-[#8A4FFF] group-hover:text-[#B47AFF] group-hover:translate-x-0.5 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            ></path>
          </svg>
        </a>
      </div>

      <div className="relative max-w-md w-full mx-auto px-4 z-10">
        {/* Animated badge */}
        <div className="inline-flex items-center px-4 py-2 mb-6 rounded-full bg-gradient-to-r from-[#8A4FFF]/10 to-[#B47AFF]/10 border border-[#8A4FFF]/30 text-[#D9C7FF] text-sm font-medium animate-bounce">
          <Gift className="w-4 h-4 mr-2 text-[#B47AFF]" strokeWidth={2} />
          FREE TRIAL – 3 simulations included
        </div>

        <div className="bg-gradient-to-br from-[#1E1B2B] to-[#2A2342] p-8 rounded-2xl border border-[#8A4FFF]/20 shadow-2xl backdrop-blur-sm">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between text-xs text-[#D1C4E9] mb-2">
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-[#8A4FFF] mr-2"></span>
                Step {step} of 4
              </span>
              <span className="text-[#8A4FFF] font-medium">
                {Math.round((step / 4) * 100)}% complete
              </span>
            </div>
            <div className="w-full bg-[#1E1B2B] rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#8A4FFF] to-[#B47AFF] h-2 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${(step / 4) * 100}%` }}
              ></div>
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">
            {step === 1 && "Start your free trial"}
            {step === 2 && "Which sector do you work in?"}
            {step === 3 && "Company size"}
            {step === 4 && "Your level of interest"}
          </h2>

          <p className="text-[#D9C7FF] mb-8">
            {step === 1 && "Enter your work email to begin"}
            {step === 2 && "Select your main industry"}
            {step === 3 && "How many people work at your company?"}
            {step === 4 && "How interested are you in this solution?"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <div className="animate-fadeIn">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A4FFF]">
                    <Mail className="w-5 h-5" strokeWidth={1.8} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="your@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-5 py-3.5 rounded-xl bg-[#1E1B2B] text-white border border-[#3A2E5D] focus:outline-none focus:ring-2 focus:ring-[#8A4FFF]/50 transition-all shadow-inner"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!email}
                  className="w-full mt-4 group bg-gradient-to-r from-[#8A4FFF] to-[#9D5AFF] hover:from-[#9D5AFF] hover:to-[#B47AFF] text-white font-medium py-3.5 px-6 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] hover:shadow-[#8A4FFF]/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <span>Continue</span>
                  <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="animate-fadeIn">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      label: "Construction",
                      icon: <Briefcase className="w-5 h-5" />,
                    },
                    {
                      label: "Accounting",
                      icon: <BarChart2 className="w-5 h-5" />,
                    },
                    { label: "Transport", icon: <Send className="w-5 h-5" /> },
                    {
                      label: "E-commerce",
                      icon: <Heart className="w-5 h-5" />,
                    },
                    {
                      label: "Healthcare",
                      icon: <Heart className="w-5 h-5" />,
                    },
                    { label: "Other", icon: <Briefcase className="w-5 h-5" /> },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => {
                        setSector(opt.label);
                        setTimeout(() => setStep(3), 300);
                      }}
                      className={`py-4 px-4 rounded-xl transition-all flex flex-col items-center gap-2 ${
                        sector === opt.label
                          ? "bg-gradient-to-br from-[#8A4FFF] to-[#B47AFF] text-white shadow-md"
                          : "bg-[#1E1B2B] hover:bg-[#2A2342] text-[#D9C7FF] border border-[#3A2E5D]"
                      }`}
                    >
                      <div className="text-[#B47AFF]">{opt.icon}</div>
                      <span className="text-sm font-medium">{opt.label}</span>
                    </button>
                  ))}
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 bg-[#1E1B2B] hover:bg-[#2A2342] text-[#D9C7FF] rounded-xl transition border border-[#3A2E5D] flex items-center justify-center"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-fadeIn">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { size: "1-5", emoji: "👨‍💼", label: "Micro" },
                    { size: "6-10", emoji: "👨‍💼👩‍💼", label: "Small" },
                    { size: "11-20", emoji: "👨‍💼👩‍💼👨‍💼", label: "Medium" },
                    { size: "21-50", emoji: "🏢", label: "Large" },
                    { size: "50+", emoji: "🏭", label: "Corporate" },
                  ].map((opt) => (
                    <button
                      key={opt.size}
                      type="button"
                      onClick={() => {
                        setEmployees(opt.size);
                      }}
                      className={`py-4 rounded-xl transition-all flex flex-col items-center gap-2 ${
                        employees === opt.size
                          ? "bg-gradient-to-br from-[#8A4FFF] to-[#B47AFF] text-white shadow-md"
                          : "bg-[#1E1B2B] hover:bg-[#2A2342] text-[#D9C7FF] border border-[#3A2E5D]"
                      }`}
                    >
                      <span className="text-2xl">{opt.emoji}</span>
                      <div>
                        <div className="text-sm font-medium">{opt.size}</div>
                        <div className="text-xs text-[#B47AFF]">
                          {opt.label}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 py-3 bg-[#1E1B2B] hover:bg-[#2A2342] text-[#D9C7FF] rounded-xl transition border border-[#3A2E5D] flex items-center justify-center"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    disabled={!employees}
                    className="flex-1 py-3 group bg-gradient-to-r from-[#8A4FFF] to-[#9D5AFF] hover:from-[#9D5AFF] hover:to-[#B47AFF] text-white rounded-xl transition disabled:opacity-50 flex items-center justify-center"
                  >
                    <span>Continue</span>
                    <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="animate-fadeIn">
                <div className="mb-8">
                  <div className="flex justify-between text-sm text-[#D9C7FF] mb-3">
                    <span className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-[#27C93F] mr-2"></div>
                      Not interested
                    </span>
                    <span className="flex items-center">
                      Very interested
                      <div className="w-2 h-2 rounded-full bg-[#FF5F56] ml-2"></div>
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={interest}
                    onChange={(e) => setInterest(parseInt(e.target.value))}
                    className="w-full h-2 bg-[#3A2E5D] rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-[#8A4FFF] [&::-webkit-slider-thumb]:to-[#B47AFF]"
                  />
                  <div className="text-center mt-4 text-[#B47AFF] font-medium text-lg">
                    {interest < 4 && "Just exploring"}
                    {interest >= 4 && interest < 7 && "Interested"}
                    {interest >= 7 && "I want to start now!"}
                  </div>
                </div>

                <input type="hidden" name="email" value={email} />
                <input type="hidden" name="sector" value={sector} />
                <input type="hidden" name="employees" value={employees} />
                <input type="hidden" name="interest" value={interest} />

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex-1 py-3 bg-[#1E1B2B] hover:bg-[#2A2342] text-[#D9C7FF] rounded-xl transition border border-[#3A2E5D] flex items-center justify-center"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={state.submitting}
                    className="flex-1 py-3 group bg-gradient-to-r from-[#8A4FFF] to-[#9D5AFF] hover:from-[#9D5AFF] hover:to-[#B47AFF] text-white rounded-xl transition flex items-center justify-center gap-2 shadow-lg hover:shadow-[#8A4FFF]/40"
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
                        <Send className="w-5 h-5 group-hover:translate-y-[-2px] transition-transform" />
                        Submit request
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-4 text-[#D9C7FF] text-sm">
          <div className="flex items-center bg-[#1E1B2B]/50 px-3 py-1.5 rounded-full">
            <Lock className="w-4 h-4 text-[#8A4FFF] mr-2" strokeWidth={2} />
            <span>100% data secured</span>
          </div>
          <div className="flex items-center bg-[#1E1B2B]/50 px-3 py-1.5 rounded-full">
            <Gift className="w-4 h-4 text-[#B47AFF] mr-2" strokeWidth={2} />
            <span>3 free simulations</span>
          </div>
        </div>
      </div>

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

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }

        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        .animate-bounce {
          animation: bounce 1.5s infinite;
        }
      `}</style>
    </div>
  );
}
