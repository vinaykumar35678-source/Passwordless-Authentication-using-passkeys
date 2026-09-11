import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DemoPage from './pages/DemoPage';
import SecurityPage from './pages/SecurityPage';
import CryptographyPage from './pages/CryptographyPage';
import ArchitecturePage from './pages/ArchitecturePage';
import ThreatModelPage from './pages/ThreatModelPage';
import SeminarPage from './pages/SeminarPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-layout">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/demo" element={<DemoPage />} />
              <Route path="/security" element={<SecurityPage />} />
              <Route path="/cryptography" element={<CryptographyPage />} />
              <Route path="/architecture" element={<ArchitecturePage />} />
              <Route path="/threat-model" element={<ThreatModelPage />} />
              <Route path="/seminar" element={<SeminarPage />} />
              {/* Fallback to home */}
              <Route path="*" element={<LandingPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
