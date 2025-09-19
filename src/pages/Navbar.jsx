import React from "react";
import { useTranslation } from "react-i18next";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";

// Animation pour le hover des boutons
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Composants stylisés
const NavButton = styled.button`
  background: linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%);
  color: #ffffff;
  border: none;
  padding: 0.5rem 1.25rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 22px rgba(91, 33, 182, 0.18);
  position: relative;
  overflow: hidden;

  &:hover {
    background: linear-gradient(135deg, #6d28d9 0%, #8b5cf6 100%);
    box-shadow: 0 14px 28px rgba(91, 33, 182, 0.25);
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
  background: rgba(255, 255, 255, 0.92);
  position: absolute;
  top: 0;
  left: 0;
  z-index: 50;
  backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
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
  width: 7.5rem;
  height: 7.5rem;
  margin-top: 8px;
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
          <LogoContainer className="flex items-center space-x-2">
            {/* Icône ou logo SVG */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 text-violet-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>

            {/* Texte ZeroClick en gras */}
            <p className="text-1xl font-extrabold text-slate-900">ZeroClick</p>
          </LogoContainer>

          {/* Navigation */}
          <NavLinks>
            <NavButton onClick={() => navigate("/Form")}>
              Request a demo
            </NavButton>
          </NavLinks>
        </NavContent>
      </NavContainer>
    </NavHeader>
  );
}
