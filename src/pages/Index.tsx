
import { useState } from "react";
import LandingPage from "@/components/LandingPage";
import AuthModal from "@/components/AuthModal";
import Dashboard from "@/components/Dashboard";
import { User } from "@/types";

const Index = () => {
  const [currentView, setCurrentView] = useState<"landing" | "auth" | "dashboard">("landing");
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const handleAuthSuccess = (userData: User) => {
    setUser(userData);
    setCurrentView("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView("landing");
  };

  const openAuth = (mode: "login" | "register" = "login") => {
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
        onSwitchMode={(mode: "login" | "register") => setAuthMode(mode)}
      />
    );
  }

  return <LandingPage onOpenAuth={openAuth} />;
};

export default Index;
