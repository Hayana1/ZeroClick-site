import React from "react";
import { motion } from "framer-motion";
import {
  Database,
  Cpu,
  Shield,
  CheckSquare,
  RefreshCw,
  Archive,
  FileText,
  ArrowRight,
} from "react-feather";
import { useNavigate } from "react-router-dom";

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

export default function Features() {
  const navigate = useNavigate();

  const pillars = [
    {
      title: "Automated OSINT collector",
      detail:
        "Crawl public sources (site, LinkedIn, X, GitHub, job posts, WHOIS, cert transparency) to build live profiles of employees, vendors and exposed assets.",
      icon: <Database className="w-6 h-6 text-indigo-500" strokeWidth={1.8} />,
      label: "Signal graph",
    },
    {
      title: "AI-driven simulation composer",
      detail:
        "Generate high-realism email, SMS and voice-lite scripts personalised with OSINT. Inject unique click tokens and post-click learning pages automatically.",
      icon: <Cpu className="w-6 h-6 text-violet-500" strokeWidth={1.8} />,
      label: "Creative engine",
    },
    {
      title: "Simulation orchestrator & safety gate",
      detail:
        "Schedule campaigns, set rate limits, maintain allow/deny lists and keep a live kill-switch. Scope is locked to signed consent before anything ships.",
      icon: <Shield className="w-6 h-6 text-purple-500" strokeWidth={1.8} />,
      label: "Control tower",
    },
    {
      title: "Tracking, evidence & after-click learning",
      detail:
        "Tokenise every interaction (open, click, submit, timing). Redirect “fails” to two-minute micro-training and log improvements automatically.",
      icon: (
        <CheckSquare className="w-6 h-6 text-fuchsia-500" strokeWidth={1.8} />
      ),
      label: "Learning loop",
    },
    {
      title: "Remediation & privacy cleanup",
      detail:
        "Auto-generate takedown requests, hardening checklists and prioritised remediation tickets. Offer managed or self-serve workflows.",
      icon: <Archive className="w-6 h-6 text-sky-500" strokeWidth={1.8} />,
      label: "Action pack",
    },
    {
      title: "Dynamic training loop",
      detail:
        "Personalise follow-up modules by role and behaviour. Re-test on schedule and show score deltas that leadership can trust.",
      icon: (
        <RefreshCw className="w-6 h-6 text-emerald-500" strokeWidth={1.8} />
      ),
      label: "Habit builder",
    },
    {
      title: "Audit trail & compliance",
      detail:
        "Store signed SOWs, campaign logs and evidence packages immutably. Export for legal, insurers and the board in one click.",
      icon: <FileText className="w-6 h-6 text-amber-500" strokeWidth={1.8} />,
      label: "Proof kit",
    },
  ];

  const distinctions = [
    "Modular tiers + fast pilots keep the product affordable for startups and VC portfolios.",
    "Automation-first workflows reduce delivery cost versus legacy awareness services.",
    "Channel roadmap: nail email + SMS + voice-lite now, introduce deepfakes only with explicit legal buy-in.",
    "Distribution leverages VC/accelerator cohorts, MSPs and startup ops leaders for rapid adoption.",
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
      className="relative py-24 bg-gradient-to-b from-[#F8FBFF] via-white to-[#F6F4FF] overflow-hidden"
      id="product-blueprint"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeIn}
      custom={0}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 right-16 w-56 h-56 bg-indigo-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-5 left-10 w-72 h-72 bg-purple-200/30 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          variants={fadeIn}
          custom={0.1}
        >
          <div className="inline-flex items-center px-5 py-2 mb-5 rounded-full bg-indigo-100 text-indigo-600 border border-indigo-200 text-sm font-medium">
            Product blueprint: ZeroClick power for startups
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold text-slate-900">
            Build ZeroClick realism, tuned for lean teams
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto mt-4">
            Each pillar mirrors ZeroClick’s strengths, packaged so a startup can
            deploy in days, stay inside legal guardrails and measure human-risk
            reduction without extra headcount.
          </p>
        </motion.div>

        <motion.div
          className="mb-10 rounded-3xl overflow-hidden shadow-xl"
          variants={fadeIn}
          custom={0.15}
        >
          <div className="grid gap-0 md:grid-cols-[1.1fr_0.9fr] items-stretch">
            <div className="relative aspect-[16/9] md:aspect-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-[#a855f7] via-[#6366f1] to-[#22d3ee] opacity-95" />
              <div className="absolute inset-0 mix-blend-overlay bg-gradient-to-tl from-[#f472b6]/40 via-transparent to-[#facc15]/35" />
              <div className="absolute inset-4 md:inset-6 rounded-3xl border border-white/20" />
              <div className="absolute inset-x-8 inset-y-10 md:inset-y-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 flex items-center justify-center text-center text-white px-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/80 mb-3">
                    ZeroClick Blueprint
                  </p>
                  <h3 className="text-2xl md:text-3xl font-semibold leading-snug">
                    Powering simulations
                  </h3>
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-6 md:p-10 text-sm text-slate-600 leading-relaxed">
              Show investors and customers how ZeroClick pulls OSINT signals,
              composes campaigns and closes the loop on remediation. The
              gradient anchors your product story now and stays flexible if you
              evolve it into a video or live dashboard later.
            </div>
          </div>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {pillars.map((pillar) => (
            <motion.div
              key={pillar.title}
              className="group relative bg-white border border-slate-200 rounded-3xl p-7 shadow-lg shadow-indigo-100 transition-all hover:-translate-y-1 hover:shadow-xl"
              variants={fadeIn}
              custom={0.2}
            >
              <div className="absolute -top-3 -right-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-indigo-500 bg-indigo-100 px-2.5 py-1 rounded-full">
                  {pillar.label}
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-5">
                {pillar.icon}
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                {pillar.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {pillar.detail}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-16 bg-white border border-slate-200 rounded-3xl p-8 shadow-lg"
          variants={fadeIn}
          custom={0.25}
        >
          <div className="grid md:grid-cols-[1fr,1.2fr] gap-8 items-start">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Focused differentiation for ZeroClick
              </h3>
              <p className="text-slate-600">
                You deliver ZeroClick realism, while winning on speed,
                automation and price. Position it as “ZeroClick-grade defenses
                without the enterprise complexity.”
              </p>
            </div>
            <ul className="space-y-3 text-sm text-slate-600">
              {distinctions.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3"
                >
                  <span className="text-indigo-500 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        <motion.div
          className="mt-16 bg-indigo-600 rounded-3xl p-10 text-white shadow-xl"
          variants={fadeIn}
          custom={0.3}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h3 className="text-2xl font-semibold mb-2">
                Ready to ship this blueprint?
              </h3>
              <p className="text-indigo-100 max-w-xl">
                Launch with OSINT + one campaign in 48 hours, then expand to
                SMS, voice-lite and automated remediation in under 90 days.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <button
                onClick={() => navigate("/Form")}
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-indigo-600 font-semibold shadow-md hover:shadow-lg"
              >
                <PixelIcon name="chevalier" size={26} />
                Request a 48-hour Pilot Audit
                <ArrowRight className="w-4 h-4" />
              </button>
              <span className="text-sm text-indigo-100/80">
                No obligation • We keep the redirect to your demo request flow
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
