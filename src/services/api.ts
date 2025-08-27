// API service for Ilorin Innovation Hub
// This service handles all communication with the backend API

import { supabase } from '@/integrations/supabase/client';
import ErrorHandler from '@/utils/errorHandler';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    status: number;
    details?: any;
  };
  message?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'intern' | 'admin' | 'staff';
  phone?: string;
  department?: string;
  supervisor?: string;
  join_date?: string;
}

export interface AttendanceRecord {
  id: string;
  user_id: string;
  date: string;
  sign_in_time?: string;
  sign_out_time?: string;
  sign_in_location?: LocationData;
  sign_out_location?: LocationData;
  status: 'signed_in' | 'signed_out' | 'absent';
  total_hours?: number;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  distanceToHub: number;
  timestamp: string;
  hubCoordinates: {
    lat: number;
    lng: number;
  };
}

class ApiService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    this.apiKey = import.meta.env.VITE_API_KEY || 'iih-hub-dev-key';
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const { data: { session } } = await supabase.auth.getSession();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-API-Key': this.apiKey
    };

    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const data = await response.json();

    if (!response.ok) {
      const error = await ErrorHandler.handleSupabaseError(
        { message: data.error?.message || 'Request failed', code: response.status },
        'API Request'
      );
      return { success: false, error };
    }

    return data;
  }

  // Authentication methods
  async register(userData: {
    email: string;
    password: string;
    name: string;
    role?: 'intern' | 'admin' | 'staff';
    phone?: string;
    department?: string;
    supervisor?: string;
    adminCode?: string;
  }): Promise<ApiResponse<{ user: User }>> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseUrl}/auth/register`, {
        method: 'POST',
        headers,
        body: JSON.stringify(userData)
      });

      return this.handleResponse(response);
    } catch (error) {
      const appError = await ErrorHandler.handleSupabaseError(error, 'User registration');
      return { success: false, error: appError };
    }
  }

  async login(email: string, password: string): Promise<ApiResponse<{ user: any; session: any; profile: User }>> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email, password })
      });

      return this.handleResponse(response);
    } catch (error) {
      const appError = await ErrorHandler.handleSupabaseError(error, 'User login');
      return { success: false, error: appError };
    }
  }

  async logout(): Promise<ApiResponse> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseUrl}/auth/logout`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ access_token: session?.access_token })
      });

      return this.handleResponse(response);
    } catch (error) {
      const appError = await ErrorHandler.handleSupabaseError(error, 'User logout');
      return { success: false, error: appError };
    }
  }

  async getCurrentUser(): Promise<ApiResponse<{ user: any; profile: User }>> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseUrl}/auth/me`, {
        method: 'GET',
        headers
      });

      return this.handleResponse(response);
    } catch (error) {
      const appError = await ErrorHandler.handleSupabaseError(error, 'Get current user');
      return { success: false, error: appError };
    }
  }

  // Attendance methods
  async submitAttendance(location: LocationData, action: 'sign_in' | 'sign_out'): Promise<ApiResponse<{ attendance: AttendanceRecord }>> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseUrl}/attendance/submit`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ location, action })
      });

      return this.handleResponse(response);
    } catch (error) {
      const appError = await ErrorHandler.handleSupabaseError(error, 'Submit attendance');
      return { success: false, error: appError };
    }
  }

  async getAttendanceHistory(params?: {
    start_date?: string;
    end_date?: string;
    limit?: number;
  }): Promise<ApiResponse<{ attendance: AttendanceRecord[] }>> {
    try {
      const headers = await this.getAuthHeaders();
      const queryParams = new URLSearchParams();
      
      if (params?.start_date) queryParams.append('start_date', params.start_date);
      if (params?.end_date) queryParams.append('end_date', params.end_date);
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const url = `${this.baseUrl}/attendance/history${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      return this.handleResponse(response);
    } catch (error) {
      const appError = await ErrorHandler.handleSupabaseError(error, 'Get attendance history');
      return { success: false, error: appError };
    }
  }

  async getTodayAttendance(): Promise<ApiResponse<{ attendance: AttendanceRecord | null; status: string }>> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseUrl}/attendance/today`, {
        method: 'GET',
        headers
      });

      return this.handleResponse(response);
    } catch (error) {
      const appError = await ErrorHandler.handleSupabaseError(error, 'Get today attendance');
      return { success: false, error: appError };
    }
  }

  // Direct Supabase methods (fallback)
  async getProfile(): Promise<{ data: User | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: { message: 'No user logged in' } };
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        await ErrorHandler.handleSupabaseError(error, 'Get profile');
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      const appError = await ErrorHandler.handleSupabaseError(error, 'Get profile');
      return { data: null, error: appError };
    }
  }

  async updateProfile(updates: Partial<User>): Promise<{ error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { error: { message: 'No user logged in' } };
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        await ErrorHandler.handleSupabaseError(error, 'Update profile');
        return { error };
      }

      return { error: null };
    } catch (error) {
      const appError = await ErrorHandler.handleSupabaseError(error, 'Update profile');
      return { error: appError };
    }
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();
export default apiService;
