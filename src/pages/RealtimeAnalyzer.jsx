import React from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Zap, Activity, CheckCircle, MousePointer, FileText } from "react-feather";

export default function RealTimeAnalyzer() {
  const navigate = useNavigate();
  return (
    <section className="relative py-24 px-6 bg-gradient-to-b from-[#FDFBFF] via-[#F4ECFF] to-[#F0E6FF] text-[#1F1235] overflow-hidden">
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        {[...Array(18)].map((_, index) => (
          <div
            key={index}
            className="absolute rounded-full bg-gradient-to-br from-[#8A4FFF] to-[#B47AFF]"
            style={{
              width: `${Math.random() * 12 + 4}px`,
              height: `${Math.random() * 12 + 4}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.3 + 0.1,
              animation: `float ${Math.random() * 15 + 12}s linear infinite`,
              animationDelay: `${Math.random() * 8}s`,
            }}
          />
        ))}
      </div>

      <div className="relative max-w-6xl mx-auto z-10">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-[#E3D8FF] text-xs font-semibold uppercase tracking-wide text-[#7F56D0]">
            <Zap className="w-4 h-4" />
            New • Real-Time Analyzer
          </span>
          <h2 className="mt-6 text-3xl md:text-4xl font-bold text-[#2B1653]">
            Stop dangerous clicks <span className="bg-gradient-to-r from-[#B47AFF] via-[#9D5AFF] to-[#8A4FFF] bg-clip-text text-transparent">before they happen</span>
          </h2>
          <p className="mt-4 text-lg md:text-xl text-[#5F4C8C] max-w-3xl mx-auto">
            A smart shield that inspects every link and file in real time. It blocks threats the instant your team hovers, keeping the workflow calm and uninterrupted.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            {
              icon: <MousePointer className="w-6 h-6 text-[#8A4FFF]" />,
              title: "Invisible scan",
              desc: "Runs quietly in the browser, watching emails, chats, and docs without slowing anyone down.",
              path: "/services/real-time-analyzer#invisible-scan",
            },
            {
              icon: <Activity className="w-6 h-6 text-[#9D5AFF]" />,
              title: "Instant verdict",
              desc: "Each hover triggers an AI + threat intel check. Safe links open, risky ones are quarantined in milliseconds.",
              path: "/services/real-time-analyzer#instant-verdict",
            },
            {
              icon: <Shield className="w-6 h-6 text-[#B47AFF]" />,
              title: "Always-on protection",
              desc: "Warns with a bright red screen when danger appears, so even tired teammates stay protected.",
              path: "/services/real-time-analyzer#always-on",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-[#E3D8FF] p-6 shadow-[0_16px_40px_rgba(138,79,255,0.12)] hover:shadow-[0_24px_60px_rgba(138,79,255,0.18)] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C8B4FF]"
              onClick={() => navigate(feature.path)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  navigate(feature.path);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`Learn more about ${feature.title}`}
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#F0E8FF] mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-[#2B1653] mb-2">{feature.title}</h3>
              <p className="text-sm text-[#5F4C8C] leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mb-16">
          <button
            onClick={() => navigate("/services/real-time-analyzer")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#8A4FFF] to-[#9D5AFF] text-white font-semibold shadow-[0_15px_35px_rgba(138,79,255,0.28)] hover:shadow-[0_18px_45px_rgba(138,79,255,0.35)] transition"
          >
            Explore Real-Time Analyzer
            <Zap className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="bg-white/90 border border-[#E3D8FF] rounded-2xl p-6 md:p-8 shadow-[0_16px_40px_rgba(138,79,255,0.12)]">
            <h3 className="text-xl font-semibold text-[#2B1653] mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#8A4FFF]" />
              What it blocks in real life
            </h3>
            <ul className="space-y-3 text-sm text-[#5F4C8C]">
              <li className="flex gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 text-[#7F56D0]" />
                Fake Microsoft 365 or banking portals built to steal credentials.
              </li>
              <li className="flex gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 text-[#7F56D0]" />
                Weaponized attachments: Excel macros, PDF traps, malware-laced ZIP files.
              </li>
              <li className="flex gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 text-[#7F56D0]" />
                Any link that reroutes to a suspicious domain the moment someone hovers.
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-r from-[#8A4FFF]/15 via-[#B47AFF]/12 to-[#9D5AFF]/20 border border-[#E3D8FF] rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-[#2B1653] mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#7F56D0]" />
                Why teams call it a game changer
              </h3>
              <p className="text-sm text-[#5F4C8C] leading-relaxed">
                Training builds reflexes; Real-Time Analyzer enforces them 24/7. Together they deliver instant defenses and long-term muscle memory.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[180px] bg-white border border-[#E3D8FF] rounded-xl p-4 shadow-[0_10px_25px_rgba(138,79,255,0.1)]">
                <p className="text-sm text-[#5F4C8C]">
                  <span className="block text-2xl font-semibold text-[#7F56D0]">0</span>
                  Surprise clicks that reach your systems.
                </p>
              </div>
              <div className="flex-1 min-w-[180px] bg-white border border-[#E3D8FF] rounded-xl p-4 shadow-[0_10px_25px_rgba(138,79,255,0.1)]">
                <p className="text-sm text-[#5F4C8C]">
                  <span className="block text-2xl font-semibold text-[#7F56D0]">100%</span>
                  Coverage even on rushed days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 0;
          }
          30% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(-90vh) rotate(360deg) scale(1.1);
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
}
