
export interface User {
  id?: string;
  name: string;
  email: string;
  role: 'intern' | 'admin' | 'staff';
  internId?: string;
  phone?: string;
  signedInToday?: boolean;
  lastSignIn?: Date | string;
  lastSignOut?: Date | string;
  pendingSignIn?: {
    timestamp: Date | string;
    location?: LocationData;
  };
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

export interface AttendanceRecord {
  timestamp: Date | string;
  location: LocationData;
}

export interface Intern {
  id: number;
  name: string;
  internId: string;
  email: string;
  phone: string;
  attendanceRate: number;
  missedDays: number;
  lastSignIn: Date;
  status: 'signed_in' | 'signed_out' | 'absent';
  joinDate: string;
  department: string;
  supervisor: string;
  monthlyData: {
    [key: string]: {
      totalDays: number;
      presentDays: number;
      absentDays: number;
      rate: number;
    };
  };
  missedDaysDetails: Array<{
    date: string;
    reason: string;
    type: 'excused' | 'unexcused';
  }>;
  timeAnalytics: {
    avgSignIn: string;
    avgSignOut: string;
    totalHours: number;
    punctualityRate: number;
  };
}

export interface PendingSignIn {
  id: number;
  name: string;
  internId: string;
  email: string;
  signInTime: string;
  signOutTime?: string | null;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
    distanceToHub: number;
    timestamp: string;
  };
  signOutLocation?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    distanceToHub: number;
    timestamp: string;
  };
  status: 'pending';
}

// Auth form interfaces
export interface AuthFormProps {
  mode: "login" | "register";
  onSuccess: () => void;
  onSwitchMode: (mode: "login" | "register") => void;
}

// Landing page interfaces
export interface LandingPageProps {
  onOpenAuth: (mode: "login" | "register") => void;
}

// Dashboard interfaces
export interface DashboardProps {
  user: User;
  onLogout: () => void;
}

// Attendance calendar interfaces
export interface AttendanceCalendarProps {
  attendance?: Record<string, "present" | "absent">;
}
