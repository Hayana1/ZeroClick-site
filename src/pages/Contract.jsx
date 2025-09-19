import React from "react";
import { motion } from "framer-motion";
import {
  FileText,
  CheckCircle,
  Zap,
  Shield,
  Clock,
  Activity,
  Layers,
} from "react-feather";

export default function Contrat() {
  const platformHighlights = [
    {
      title: "AI-native, multi-channel simulations",
      detail:
        "ZeroClick injects authorized AI-crafted phishing, SMS, voice and deepfake-ready video that mimic trusted contacts using public OSINT.",
    },
    {
      title: "Risk scoring with an adaptive training loop",
      detail:
        "Simulate → measure → deliver role-based micro-learning → re-test, giving leaders living human-risk metrics instead of gut feeling.",
    },
    {
      title: "Heavy backing for rapid R&D",
      detail:
        "ZeroClick is fueled by offensive-security veterans and founder networks focused on generative defense, helping us outpace legacy vendors in research and distribution.",
    },
  ];

  const differentiation = [
    {
      title: "Startup-ready pricing",
      detail:
        "Launch fast with low-cost pilots, usage-based tiers and cohort deals for VC portfolios or MSP partners.",
    },
    {
      title: "Automation-first delivery",
      detail:
        "Prebuilt OSINT collectors, templated campaigns and one-click pilots keep delivery lean for small security teams.",
    },
    {
      title: "Legal-first channel rollout",
      detail:
        "Start with email, SMS and voice-lite simulations; unlock deepfakes only when consent, legal and safety controls are in place.",
    },
  ];

  const pilotSteps = [
    {
      title: "Onboard & scope",
      timeframe: "Day 0–2",
      detail:
        "Sign the MSA + SOW, lock targets and channels, and trigger the first automated OSINT crawl.",
      icon: <FileText className="w-5 h-5 text-indigo-500" strokeWidth={2} />,
    },
    {
      title: "Discovery audit",
      timeframe: "Day 2–4",
      detail:
        "Deliver the Executive Risk Snapshot PDF: exposed assets, at-risk personas and recommended simulations for sign-off.",
      icon: <Activity className="w-5 h-5 text-violet-500" strokeWidth={2} />,
    },
    {
      title: "Authorized simulation",
      timeframe: "Day 5–10",
      detail:
        "Run one scoped campaign with tokenised tracking, instant micro-training and a live kill-switch.",
      icon: <Zap className="w-5 h-5 text-purple-500" strokeWidth={2} />,
    },
    {
      title: "Remediation sprint",
      timeframe: "Day 10–14",
      detail:
        "Auto-issue takedown requests, hardening checklists and prioritized tickets so fixes land inside the workflow.",
      icon: <Shield className="w-5 h-5 text-fuchsia-500" strokeWidth={2} />,
    },
    {
      title: "Monitor & iterate",
      timeframe: "Ongoing",
      detail:
        "Weekly OSINT refresh, monthly simulations and quarterly executive reviews with ROI snapshots.",
      icon: <Clock className="w-5 h-5 text-indigo-400" strokeWidth={2} />,
    },
  ];

  const guardrails = [
    {
      title: "Consent-first operations",
      detail:
        "No payloads launch without a signed SOW, explicit scope and a named internal sponsor.",
    },
    {
      title: "Privacy by design",
      detail:
        "Store the minimum PII, encrypt everything, honour deletion SLAs and never republish leaked or stolen data.",
    },
    {
      title: "Immutable audit trail",
      detail:
        "Archive approvals, payloads, timestamps and results so counsel, insurers and the board can verify every test.",
    },
  ];

  const pricingPlans = [
    {
      name: "Pilot offer",
      price: "$500–$1,500",
      cadence: "Two-week authorized pilot",
      description:
        "Automated OSINT sweep, one scoped simulation (email/SMS/voice-lite) and an Executive Risk Snapshot you can hand to leadership.",
      note: "Great for case studies and first trust wins.",
    },
    {
      name: "Starter plan",
      price: "$99–$299/mo",
      cadence: "Quarterly cadence",
      description:
        "Continuous monitoring, one simulation per quarter and automated micro-training. Perfect for seed to Series A teams.",
      note: "Keep it lean, prove value, grow later.",
    },
    {
      name: "Growth plan",
      price: "$1,000–$3,000/mo",
      cadence: "Monthly cadence",
      description:
        "Monthly simulations across channels, remediation credits and integrations into ticketing and messaging stacks.",
      note: "Hands-on partnership for scaling companies.",
    },
    {
      name: "Enterprise add-ons",
      price: "Custom",
      cadence: "On demand",
      description:
        "High-fidelity deepfakes, custom SLAs, incident response retainers and premium compliance packages for later-stage customers.",
      note: "Unlocked only with explicit legal approval.",
    },
  ];

  const fadeIn = {
    hidden: { opacity: 0, y: 32 },
    visible: (delay = 0) => ({
      opacity: 1,
      y: 0,
      transition: { delay, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
    }),
  };

  return (
    <motion.section
      className="relative overflow-hidden px-6 py-24 bg-white"
      id="zeroclick-summary"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeIn}
      custom={0}
    >
      <div className="absolute inset-x-0 top-16 h-64 bg-gradient-to-r from-indigo-100 via-purple-100 to-indigo-50 opacity-60 blur-3xl" />

      <div className="relative max-w-6xl mx-auto">
        <motion.div className="text-center mb-16" variants={fadeIn} custom={0.1}>
          <div className="inline-flex items-center px-5 py-2 mb-5 rounded-full bg-indigo-100 text-indigo-600 border border-indigo-200 text-sm font-medium">
            <Layers className="w-4 h-4 mr-2" strokeWidth={2.2} />
            Borrow the ZeroClick Security playbook
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold text-slate-900">
            What ZeroClick delivers — and how we keep startups ahead
          </h2>
          <p className="text-slate-600 mt-4 max-w-3xl mx-auto">
            Use ZeroClick’s authorized simulations, automation and reporting loops to run next-wave defenses without the enterprise baggage.
          </p>
        </motion.div>

        <div className="grid gap-10 lg:grid-cols-2">
          <motion.div
            className="bg-white border border-slate-200 rounded-3xl shadow-xl p-10 space-y-6"
            variants={fadeIn}
            custom={0.2}
          >
            <div className="aspect-[4/3] relative overflow-hidden rounded-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-[#f472b6] via-[#9333ea] to-[#38bdf8] opacity-95" />
              <div className="absolute inset-0 mix-blend-overlay bg-gradient-to-tl from-[#fcd34d]/40 via-transparent to-[#22d3ee]/45" />
              <div className="absolute inset-4 rounded-3xl border border-white/25" />
              <div className="absolute inset-x-6 inset-y-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-center text-white px-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/80 mb-3">
                    ZeroClick Platform Canvas
                  </p>
                  <h3 className="text-2xl md:text-3xl font-semibold leading-snug">
                    Visualise AI-native simulations, evidence and adaptive coaching in one flow
                  </h3>
                </div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-indigo-600 uppercase tracking-wide">
              Inside ZeroClick’s platform
            </h3>
            <ul className="space-y-4">
              {platformHighlights.map((item) => (
                <li
                  key={item.title}
                  className="rounded-2xl border border-slate-200 p-5 bg-slate-50"
                >
                  <p className="text-base font-semibold text-slate-900 mb-2">
                    {item.title}
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {item.detail}
                  </p>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            className="bg-indigo-50 border border-indigo-100 rounded-3xl shadow-xl p-10 space-y-6"
            variants={fadeIn}
            custom={0.3}
          >
            <h3 className="text-lg font-semibold text-indigo-700 uppercase tracking-wide">
              How ZeroClick keeps startups ahead
            </h3>
            <ul className="space-y-4">
              {differentiation.map((item) => (
                <li
                  key={item.title}
                  className="rounded-2xl border border-indigo-100 bg-white p-5"
                >
                  <p className="text-base font-semibold text-slate-900 mb-2">
                    {item.title}
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {item.detail}
                  </p>
                </li>
              ))}
            </ul>
            <div className="flex items-start gap-3 p-5 border border-indigo-200 rounded-2xl bg-white/80">
              <CheckCircle className="w-5 h-5 text-indigo-500 mt-0.5" strokeWidth={2.5} />
              <p className="text-sm text-slate-600">
                Outcome: ZeroClick packages enterprise-grade realism for lean operators — launch in 48 hours, prove ROI in two weeks, scale without extra headcount.
              </p>
            </div>
          </motion.div>
        </div>

        <motion.div className="mt-24" variants={fadeIn} custom={0.35}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-12">
            <div>
              <h3 className="text-2xl font-semibold text-slate-900">
                48-hour pilot to ongoing program — the operating procedure
              </h3>
              <p className="text-slate-600 max-w-2xl mt-2">
                Align executives, legal and operators with a transparent cadence. Every stage is logged, authorized and measurable.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pilotSteps.map((step) => (
              <motion.div
                key={step.title}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg"
                variants={fadeIn}
                custom={0.4}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                    {step.icon}
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                    {step.timeframe}
                  </span>
                </div>
                <h4 className="text-lg font-semibold text-slate-900 mb-2">
                  {step.title}
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {step.detail}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="mt-16 bg-white border border-slate-200 rounded-3xl p-10 shadow-xl"
          variants={fadeIn}
          custom={0.38}
        >
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-10">
            <div>
              <h3 className="text-2xl font-semibold text-slate-900">
                Flexible pricing that scales with you
              </h3>
              <p className="text-slate-600 max-w-2xl mt-2">
                Start with a rapid pilot, lock in predictable cadences, then layer on enterprise-grade add-ons as your board and customers demand more coverage.
              </p>
            </div>
            <div className="px-5 py-2 rounded-full bg-gradient-to-r from-[#a855f7]/20 to-[#22d3ee]/20 border border-indigo-200 text-sm font-semibold text-indigo-600">
              Transparent. Modular. Zero surprises.
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {pricingPlans.map((plan) => (
              <motion.div
                key={plan.name}
                className="flex flex-col justify-between bg-slate-50 border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-lg transition-shadow"
                variants={fadeIn}
                custom={0.4}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xl font-semibold text-slate-900">
                      {plan.name}
                    </h4>
                    <span className="text-sm font-semibold text-indigo-500 bg-indigo-100 px-3 py-1 rounded-full">
                      {plan.price}
                    </span>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-400 mb-3">
                    {plan.cadence}
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">
                    {plan.description}
                  </p>
                </div>
                <div className="text-sm font-medium text-indigo-500">
                  {plan.note}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="mt-20 bg-slate-50 border border-slate-200 rounded-3xl p-10"
          variants={fadeIn}
          custom={0.45}
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
            <div className="md:w-1/2">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">
                Safety & legal guardrails you can share with counsel on day one
              </h3>
              <p className="text-slate-600 max-w-2xl mb-6">
                Every ZeroClick simulation is bolted to explicit legal, privacy and ethical controls so leadership never wonders if a test crossed the line.
              </p>
              <div className="mb-8">
                <img
                  src="/feat.avif"
                  alt="Illustration of safety and legal guardrails"
                  className="rounded-2xl shadow-md w-full md:max-w-md"
                />
              </div>
            </div>

            <div className="md:w-1/2 grid gap-5">
              {guardrails.map((item) => (
                <motion.div
                  key={item.title}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
                  variants={fadeIn}
                  custom={0.5}
                >
                  <h4 className="text-base font-semibold text-slate-900 mb-1">
                    {item.title}
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {item.detail}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
