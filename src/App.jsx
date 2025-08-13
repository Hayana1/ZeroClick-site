import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import LandingPage from "./pages/LandingPage";
import ContactForm from "./pages/Form";
import Demo from "./pages/DemoLanding";
import ZeroClickShockToCalm from "./pages/Demo";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/form" element={<ContactForm />} />
        <Route path="/demo" element={<Demo />} />
        <Route path="/demo-page" element={<ZeroClickShockToCalm />} />{" "}
        {/* page tampon */}
      </Routes>
    </Router>
  );
}
