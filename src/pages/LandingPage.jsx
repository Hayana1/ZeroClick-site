import React from "react";

import Hero from "./Hero";
import How from "./How";

import Footer from "./Footer";
//import Temoignage from "./Temoignage";
import Navbar from "./Navbar";
import Features from "./Features";
import Benefits from "./Benefits";
import ReadyToTry from "./Cta";

export default function LandingPage() {
  return (
    <div className="bg-[rgb(33,33,33)] text-white min-h-screen font-sans">
      <Navbar />
      <Hero />
      <Features />
      <Benefits />
      <ReadyToTry />
      <Footer />
    </div>
  );
}
