import React from "react";
import { motion } from "framer-motion";
import Hero from "./Hero";

import Footer from "./Footer";
//import Temoignage from "./Temoignage";
import Navbar from "./Navbar";
import Features from "./Features";

import ReadyToTry from "./Cta";
import Contrat from "./Contract";
import RealTimeAnalyzer from "./RealtimeAnalyzer";

export default function LandingPage() {
  return (
    <div className="bg-gradient-to-b from-[#F8F2FF] via-white to-[#F4ECFF] text-[#1F1235] min-h-screen font-Anton">
      <Navbar />
      <Hero />
      <Contrat />
      <Features />
      <RealTimeAnalyzer />

      <ReadyToTry />
      <Footer />
    </div>
  );
}
