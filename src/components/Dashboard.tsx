
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, User, LogOut, Users, BarChart3, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AttendanceCard from "./AttendanceCard";
import AttendanceHistory from "./AttendanceHistory";
import AdminPanel from "./AdminPanel";

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

  const handleSignIn = () => {
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

    // Update user state (in a real app, this would be an API call)
    user.signedInToday = true;
    user.lastSignIn = currentTime.toISOString();
    
    toast({
      title: "Signed In Successfully!",
      description: `Signed in at ${formatTime(currentTime)} WAT`,
    });
  };

  const handleSignOut = () => {
    if (!user.signedInToday) {
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

    // Update user state
    user.lastSignOut = currentTime.toISOString();
    
    toast({
      title: "Signed Out Successfully!",
      description: `Signed out at ${formatTime(currentTime)} WAT`,
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
          <AdminPanel />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
