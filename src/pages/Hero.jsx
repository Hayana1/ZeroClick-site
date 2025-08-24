import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  RefreshCw,
  CheckCircle,
  ChevronsRight,
  ArrowRight,
} from "react-feather";

export default function Hero() {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationRef = useRef(null);

  // Effet de particules avancé avec canvas
  // Effet de particules avancé avec canvas
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

    // Création des particules (une seule fois)
    if (particlesRef.current.length === 0) {
      const width = canvas.width;
      const height = canvas.height;
      const particleCount = Math.min(80, Math.floor((width * height) / 20000));

      for (let i = 0; i < particleCount; i++) {
        const hue = Math.random() * 20 + 260; // 260–280
        particlesRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.5 + 0.5,
          speed: Math.random() * 0.3 + 0.1,
          opacity: Math.random() * 0.3 + 0.1,
          angle: Math.random() * Math.PI * 2,
          frequency: Math.random() * 0.05 + 0.01,
          hue, // ⬅️ on garde la teinte pour HSLA
        });
      }
    }

    const animate = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Lignes de connexion
      ctx.lineWidth = 0.1;
      ctx.strokeStyle = "rgba(180, 122, 255, 0.08)";
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

      // Particules + halo
      particlesRef.current.forEach((p) => {
        // Update
        p.y -= p.speed;
        p.x += Math.sin(p.angle) * 0.3;
        p.angle += p.frequency;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        // Halo en HSLA (au lieu de concaténer du hex à HSL)
        const grad = ctx.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          p.radius * 3
        );
        const start = `hsla(${p.hue}, 100%, 70%, ${p.opacity})`;
        const end = `hsla(${p.hue}, 100%, 70%, 0)`;
        grad.addColorStop(0, start);
        grad.addColorStop(1, end);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Cœur de la particule (HSLA aussi)
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
    <section className="relative overflow-hidden px-6 py-24 md:py-32 text-center bg-gradient-to-b from-[#0F0F19] via-[#151221] to-[#1A1428] min-h-screen flex items-center justify-center">
      {/* Canvas pour les particules avancées */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      {/* Éléments visuels supplémentaires */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#8A4FFF] rounded-full filter blur-[90px] opacity-10 animate-pulse-slow" />
      <div
        className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-[#B47AFF] rounded-full filter blur-[90px] opacity-10 animate-pulse-slow"
        style={{ animationDelay: "2s" }}
      />

      {/* Effet de lueur centrale subtile */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4/5 h-3/5 bg-gradient-to-r from-[#8A4FFF] to-[#B47AFF] rounded-full filter blur-[100px] opacity-3" />

      <div className="relative max-w-4xl mx-auto z-10">
        {/* Quebec badge avec animation subtile */}
        <div className="inline-flex items-center px-4 py-2 mb-10 rounded-full bg-[#8A4FFF]/10 border border-[#8A4FFF]/20 text-[#D9C7FF] text-sm font-medium backdrop-blur-md transition-all hover:bg-[#8A4FFF]/15 hover:border-[#8A4FFF]/40 animate-bounce-in">
          <CheckCircle
            className="w-4 h-4 mr-2 text-[#B47AFF]"
            strokeWidth={2.5}
          />
          Made in Québec, not Silicon Valley
        </div>

        {/* Titre principal avec effet de machine à écrire */}
        <h1 className="text-4xl md:text-5xl font-bold mb-8 leading-tight tracking-tight">
          <TypewriterText
            text="One click can cost everything."
            className="text-white font-medium block mb-4"
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

        {/* Subheadline avec effet d'apparition */}
        <div
          className="opacity-0 animate-fade-in"
          style={{ animationDelay: "1.8s", animationFillMode: "forwards" }}
        >
          <p className="text-lg text-[#D9C7FF] mb-12 max-w-2xl mx-auto leading-relaxed">
            Realistic inbox scenarios that feel natural.{" "}
            <span className="font-medium bg-[#1E1B2B] px-2 py-1 rounded-md text-[#B47AFF] border border-[#3A2E5D]">
              Your team learns without pressure
            </span>{" "}
            — building calm, confident reflexes day by day.
          </p>
        </div>

        {/* CTA avec effet de pulsation subtile */}
        <div
          className="mb-16 opacity-0 animate-fade-in"
          style={{ animationDelay: "2.2s", animationFillMode: "forwards" }}
        >
          <button
            onClick={() => navigate("/Form")}
            className="group relative overflow-hidden px-6 py-3 bg-gradient-to-r from-[#8A4FFF] to-[#9D5AFF] hover:from-[#9D5AFF] hover:to-[#B47AFF] text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-[#8A4FFF]/30"
          >
            <span className="relative z-10 flex items-center justify-center">
              🐣 Try a free simulation
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-[#9D5AFF] to-[#B47AFF] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>

            {/* Effet de lumière sur le bouton */}
            <span className="absolute top-0 left-0 w-full h-full overflow-hidden">
              <span className="absolute top-0 left-0 w-8 h-full bg-white opacity-0 group-hover:opacity-10 transform -skew-x-12 group-hover:left-[calc(100%+16px)] transition-all duration-1000"></span>
            </span>
          </button>
          <p className="mt-3 text-xs text-[#A794D4]">
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
                  className="w-6 h-6 text-[#8A4FFF]"
                  strokeWidth={1.5}
                />
              ),
              title: "Automatic reflexes",
              desc: "Short, gentle exercises that build instinct. Fewer risky clicks, more confidence.",
              badge: "Calm",
            },
            {
              icon: (
                <RefreshCw
                  className="w-6 h-6 text-[#9D5AFF]"
                  strokeWidth={1.5}
                />
              ),
              title: "Invisible learning",
              desc: "Lessons that don't feel like lessons. Every slip becomes a kind reminder.",
              badge: "Gentle",
            },
            {
              icon: (
                <CheckCircle
                  className="w-6 h-6 text-[#B47AFF]"
                  strokeWidth={1.5}
                />
              ),
              title: "Peace of mind",
              desc: "Your team feels safe and ready. You finally breathe easier.",
              badge: "Trust",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className={`group relative bg-[#1E1B2B]/70 backdrop-blur-sm p-5 rounded-xl border border-[#2D2442] transition-all duration-500 transform perspective-1000 ${
                hoveredCard === index ? "scale-105 -translate-y-2" : ""
              }`}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                transformStyle: "preserve-3d",
                boxShadow:
                  hoveredCard === index
                    ? "0 15px 30px -10px rgba(138, 79, 255, 0.2)"
                    : "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
              }}
            >
              <div className="absolute -top-2 -right-2 z-10">
                <span className="text-xs bg-[#8A4FFF]/10 text-[#B47AFF] px-2 py-1 rounded-full border border-[#8A4FFF]/20">
                  {feature.badge}
                </span>
              </div>

              <div className="bg-gradient-to-br from-[#1E1B2B] to-[#2D2442] w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#8A4FFF]/10 transition-colors duration-500 group-hover:scale-110">
                {feature.icon}
              </div>

              <h3 className="text-lg font-medium text-white mb-2 group-hover:text-[#D9C7FF] transition-colors">
                {feature.title}
              </h3>

              <p className="text-[#D1C4E9] text-sm leading-relaxed">
                {feature.desc}
              </p>

              <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ChevronsRight className="w-4 h-4 text-[#8A4FFF] animate-bounce-horizontal" />
              </div>

              {/* Effet de lumière derrière la carte */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#8A4FFF] to-[#B47AFF] opacity-0 group-hover:opacity-5 transition-opacity duration-500 -z-10" />
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
