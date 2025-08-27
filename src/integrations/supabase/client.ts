// Supabase client configuration for Ilorin Innovation Hub
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Get environment variables with fallbacks
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://cxkzcsduxaeziwfwbcyz.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4a3pjc2R1eGFleml3ZndiY3l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTA5OTQsImV4cCI6MjA2Njg2Njk5NH0.OZ0Jcil6tgHFonCwmt-4oZcCf3gKCX37S9y8qKHvz-Q";

// Validate configuration
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase configuration. Please check your environment variables.');
}

// Create Supabase client with optimized configuration
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'iih-hub@1.0.0'
    }
  }
});

// Export configuration for use in other parts of the app
export const supabaseConfig = {
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY
} as const;