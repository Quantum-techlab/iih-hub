
import { useAuth } from "@/hooks/useAuth";
import LandingPage from "@/components/LandingPage";
import AuthModal from "@/components/AuthModal";
import Dashboard from "@/components/Dashboard";
import { useState } from "react";

const Index = () => {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<"landing" | "auth">("landing");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Dashboard />;
  }

  const handleAuthSuccess = () => {
    setCurrentView("landing");
  };

  const openAuth = (mode: "login" | "register" = "login") => {
    setAuthMode(mode);
    setCurrentView("auth");
  };

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
