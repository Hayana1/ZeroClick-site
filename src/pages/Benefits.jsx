import React from "react";
import {
  Clock,
  DollarSign,
  Heart,
  Smartphone,
  Award,
  RefreshCw,
  ArrowRight,
} from "react-feather";
import { useNavigate } from "react-router-dom";

export default function Benefits() {
  const navigate = useNavigate();
  return (
    <div className="relative py-28 bg-gradient-to-b from-[#1A1428] to-[#0F0F19] overflow-hidden">
      {/* Decorative dots */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-[#8A4FFF] to-[#B47AFF]"
            style={{
              width: `${Math.random() * 8 + 2}px`,
              height: `${Math.random() * 8 + 2}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 20 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: Math.random() * 0.3 + 0.1,
            }}
          />
        ))}
      </div>

      <div className="relative max-w-5xl mx-auto px-6 text-center z-10">
        <div className="inline-block bg-gradient-to-r from-[#8A4FFF] to-[#B47AFF] p-0.5 rounded-full mb-8">
          <div className="bg-[#1A1428] rounded-full px-5 py-1.5 text-[#D9C7FF] text-sm font-medium">
            Key benefits
          </div>
        </div>

        <h2 className="text-4cxl md:text-4xl font-bold mb-6 text-white">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B47AFF] via-[#9D5AFF] to-[#8A4FFF]">
            Why choose our training?
          </span>
        </h2>

        <p className="text-xl md:text-2xl text-[#D9C7FF] mb-16 max-w-3xl mx-auto leading-relaxed">
          Real inbox practice that builds calm, confident habits. No stress, no
          jargon — just fewer risky clicks.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: (
                <Clock className="w-10 h-10 text-[#8A4FFF]" strokeWidth={1.2} />
              ),
              title: "Save 10+ hours/month",
              desc: "Less incident handling and back-and-forth. More focus on real work.",
              highlight: "Time back",
            },
            {
              icon: (
                <DollarSign
                  className="w-10 h-10 text-[#9D5AFF]"
                  strokeWidth={1.2}
                />
              ),
              title: "Prevent costly losses",
              desc: "Fewer risky clicks, fewer wire changes, fewer panic moments.",
              highlight: "Protect cash",
            },

            {
              icon: (
                <Smartphone
                  className="w-10 h-10 text-[#8A4FFF]"
                  strokeWidth={1.2}
                />
              ),
              title: "Nothing to install",
              desc: "Training happens by email, exactly where mistakes occur.",
              highlight: "Simple by design",
            },
          ].map((benefit, index) => (
            <div
              key={index}
              className="relative bg-gradient-to-br from-[#1E1B2B]/70 to-[#2A2342]/70 p-8 rounded-2xl border border-[#3A2E5D]/50 backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:border-[#8A4FFF]/50 hover:shadow-[0_20px_50px_rgba(138,79,255,0.2)]"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-[#8A4FFF] to-[#B47AFF] w-16 h-16 rounded-full flex items-center justify-center shadow-lg">
                {benefit.icon}
              </div>

              <h3 className="text-xl font-bold text-white mb-3 mt-6">
                {benefit.title}
              </h3>

              <p className="text-[#D9C7FF] mb-4 min-h-[60px]">{benefit.desc}</p>

              <div className="inline-block bg-[#8A4FFF]/10 text-[#D9C7FF] px-3 py-1 rounded-full text-sm border border-[#8A4FFF]/20">
                {benefit.highlight}
              </div>
            </div>
          ))}
        </div>

        {/* Final CTA */}
        <div className="mt-20">
          <button
            onClick={() => navigate("/Form")}
            className="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-[#8A4FFF] to-[#9D5AFF] hover:from-[#9D5AFF] hover:to-[#B47AFF] text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-xl hover:shadow-[0_15px_30px_rgba(138,79,255,0.4)]"
          >
            <span className="relative z-10 flex items-center justify-center">
              🎯 Try a free simulation
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-[#9D5AFF] to-[#B47AFF] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
          </button>

          <div className="mt-6 flex flex-wrap justify-center gap-6 text-[#D9C7FF] text-sm">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-[#27C93F] mr-2 animate-pulse"></div>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-[#27C93F] mr-2 animate-pulse"></div>
              <span>First 3 simulations free</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-[#27C93F] mr-2 animate-pulse"></div>
              <span>Instant setup</span>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          50% {
            opacity: 0.4;
          }
          100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
