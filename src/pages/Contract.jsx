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
    'From: "ABC Billing" <billing@abc-inc-payments.com>',
    "To: Sophie Tremblay",
    "Subject: Quick payment check",
    "",
    "Hi Sophie,",
    "We need you to confirm the new banking details before noon.",
    "",
    "Secure link: http://abc-inc-payments.com/update-info",
    "",
    "If the link fails, reply with your banking contact right away.",
    "",
    "Thanks,",
    "Marc, Accounts",
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
    <section className="relative overflow-hidden px-6 py-16 md:py-24 bg-gradient-to-b from-[#F6EEFF] via-[#FDFBFF] to-[#F3E9FF] text-[#1F1235]">
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
          <div className="inline-flex items-center px-4 py-2 mb-6 rounded-full bg-white/80 border border-[#D8C7FF] text-[#4B2C83] text-sm font-medium backdrop-blur">
            <CheckCircle className="w-4 h-4 mr-2 text-[#7F56D0]" />
            Training simulation — obvious fraud example
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[#2B1653]">
            Client email with a link
            <br />
            <span className="bg-gradient-to-r from-[#B47AFF] via-[#9D5AFF] to-[#8A4FFF] bg-clip-text text-transparent">
              learn to spot the red flags in seconds
            </span>
          </h1>

          <p className="text-lg text-[#5F4C8C] max-w-2xl mx-auto">
            A realistic message lands in the inbox. Your team practices pausing,
            checking, and staying safe — without stress or jargon.
          </p>
        </div>

        {/* Main content */}
        <div className="flex flex-col lg:flex-row gap-10 items-stretch">
          {/* Email animation panel */}
          <div className="w-full lg:w-7/12 flex flex-col">
            <div className="bg-white/95 rounded-2xl border border-[#E3D8FF] shadow-[0_22px_55px_rgba(138,79,255,0.14)] overflow-hidden flex flex-col max-h-[420px]">
              {/* Document title bar */}
              <div className="bg-[#F1E9FF] px-6 py-3 border-b border-[#E3D8FF] flex justify-between items-center">
                <div className="flex items-center space-x-2 text-[#4B2C83]">
                  <FileText className="w-5 h-5 text-[#7F56D0]" />
                  <span className="font-medium">
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
              <div className="p-6 font-sans text-[#5F4C8C] overflow-y-auto bg-white/80">
                <div className="max-w-md mx-auto">
                  <div className="mb-4 text-center">
                    <h2 className="text-lg font-semibold text-[#2B1653] mb-1 tracking-wide">
                      INBOX — SUSPICIOUS CLIENT MESSAGE
                    </h2>
                    <div className="w-12 h-0.5 bg-gradient-to-r from-[#8A4FFF] to-[#B47AFF] mx-auto rounded-full"></div>
                  </div>

                  <div className="space-y-4">
                    {/* Animated content */}
                    <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap">
                      {typedText}
                      {isTyping && (
                        <span className="ml-1 inline-block w-2 h-3 bg-[#B47AFF] animate-pulse"></span>
                      )}
                    </div>
                  </div>
                </div>

                {showContract && (
                  <div className="mt-4 p-3 bg-gradient-to-r from-[#F0E8FF] to-[#F4ECFF] border-l-4 border-[#8A4FFF] rounded-r-md animate-fadeIn">
                    <div className="flex items-start">
                      <CheckCircle className="flex-shrink-0 mt-1 mr-2 w-5 h-5 text-[#7F56D0]" />
                      <div className="text-left text-[#4B2C83]">
                        <p className="font-semibold text-sm">Red flags spotted</p>
                        <p className="text-xs text-[#5F4C8C] mt-0.5">
                          Mismatched sender domain, rushed deadline, new bank
                          details, and a suspicious link.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 text-sm text-[#7A67A8] flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-[#8A4FFF] mr-2 animate-pulse"></div>
              Automatic typing simulation
            </div>
          </div>

          {/* Process & CTA panel (text-only changes) */}
          <div className="w-full lg:w-5/12 flex flex-col">
            <div className="bg-white/95 p-8 rounded-2xl border border-[#E3D8FF] shadow-[0_18px_45px_rgba(138,79,255,0.14)] flex-1 flex flex-col">
              <h2 className="text-2xl font-bold text-[#2B1653] mb-8 flex items-center">
                <Zap className="w-6 h-6 mr-3 text-[#7F56D0]" />
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
                      <div className="w-10 h-10 rounded-full bg-white border border-[#C8B4FF] flex items-center justify-center group-hover:bg-[#F0E8FF] transition-colors">
                        <span className="text-[#7F56D0] font-bold">
                          {item.step}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        {item.icon}
                        <h3 className="text-lg font-semibold text-[#2B1653] ml-2">
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-[#5F4C8C] text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-6 border-t border-[#E3D8FF]">
                <div className="bg-[#F4ECFF] text-[#4B2C83] p-4 rounded-xl space-y-3">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-[#7F56D0]" />
                    <span className="text-sm">
                      2-minute setup. Start training this week.
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[#5F4C8C]">
                    <Shield className="w-5 h-5 text-[#7F56D0]" />
                    <span>No blame. Calm, confident teams.</span>
                  </div>
                </div>
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
