import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styled, { keyframes, css } from "styled-components";
import { useNavigate } from "react-router-dom";

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
`;

const NavHeader = styled.header`
  width: 100%;
  background: transparent;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 50;
  backdrop-filter: blur(5px);
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
`;

export default function Navbar() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
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
            <NavButton onClick={() => navigate("/Form")}>Sign Up</NavButton>
          </NavLinks>
        </NavContent>
      </NavContainer>
    </NavHeader>
  );
}
