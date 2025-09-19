import React from "react";
import Hero from "./Hero";

import Footer from "./Footer";
//import Temoignage from "./Temoignage";
import Navbar from "./Navbar";
import Features from "./Features";
import ReadyToTry from "./Cta";
import Contrat from "./Contract";

export default function LandingPage() {
  return (
    <div className="bg-[#F7F9FC] text-slate-900 min-h-screen font-Anton">
      <Navbar />
      <Hero />
      <Contrat />
      <Features />
      <ReadyToTry />
      <Footer />
    </div>
  );
}
