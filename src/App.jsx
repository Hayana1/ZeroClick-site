import React from "react";
import { useState } from "react";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import LandingPage from "./pages/LandingPage";
import ContactForm from "./pages/Form";
import DemoZeroClick from "./pages/Demo";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* Tu peux rajouter login/signup ici plus tard */}
        <Route path="/Form" element={<ContactForm />} />
        <Route path="/Demo" element={<DemoZeroClick />} />
      </Routes>
    </Router>
  );
}
