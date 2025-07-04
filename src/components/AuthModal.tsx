
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, X } from "lucide-react";
import AuthForm from "./AuthForm";

interface AuthModalProps {
  mode: "login" | "register";
  onSuccess: () => void;
  onClose: () => void;
  onSwitchMode: (mode: "login" | "register") => void;
}

const AuthModal = ({ mode, onSuccess, onClose, onSwitchMode }: AuthModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto py-4 px-4 bg-black/50 backdrop-blur-sm">
      {/* Animated backgrounds */}
      <div className="auth-bg-animated">
        <svg className="blob1" viewBox="0 0 700 700"><defs><linearGradient id="b1" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#a5b4fc"/><stop offset="1" stopColor="#fbcfe8"/></linearGradient></defs><ellipse cx="350" cy="350" rx="340" ry="320" fill="url(#b1)" /></svg>
        <svg className="blob2" viewBox="0 0 700 700"><defs><linearGradient id="b2" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#fcd34d"/><stop offset="1" stopColor="#bae6fd"/></linearGradient></defs><ellipse cx="350" cy="350" rx="320" ry="330" fill="url(#b2)" /></svg>
        <svg className="blob3" viewBox="0 0 800 800"><defs><linearGradient id="b3" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#f0abfc"/><stop offset="1" stopColor="#bbf7d0"/></linearGradient></defs><ellipse cx="400" cy="400" rx="350" ry="280" fill="url(#b3)" /></svg>
      </div>

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-md mx-auto bg-white/98 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
        {/* Header */}
        <CardHeader className="text-center relative pb-4 pt-6 px-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-3 top-3 h-9 w-9 p-0 rounded-full bg-gray-100/80 hover:bg-gray-200/80 transition-colors z-10"
          >
            <X className="w-4 h-4 text-gray-600" />
          </Button>
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
            {mode === "login" ? "Welcome Back" : "Join IIH"}
          </CardTitle>
          <p className="text-gray-600 text-sm">
            {mode === "login"
              ? "Sign in to track your attendance"
              : "Create your attendance account"}
          </p>
        </CardHeader>

        <CardContent className="px-6 pb-6">
          <AuthForm mode={mode} onSuccess={onSuccess} onSwitchMode={onSwitchMode} />

          {/* Switch Mode */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}
              <Button
                variant="link"
                className="p-0 ml-1 text-blue-600 hover:text-blue-700 text-sm"
                onClick={() => onSwitchMode(mode === "login" ? "register" : "login")}
              >
                {mode === "login" ? "Sign up" : "Sign in"}
              </Button>
            </p>
          </div>
        </CardContent>
      </div>
    </div>
  );
};

export default AuthModal;
