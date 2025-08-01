import React, { useState, useEffect } from "react";
import styled, { keyframes, css } from "styled-components";

// Animations avec css`` pour éviter l'erreur
const fadeIn = css`
  ${keyframes`
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  `}
`;

const BackButton = styled.button`
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: none;
  border: none;
  color: #ffffff;
  font-weight: 600;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0.5rem;
  z-index: 10;

  svg {
    margin-right: 0.5rem;
  }

  &:hover {
    text-decoration: underline;
  }
`;

const shake = css`
  ${keyframes`
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  `}
`;

const FadeInDiv = styled.div`
  animation: ${fadeIn} 0.5s ease-out;
`;
// Composants stylisés
const Container = styled.div`
  font-family: "Segoe UI", sans-serif;
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  animation: ${fadeIn} 0.5s ease-out;
`;

const Header = styled.h2`
  color: #6e3af2;
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 2rem;
  &::after {
    content: "";
    display: block;
    width: 60px;
    height: 4px;
    background: linear-gradient(90deg, #6e3af2, #a78bfa);
    margin: 0.5rem auto 0;
    border-radius: 2px;
  }
`;

const StepContainer = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  animation: ${fadeIn} 0.3s ease-out;
`;

const StepHeader = styled.h3`
  color: #4a5568;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  span {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background-color: #6e3af2;
    color: white;
    border-radius: 50%;
    margin-right: 0.75rem;
    font-size: 0.9rem;
  }
`;

const Button = styled.button`
  background: linear-gradient(90deg, #6e3af2, #8b5cf6);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: inline-flex;
  align-items: center;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  svg {
    margin-left: 0.5rem;
  }
`;

const Alert = styled.div`
  background: ${({ type }) => (type === "danger" ? "#fff5f5" : "#f0fdf4")};
  color: ${({ type }) => (type === "danger" ? "#dc2626" : "#16a34a")};
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  display: flex;
  align-items: flex-start;
  animation: ${fadeIn} 0.3s ease-out;
  border-left: 4px solid
    ${({ type }) => (type === "danger" ? "#dc2626" : "#16a34a")};
`;

const ProgressBar = styled.div`
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  margin-top: 1rem;
  overflow: hidden;
  div {
    height: 100%;
    background: linear-gradient(90deg, #6e3af2, #8b5cf6);
    border-radius: 4px;
    transition: width 0.3s ease;
  }
`;

const ActivityItem = styled.li`
  padding: 0.75rem 0;
  border-bottom: 1px solid #edf2f7;
  display: flex;
  align-items: center;
  &:last-child {
    border-bottom: none;
  }
`;

const Navigation = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;
`;
const Badge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 0.5rem;
  background: ${({ type }) => (type === "danger" ? "#fee2e2" : "#dcfce7")};
  color: ${({ type }) => (type === "danger" ? "#b91c1c" : "#166534")};
`;

const EmailPreview = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1rem;
`;
const EmailHeader = styled.div`
  background: #f7fafc;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
`;
const EmailBody = styled.div`
  padding: 1rem;
`;

// Icônes SVG
const icons = {
  warning: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0378 2.66667 10.268 4L3.33978 16C2.56998 17.3333 3.53223 19 5.07183 19Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  check: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18457 2.99721 7.13633 4.39828 5.49707C5.79935 3.85782 7.69279 2.71538 9.79619 2.24015C11.8996 1.76491 14.1003 1.98234 16.07 2.86"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 4L12 14.01L9 11.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  arrowRight: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 12H19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 5L19 12L12 19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  arrowLeft: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M19 12H5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 19L5 12L12 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  file: (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C20.7893 21.0391 20 20.5304 20 20V8L14 2Z"
        stroke="#4a5568"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 2V8H20"
        stroke="#4a5568"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 13H8"
        stroke="#4a5568"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 17H8"
        stroke="#4a5568"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 9H9H8"
        stroke="#4a5568"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

export default function DemoZeroClick() {
  const [demoStep, setDemoStep] = useState(1);
  const [showAlert, setShowAlert] = useState(false);
  const [fileStatus, setFileStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [dashboardStats, setDashboardStats] = useState({
    blockedEmails: 1,
    safeLinks: 12,
    scannedFiles: 3,
    suspiciousFiles: 1,
  });

  const simulateFileAnalysis = () => {
    setFileStatus("");
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) =>
        prev >= 100 ? (clearInterval(interval), 100) : prev + 10
      );
    }, 200);

    setTimeout(() => {
      setFileStatus("⚠️ Fichier suspect détecté");
      clearInterval(interval);
    }, 2200);
  };

  useEffect(() => {
    setProgress(0);
    setFileStatus("");
  }, [demoStep]);

  return (
    <Container>
      <BackButton onClick={() => (window.location.href = "/")}>
        {icons.arrowLeft} Retour
      </BackButton>

      <Header>Protection ZeroClick</Header>

      {demoStep === 1 && (
        <StepContainer>
          <StepHeader>
            <span>1</span>Protection Email
          </StepHeader>
          <EmailPreview>
            <EmailHeader>
              <div>
                <strong>De :</strong> facturation@hydroquebec-paiement.com
                <Badge type="danger">Nouveau domaine</Badge>
              </div>
              <div style={{ color: "#6e3af2", fontWeight: 600 }}>10:24 AM</div>
            </EmailHeader>
            <EmailBody>
              <p style={{ marginBottom: "0.5rem" }}>
                <strong>Sujet :</strong> Votre facture impayée - Action requise
              </p>
              <p style={{ color: "#4a5568", marginBottom: "1rem" }}>
                Cher client, votre facture de 245,67$ est en retard. Veuillez
                payer immédiatement.
              </p>
              <Button
                onClick={() => setShowAlert(true)}
                style={{ width: "100%", justifyContent: "center" }}
              >
                Analyser cet email
              </Button>
            </EmailBody>
          </EmailPreview>

          {showAlert && (
            <Alert type="danger">
              <span>🔴</span>
              <div>
                <strong>Email frauduleux détecté !</strong>
                <p style={{ marginTop: "0.25rem", marginBottom: 0 }}>
                  Ce domaine imite Hydro-Québec mais a été créé il y a 3 jours.
                </p>
              </div>
            </Alert>
          )}

          <div
            style={{
              marginTop: "1rem",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button onClick={() => setDemoStep(2)}>
              Suivant {icons.arrowRight}
            </Button>
          </div>
        </StepContainer>
      )}

      {demoStep === 2 && (
        <StepContainer>
          <StepHeader>
            <span>2</span>Analyse de Fichiers
          </StepHeader>

          <div
            style={{
              border: "2px dashed #cbd5e0",
              padding: "2rem",
              textAlign: "center",
              borderRadius: "8px",
              marginBottom: "1.5rem",
              backgroundColor: "white",
            }}
          >
            {fileStatus ? (
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "0.5rem",
                  }}
                >
                  {icons.file}
                  <strong>facture_hydro.pdf</strong>
                </div>

                {progress < 100 ? (
                  <div>
                    <p>Analyse en cours...</p>
                    <ProgressBar>
                      <div style={{ width: `${progress}%` }} />
                    </ProgressBar>
                  </div>
                ) : (
                  <FadeInDiv>
                    <p
                      style={{
                        fontWeight: "600",
                        color: fileStatus.includes("⚠️")
                          ? "#dc2626"
                          : "#16a34a",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {fileStatus.includes("⚠️") ? icons.warning : icons.check}
                      {fileStatus}
                    </p>
                  </FadeInDiv>
                )}
              </div>
            ) : (
              <>
                <p style={{ fontWeight: "600", marginBottom: "1rem" }}>
                  Analyse de fichier PDF simulée
                </p>
                <Button onClick={simulateFileAnalysis}>
                  Simuler l'analyse d'un fichier
                </Button>
              </>
            )}
          </div>

          <Navigation>
            <Button onClick={() => setDemoStep(1)}>
              {icons.arrowLeft} Précédent
            </Button>
            <Button onClick={() => setDemoStep(3)} disabled={!fileStatus}>
              Suivant {icons.arrowRight}
            </Button>
          </Navigation>
        </StepContainer>
      )}

      {demoStep === 3 && (
        <StepContainer>
          <StepHeader>
            <span>3</span>Tableau de Bord
          </StepHeader>
          <div style={{ marginBottom: "1.5rem" }}>
            <h4 style={{ color: "#4a5568", marginBottom: "1rem" }}>
              Résumé de sécurité
            </h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <div
                style={{
                  backgroundColor: "#f0fdf4",
                  padding: "1rem",
                  borderRadius: "8px",
                }}
              >
                <strong style={{ color: "#166534" }}>Protection active</strong>
                <p style={{ fontSize: "0.9rem", color: "#4a5568", margin: 0 }}>
                  ZeroClick protège vos appareils
                </p>
              </div>
              <div
                style={{
                  backgroundColor: "#fff5f5",
                  padding: "1rem",
                  borderRadius: "8px",
                }}
              >
                <strong style={{ color: "#b91c1c" }}>
                  {dashboardStats.blockedEmails} menace(s)
                </strong>
                <p style={{ fontSize: "0.9rem", color: "#4a5568", margin: 0 }}>
                  bloquées aujourd'hui
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 style={{ color: "#4a5568", marginBottom: "1rem" }}>
              Activité récente
            </h4>
            <ul
              style={{ listStyle: "none", padding: 0, marginBottom: "1.5rem" }}
            >
              <ActivityItem>
                <span>🔴</span>
                <div style={{ flex: 1 }}>
                  Email frauduleux bloqué
                  <div style={{ fontSize: "0.8rem", color: "#718096" }}>
                    facturation@hydroquebec-paiement.com
                  </div>
                </div>
                <span style={{ fontSize: "0.8rem", color: "#718096" }}>
                  10:24 AM
                </span>
              </ActivityItem>
              <ActivityItem>
                <span>🟢</span>
                <div style={{ flex: 1 }}>
                  {dashboardStats.safeLinks} liens sécurisés analysés
                </div>
              </ActivityItem>
              <ActivityItem>
                <span>⚠️</span>
                <div style={{ flex: 1 }}>
                  {dashboardStats.scannedFiles} fichiers analysés
                </div>
              </ActivityItem>
            </ul>
          </div>

          <Navigation>
            <Button onClick={() => setDemoStep(2)}>
              {icons.arrowLeft} Précédent
            </Button>
            <Button
              onClick={() => {
                setDemoStep(1);
                setShowAlert(false);
                setDashboardStats({
                  ...dashboardStats,
                  blockedEmails: dashboardStats.blockedEmails + 1,
                  safeLinks: dashboardStats.safeLinks + 3,
                  scannedFiles: dashboardStats.scannedFiles + 1,
                });
              }}
            >
              Nouvelle démo
            </Button>
          </Navigation>
        </StepContainer>
      )}
    </Container>
  );
}
