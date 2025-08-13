import React, { useState, useEffect, useRef } from "react";

const MatrixHackedPage = () => {
  // step: 0 = hacked+matrix, 1 = white msg1, 2 = white msg2
  const [step, setStep] = useState(0);
  const matrixRef = useRef(null);
  const createdColsRef = useRef([]);

  // --- Inject CSS once
  useEffect(() => {
    const style = document.createElement("style");
    style.id = "matrix-hacked-styles";
    style.textContent = `
      @keyframes fadeIn { from {opacity:0;} to {opacity:1;} }
      .matrix-char {
        position: absolute;
        color: #16a34a;            /* green-600 plus doux */
        font-size: 18px;
        opacity: 0.6;
        text-shadow: 0 0 3px rgba(22,163,74,0.6);
      }
    `;
    document.head.appendChild(style);
    return () => {
      style.remove();
    };
  }, []);

  // --- Timings
  useEffect(() => {
    const t1 = 3000; // show hacked
    const t2 = 2500; // show msg1
    const t3 = 2500; // show msg2

    const timers = [];
    timers.push(setTimeout(() => setStep(1), t1));
    timers.push(setTimeout(() => setStep(2), t1 + t2));
    timers.push(
      setTimeout(() => {
        window.location.href = "/demo";
      }, t1 + t2 + t3)
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  // --- Matrix effect (only in step 0)
  useEffect(() => {
    if (step !== 0) {
      createdColsRef.current.forEach((el) => el?.remove());
      createdColsRef.current = [];
      return;
    }
    if (!matrixRef.current) return;

    // Moins dense : colonnes plus espacées + skip aléatoire
    const fontSize = 22; // plus grand -> moins de lignes
    const spacing = fontSize * 1.6; // espace horizontal
    const columns = Math.floor(window.innerWidth / spacing);

    for (let i = 0; i < columns; i++) {
      if (Math.random() < 0.45) continue; // ~55% des colonnes seulement
      const x = i * spacing + Math.random() * 8; // léger jitter
      const yPos = Math.random() * -60;
      const col = createColumn(x, yPos);
      matrixRef.current.appendChild(col);
      createdColsRef.current.push(col);
    }

    function createColumn(x, y) {
      const col = document.createElement("div");
      col.style.position = "absolute";
      col.style.left = x + "px";
      col.style.top = y + "px";

      // Moins de caractères par colonne
      const charCount = 6 + Math.floor(Math.random() * 8); // 6–13
      const lineHeight = 24;

      for (let i = 0; i < charCount; i++) {
        const ch = document.createElement("span");
        ch.className = "matrix-char";
        ch.style.top = i * lineHeight + "px";
        ch.textContent = RANDOM_CHAR();
        ch.style.opacity = (0.3 + Math.random() * 0.4).toString();
        // Animation plus discrète : légère apparition
        ch.style.animation = `fadeIn ${
          0.8 + Math.random() * 1.2
        }s infinite alternate`;
        col.appendChild(ch);
      }
      return col;
    }

    function RANDOM_CHAR() {
      const chars =
        "アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const A = chars.split("");
      return A[Math.floor(Math.random() * A.length)];
    }

    return () => {
      createdColsRef.current.forEach((el) => el?.remove());
      createdColsRef.current = [];
    };
  }, [step]);

  return (
    <div style={styles.root}>
      {/* STEP 0: Matrix + message rouge doux */}
      {step === 0 && (
        <>
          <div ref={matrixRef} style={styles.matrixEffect} />
          <div style={styles.hackedMessage}>You Have Been Hacked</div>
        </>
      )}

      {/* STEP 1 & 2: White screen with gradient texts */}
      {step > 0 && (
        <div style={styles.whiteScreen}>
          <div style={styles.textBlock}>
            {step === 1 && (
              <p style={styles.msgPrimary}>
                Pas d’inquiétude — il s’agissait d’un{" "}
                <span style={styles.gradientText}>ZeroClick</span> test.
              </p>
            )}
            {step === 2 && (
              <>
                <p style={styles.msgPrimary}>
                  Mais demain, un hacker pourrait ne pas prévenir…
                </p>
                <p style={styles.msgSecondary}>
                  Protégez vos équipes avec{" "}
                  <span style={styles.gradientText}>ZeroClick</span> avant le
                  clic. (Redirection en cours…)
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Inline styles
const styles = {
  root: {
    position: "relative",
    height: "100vh",
    width: "100vw",
    overflow: "hidden",
    backgroundColor: "#000",
    fontFamily:
      "'Inter', system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji'",
  },
  matrixEffect: {
    position: "absolute",
    inset: 0,
    zIndex: 50,
  },
  hackedMessage: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    fontSize: "clamp(1.5rem, 6vw, 3rem)", // min 1.5rem, max 3rem, s’adapte à la largeur
    fontWeight: 800,
    color: "#dc2626", // rouge moins flashy
    textShadow: "0 0 6px rgba(220,38,38,0.6)", // glow réduit
    zIndex: 100,
    textAlign: "center",
    animation: "fadeIn 0.9s ease-out forwards",
    letterSpacing: "0.5px",
    whiteSpace: "normal", // autorise le retour à la ligne
    padding: "0 10px", // un peu d'espace sur mobile
    lineHeight: 1.2,
  },
  whiteScreen: {
    position: "absolute",
    inset: 0,
    backgroundColor: "#fff",
    color: "#111",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 120,
    animation: "fadeIn 0.35s ease-out forwards",
  },
  textBlock: {
    textAlign: "center",
    maxWidth: 900,
    padding: "0 24px",
  },
  msgPrimary: {
    fontSize: "2rem",
    fontWeight: 700,
    marginBottom: 8,
  },
  msgSecondary: {
    fontSize: "1.125rem",
    opacity: 0.75,
  },
  gradientText: {
    background: "linear-gradient(to right, #7c3aed, #4f46e5)", // violet-600 → indigo-600
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontWeight: "bold",
  },
};

export default MatrixHackedPage;
