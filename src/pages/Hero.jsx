import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  RefreshCw,
  Smile,
  ChevronsRight,
  CheckCircle,
  Send,
  StopCircle,
  ArrowRight,
} from "react-feather";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden px-6 py-24 md:py-36 text-center bg-gradient-to-b from-[#0F0F19] via-[#151221] to-[#1A1428]">
      {/* Enhanced cosmic background */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-[#8A4FFF] to-[#B47AFF]"
            style={{
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 20 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 10}s`,
              opacity: Math.random() * 0.4 + 0.1,
            }}
          />
        ))}
      </div>

      {/* Soft organic vector */}
      <div className="absolute -top-[40%] -left-[30%] w-[160%] h-[160%] opacity-5">
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
            transform="translate(250 250) scale(1.3)"
          />
        </svg>
      </div>

      <div className="relative max-w-5xl mx-auto">
        {/* Quebec badge */}
        <div className="inline-flex items-center px-4 py-2 mb-8 rounded-full bg-[#8A4FFF]/10 border border-[#8A4FFF]/20 text-[#D9C7FF] text-sm font-medium backdrop-blur-md transition-all hover:bg-[#8A4FFF]/15 hover:border-[#8A4FFF]/40">
          <CheckCircle
            className="w-4 h-4 mr-2 text-[#B47AFF]"
            strokeWidth={2.5}
          />
          Made in Québec, not Silicon Valley
        </div>
        <h1 className="text-5xl md:text-5xl font-bold mb-8 leading-tight tracking-tight">
          <span className="text-white font-extrabold">
            One click can cost everything.
          </span>
          <br />
          <span className="bg-gradient-to-r from-[#B47AFF] via-[#9D5AFF] to-[#8A4FFF] bg-clip-text text-transparent">
            Train your team to spot fraud early.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-1xl md:text-1xl text-[#D9C7FF] mb-12 max-w-3xl mx-auto leading-relaxed tracking-normal">
          Realistic inbox scenarios that feel natural.{" "}
          <span className="font-mono bg-[#1E1B2B] px-3 py-1.5 rounded-md text-[#B47AFF] border border-[#3A2E5D]">
            Your team learns without pressure
          </span>{" "}
          — building calm, confident reflexes day by day.
        </p>

        {/* CTA */}
        <div className="mb-20">
          <button
            onClick={() => navigate("/demo-page")}
            className="group relative overflow-hidden px-5 py-3 bg-gradient-to-r from-[#8A4FFF] to-[#9D5AFF] hover:from-[#9D5AFF] hover:to-[#B47AFF] text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-xl hover:shadow-[#8A4FFF]/40"
          >
            <span className="relative z-10 flex items-center justify-center">
              🐣 Try a free simulation
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-[#9D5AFF] to-[#B47AFF] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
          </button>
          <p className="mt-3 text-sm text-[#A794D4]">
            Better a fake trap today than a real loss tomorrow • No commitment
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            {
              icon: (
                <FileText
                  className="w-8 h-8 text-[#8A4FFF]"
                  strokeWidth={1.5}
                />
              ),
              title: "Automatic reflexes",
              desc: "Short, gentle exercises that build instinct. Fewer risky clicks, more confidence.",
              badge: "Calm",
            },
            {
              icon: (
                <RefreshCw
                  className="w-8 h-8 text-[#9D5AFF]"
                  strokeWidth={1.5}
                />
              ),
              title: "Invisible learning",
              desc: "Lessons that don’t feel like lessons. Every slip becomes a kind reminder.",
              badge: "Gentle",
            },
            {
              icon: (
                <CheckCircle
                  className="w-8 h-8 text-[#B47AFF]"
                  strokeWidth={1.5}
                />
              ),
              title: "Peace of mind",
              desc: "Your team feels safe and ready. You finally breathe easier.",
              badge: "Trust",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="group relative bg-[#1E1B2B]/70 backdrop-blur-sm p-6 rounded-xl border border-[#2D2442] hover:border-[#8A4FFF]/50 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="absolute -top-3 -right-3">
                <span className="text-xs bg-[#8A4FFF]/10 text-[#B47AFF] px-2 py-1 rounded-full border border-[#8A4FFF]/20">
                  {feature.badge}
                </span>
              </div>
              <div className="bg-gradient-to-br from-[#1E1B2B] to-[#2D2442] w-14 h-14 rounded-xl flex items-center justify-center mb-5 group-hover:bg-[#8A4FFF]/10 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-[#D1C4E9] text-sm leading-relaxed">
                {feature.desc}
              </p>
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronsRight className="w-5 h-5 text-[#8A4FFF]" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Float animation */}
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 0;
          }
          20% {
            opacity: 0.4;
          }
          100% {
            transform: translateY(-120vh) rotate(360deg) scale(1.2);
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
}
