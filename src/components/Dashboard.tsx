import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, User, LogOut, Users, BarChart3, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AttendanceCard from "./AttendanceCard";
import AttendanceHistory from "./AttendanceHistory";
import AdminDashboard from "./AdminDashboard";

// ----- Helper for geolocation and distance -----
const HUB_COORDS = { lat: 8.4967, lng: 4.5519 }; // Replace with real hub location if needed

function haversine(lat1, lon1, lat2, lon2) {
  const toRad = x => (x * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const AttendanceCalendarWithLocation = ({ attendance = {} }) => {
  const [today] = useState(new Date());
  const [distance, setDistance] = useState(null);
  const [loading, setLoading] = useState(false);

  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const getLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const { latitude, longitude } = pos.coords;
          const dist = haversine(latitude, longitude, HUB_COORDS.lat, HUB_COORDS.lng);
          setDistance(dist);
          setLoading(false);
        },
        () => {
          alert("Location permission denied or unavailable");
          setLoading(false);
        }
      );
    } else {
      alert("Geolocation not supported");
      setLoading(false);
    }
  };

  const calendarDays = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(<div key={"empty" + i}></div>);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    const dateString = date.toISOString().split("T")[0];
    let bgColor = "bg-gray-100 text-gray-400";
    if (date < today) {
      if (attendance[dateString] === "present") bgColor = "bg-green-500 text-white";
      else if (attendance[dateString] === "absent") bgColor = "bg-red-500 text-white";
      else bgColor = "bg-gray-300 text-gray-500";
    } else if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      if (attendance[dateString] === "present") bgColor = "bg-green-600 text-white ring-2 ring-green-800";
      else if (attendance[dateString] === "absent") bgColor = "bg-red-600 text-white ring-2 ring-red-800";
      else bgColor = "bg-blue-200 text-blue-800 ring-2 ring-blue-400";
    }
    calendarDays.push(
      <div
        key={dateString}
        className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium ${bgColor}`}
        title={dateString}
      >
        {i}
      </div>
    );
  }

  return (
    <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="w-5 h-5" />
          <span>
            Attendance Calendar - {today.toLocaleString("default", { month: "long", year: "numeric" })}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
            <div key={d} className="text-center font-bold text-gray-600">
              {d}
            </div>
          ))}
          {calendarDays}
        </div>
        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1"><span className="w-4 h-4 bg-green-500 rounded inline-block"></span>Present</div>
          <div className="flex items-center gap-1"><span className="w-4 h-4 bg-red-500 rounded inline-block"></span>Absent</div>
          <div className="flex items-center gap-1"><span className="w-4 h-4 bg-gray-100 border border-gray-300 rounded inline-block"></span>Yet to come</div>
        </div>
        <Button onClick={getLocation} disabled={loading}>
          {loading ? "Getting location..." : "Check Distance to Hub"}
        </Button>
        {distance !== null && (
          <div className="mt-2 text-blue-700 font-medium">
            You are {distance < 1000 ? `${distance.toFixed(1)} meters` : `${(distance/1000).toFixed(2)} km`} from the hub.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const Dashboard = ({ user, onLogout }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("overview");
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

  const TabButton = ({ id, icon: Icon, label, isActive, onClick }) => (
    <Button
      variant={isActive ? "default" : "ghost"}
      onClick={onClick}
      className={`flex items-center space-x-2 ${
        isActive 
          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white" 
          : "text-gray-600 hover:text-gray-900"
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </Button>
  );

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
                onClick={onLogout}
                className="text-gray-600 hover:text-gray-900"
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
        <div className="flex flex-wrap gap-2 mb-8 p-1 bg-gray-100/50 rounded-lg w-fit">
          <TabButton
            id="overview"
            icon={Calendar}
            label="Overview"
            isActive={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
          />
          <TabButton
            id="history"
            icon={Clock}
            label="History"
            isActive={activeTab === "history"}
            onClick={() => setActiveTab("history")}
          />
          {user.role === "admin" && (
            <TabButton
              id="admin"
              icon={Users}
              label="Admin Panel"
              isActive={activeTab === "admin"}
              onClick={() => setActiveTab("admin")}
            />
          )}
        </div>

        {/* Content */}
        {activeTab === "overview" && (
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
                    <BarChart3 className="w-5 h-5 text-green-600" />
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
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
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

            {/* --- Attendance Calendar & Geolocation --- */}
            {user.role !== "admin" && (
              <AttendanceCalendarWithLocation attendance={user.attendance || {}} />
            )}

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

        {activeTab === "history" && (
          <AttendanceHistory user={user} />
        )}

        {activeTab === "admin" && user.role === "admin" && (
          <AdminDashboard user={user} onLogout={onLogout} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;