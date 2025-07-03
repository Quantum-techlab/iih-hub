import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, LogOut, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AttendanceCard from "./AttendanceCard";
import AttendanceHistory from "./AttendanceHistory";
import AdminDashboard from "./AdminDashboard";
import UserProfile from "./UserProfile";
import AttendanceCalendar from "./AttendanceCalendar";
import DashboardNavigation from "./DashboardNavigation";
import LogoutConfirmation from "./LogoutConfirmation";

const Dashboard = ({ user, onLogout }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState(user.role === "admin" ? "admin" : "overview");
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Africa/Lagos'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Africa/Lagos'
    });
  };

  const isWeekday = () => {
    const day = currentTime.getDay();
    return day >= 1 && day <= 5; // Monday to Friday
  };

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutDialog(false);
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out.",
    });
    onLogout();
  };

  const handleSignIn = (data) => {
    if (!isWeekday()) {
      toast({
        title: "Weekend Detected",
        description: "Attendance tracking is only available Monday to Friday",
        variant: "destructive",
      });
      return;
    }

    if (user.signedInToday) {
      toast({
        title: "Already Signed In",
        description: "You have already signed in today",
        variant: "destructive",
      });
      return;
    }

    // Store pending sign-in with geolocation
    user.pendingSignIn = {
      timestamp: data.timestamp.toISOString(),
      location: data.location,
      status: 'pending'
    };
    
    toast({
      title: "Sign-in Submitted!",
      description: `Pending admin approval at ${formatTime(data.timestamp)} WAT`,
    });
  };

  const handleSignOut = (data) => {
    if (!user.pendingSignIn && !user.signedInToday) {
      toast({
        title: "Not Signed In",
        description: "You must sign in before you can sign out",
        variant: "destructive",
      });
      return;
    }

    if (user.lastSignOut && new Date(user.lastSignOut).toDateString() === currentTime.toDateString()) {
      toast({
        title: "Already Signed Out",
        description: "You have already signed out today",
        variant: "destructive",
      });
      return;
    }

    // Update pending sign-in with sign-out data
    if (user.pendingSignIn) {
      user.pendingSignIn.signOutTimestamp = data.timestamp.toISOString();
      user.pendingSignIn.signOutLocation = data.location;
    }
    
    toast({
      title: "Sign-out Submitted!",
      description: `Pending admin approval at ${formatTime(data.timestamp)} WAT`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900">IIH Attendance</h1>
                <p className="text-xs text-gray-500">{formatTime(currentTime)} WAT</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="font-medium text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500">
                  {user.role === "admin" ? "Administrator" : `Intern ID: ${user.internId}`}
                </p>
              </div>
              <Button
                variant="ghost"
                onClick={() => setActiveTab("profile")}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                onClick={handleLogoutClick}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name}!
          </h2>
          <p className="text-lg text-gray-600">
            {formatDate(currentTime)}
          </p>
        </div>

        {/* Navigation Tabs */}
        <DashboardNavigation user={user} activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Content */}
        {activeTab === "overview" && user.role !== "admin" && (
          <div className="space-y-6">
            {/* Status Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AttendanceCard
                user={user}
                currentTime={currentTime}
                isWeekday={isWeekday()}
                onSignIn={handleSignIn}
                onSignOut={handleSignOut}
              />
              
              <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-green-600" />
                    <span>This Week</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 mb-1">4/5</div>
                  <p className="text-sm text-gray-600">Days attended</p>
                  <div className="mt-3 flex space-x-1">
                    {[1, 2, 3, 4, 5].map((day) => (
                      <div
                        key={day}
                        className={`w-8 h-2 rounded-full ${
                          day <= 4 ? "bg-green-500" : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-orange-500" />
                    <span>Missed Days</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {user.missedDays?.length || 0}
                  </div>
                  <p className="text-sm text-gray-600">This month</p>
                  {user.missedDays?.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-orange-600">
                        Last missed: {user.missedDays[user.missedDays.length - 1]}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Attendance Calendar & Geolocation */}
            <AttendanceCalendar attendance={user.attendance || {}} />

            {/* Quick Stats */}
            <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">95%</div>
                    <p className="text-sm text-gray-600">Attendance Rate</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">8:30 AM</div>
                    <p className="text-sm text-gray-600">Avg. Sign-in</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">5:15 PM</div>
                    <p className="text-sm text-gray-600">Avg. Sign-out</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">23</div>
                    <p className="text-sm text-gray-600">Days Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "history" && user.role !== "admin" && (
          <AttendanceHistory user={user} />
        )}

        {activeTab === "admin" && user.role === "admin" && (
          <AdminDashboard user={user} onLogout={handleLogoutConfirm} />
        )}

        {activeTab === "profile" && (
          <UserProfile user={user} onLogout={handleLogoutConfirm} />
        )}
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

export default Dashboard;