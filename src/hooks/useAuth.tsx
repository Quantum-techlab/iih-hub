
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ErrorHandler from '@/utils/errorHandler';
import apiService from '@/services/api';
import { APP_CONFIG } from '@/config/app';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string, name: string, role?: 'intern' | 'admin' | 'staff') => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string, role: 'intern' | 'admin' | 'staff' = 'intern') => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name,
            role
          }
        }
      });

      if (error) {
        const appError = await ErrorHandler.handleSupabaseError(error, 'User sign up');
        toast({
          title: "Sign Up Error",
          description: appError.message,
          variant: "destructive",
        });
        return { error: appError };
      }

      // If successful, show success message
      if (data.user && !data.user.email_confirmed_at) {
        toast({
          title: "Account Created Successfully",
          description: "Please check your email to verify your account before signing in.",
        });
      }

      return { error: null };
    } catch (error) {
      const appError = await ErrorHandler.handleSupabaseError(error, 'User sign up - unexpected error');
      toast({
        title: "Sign Up Error",
        description: appError.message,
        variant: "destructive",
      });
      return { error: appError };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        const appError = await ErrorHandler.handleSupabaseError(error, 'User sign in');
        toast({
          title: "Sign In Error",
          description: appError.message,
          variant: "destructive",
        });
        return { error: appError };
      }

      // Check if user email is confirmed
      if (data.user && !data.user.email_confirmed_at) {
        toast({
          title: "Email Not Verified",
          description: "Please check your email and click the verification link before signing in.",
          variant: "destructive",
        });
        return { error: { message: "Email not verified" } };
      }

      return { error: null };
    } catch (error) {
      const appError = await ErrorHandler.handleSupabaseError(error, 'User sign in - unexpected error');
      toast({
        title: "Sign In Error",
        description: appError.message,
        variant: "destructive",
      });
      return { error: appError };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        const appError = await ErrorHandler.handleSupabaseError(error, 'User sign out');
        toast({
          title: "Sign Out Error",
          description: appError.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      await ErrorHandler.handleSupabaseError(error, 'User sign out - unexpected error');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      signUp,
      signIn,
      signOut,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
