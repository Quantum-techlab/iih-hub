
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Profile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'intern' | 'admin' | 'staff';
  intern_id?: string;
  department?: string;
  supervisor?: string;
  join_date?: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: 'No user logged in' };

    try {
      // Create a safe update object that only includes fields that exist in the database
      const safeUpdates: any = {};
      
      // Only include fields that are definitely in the database schema
      if (updates.name !== undefined) safeUpdates.name = updates.name;
      if (updates.email !== undefined) safeUpdates.email = updates.email;
      if (updates.phone !== undefined) safeUpdates.phone = updates.phone;
      if (updates.intern_id !== undefined) safeUpdates.intern_id = updates.intern_id;
      if (updates.department !== undefined) safeUpdates.department = updates.department;
      if (updates.supervisor !== undefined) safeUpdates.supervisor = updates.supervisor;
      if (updates.join_date !== undefined) safeUpdates.join_date = updates.join_date;
      
      // Handle role separately with proper type casting
      if (updates.role !== undefined) {
        safeUpdates.role = updates.role;
      }

      const { error } = await supabase
        .from('profiles')
        .update(safeUpdates)
        .eq('id', user.id);

      if (error) throw error;
      
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      return { error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { error };
    }
  };

  return {
    profile,
    loading,
    updateProfile,
    refetch: fetchProfile
  };
};
