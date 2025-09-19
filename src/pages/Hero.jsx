import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Cpu,
  RefreshCw,
  Shield,
  ArrowRight,
  CheckCircle,
  ChevronsRight,
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

export default function Hero() {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);

  const featureCards = [
    {
      icon: <Cpu className="w-7 h-7 text-indigo-500" strokeWidth={1.8} />,
      title: "Hyper-real rehearsals",
      desc: "Multi-channel (email, SMS, voice-lite) attack simulations driven by live OSINT so teams experience how AI-powered adversaries really strike.",
      badge: "Simulate",
    },
    {
      icon: <RefreshCw className="w-7 h-7 text-violet-500" strokeWidth={1.8} />,
      title: "Dynamic coaching loop",
      desc: "Simulate → score → auto-deliver role-based micro-lessons → re-test. Every campaign sharpens human reflexes with measurable deltas.",
      badge: "Measure",
    },
    {
      icon: <Shield className="w-7 h-7 text-purple-500" strokeWidth={1.8} />,
      title: "Evidence & safety gates",
      desc: "Signed scopes, live kill-switch, immutable logs and remediation tickets so legal, insurance and the board stay aligned.",
      badge: "Safeguard",
    },
  ];

  const supportingPoints = [
    "AI-generated phishing, SMS and voice scripts crafted with ZeroClick realism",
    "OSINT personalization across employees, vendors and exposed assets",
    "Instant risk scoring, after-click training and executive-ready evidence"
  ];

  const fadeInUp = {
    hidden: { opacity: 0, translateY: 24 },
    visible: (delay = 0) => ({
      opacity: 1,
      translateY: 0,
      transition: { delay, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
    }),
  };

  return (
    <motion.section
      className="relative overflow-hidden px-6 py-24 md:py-32 bg-gradient-to-b from-white via-[#F5F2FF] to-[#F8FBFF]"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      custom={0}
      variants={fadeInUp}
    >
      <div className="absolute top-10 -left-10 w-64 h-64 bg-indigo-200/40 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-200/40 rounded-full blur-3xl" />

      <div className="relative max-w-6xl mx-auto grid gap-16 md:grid-cols-[1.05fr_0.95fr] items-center">
        <motion.div className="text-left" variants={fadeInUp} custom={0.1}>
          <motion.div
            className="inline-flex items-center px-4 py-2 mb-6 rounded-full bg-white shadow-md border border-slate-200 text-sm font-medium text-indigo-600"
            variants={fadeInUp}
            custom={0.2}
          >
            <CheckCircle className="w-4 h-4 mr-2" strokeWidth={2.5} />
            Built for startup security leaders
          </motion.div>

          <motion.h1
            className="text-4xl md:text-5xl font-semibold leading-tight text-slate-900"
            variants={fadeInUp}
            custom={0.25}
          >
            Prepare for the phishing attacks of tomorrow — today.
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-slate-600 mt-6 max-w-xl leading-relaxed"
            variants={fadeInUp}
            custom={0.3}
          >
            AI-generated, OSINT-personalized phishing, SMS and voice simulations that reveal how attackers will target your startup — legally, safely and measurably.
          </motion.p>

          <motion.ul
            className="mt-8 grid gap-3 sm:grid-cols-2 text-sm text-slate-600"
            variants={fadeInUp}
            custom={0.35}
          >
            {supportingPoints.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-xl bg-white/80 border border-slate-200 px-4 py-3 shadow-sm"
              >
                <span className="mt-1 text-indigo-500">•</span>
                <span>{item}</span>
              </li>
            ))}
          </motion.ul>

          <motion.div
            className="mt-10 flex flex-col sm:flex-row sm:items-center gap-4"
            variants={fadeInUp}
            custom={0.45}
          >
            <button
              onClick={() => navigate("/Form")}
              className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500 px-7 py-4 text-white font-semibold shadow-lg shadow-indigo-200 transition-transform hover:scale-[1.01]"
            >
              <PixelIcon name="sorcier-malefique" size={24} className="mr-1" />
              Request a 48-hour Pilot Audit
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              type="button"
              onClick={() => {
                const element = document.getElementById("product-blueprint");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }}
              className="inline-flex items-center gap-2 text-indigo-600 font-medium hover:text-indigo-500"
            >
              See the product blueprint
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>

          <motion.p
            className="mt-4 text-sm text-slate-500"
            variants={fadeInUp}
            custom={0.55}
          >
            Redirect keeps your team on the same trusted flow — request a demo, run authorized simulations, receive the executive snapshot.
          </motion.p>
        </motion.div>

        <motion.div className="grid gap-6" variants={fadeInUp} custom={0.2}>
          <motion.div
            className="relative rounded-3xl overflow-hidden shadow-lg"
            variants={fadeInUp}
            custom={0.25}
          >
            <div className="aspect-[4/3] relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#a855f7] via-[#6366f1] to-[#22d3ee] opacity-95" />
              <div className="absolute inset-0 mix-blend-overlay bg-gradient-to-tl from-[#facc15]/50 via-transparent to-[#f472b6]/40" />
              <div className="absolute inset-4 rounded-3xl border border-white/20" />
              <div className="absolute inset-x-6 inset-y-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 flex items-center justify-center">
                <div className="text-center text-white">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/80 mb-3">
                    ZeroClick Visual Layer
                  </p>
                  <h3 className="text-2xl md:text-3xl font-semibold">
                    Simulate tomorrow’s attacks in today’s inbox
                  </h3>
                </div>
              </div>
            </div>
          </motion.div>
          {featureCards.map((feature, index) => (
            <motion.div
              key={feature.title}
              className={`group relative bg-white/90 border border-slate-200 rounded-2xl px-6 py-6 shadow-xl transition-all duration-300 backdrop-blur-sm ${
                hoveredCard === index ? "-translate-y-1.5 shadow-2xl" : ""
              }`}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              variants={fadeInUp}
              custom={0.3 + index * 0.1}
            >
              <div className="absolute -top-3 -right-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-indigo-500 bg-indigo-100 px-2.5 py-1 rounded-full">
                  {feature.badge}
                </span>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center mb-5">
                {feature.icon}
              </div>

              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {feature.desc}
              </p>

              <div className="absolute bottom-5 right-5 text-indigo-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <ChevronsRight className="w-5 h-5" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
