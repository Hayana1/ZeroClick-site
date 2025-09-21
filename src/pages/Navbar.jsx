import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styled, { keyframes, css } from "styled-components";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "react-feather";

// Animation pour le hover des boutons
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Composants stylisés
const NavButton = styled.button`
  background: linear-gradient(135deg, #8a2be2 0%, #a050fa 100%);
  color: white;
  border: none;
  padding: 0.5rem 1.25rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(138, 43, 226, 0.2);
  position: relative;
  overflow: hidden;

  &:hover {
    background: linear-gradient(135deg, #9a3bf2 0%, #b060ff 100%);
    box-shadow: 0 6px 12px rgba(138, 43, 226, 0.3);
    animation: ${pulse} 1s ease infinite;
  }

  &:active {
    transform: scale(0.98);
  }

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      rgba(255, 255, 255, 0.2),
      rgba(255, 255, 255, 0)
    );
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::after {
    opacity: 1;
  }

  @media (max-width: 768px) {
    width: 100%;
    text-align: center;
  }
`;

const NavHeader = styled.header`
  width: 100%;
  background: rgba(255, 255, 255, 0.82);
  position: absolute;
  top: 0;
  left: 0;
  z-index: 50;
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(138, 79, 255, 0.12);
  box-shadow: 0 12px 40px rgba(138, 79, 255, 0.08);
`;

const NavContainer = styled.div`
  max-width: 72rem;
  margin: 0 auto;
  padding: 0 1rem;

  @media (min-width: 640px) {
    padding: 0 1.5rem;
  }

  @media (min-width: 1024px) {
    padding: 0 2rem;
  }
`;

const NavContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 4rem;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Logo = styled.img`
  width: 10rem;
  height: 10rem;
  margin-top: 20px;
  object-fit: contain;
  transition: transform 0.3s ease;

  &:hover {
    transform: rotate(-5deg);
  }
`;

const NavLinks = styled.nav`
  display: flex;
  align-items: center;
  gap: 1.5rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLinkButton = styled(Link)`
  color: #4b2c83;
  font-weight: 600;
  font-size: 0.9rem;
  position: relative;
  padding-bottom: 4px;
  transition: color 0.25s ease;

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(135deg, #8a2be2 0%, #a050fa 100%);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.25s ease;
  }

  &:hover {
    color: #8a2be2;
  }

  &:hover::after {
    transform: scaleX(1);
  }

  @media (max-width: 768px) {
    width: 100%;
    display: block;
    padding: 0.35rem 0;
    font-size: 1rem;

    &::after {
      display: none;
    }
  }
`;

const MobileToggle = styled.button`
  display: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid rgba(138, 79, 255, 0.2);
  background: rgba(255, 255, 255, 0.9);
  color: #4b2c83;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 1);
    border-color: rgba(138, 79, 255, 0.4);
    box-shadow: 0 10px 25px rgba(138, 79, 255, 0.18);
  }

  @media (max-width: 768px) {
    display: inline-flex;
  }
`;

const MobileMenu = styled.nav`
  display: none;

  @media (max-width: 768px) {
    display: ${(props) => (props.$open ? "flex" : "none")};
    flex-direction: column;
    gap: 1rem;
    margin-top: 1rem;
    padding: 1.25rem;
    border-radius: 18px;
    border: 1px solid rgba(138, 79, 255, 0.18);
    background: rgba(255, 255, 255, 0.96);
    box-shadow: 0 20px 45px rgba(138, 79, 255, 0.12);
  }
`;

export default function Navbar() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const handleNavigate = (path) => {
    setMobileOpen(false);
    navigate(path);
  };

  return (
    <NavHeader>
      <NavContainer>
        <NavContent>
          {/* Logo */}
          <LogoContainer>
            <Logo src="ZeroClick.png" alt="Logo" />
          </LogoContainer>

          {/* Navigation */}
          <NavLinks>
            <NavLinkButton to="/services/phishing-simulation">
              Phishing Simulator
            </NavLinkButton>
            <NavLinkButton to="/services/real-time-analyzer">
              Real-Time Analyzer
            </NavLinkButton>
            <NavButton onClick={() => navigate("/Form")}>Sign Up</NavButton>
          </NavLinks>

          <MobileToggle
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </MobileToggle>
        </NavContent>

        <MobileMenu id="mobile-navigation" $open={mobileOpen}>
          <NavLinkButton to="/services/phishing-simulation" onClick={() => setMobileOpen(false)}>
            Phishing Simulator
          </NavLinkButton>
          <NavLinkButton to="/services/real-time-analyzer" onClick={() => setMobileOpen(false)}>
            Real-Time Analyzer
          </NavLinkButton>
          <NavButton onClick={() => handleNavigate("/Form")}>Sign Up</NavButton>
        </MobileMenu>
      </NavContainer>
    </NavHeader>
  );
}
