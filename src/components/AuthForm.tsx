
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useTypingSound } from "@/hooks/useTypingSound";

interface AuthFormProps {
  mode: "login" | "register";
  onSuccess: () => void;
  onSwitchMode: (mode: "login" | "register") => void;
}

const AuthForm = ({ mode, onSuccess, onSwitchMode }: AuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const { playTypingSound } = useTypingSound();

  const handleInputChange = (setter: (value: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    playTypingSound();
    setter(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await signIn(email, password);
        if (!error) {
          onSuccess();
        }
      } else {
        // Validate admin code if provided
        let role: 'intern' | 'admin' = 'intern';
        
        if (adminCode.trim()) {
          if (adminCode === "IIH-ADMIN-2025") {
            role = 'admin';
          } else {
            toast({
              title: "Invalid Admin Access Code",
              description: "The admin access code you entered is incorrect.",
              variant: "destructive",
            });
            setLoading(false);
            return;
          }
        }

        const { error } = await signUp(email, password, name, role);
        if (!error) {
          toast({
            title: "Account Created Successfully", 
            description: role === 'admin' 
              ? "Your admin account has been created!" 
              : "Your intern account has been created!",
          });
          onSuccess();
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === "register" && (
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={handleInputChange(setName)}
            required
            className="w-full"
            placeholder="Enter your full name"
          />
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={handleInputChange(setEmail)}
          required
          className="w-full"
          placeholder="Enter your email"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={handleInputChange(setPassword)}
          required
          className="w-full"
          placeholder="Enter your password"
          minLength={6}
        />
      </div>

      {mode === "register" && (
        <div className="space-y-2">
          <Label htmlFor="adminCode">Admin Access Code (Optional)</Label>
          <Input
            id="adminCode"
            type="text"
            value={adminCode}
            onChange={handleInputChange(setAdminCode)}
            className="w-full"
            placeholder="Enter admin code to create admin account"
          />
          <p className="text-xs text-gray-500">
            Leave blank to create a regular intern account
          </p>
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {mode === "login" ? "Signing in..." : "Creating account..."}
          </>
        ) : (
          mode === "login" ? "Sign In" : "Create Account"
        )}
      </Button>
    </form>
  );
};

export default AuthForm;
