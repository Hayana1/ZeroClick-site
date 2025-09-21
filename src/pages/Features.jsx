import React from "react";
import {
  Send,
  Mail,
  RefreshCw,
  CheckCircle,
  ArrowRight,
  ChevronRight,
  Copy,
  Check,
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
  return (
    <div className="relative py-24 bg-gradient-to-b from-[#FDFBFF] via-[#F6EEFF] to-[#EFE3FF] overflow-hidden text-[#1F1235]">
      {/* Animated decorative dots */}
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

      <div className="relative max-w-6xl mx-auto px-6">
        {/* Title */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-4xl font-bold mb-6 text-[#2B1653]">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B47AFF] via-[#9D5AFF] to-[#8A4FFF] animate-gradient">
              Inbox training
            </span>{" "}
            in 3 simple steps
          </h2>
          <p className="text-1xl text-[#5F4C8C] max-w-3xl mx-auto">
            Real emails. Real habits. No stress, no jargon — just calm,
            confident clicks.
          </p>
        </div>

        {/* Vertical timeline */}
        <div className="relative">
          {/* Center line (desktop) */}
          <div className="absolute left-1/2 -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-[#8A4FFF] via-[#B47AFF] to-[#8A4FFF] opacity-20 hidden md:block"></div>

          {/* Step 1 */}
          <div className="flex flex-col md:flex-row items-stretch gap-8 mb-24 group">
            {/* Card */}
            <div className="bg-white/90 p-8 rounded-2xl border border-[#E3D8FF] shadow-[0_18px_45px_rgba(138,79,255,0.12)] w-full md:w-1/2 transition-all duration-300 group-hover:border-[#C8B4FF] group-hover:shadow-[0_25px_55px_rgba(138,79,255,0.22)]">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-gradient-to-br from-[#8A4FFF] to-[#B47AFF] text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg shadow-lg">
                  1
                </div>
                <h3 className="text-2xl font-semibold text-[#2B1653]">
                  A message arrives
                </h3>
              </div>

              <div className="space-y-5 pl-2">
                <div className="flex items-start gap-4">
                  <div className="bg-[#8A4FFF]/10 p-1.5 rounded-full mt-0.5">
                    <Mail
                      className="w-4 h-4 text-[#8A4FFF]"
                      strokeWidth={2.5}
                    />
                  </div>
                  <div>
                    <p className="text-[#5F4C8C]">
                      A realistic email lands in the inbox — urgent tone, a
                      link, and small changes that feel off.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-[#9D5AFF]/10 p-1.5 rounded-full mt-0.5">
                    <Send
                      className="w-4 h-4 text-[#9D5AFF]"
                      strokeWidth={2.5}
                    />
                  </div>
                  <div>
                    <p className="text-[#5F4C8C]">
                      Your team sees it like any normal day — and learns to spot
                      fraud early.
                    </p>
                    <div className="mt-1 text-sm text-[#7A67A8]">
                      No new tools to learn.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual example */}
            <div className="w-full md:w-1/2 relative">
              <div className="bg-white/95 p-6 rounded-2xl border border-[#E3D8FF] h-full shadow-[0_15px_40px_rgba(138,79,255,0.12)] transition-all duration-300 group-hover:border-[#C8B4FF]">
                <div className="font-mono text-sm text-[#5F4C8C] space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
                  </div>
                  <div className="text-[#8A4FFF]">// Sample email</div>
                  <div className="mt-3">
                    <span className="text-[#8A4FFF]">From:</span> “Billing – ABC
                    Inc.” &lt;billing@abc-inc-payments.com&gt;
                  </div>
                  <div>
                    <span className="text-[#8A4FFF]">Subject:</span> URGENT:
                    Payment issue
                  </div>
                  <div className="break-words">
                    <span className="text-[#8A4FFF]">Link:</span>{" "}
                    http://abc-inc.payments-update-secure.co/verify
                  </div>
                  <div className="text-[#7A67A8]">
                    Red flags: new domain, rushed deadline, new bank details.
                  </div>
                </div>
                <div className="absolute bottom-4 right-4 flex items-center gap-1 text-xs text-[#8A4FFF]">
                  <ChevronRight className="w-4 h-4" />
                  <span>Realistic example</span>
                </div>
              </div>

              {/* Timeline dot */}
              <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-[#8A4FFF] to-[#B47AFF] flex items-center justify-center border-4 border-white shadow-lg hidden md:flex">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col md:flex-row-reverse items-stretch gap-8 mb-24 group">
            {/* Card */}
            <div className="bg-white/90 p-8 rounded-2xl border border-[#E3D8FF] shadow-[0_18px_45px_rgba(138,79,255,0.12)] w-full md:w-1/2 transition-all duration-300 group-hover:border-[#C8B4FF] group-hover:shadow-[0_25px_55px_rgba(138,79,255,0.22)]">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-gradient-to-br from-[#8A4FFF] to-[#B47AFF] text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg shadow-lg">
                  2
                </div>
                <h3 className="text-2xl font-semibold text-[#2B1653]">
                  Pause and check
                </h3>
              </div>

              <div className="space-y-5 pl-2">
                <div className="flex items-start gap-4">
                  <div className="bg-[#8A4FFF]/10 p-1.5 rounded-full mt-0.5">
                    <RefreshCw
                      className="w-4 h-4 text-[#8A4FFF]"
                      strokeWidth={2.5}
                    />
                  </div>
                  <div>
                    <p className="text-[#5F4C8C]">
                      Hover links, read the address, compare payment details.
                      Slow beats sorry.
                    </p>
                    <div className="mt-1 text-sm text-[#7A67A8]">
                      Habits built in seconds.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-[#9D5AFF]/10 p-1.5 rounded-full mt-0.5">
                    <svg
                      className="w-4 h-4 text-[#9D5AFF]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      ></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-[#5F4C8C]">
                      You stay in control — we only coach the reflex.
                    </p>
                    <div className="mt-1 text-sm text-[#7A67A8]">
                      No blame, just better clicks.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual example */}
            <div className="w-full md:w-1/2 relative">
              <div className="bg-white/95 p-6 rounded-2xl border border-[#E3D8FF] h-full shadow-[0_15px_40px_rgba(138,79,255,0.12)] transition-all duration-300 group-hover:border-[#C8B4FF]">
                <div className="text-[#5F4C8C] text-sm space-y-4">
                  <div className="text-[#8A4FFF] font-medium">
                    Quick check list:
                  </div>
                  <ul className="list-disc list-inside text-[#5F4C8C] space-y-1">
                    <li>Sender address matches the company?</li>
                    <li>Link preview shows the right domain?</li>
                    <li>Any sudden “new bank details”?</li>
                  </ul>
                  <div className="pt-4 border-t border-[#E3D8FF] text-xs text-[#8A4FFF]/70">
                    10 seconds to avoid a costly mistake
                  </div>
                </div>
                <div className="absolute bottom-4 right-4 flex items-center gap-1 text-xs text-[#8A4FFF]">
                  <ChevronRight className="w-4 h-4" />
                  <span>Practical tips</span>
                </div>
              </div>

              {/* Timeline dot */}
              <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-[#8A4FFF] to-[#B47AFF] flex items-center justify-center border-4 border-white shadow-lg hidden md:flex">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col md:flex-row items-stretch gap-8 group">
            {/* Card */}
            <div className="bg-white/90 p-8 rounded-2xl border border-[#E3D8FF] shadow-[0_18px_45px_rgba(138,79,255,0.12)] w-full md:w-1/2 transition-all duration-300 group-hover:border-[#C8B4FF] group-hover:shadow-[0_25px_55px_rgba(138,79,255,0.22)]">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-gradient-to-br from-[#8A4FFF] to-[#B47AFF] text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg shadow-lg">
                  3
                </div>
                <h3 className="text-2xl font-semibold text-[#2B1653]">
                  Gentle feedback
                </h3>
              </div>

              <div className="space-y-5 pl-2">
                <div className="flex items-start gap-4">
                  <div className="bg-[#8A4FFF]/10 p-1.5 rounded-full mt-0.5">
                    <CheckCircle
                      className="w-4 h-4 text-[#8A4FFF]"
                      strokeWidth={2.5}
                    />
                  </div>
                  <div>
                    <p className="text-[#5F4C8C]">
                      If someone clicks, a short lesson explains each red flag —
                      no shame, just clarity.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-[#9D5AFF]/10 p-1.5 rounded-full mt-0.5">
                    <svg
                      className="w-4 h-4 text-[#9D5AFF]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      ></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-[#5F4C8C]">
                      Habits improve every week — calm, confident, natural.
                    </p>
                    <div className="mt-1 text-sm text-[#7A67A8]">
                      Peace of mind for everyone.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual example */}
            <div className="w-full md:w-1/2 relative">
              <div className="bg-white/95 p-6 rounded-2xl border border-[#E3D8FF] h-full shadow-[0_15px_40px_rgba(138,79,255,0.12)] transition-all duration-300 group-hover:border-[#C8B4FF]">
                <div className="text-[#5F4C8C] text-sm space-y-4">
                  <div className="text-[#8A4FFF] font-medium">
                    Example feedback:
                  </div>
                  <div className="font-mono bg-white px-3 py-2 rounded-lg border border-[#E3D8FF] inline-block shadow-sm">
                    “The sender domain doesn’t match. The link points elsewhere.
                    Payment details changed.”
                  </div>
                  <div className="flex items-center gap-2 mt-4 text-[#27C93F]">
                    <Check className="w-5 h-5" />
                    <span className="font-medium">
                      Next time: pause, hover, verify.
                    </span>
                  </div>
                  <div className="text-xs text-[#8A4FFF]/70">
                    Tiny lessons, big protection
                  </div>
                  <div className="pt-4 border-t border-[#E3D8FF] text-xs text-[#7A67A8]">
                    Weekly summary shows progress (no blame).
                  </div>
                </div>
                <div className="absolute bottom-4 right-4 flex items-center gap-1 text-xs text-[#8A4FFF]">
                  <ChevronRight className="w-4 h-4" />
                  <span>On-the-spot coaching</span>
                </div>
              </div>

              {/* Timeline dot */}
              <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-[#8A4FFF] to-[#B47AFF] flex items-center justify-center border-4 border-white shadow-lg hidden md:flex">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-24 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-[#2B1653] mb-6">
            Ready to <span className="text-[#8A4FFF]">stop fraud early</span>?
          </h3>
          <button
            onClick={() => navigate("/Form")}
            className="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-[#8A4FFF] to-[#9D5AFF] hover:from-[#9D5AFF] hover:to-[#B47AFF] text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-xl hover:shadow-[#8A4FFF]/40"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <PixelIcon name="chevalier" size={25} />
              Try a free simulation
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-[#9D5AFF] to-[#B47AFF] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
          </button>
          <p className="mt-4 text-sm text-[#7A67A8]">
            No commitment • Friendly coaching • Results you can feel
          </p>
        </div>
      </div>

      {/* CSS animations */}
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
        @keyframes animate-gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: animate-gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}
