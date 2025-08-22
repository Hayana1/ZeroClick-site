import React, { useState, useEffect } from "react";
import {
  FileText,
  CheckCircle,
  Zap,
  Shield,
  Mail,
  ChevronRight,
  File,
  Send,
  Clock,
  User,
  DollarSign,
  PenTool,
  Layout,
} from "react-feather";

export default function Contrat() {
  const [typedText, setTypedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [showContract, setShowContract] = useState(false);

  // Typing animation text — phishing-like client email (obvious red flags)
  const contractText = [
    'From: "Jean Dupont – ABC Inc." <billing@abc-inc-payments.com>',
    "To: Sophie Tremblay <sophie.tremblay@designstudio.com>",
    "Subject: URGENT: Unpaid invoice – action needed",
    "Date: Thu, Aug 7, 2025 09:14 AM",
    "",
    "Hi Sophie,",
    "",
    "We detected an issue with your last payment and your account could be paused today.",
    "Please confirm the details within 2 hours to avoid extra fees.",
    "",
    "View the updated document here:",
    "👉  http://abc-inc.payments-update-secure.co/account/verify?case=812734  ",
    "",
    "Notes:",
    "- We recently changed our bank account (see link for new details).",
    "- This is handled by a new external provider.",
    "",
    "Best,",
    "Jean Dupont",
    "Finance Department, ABC Inc.",
    "billing@abc-inc-payments.com",
  ].join("\n");

  useEffect(() => {
    if (isTyping) {
      const timer = setTimeout(() => {
        if (typedText.length < contractText.length) {
          setTypedText(contractText.substring(0, typedText.length + 1));
        } else {
          setIsTyping(false);
          setTimeout(() => setShowContract(true), 300);
        }
      }, 30);

      return () => clearTimeout(timer);
    }
  }, [typedText, isTyping, contractText]);

  return (
    <section className="relative overflow-hidden px-6 py-16 md:py-24 bg-gradient-to-b from-[#0F0F19] via-[#151221] to-[#1A1428]">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        {[...Array(20)].map((_, i) => (
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

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 mb-6 rounded-full bg-[#8A4FFF]/10 border border-[#8A4FFF]/20 text-[#D9C7FF] text-sm font-medium backdrop-blur-md">
            <CheckCircle className="w-4 h-4 mr-2 text-[#B47AFF]" />
            Training simulation — obvious fraud example
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Client email with a link
            <br />
            <span className="bg-gradient-to-r from-[#B47AFF] via-[#9D5AFF] to-[#8A4FFF] bg-clip-text text-transparent">
              learn to spot the red flags in seconds
            </span>
          </h1>

          <p className="text-lg text-[#D9C7FF] max-w-2xl mx-auto">
            A realistic message lands in the inbox. Your team practices pausing,
            checking, and staying safe — without stress or jargon.
          </p>
        </div>

        {/* Main content */}
        <div className="flex flex-col lg:flex-row gap-10 items-stretch">
          {/* Email animation panel */}
          <div className="w-full lg:w-7/12 flex flex-col">
            <div className="bg-gradient-to-br from-[#1E1B2B] to-[#2D2442] rounded-2xl border border-[#3A2E5D] shadow-2xl overflow-hidden flex-1 flex flex-col">
              {/* Document title bar */}
              <div className="bg-[#2D2442] px-6 py-3 border-b border-[#3A2E5D] flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-[#B47AFF]" />
                  <span className="font-medium text-[#D9C7FF]">
                    Client_Email_ABC-Inc_Payment-Issue.eml
                  </span>
                </div>
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-[#8A4FFF] rounded-full"></div>
                  <div className="w-3 h-3 bg-[#9D5AFF] rounded-full"></div>
                  <div className="w-3 h-3 bg-[#B47AFF] rounded-full"></div>
                </div>
              </div>

              {/* Document content */}
              <div className="p-4 font-sans text-[#D9C7FF] overflow-y-auto flex-1">
                <div className="max-w-xl mx-auto">
                  <div className="mb-4 text-center">
                    <h2 className="text-lg font-semibold text-white mb-1 tracking-wide">
                      INBOX — SUSPICIOUS CLIENT MESSAGE
                    </h2>
                    <div className="w-12 h-0.5 bg-gradient-to-r from-[#8A4FFF] to-[#B47AFF] mx-auto rounded-full"></div>
                  </div>

                  <div className="space-y-4">
                    {/* Animated content */}
                    <div className="font-mono text-xs leading-snug whitespace-pre-wrap">
                      {typedText}
                      {isTyping && (
                        <span className="ml-1 inline-block w-2 h-3 bg-[#B47AFF] animate-pulse"></span>
                      )}
                    </div>
                  </div>
                </div>

                {showContract && (
                  <div className="mt-4 p-3 bg-gradient-to-r from-[#8A4FFF]/20 to-[#B47AFF]/20 border-l-4 border-[#8A4FFF] rounded-r-md animate-fadeIn">
                    <div className="flex items-start">
                      <CheckCircle className="flex-shrink-0 mt-1 mr-2 w-5 h-5 text-[#B47AFF]" />
                      <div>
                        <p className="font-semibold text.white text-sm">
                          Red flags spotted
                        </p>
                        <p className="text-xs text-[#D9C7FF] mt-0.5">
                          Mismatched sender domain, rushed deadline, new bank
                          details, and a suspicious link.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 text-sm text-[#A794D4] flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-[#8A4FFF] mr-2 animate-pulse"></div>
              Automatic typing simulation
            </div>
          </div>

          {/* Process & CTA panel (text-only changes) */}
          <div className="w-full lg:w-5/12 flex flex-col">
            <div className="bg-gradient-to-br from-[#1E1B2B] to-[#2D2442] p-8 rounded-2xl border border-[#3A2E5D] shadow-lg flex-1 flex flex-col">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
                <Zap className="w-6 h-6 mr-3 text-[#8A4FFF]" />
                How this simulation works (3 steps)
              </h2>

              <div className="space-y-8 mb-8">
                {[
                  {
                    step: "1",
                    title: "A message arrives",
                    desc: "A realistic email lands in the inbox — urgent tone, link, small details that feel off.",
                    icon: <Mail className="w-5 h-5 text-[#8A4FFF]" />,
                  },
                  {
                    step: "2",
                    title: "Pause and check",
                    desc: "Users practice slowing down: hover the link, read the address, look for changes in payment info.",
                    icon: <Shield className="w-5 h-5 text-[#9D5AFF]" />,
                  },
                  {
                    step: "3",
                    title: "Instant feedback",
                    desc: "If they click, a gentle lesson explains each red flag — building calm, confident reflexes.",
                    icon: <Send className="w-5 h-5 text-[#B47AFF]" />,
                  },
                ].map((item, index) => (
                  <div key={index} className="flex items-start group">
                    <div className="flex-shrink-0 mr-4 mt-1">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1E1B2B] to-[#2D2442] border border-[#8A4FFF] flex items-center justify-center group-hover:bg-[#8A4FFF]/20 transition-colors">
                        <span className="text-[#8A4FFF] font-bold">
                          {item.step}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        {item.icon}
                        <h3 className="text-lg font-semibold text-white ml-2">
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-[#D1C4E9] text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx global>{`
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

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </section>
  );
}
