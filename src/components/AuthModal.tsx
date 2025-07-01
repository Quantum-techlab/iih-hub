import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Eye, EyeOff, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ADMIN_CODE = "IIH-ADMIN-2025";

const AuthModal = ({ mode, onSuccess, onClose, onSwitchMode }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    internId: "",
    adminCode: "",
    password: "",
    confirmPassword: "",
  });
  const [role, setRole] = useState("intern");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setFormData((prev) => ({
      ...prev,
      adminCode: "",
      internId: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (mode === "register") {
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Error",
          description: "Passwords do not match",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      if (formData.password.length < 6) {
        toast({
          title: "Error",
          description: "Password must be at least 6 characters",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      if (role === "admin" && formData.adminCode !== ADMIN_CODE) {
        toast({
          title: "Error",
          description: "Invalid admin access code.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
    }

    setTimeout(() => {
      if (mode === "register") {
        setShowConfirmation(true);
        setIsLoading(false);
        setTimeout(() => {
          setShowConfirmation(false);
          onSwitchMode("login");
        }, 3500);
        return;
      }

      toast({
        title: "Success!",
        description: "Welcome back!",
      });
      onSuccess && onSuccess({
        email: formData.email,
        name: formData.name,
        role: mode === "login" ? (formData.email.includes("admin") ? "admin" : "intern") : role,
        internId: role === "intern" ? (formData.internId || `IIH${String(Date.now()).slice(-3)}`) : undefined,
        phone: formData.phone
      });
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto py-6 px-2 sm:px-4 bg-black/30">
      {/* Animated SVG Background */}
      <div className="auth-bg-animated">
        <svg className="blob1" viewBox="0 0 700 700"><defs><linearGradient id="b1" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#a5b4fc"/><stop offset="1" stopColor="#fbcfe8"/></linearGradient></defs><ellipse cx="350" cy="350" rx="340" ry="320" fill="url(#b1)" /></svg>
        <svg className="blob2" viewBox="0 0 700 700"><defs><linearGradient id="b2" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#fcd34d"/><stop offset="1" stopColor="#bae6fd"/></linearGradient></defs><ellipse cx="350" cy="350" rx="320" ry="330" fill="url(#b2)" /></svg>
        <svg className="blob3" viewBox="0 0 800 800"><defs><linearGradient id="b3" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#f0abfc"/><stop offset="1" stopColor="#bbf7d0"/></linearGradient></defs><ellipse cx="400" cy="400" rx="350" ry="280" fill="url(#b3)" /></svg>
      </div>
      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-md mx-auto bg-white/95 backdrop-blur-lg rounded-xl shadow-xl p-5 sm:p-8 overflow-hidden">
        <CardHeader className="text-center relative pb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-2 top-2 h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {mode === "login" ? "Welcome Back" : "Join IIH"}
          </CardTitle>
          <p className="text-gray-600">
            {mode === "login"
              ? "Sign in to track your attendance"
              : "Create your attendance account"}
          </p>
        </CardHeader>
        <CardContent>
          {showConfirmation ? (
            <div className="py-10 text-center">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707a1 1 0 00-1.414-1.414L9 11.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Check your email to confirm registration</h3>
              <p className="text-gray-600">You'll be redirected to sign in shortly...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto">
              {mode === "register" && (
                <>
                  {/* Role Selector */}
                  <div className="space-y-2">
                    <Label htmlFor="role">Registering as</Label>
                    <select
                      id="role"
                      name="role"
                      value={role}
                      onChange={handleRoleChange}
                      className="h-11 w-full border rounded px-2"
                    >
                      <option value="intern">Intern</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="h-11"
                    />
                  </div>
                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="e.g., +234 806 123 4567"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="h-11"
                    />
                  </div>
                  {/* Intern ID (optional) */}
                  {role === "intern" && (
                    <div className="space-y-2">
                      <Label htmlFor="internId">Intern ID (optional)</Label>
                      <Input
                        id="internId"
                        name="internId"
                        type="text"
                        placeholder="Your unique intern ID"
                        value={formData.internId}
                        onChange={handleInputChange}
                        className="h-11"
                      />
                    </div>
                  )}
                  {/* Admin Code (required) */}
                  {role === "admin" && (
                    <div className="space-y-2">
                      <Label htmlFor="adminCode">Admin Access Code</Label>
                      <Input
                        id="adminCode"
                        name="adminCode"
                        type="text"
                        placeholder="Enter admin code"
                        value={formData.adminCode}
                        onChange={handleInputChange}
                        required
                        className="h-11"
                      />
                    </div>
                  )}
                </>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="h-11"
                />
              </div>
              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="h-11 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              {/* Confirm Password */}
              {mode === "register" && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="h-11"
                  />
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{mode === "login" ? "Signing In..." : "Creating Account..."}</span>
                  </div>
                ) : (
                  mode === "login" ? "Sign In" : "Create Account"
                )}
              </Button>
            </form>
          )}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}
              <Button
                variant="link"
                className="p-0 ml-1 text-blue-600 hover:text-blue-700"
                onClick={() => onSwitchMode(mode === "login" ? "register" : "login")}
              >
                {mode === "login" ? "Sign up" : "Sign in"}
              </Button>
            </p>
          </div>
          {mode === "login" && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Demo Accounts:</strong><br />
                Admin: admin@iih.ng / password<br />
                Intern: intern@iih.ng / password
              </p>
            </div>
          )}
        </CardContent>
      </div>
    </div>
  );
};

export default AuthModal;