
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, LogOut, User, BarChart3 } from "lucide-react";
import { useAttendance } from "@/hooks/useAttendance";
import AttendanceCard from "./AttendanceCard";
import AttendanceHistory from "./AttendanceHistory";
import UserProfile from "./UserProfile";
import LogoutConfirmation from "./LogoutConfirmation";

interface StaffDashboardProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'staff';
  };
  onLogout: () => Promise<void>;
}

const StaffDashboard = ({ user, onLogout }: StaffDashboardProps) => {
  const { submitSignIn, submitSignOut, hasPendingSignIn, isSignedInToday, hasSignedOutToday } = useAttendance();
  const [activeTab, setActiveTab] = useState<"attendance" | "history" | "profile">("attendance");
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const currentTime = new Date();
  const isWeekday = currentTime.getDay() >= 1 && currentTime.getDay() <= 5;

  const handleSignIn = async (attendanceData: { timestamp: Date; location: any }) => {
    await submitSignIn(attendanceData.location);
  };

  const handleSignOut = async (attendanceData: { timestamp: Date; location: any }) => {
    await submitSignOut(attendanceData.location);
  };

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutDialog(false);
    await onLogout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900">Staff Attendance</h1>
                <p className="text-xs text-gray-500">Welcome back, {user.name}!</p>
              </div>
            </div>

            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="flex space-x-1 bg-white/50 backdrop-blur-sm rounded-lg p-1 mb-6">
          <Button
            variant={activeTab === "attendance" ? "default" : "ghost"}
            onClick={() => setActiveTab("attendance")}
            className="flex-1"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Attendance
          </Button>
          <Button
            variant={activeTab === "history" ? "default" : "ghost"}
            onClick={() => setActiveTab("history")}
            className="flex-1"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            History
          </Button>
          <Button
            variant={activeTab === "profile" ? "default" : "ghost"}
            onClick={() => setActiveTab("profile")}
            className="flex-1"
          >
            <User className="w-4 h-4 mr-2" />
            Profile
          </Button>
        </div>

        {/* Content */}
        {activeTab === "attendance" && (
          <div className="space-y-6">
            <AttendanceCard
              user={{
                ...user,
                signedInToday: isSignedInToday,
                pendingSignIn: hasPendingSignIn ? { timestamp: new Date(), location: null } : undefined
              }}
              currentTime={currentTime}
              isWeekday={isWeekday}
              onSignIn={handleSignIn}
              onSignOut={handleSignOut}
            />
          </div>
        )}

        {activeTab === "history" && <AttendanceHistory />}
        {activeTab === "profile" && <UserProfile />}
      </div>

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmation
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={handleLogoutConfirm}
        userName={user.name}
      />
    </div>
  );
};

export default StaffDashboard;
