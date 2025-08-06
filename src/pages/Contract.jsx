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

  // Texte pour l'animation de frappe
  const contractText = [
    "CONTRAT DE SERVICE",
    "",
    "Fait à Montréal, le 7 août 2025",
    "",
    "Prestataire : Sophie Tremblay, designer graphique",
    "Client : ABC Inc., représentée par Jean Dupont",
    "",
    "Objet : Conception d’un site web de 5 pages (design + développement).",
    "Montant : 2 500 $ CAD – 50% à la signature, 50% à la livraison.",
    "Livraison prévue : 15 octobre 2025.",
    "",
    "Le transfert des droits se fait après paiement complet.",
    "Retard de paiement >30 jours : pénalité de 2%/mois.",
    "Résiliation possible avec 15 jours de préavis.",
    "Ce contrat est régi par les lois du Québec.",
    "",
    "Signatures :",
    "____________________      ____________________",
    "Sophie Tremblay          Jean Dupont",
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
      {/* Arrière-plan cosmique */}
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
        {/* En-tête */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 mb-6 rounded-full bg-[#8A4FFF]/10 border border-[#8A4FFF]/20 text-[#D9C7FF] text-sm font-medium backdrop-blur-md">
            <CheckCircle className="w-4 h-4 mr-2 text-[#B47AFF]" />
            Conforme aux exigences juridiques du Québec
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Contrats professionnels
            <br />
            <span className="bg-gradient-to-r from-[#B47AFF] via-[#9D5AFF] to-[#8A4FFF] bg-clip-text text-transparent">
              en 30 secondes chrono
            </span>
          </h1>

          <p className="text-lg text-[#D9C7FF] max-w-2xl mx-auto">
            Imposez vos conditions de paiement et protégez-vous juridiquement.
            Sans jargon compliqué.
          </p>
        </div>

        {/* Contenu principal */}
        <div className="flex flex-col lg:flex-row gap-10 items-stretch">
          {/* Animation de contrat - Design amélioré */}
          <div className="w-full lg:w-7/12 flex flex-col">
            <div className="bg-gradient-to-br from-[#1E1B2B] to-[#2D2442] rounded-2xl border border-[#3A2E5D] shadow-2xl overflow-hidden flex-1 flex flex-col">
              {/* Barre de titre du document */}
              <div className="bg-[#2D2442] px-6 py-3 border-b border-[#3A2E5D] flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-[#B47AFF]" />
                  <span className="font-medium text-[#D9C7FF]">
                    Contrat_ABC-Inc_Sophie-Tremblay.pdf
                  </span>
                </div>
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-[#8A4FFF] rounded-full"></div>
                  <div className="w-3 h-3 bg-[#9D5AFF] rounded-full"></div>
                  <div className="w-3 h-3 bg-[#B47AFF] rounded-full"></div>
                </div>
              </div>

              {/* Contenu du document - Design professionnel */}
              <div className="p-4 font-sans text-[#D9C7FF] overflow-y-auto flex-1">
                <div className="max-w-xl mx-auto">
                  <div className="mb-4 text-center">
                    <h2 className="text-lg font-semibold text-white mb-1 tracking-wide">
                      CONTRAT DE SERVICES
                    </h2>
                    <div className="w-12 h-0.5 bg-gradient-to-r from-[#8A4FFF] to-[#B47AFF] mx-auto rounded-full"></div>
                  </div>

                  <div className="space-y-4">
                    {/* Contenu animé */}
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
                        <p className="font-semibold text-white text-sm">
                          Contrat prêt à être signé
                        </p>
                        <p className="text-xs text-[#D9C7FF] mt-0.5">
                          Signature électronique disponible immédiatement
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 text-sm text-[#A794D4] flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-[#8A4FFF] mr-2 animate-pulse"></div>
              Simulation de rédaction automatique
            </div>
          </div>

          {/* Processus et CTA */}
          <div className="w-full lg:w-5/12 flex flex-col">
            <div className="bg-gradient-to-br from-[#1E1B2B] to-[#2D2442] p-8 rounded-2xl border border-[#3A2E5D] shadow-lg flex-1 flex flex-col">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
                <Zap className="w-6 h-6 mr-3 text-[#8A4FFF]" />
                Créez votre contrat en 3 étapes
              </h2>

              <div className="space-y-8 mb-8">
                {[
                  {
                    step: "1",
                    title: "Décrivez votre mandat",
                    desc: "Quel service, pour qui, et pour quel montant?",
                    icon: <File className="w-5 h-5 text-[#8A4FFF]" />,
                  },
                  {
                    step: "2",
                    title: "Définissez vos conditions",
                    desc: "Paiement à la signature, à la livraison ou échelonné. Pénalités après 30 jours de retard.",
                    icon: <Shield className="w-5 h-5 text-[#9D5AFF]" />,
                  },
                  {
                    step: "3",
                    title: "Envoyez et signez",
                    desc: "Votre PDF professionnel est généré instantanément, prêt pour signature électronique.",
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
