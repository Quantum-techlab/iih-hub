import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Download, Search, TrendingUp, Clock, MapPin, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Ilorin Innovation Hub coordinates
const HUB_COORDS = { lat: 8.4799, lng: 4.5418 };

// Calculate distance using Haversine formula
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371000; // Earth's radius in meters
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
};

const AdminDashboard = ({ user, onLogout }: { user: any; onLogout: () => void }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const { toast } = useToast();

  // Mock data for demonstration
  const interns = [
    {
      id: 1,
      name: "Adebayo Oluwaseun",
      internId: "IIH001",
      email: "adebayo@example.com",
      attendanceRate: 95,
      missedDays: 1,
      lastSignIn: new Date(2025, 5, 19, 8, 30),
      status: "signed_in"
    },
    {
      id: 2,
      name: "Fatima Hassan",
      internId: "IIH002",
      email: "fatima@example.com",
      attendanceRate: 88,
      missedDays: 3,
      lastSignIn: new Date(2025, 5, 18, 9, 15),
      status: "absent"
    },
    {
      id: 3,
      name: "Chinedu Okoro",
      internId: "IIH003",
      email: "chinedu@example.com",
      attendanceRate: 100,
      missedDays: 0,
      lastSignIn: new Date(2025, 5, 19, 8, 45),
      status: "signed_out"
    },
    {
      id: 4,
      name: "Aisha Abdullahi",
      internId: "IIH004",
      email: "aisha@example.com",
      attendanceRate: 92,
      missedDays: 2,
      lastSignIn: new Date(2025, 5, 19, 9, 0),
      status: "signed_in"
    }
  ];

  // Pending sign-ins mock data
  const [pendingSignIns, setPendingSignIns] = useState([
    {
      id: 11,
      name: "Samuel Ajayi",
      internId: "IIH005",
      email: "samuel@example.com",
      signInTime: "2025-06-30T08:55:00Z",
      signOutTime: null,
      location: { latitude: 8.4801, longitude: 4.5420 },
      status: "pending"
    },
    {
      id: 12,
      name: "Mary Uche",
      internId: "IIH006",
      email: "mary@example.com",
      signInTime: "2025-06-30T09:10:00Z",
      signOutTime: "2025-06-30T17:15:00Z",
      location: { latitude: 8.4799, longitude: 4.5418 },
      signOutLocation: { latitude: 8.4800, longitude: 4.5419 },
      status: "pending"
    },
  ]);

  const handleApprove = (id: number) => {
    const signIn = pendingSignIns.find(s => s.id === id);
    if (signIn) {
      setPendingSignIns((prev) => prev.filter((signIn) => signIn.id !== id));
      toast({
        title: "Sign-in Approved",
        description: `${signIn.name}'s attendance has been approved.`,
      });
    }
  };

  const handleReject = (id: number) => {
    const signIn = pendingSignIns.find(s => s.id === id);
    setPendingSignIns((prev) => prev.filter((signIn) => signIn.id !== id));
    toast({
      title: "Sign-in Rejected",
      description: `${signIn?.name}'s attendance has been rejected.`,
      variant: "destructive",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "signed_in":
        return <Badge className="bg-green-100 text-green-800">Signed In</Badge>;
      case "signed_out":
        return <Badge className="bg-blue-100 text-blue-800">Signed Out</Badge>;
      case "absent":
        return <Badge className="bg-red-100 text-red-800">Absent</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const getAttendanceRateColor = (rate: number) => {
    if (rate >= 95) return "text-green-600";
    if (rate >= 85) return "text-yellow-600";
    return "text-red-600";
  };

  const handleExportReport = () => {
    toast({
      title: "Export Started",
      description: "Attendance report is being generated...",
    });
    
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "Attendance report has been downloaded successfully",
      });
    }, 2000);
  };

  const filteredInterns = interns.filter(intern => {
    const matchesSearch = intern.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         intern.internId.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedFilter === "all") return matchesSearch;
    if (selectedFilter === "present") return matchesSearch && intern.status !== "absent";
    if (selectedFilter === "absent") return matchesSearch && intern.status === "absent";
    if (selectedFilter === "at_risk") return matchesSearch && intern.missedDays >= 3;
    
    return matchesSearch;
  });

  const overallStats = {
    totalInterns: interns.length,
    presentToday: interns.filter(i => i.status !== "absent").length,
    absentToday: interns.filter(i => i.status === "absent").length,
    averageAttendance: Math.round(interns.reduce((sum, i) => sum + i.attendanceRate, 0) / interns.length)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900">IIH Admin Dashboard</h1>
                <p className="text-xs text-gray-500">Manage Intern Attendance</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="font-medium text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500">Administrator</p>
              </div>
              <Button
                variant="ghost"
                onClick={onLogout}
                className="text-gray-600 hover:text-gray-900"
              >
                <Clock className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {user.name}!
          </h2>
          <p className="text-lg text-gray-600">
            Manage intern attendance and track performance
          </p>
        </div>

        {/* Pending Sign-In Approvals */}
        <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Pending Sign-In Approvals</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingSignIns.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No pending approvals.</div>
            ) : (
              <div className="space-y-3">
                {pendingSignIns.map((signIn) => {
                  const distance = calculateDistance(
                    signIn.location.latitude,
                    signIn.location.longitude,
                    HUB_COORDS.lat,
                    HUB_COORDS.lng
                  );
                  
                  return (
                    <div
                      key={signIn.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border border-gray-200 bg-white/50 hover:bg-white/70 transition-colors gap-2"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {signIn.name} <span className="text-sm text-gray-600">({signIn.internId})</span>
                        </div>
                        <div className="text-sm text-gray-500">{signIn.email}</div>
                        <div className="text-xs text-gray-400">
                          Signed in: {new Date(signIn.signInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {signIn.signOutTime && (
                            <> | Signed out: {new Date(signIn.signOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <MapPin className="w-3 h-3 text-blue-600" />
                          <span className="text-blue-600">
                            Distance from Hub: {distance < 1000 ? `${distance.toFixed(0)}m` : `${(distance/1000).toFixed(2)}km`}
                          </span>
                          <span className="text-gray-400">
                            ({signIn.location?.latitude?.toFixed(4)}, {signIn.location?.longitude?.toFixed(4)})
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-2 sm:mt-0">
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleApprove(signIn.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-red-600 text-red-600 hover:bg-red-50"
                          onClick={() => handleReject(signIn.id)}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Overview Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{overallStats.totalInterns}</div>
              <p className="text-sm text-gray-600">Total Interns</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{overallStats.presentToday}</div>
              <p className="text-sm text-gray-600">Present Today</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{overallStats.absentToday}</div>
              <p className="text-sm text-gray-600">Absent Today</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{overallStats.averageAttendance}%</div>
              <p className="text-sm text-gray-600">Avg. Attendance</p>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Intern Management</span>
              </span>
              <Button onClick={handleExportReport} className="bg-green-600 hover:bg-green-700">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by name or intern ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                {["all", "present", "absent", "at_risk"].map((filter) => (
                  <Button
                    key={filter}
                    variant={selectedFilter === filter ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedFilter(filter)}
                    className="capitalize"
                  >
                    {filter.replace("_", " ")}
                  </Button>
                ))}
              </div>
            </div>

            {/* Intern List */}
            <div className="space-y-3">
              {filteredInterns.map((intern) => (
                <div
                  key={intern.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border border-gray-200 bg-white/50 hover:bg-white/70 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <h3 className="font-medium text-gray-900">{intern.name}</h3>
                        <p className="text-sm text-gray-500">{intern.internId} • {intern.email}</p>
                      </div>
                      {getStatusBadge(intern.status)}
                    </div>
                    <div className="mt-2 flex items-center space-x-4 text-sm">
                      <span className={`font-medium ${getAttendanceRateColor(intern.attendanceRate)}`}>
                        {intern.attendanceRate}% attendance
                      </span>
                      <span className="text-gray-500">
                        {intern.missedDays} missed days
                      </span>
                      {intern.lastSignIn && (
                        <span className="text-gray-500">
                          Last: {intern.lastSignIn.toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;