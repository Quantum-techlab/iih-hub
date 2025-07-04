
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { LocationData } from '@/types';
import { Json } from '@/integrations/supabase/types';

interface AttendanceRecord {
  id: string;
  date: string;
  sign_in_time?: string;
  sign_out_time?: string;
  sign_in_location?: LocationData;
  sign_out_location?: LocationData;
  status: 'signed_in' | 'signed_out' | 'absent';
  total_hours?: number;
}

interface PendingSignIn {
  id: string;
  sign_in_time: string;
  sign_out_time?: string;
  sign_in_location: LocationData;
  sign_out_location?: LocationData;
  status: 'pending' | 'approved' | 'rejected';
}

// Helper function to convert Json to LocationData
const jsonToLocationData = (json: Json | null): LocationData | undefined => {
  if (!json || typeof json !== 'object') return undefined;
  return json as unknown as LocationData;
};

// Helper function to convert LocationData to Json
const locationDataToJson = (location: LocationData): Json => {
  return location as unknown as Json;
};

export const useAttendance = () => {
  const { user } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [pendingSignIns, setPendingSignIns] = useState<PendingSignIn[]>([]);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAttendanceData();
    }
  }, [user]);

  const fetchAttendanceData = async () => {
    if (!user) return;

    try {
      // Fetch attendance records
      const { data: records } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (records) {
        const mappedRecords: AttendanceRecord[] = records.map(record => ({
          id: record.id,
          date: record.date,
          sign_in_time: record.sign_in_time || undefined,
          sign_out_time: record.sign_out_time || undefined,
          sign_in_location: jsonToLocationData(record.sign_in_location),
          sign_out_location: jsonToLocationData(record.sign_out_location),
          status: record.status || 'absent',
          total_hours: record.total_hours || undefined
        }));
        setAttendanceRecords(mappedRecords);

        // Get today's record
        const today = new Date().toISOString().split('T')[0];
        const todayRecord = mappedRecords.find(r => r.date === today);
        setTodayRecord(todayRecord || null);
      }

      // Fetch pending sign-ins
      const { data: pending } = await supabase
        .from('pending_sign_ins')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (pending) {
        const mappedPending: PendingSignIn[] = pending.map(p => ({
          id: p.id,
          sign_in_time: p.sign_in_time,
          sign_out_time: p.sign_out_time || undefined,
          sign_in_location: jsonToLocationData(p.sign_in_location)!,
          sign_out_location: jsonToLocationData(p.sign_out_location),
          status: p.status || 'pending'
        }));
        setPendingSignIns(mappedPending);
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitSignIn = async (location: LocationData) => {
    if (!user) return { error: 'No user logged in' };

    try {
      const { error } = await supabase
        .from('pending_sign_ins')
        .insert({
          user_id: user.id,
          sign_in_time: new Date().toISOString(),
          sign_in_location: locationDataToJson(location),
          status: 'pending'
        });

      if (error) throw error;
      
      await fetchAttendanceData();
      return { error: null };
    } catch (error) {
      console.error('Error submitting sign-in:', error);
      return { error };
    }
  };

  const submitSignOut = async (location: LocationData) => {
    if (!user) return { error: 'No user logged in' };

    try {
      // Find today's pending sign-in or create a new one
      const today = new Date().toISOString().split('T')[0];
      const existingPending = pendingSignIns.find(p => 
        p.sign_in_time.startsWith(today) && !p.sign_out_time
      );

      if (existingPending) {
        // Update existing pending sign-in with sign-out
        const { error } = await supabase
          .from('pending_sign_ins')
          .update({
            sign_out_time: new Date().toISOString(),
            sign_out_location: locationDataToJson(location)
          })
          .eq('id', existingPending.id);

        if (error) throw error;
      } else {
        // Create new pending sign-out
        const { error } = await supabase
          .from('pending_sign_ins')
          .insert({
            user_id: user.id,
            sign_in_time: new Date().toISOString(),
            sign_out_time: new Date().toISOString(),
            sign_in_location: locationDataToJson(location),
            sign_out_location: locationDataToJson(location),
            status: 'pending'
          });

        if (error) throw error;
      }
      
      await fetchAttendanceData();
      return { error: null };
    } catch (error) {
      console.error('Error submitting sign-out:', error);
      return { error };
    }
  };

  const hasPendingSignIn = pendingSignIns.some(p => !p.sign_out_time);
  const isSignedInToday = todayRecord?.status === 'signed_in';
  const hasSignedOutToday = todayRecord?.sign_out_time !== null;

  return {
    attendanceRecords,
    pendingSignIns,
    todayRecord,
    loading,
    submitSignIn,
    submitSignOut,
    hasPendingSignIn,
    isSignedInToday,
    hasSignedOutToday,
    refetch: fetchAttendanceData
  };
};
