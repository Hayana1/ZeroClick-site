import React from "react";
import { motion } from "framer-motion";
import Hero from "./Hero";

import Footer from "./Footer";
//import Temoignage from "./Temoignage";
import Navbar from "./Navbar";
import Features from "./Features";
import Benefits from "./Benefits";
import ReadyToTry from "./Cta";
import Contrat from "./Contract";

export default function LandingPage() {
  return (
    <div className="bg-[rgb(33,33,33)] text-white min-h-screen font-sans">
      <Navbar />
      <Hero />
      <Contrat />
      <Features />
      <Benefits />
      <ReadyToTry />
      <Footer />
    </div>
  );
}
