import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowRight, Globe, Lock, Monitor, Smartphone, Shield, Zap } from "react-feather";

const analyzerSections = [
  {
    id: "invisible-scan",
    title: "Invisible scan",
    description:
      "The extension runs inside Chrome, Edge, and Brave without adding clutter. It watches mouse hovers, copy-pasted URLs, attached files, and calendar links without interrupting work.",
    bullets: [
      "Covers Outlook, Gmail, Teams, Slack, Notion, and shared drive previews",
      "Checks URLs against live threat intelligence and machine-learning heuristics",
      "Sandboxes attachments with macro and script detection"
    ],
    icon: <Monitor className="w-8 h-8 text-[#8A4FFF]" />,
  },
  {
    id: "instant-verdict",
    title: "Instant verdict",
    description:
      "When something looks suspicious, the Analyzer decides before the click lands. Clean links pass instantly. Risky content triggers a branded warning screen with the red flags explained.",
    bullets: [
      "Sub-second decisions with offline cache for travel scenarios",
      "Explains which indicator triggered the block so users learn on the spot",
      "Optional tap-to-override flow for your security team"
    ],
    icon: <Shield className="w-8 h-8 text-[#9D5AFF]" />,
  },
  {
    id: "always-on",
    title: "Always-on protection",
    description:
      "Rollouts take minutes with our admin console. Push policies to departments, review weekly heatmaps, and track which threats were blocked before anyone could click.",
    bullets: [
      "Granular policies by team, vendor, or geography",
      "Automatic reporting into your SOC or SIEM",
      "Mobile support in private beta — iOS and Android clients ship next quarter"
    ],
    icon: <Zap className="w-8 h-8 text-[#B47AFF]" />,
  },
];

export default function RealTimeAnalyzerPage() {
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location.hash]);

  return (
    <section className="bg-gradient-to-b from-[#F6EEFF] via-[#FDFBFF] to-[#F2E7FF] text-[#1F1235] min-h-screen py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm text-[#7F56D0] hover:text-[#8A4FFF] transition mb-6"
        >
          <ArrowRight className="w-4 h-4 mr-2" style={{ transform: "rotate(180deg)" }} />
          Back to landing
        </button>

        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-[#E3D8FF] text-xs font-semibold uppercase tracking-wide text-[#7F56D0]">
            Real-Time Analyzer
          </span>
          <h1 className="mt-6 text-3xl md:text-4xl font-bold text-[#2B1653]">
            The always-on layer that blocks ransomware bait at the source
          </h1>
          <p className="mt-4 text-lg text-[#5F4C8C] max-w-3xl mx-auto">
            Build reflexes with training, then let the Analyzer enforce them. It scans every channel and stops impersonation links, weaponized documents, and malicious redirects in milliseconds.
          </p>
        </div>

        <div className="space-y-16">
          {analyzerSections.map((section) => (
            <div
              key={section.id}
              id={section.id}
              className="bg-white border border-[#E3D8FF] rounded-3xl shadow-[0_25px_60px_rgba(138,79,255,0.14)] px-8 py-10"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
                <div className="md:w-1/3">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#F0E8FF] mb-4">
                    {section.icon}
                  </div>
                  <h2 className="text-2xl font-semibold text-[#2B1653] mb-2">
                    {section.title}
                  </h2>
                  <p className="text-[#7F56D0] font-medium">{section.description}</p>
                </div>
                <div className="md:w-2/3">
                  <ul className="space-y-3 text-sm text-[#5F4C8C]">
                    {section.bullets.map((bullet, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 bg-[#F6EDFF] border border-[#E3D8FF] rounded-xl px-3 py-3"
                      >
                        <Lock className="w-4 h-4 mt-0.5 text-[#8A4FFF]" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-[#E3D8FF] rounded-3xl p-8 shadow-[0_20px_50px_rgba(138,79,255,0.12)]">
            <h3 className="text-xl font-semibold text-[#2B1653] mb-3 flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#8A4FFF]" />
              Platform coverage
            </h3>
            <p className="text-sm text-[#5F4C8C] leading-relaxed">
              Desktop browsers today. Mobile rollouts (iOS / Android) in private beta now, with a lightweight agent coming to Windows and macOS to cover native apps and terminal clients.
            </p>
          </div>

          <div className="bg-white border border-[#E3D8FF] rounded-3xl p-8 shadow-[0_20px_50px_rgba(138,79,255,0.12)]">
            <h3 className="text-xl font-semibold text-[#2B1653] mb-3 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-[#B47AFF]" />
              Coming soon: mobile guardrails
            </h3>
            <p className="text-sm text-[#5F4C8C] leading-relaxed">
              Employees get the same pre-click protection on their phones. DM us to join the beta and block phishing SMS, QR-code redirects, and malicious calendar invites on mobile.
            </p>
          </div>
        </div>

        <div className="mt-20 bg-gradient-to-r from-[#8A4FFF]/15 via-[#B47AFF]/10 to-[#9D5AFF]/15 border border-[#E3D8FF] rounded-3xl p-8 md:p-10 text-center">
          <h2 className="text-2xl font-semibold text-[#2B1653] mb-4">
            Deploy in under 30 minutes across your fleet
          </h2>
          <p className="text-[#5F4C8C] max-w-2xl mx-auto mb-6">
            Our team ships a turnkey rollout kit: crowd-sourced allow lists, Slack/Teams announcement templates, and onboarding videos so adoption feels effortless.
          </p>
          <button
            onClick={() => navigate("/form")}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#8A4FFF] to-[#9D5AFF] text-white font-semibold shadow-[0_15px_35px_rgba(138,79,255,0.28)] hover:shadow-[0_18px_45px_rgba(138,79,255,0.35)] transition"
          >
            Book a live walkthrough
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
