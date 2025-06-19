
import { useState } from "react";
import LandingPage from "@/components/LandingPage";
import AuthModal from "@/components/AuthModal";
import Dashboard from "@/components/Dashboard";

const Index = () => {
  const [currentView, setCurrentView] = useState("landing"); // landing, auth, dashboard
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login"); // login, register

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setCurrentView("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView("landing");
  };

  const openAuth = (mode = "login") => {
    setAuthMode(mode);
    setCurrentView("auth");
  };

  if (currentView === "dashboard" && user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  if (currentView === "auth") {
    return (
      <AuthModal
        mode={authMode}
        onSuccess={handleAuthSuccess}
        onClose={() => setCurrentView("landing")}
        onSwitchMode={(mode) => setAuthMode(mode)}
      />
    );
  }

  return <LandingPage onOpenAuth={openAuth} />;
};

export default Index;
