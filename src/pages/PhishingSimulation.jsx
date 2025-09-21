import React from "react";
import { ArrowRight, Layers, Repeat, Shield, Target } from "react-feather";
import { useNavigate, useLocation } from "react-router-dom";

const sections = [
  {
    id: "automatic-reflexes",
    title: "Automatic reflexes",
    subtitle: "Short, gentle exercises that build instinct.",
    copy: [
      "We tailor every simulation to your team's daily reality: vendor follow-ups, finance approvals, shipping alerts, calendar invites. Each story is built from open-source intelligence on your brand, suppliers, and tone.",
      "Exercises arrive in short bursts — never more than 90 seconds to review. The goal is repetition without fatigue so the right reflex forms naturally." 
    ],
    highlights: [
      "Scenario depth informed by company research, not templates",
      "Adaptive cadence: weekly nudges for risky teams, monthly refreshers for champions",
      "Actionable micro-lessons the moment someone clicks"
    ],
    icon: <Layers className="w-8 h-8 text-[#8A4FFF]" />,
  },
  {
    id: "invisible-learning",
    title: "Invisible learning",
    subtitle: "Lessons that don't feel like lessons.",
    copy: [
      "Every simulation mirrors the channels people already trust — Outlook, Slack, SMS, shared drives, even calendar invites with spoofed Zoom links.",
      "If someone slips, the page that opens is calm and specific. It points out the exact red flags they missed and offers a 30-second practice flow to lock in the lesson." 
    ],
    highlights: [
      "Support for email, shared documents, Calendly clones, SMS and voicemail",
      "Localized language and tone so messages feel native",
      "Instant feedback pages branded for your company"
    ],
    icon: <Repeat className="w-8 h-8 text-[#9D5AFF]" />,
  },
  {
    id: "peace-of-mind",
    title: "Peace of mind",
    subtitle: "Your team feels safe and ready.",
    copy: [
      "Leaders receive a simple signal: who caught the red flags and who needs a lighter follow-up. No naming and shaming — just a coaching queue you can act on in minutes.",
      "We surface trends (supplier spoofing, payroll redirections, urgent CEO asks) so you can adapt policies before the real attack lands." 
    ],
    highlights: [
      "Executive dashboards with risk segments and trendlines",
      "Coaching scripts and templates for managers",
      "Quarterly threat briefings aligned with your industry"
    ],
    icon: <Shield className="w-8 h-8 text-[#B47AFF]" />,
  },
];

export default function PhishingSimulation() {
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
    <section className="bg-gradient-to-b from-[#F8F2FF] via-white to-[#F4ECFF] text-[#1F1235] min-h-screen py-20 px-6">
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
            Phishing Simulation Suite
          </span>
          <h1 className="mt-6 text-3xl md:text-4xl font-bold text-[#2B1653]">
            Enterprise-grade simulations built from your reality
          </h1>
          <p className="mt-4 text-lg text-[#5F4C8C] max-w-3xl mx-auto">
            We blend deep reconnaissance with respectful coaching. The result: your team practices real incidents before attackers get a chance.
          </p>
        </div>

        <div className="space-y-16">
          {sections.map((section) => (
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
                  <p className="text-[#7F56D0] font-medium">{section.subtitle}</p>
                </div>

                <div className="md:w-2/3 space-y-6 text-[#5F4C8C]">
                  {section.copy.map((paragraph, index) => (
                    <p key={index} className="leading-relaxed">
                      {paragraph}
                    </p>
                  ))}

                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {section.highlights.map((highlight, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 bg-[#F6EDFF] border border-[#E3D8FF] rounded-xl px-3 py-3"
                      >
                        <Target className="w-4 h-4 mt-0.5 text-[#8A4FFF]" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 bg-gradient-to-r from-[#8A4FFF]/15 via-[#B47AFF]/10 to-[#9D5AFF]/15 border border-[#E3D8FF] rounded-3xl p-8 md:p-10 text-center">
          <h2 className="text-2xl font-semibold text-[#2B1653] mb-4">
            Ready to see your first tailored scenario?
          </h2>
          <p className="text-[#5F4C8C] max-w-2xl mx-auto mb-6">
            Share the departments you worry about and we’ll craft a sample campaign that mirrors their day-to-day — inboxes, attachments, calendars and all.
          </p>
          <button
            onClick={() => navigate("/form")}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#8A4FFF] to-[#9D5AFF] text-white font-semibold shadow-[0_15px_35px_rgba(138,79,255,0.28)] hover:shadow-[0_18px_45px_rgba(138,79,255,0.35)] transition"
          >
            Request a tailored preview
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
