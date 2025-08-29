import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import LandingPage from "./pages/LandingPage";
import ContactForm from "./pages/Form";

import DemoZeroClick from "./pages/Oups";

import AppRouter from "./ZeroClickApp/AppRouter";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/form" element={<ContactForm />} />
        <Route path="/Oups" element={<DemoZeroClick />} /> {/* page tampon */}
        <Route path="/ZeroApp/*" element={<AppRouter />} />
      </Routes>
    </Router>
  );
}
