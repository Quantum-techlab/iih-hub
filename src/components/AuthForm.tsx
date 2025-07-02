
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ADMIN_CODE = "IIH-ADMIN-2025";

const AuthForm = ({ mode, onSuccess, onSwitchMode }) => {
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

  if (showConfirmation) {
    return (
      <div className="py-8 text-center">
        <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-green-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707a1 1 0 00-1.414-1.414L9 11.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Check your email</h3>
        <p className="text-gray-600 text-sm">Confirmation sent! Redirecting to sign in...</p>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
        {mode === "register" && (
          <>
            {/* Role Selector */}
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium">Registering as</Label>
              <select
                id="role"
                name="role"
                value={role}
                onChange={handleRoleChange}
                className="h-12 w-full border border-gray-300 rounded-lg px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
              >
                <option value="intern">Intern</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="h-12 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="e.g., +234 806 123 4567"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="h-12 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Conditional fields based on role */}
            {role === "intern" && (
              <div className="space-y-2">
                <Label htmlFor="internId" className="text-sm font-medium">Intern ID (optional)</Label>
                <Input
                  id="internId"
                  name="internId"
                  type="text"
                  placeholder="Your unique intern ID"
                  value={formData.internId}
                  onChange={handleInputChange}
                  className="h-12 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            {role === "admin" && (
              <div className="space-y-2">
                <Label htmlFor="adminCode" className="text-sm font-medium">Admin Access Code</Label>
                <Input
                  id="adminCode"
                  name="adminCode"
                  type="text"
                  placeholder="Enter admin code"
                  value={formData.adminCode}
                  onChange={handleInputChange}
                  required
                  className="h-12 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
          </>
        )}

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="h-12 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="h-12 pr-10 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
            </Button>
          </div>
        </div>

        {/* Confirm Password */}
        {mode === "register" && (
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              className="h-12 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl mt-6"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>{mode === "login" ? "Signing In..." : "Creating Account..."}</span>
            </div>
          ) : (
            mode === "login" ? "Sign In" : "Create Account"
          )}
        </Button>
      </form>

      {/* Demo Accounts - This will be removed when Supabase is connected */}
      {mode === "login" && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700">
            <strong>Demo Accounts (Remove when Supabase connected):</strong><br />
            Admin: admin@iih.ng / password<br />
            Intern: intern@iih.ng / password
          </p>
        </div>
      )}
    </>
  );
};

export default AuthForm;
