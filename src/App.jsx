import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import LandingPage from "./pages/LandingPage";
import ContactForm from "./pages/Form";

import AppRouter from "./ZeroClickApp/AppRouter";
import TrainingOups from "./ZeroClickApp/pages/Training/Oups";
import Login from "./pages/Login";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/form" element={<ContactForm />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Oups" element={<TrainingOups />} /> {/* page tampon */}
        <Route path="/training/:scenarioId" element={<TrainingOups />} />
        <Route path="/ZeroApp/*" element={<AppRouter />} />
      </Routes>
    </Router>
  );
}
