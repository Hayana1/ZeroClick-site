import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import LandingPage from "./pages/LandingPage";
import ContactForm from "./pages/Form";
import Demo from "./pages/DemoLanding";
import ZeroClickShockToCalm from "./pages/Demo";
import PhishingPage from "./pages/Oups";
import BatchManagementPage from "./pages/Management";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/form" element={<ContactForm />} />
        <Route path="/demo" element={<Demo />} />
        <Route path="/demo-page" element={<ZeroClickShockToCalm />} />{" "}
        <Route path="/Oups" element={<PhishingPage />} /> {/* page tampon */}
        <Route path="/Manage" element={<BatchManagementPage />} />
      </Routes>
    </Router>
  );
}
