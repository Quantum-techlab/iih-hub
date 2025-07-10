
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface AuthFormProps {
  mode: "login" | "register";
  onSuccess: () => void;
  onSwitchMode: (mode: "login" | "register") => void;
}

const AuthForm = ({ mode, onSuccess, onSwitchMode }: AuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<'intern' | 'admin' | 'staff'>('intern');
  const [adminCode, setAdminCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

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
        // Validate admin code if admin role is selected
        if (role === 'admin') {
          if (adminCode !== "IIH-ADMIN-2025") {
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
          let roleDescription = '';
          switch (role) {
            case 'admin':
              roleDescription = 'admin';
              break;
            case 'staff':
              roleDescription = 'staff';
              break;
            default:
              roleDescription = 'intern';
          }
          
          toast({
            title: "Account Created Successfully", 
            description: `Your ${roleDescription} account has been created! Please check your email to verify your account.`,
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
            onChange={(e) => setName(e.target.value)}
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
          onChange={(e) => setEmail(e.target.value)}
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
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full"
          placeholder="Enter your password"
          minLength={6}
        />
      </div>

      {mode === "register" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(value: 'intern' | 'admin' | 'staff') => setRole(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="intern">Intern</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {role === 'admin' && (
            <div className="space-y-2">
              <Label htmlFor="adminCode">Admin Access Code</Label>
              <Input
                id="adminCode"
                type="text"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                required
                className="w-full"
                placeholder="Enter admin access code"
              />
              <p className="text-sm text-gray-600">
                Admin access code is required to create an admin account.
              </p>
            </div>
          )}

          {role !== 'admin' && (
            <div className="p-3 bg-blue-50 rounded border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Creating {role} account</strong> - You will have access to the {role} dashboard after verification.
              </p>
            </div>
          )}
        </>
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
