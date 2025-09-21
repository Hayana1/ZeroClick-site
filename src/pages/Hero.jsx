import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  RefreshCw,
  CheckCircle,
  ChevronsRight,
  ArrowRight,
} from "react-feather";

// ADD just under the other imports
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
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setSize();
    window.addEventListener("resize", setSize);

    if (particlesRef.current.length === 0) {
      const width = canvas.width;
      const height = canvas.height;
      const particleCount = Math.min(80, Math.floor((width * height) / 20000));
      for (let i = 0; i < particleCount; i++) {
        const hue = Math.random() * 20 + 260;
        particlesRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.5 + 0.5,
          speed: Math.random() * 0.3 + 0.1,
          opacity: Math.random() * 0.3 + 0.1,
          angle: Math.random() * Math.PI * 2,
          frequency: Math.random() * 0.05 + 0.01,
          hue,
        });
      }
    }

    const animate = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      ctx.lineWidth = 0.1;
      ctx.strokeStyle = "rgba(138, 79, 255, 0.15)";
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const a = particlesRef.current[i];
          const b = particlesRef.current[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distance = Math.hypot(dx, dy);
          if (distance < 120) {
            ctx.globalAlpha = 0.1 * (1 - distance / 120);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }

      particlesRef.current.forEach((p) => {
        p.y -= p.speed;
        p.x += Math.sin(p.angle) * 0.3;
        p.angle += p.frequency;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const grad = ctx.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          p.radius * 3
        );
        grad.addColorStop(0, `hsla(${p.hue}, 100%, 70%, ${p.opacity})`);
        grad.addColorStop(1, `hsla(${p.hue}, 100%, 70%, 0)`);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 100%, 70%, ${p.opacity})`;
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      window.removeEventListener("resize", setSize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <section className="relative overflow-hidden px-6 py-24 text-center bg-gradient-to-b from-[#F9F6FF] via-[#FDFBFF] to-[#F6EDFF] min-h-screen flex items-center justify-center text-[#1F1235]">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#BFA7FF] rounded-full filter blur-[100px] opacity-40 animate-pulse-slow" />
      <div
        className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-[#D6C3FF] rounded-full filter blur-[110px] opacity-40 animate-pulse-slow"
        style={{ animationDelay: "2s" }}
      />

      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4/5 h-3/5 bg-gradient-to-r from-[#8A4FFF] to-[#B47AFF] rounded-full filter blur-[120px] opacity-20" />

      <div className="relative max-w-4xl mx-auto z-10">
        <div className="inline-flex items-center px-6 py-3 mb-10 rounded-full bg-white/80 border border-[#D8C7FF] text-[#4B2C83] text-sm md:text-base font-medium backdrop-blur-md transition-all hover:bg-white hover:border-[#C0A8FF] animate-bounce-in">
          <CheckCircle
            className="w-5 h-5 mr-2 text-[#7F56D0]"
            strokeWidth={2.5}
          />
          Made in Québec, not Silicon Valley
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-8 leading-tight tracking-tight text-[#1E0F3A]">
          <TypewriterText
            text="One click can cost everything."
            className="text-[#1E0F3A] font-medium block mb-4"
            delay={200}
            speed={60}
          />
          <TypewriterText
            text="Train your team to spot fraud early."
            className="bg-gradient-to-r from-[#B47AFF] via-[#9D5AFF] to-[#8A4FFF] bg-clip-text text-transparent block font-semibold"
            delay={800}
            speed={50}
          />
        </h1>

        <div
          className="opacity-0 animate-fade-in"
          style={{ animationDelay: "1.8s", animationFillMode: "forwards" }}
        >
          <p className="text-lg text-[#5A4B80] mb-12 max-w-2xl mx-auto leading-relaxed">
            Realistic inbox scenarios that feel natural.{" "}
            <span className="font-medium bg-white px-2 py-1 rounded-md text-[#7F56D0] border border-[#E0D4FF] shadow-sm">
              Your team learns without pressure
            </span>{" "}
            — building calm, confident reflexes day by day.
          </p>
        </div>

        <div
          className="mb-16 opacity-0 animate-fade-in"
          style={{ animationDelay: "2.2s", animationFillMode: "forwards" }}
        >
          <button
            onClick={() => navigate("/Form")}
            className="group relative overflow-hidden px-7 py-4 bg-gradient-to-r from-[#8A4FFF] to-[#9D5AFF] hover:from-[#9D5AFF] hover:to-[#B47AFF] text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-[0_15px_35px_rgba(138,79,255,0.25)] hover:shadow-[0_18px_45px_rgba(138,79,255,0.35)] text-base"
          >
            <span className="relative z-10 flex items-center justify-center">
              <PixelIcon name="sorcier-malefique" size={24} className="mr-2" />
              Try a free simulation
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-[#9D5AFF] to-[#B47AFF] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
            <span className="absolute top-0 left-0 w-full h-full overflow-hidden">
              <span className="absolute top-0 left-0 w-8 h-full bg-white opacity-0 group-hover:opacity-10 transform -skew-x-12 group-hover:left-[calc(100%+16px)] transition-all duration-1000"></span>
            </span>
          </button>
          <p className="mt-3 text-sm text-[#6F5E9E]">
            Better a fake trap today than a real loss tomorrow • No commitment
          </p>
        </div>

        {/* Feature cards avec animations 3D au survol */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto opacity-0 animate-fade-in"
          style={{ animationDelay: "2.6s", animationFillMode: "forwards" }}
        >
          {[
            {
              icon: (
                <FileText
                  className="w-7 h-7 text-[#8A4FFF]"
                  strokeWidth={1.5}
                />
              ),
              title: "Automatic reflexes",
              desc: "Short, gentle exercises that build instinct. Fewer risky clicks, more confidence.",
              badge: "Calm",
              path: "/services/phishing-simulation#automatic-reflexes",
            },
            {
              icon: (
                <RefreshCw
                  className="w-7 h-7 text-[#9D5AFF]"
                  strokeWidth={1.5}
                />
              ),
              title: "Invisible learning",
              desc: "Lessons that don't feel like lessons. Every slip becomes a kind reminder.",
              badge: "Gentle",
              path: "/services/phishing-simulation#invisible-learning",
            },
            {
              icon: (
                <CheckCircle
                  className="w-5 h-5 mr-2 text-[#B47AFF]"
                  strokeWidth={2.5}
                />
              ),
              title: "Peace of mind",
              desc: "Your team feels safe and ready. You finally breathe easier.",
              badge: "Trust",
              path: "/services/phishing-simulation#peace-of-mind",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className={`group relative bg-white/90 p-6 rounded-xl border border-[#E3D8FF] shadow-[0_12px_30px_rgba(138,79,255,0.12)] transition-all duration-500 transform perspective-1000 cursor-pointer ${
                hoveredCard === index ? "scale-105 -translate-y-2" : ""
              }`}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
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
              style={{
                transformStyle: "preserve-3d",
                boxShadow:
                  hoveredCard === index
                    ? "0 22px 45px -18px rgba(138, 79, 255, 0.30)"
                    : "0 12px 28px rgba(138, 79, 255, 0.12)",
              }}
            >
              <div className="absolute -top-2 -right-2 z-10">
                <span className="text-sm bg-white text-[#7F56D0] px-2 py-1 rounded-full border border-[#E0D4FF] shadow-sm">
                  {feature.badge}
                </span>
              </div>

              <div className="bg-gradient-to-br from-white to-[#F0E6FF] w-14 h-14 rounded-lg flex items-center justify-center mb-4 group-hover:from-[#F6EDFF] group-hover:to-white transition-all duration-500 group-hover:scale-110">
                {feature.icon}
              </div>

              <h3 className="text-lg font-semibold text-[#2B1653] mb-3 group-hover:text-[#7F56D0] transition-colors">
                {feature.title}
              </h3>

              <p className="text-[#5F4C8C] text-sm leading-relaxed">
                {feature.desc}
              </p>

              <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ChevronsRight className="w-5 h-5 text-[#8A4FFF] animate-bounce-horizontal" />
              </div>

              {/* Effet de lumière derrière la carte */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#8A4FFF] to-[#B47AFF] opacity-0 group-hover:opacity-40 transition-opacity duration-500 -z-10" />
            </div>
          ))}
        </div>
      </div>

      {/* Styles d'animation supplémentaires */}
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
        @keyframes bounce-in {
          0% {
            transform: scale(0.95);
            opacity: 0;
          }
          60% {
            transform: scale(1.02);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse-soft {
          0% {
            box-shadow: 0 0 0 0 rgba(138, 79, 255, 0.3);
          }
          70% {
            box-shadow: 0 0 0 8px rgba(138, 79, 255, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(138, 79, 255, 0);
          }
        }
        @keyframes bounce-horizontal {
          0%,
          100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(3px);
          }
        }
        .animate-bounce-in {
          animation: bounce-in 0.8s ease-out;
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        .animate-pulse-soft {
          animation: pulse-soft 3s infinite;
        }
        .animate-pulse-slow {
          animation: pulse-soft 5s infinite;
        }
        .animate-bounce-horizontal {
          animation: bounce-horizontal 1.5s infinite;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </section>
  );
}

// Composant pour l'effet machine à écrire
const TypewriterText = ({ text, className, delay = 0, speed = 50 }) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex >= text.length) return;
    const timeout = setTimeout(() => {
      setDisplayText((prev) => prev + text[currentIndex]);
      setCurrentIndex((prev) => prev + 1);
    }, speed + Math.random() * 30);
    return () => clearTimeout(timeout);
  }, [currentIndex, text, speed]);

  return (
    <span className={className}>
      {displayText}
      {currentIndex < text.length && (
        <span className="inline-block w-0.5 h-5 ml-0.5 bg-current animate-pulse align-middle"></span>
      )}
    </span>
  );
};
