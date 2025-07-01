import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Download, Search, AlertTriangle, TrendingUp, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminPanel = () => {
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

  // NEW: Pending sign-ins mock data
  const [pendingSignIns, setPendingSignIns] = useState([
    {
      id: 11,
      name: "Samuel Ajayi",
      internId: "IIH005",
      email: "samuel@example.com",
      signInTime: "2025-06-30T08:55:00Z",
      signOutTime: null,
      location: { latitude: 8.4799, longitude: 4.5418 },
      status: "pending"
    },
    {
      id: 12,
      name: "Mary Uche",
      internId: "IIH006",
      email: "mary@example.com",
      signInTime: "2025-06-30T09:10:00Z",
      signOutTime: "2025-06-30T17:15:00Z",
      location: { latitude: 8.4801, longitude: 4.5420 },
      signOutLocation: { latitude: 8.4800, longitude: 4.5419 },
      status: "pending"
    },
  ]);

  // NEW: Approve/Reject handlers
  const handleApprove = (id) => {
    const signIn = pendingSignIns.find(s => s.id === id);
    if (signIn) {
      // Move to approved attendance records
      // In real app, this would update database
      setPendingSignIns((prev) => prev.filter((signIn) => signIn.id !== id));
      toast({
        title: "Sign-in Approved",
        description: `${signIn.name}'s attendance has been approved.`,
      });
    }
  };

  const handleReject = (id) => {
    const signIn = pendingSignIns.find(s => s.id === id);
    setPendingSignIns((prev) => prev.filter((signIn) => signIn.id !== id));
    toast({
      title: "Sign-in Rejected",
      description: `${signIn?.name}'s attendance has been rejected.`,
      variant: "destructive",
    });
  };

  const getStatusBadge = (status) => {
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

  const getAttendanceRateColor = (rate) => {
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
    <div className="space-y-6">

      {/* Pending Sign-In Approvals */}
      <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
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
              {pendingSignIns.map((signIn) => (
                <div
                  key={signIn.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border border-gray-200 bg-white/50 hover:bg-white/70 transition-colors gap-2"
                >
                  <div>
                    <div className="font-medium text-gray-900">{signIn.name} <span className="text-sm text-gray-600">({signIn.internId})</span></div>
                    <div className="text-sm text-gray-500">{signIn.email}</div>
                    <div className="text-xs text-gray-400">
                      Signed in: {new Date(signIn.signInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {signIn.signOutTime && (
                        <> | Signed out: {new Date(signIn.signOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</>
                      )}
                    </div>
                    <div className="text-xs text-blue-600">
                      📍 Location: {signIn.location?.latitude?.toFixed(4)}, {signIn.location?.longitude?.toFixed(4)}
                      {signIn.signOutLocation && (
                        <> | Out: {signIn.signOutLocation?.latitude?.toFixed(4)}, {signIn.signOutLocation?.longitude?.toFixed(4)}</>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2 sm:mt-0">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleApprove(signIn.id)}>
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" className="border-red-600 text-red-600 hover:bg-red-50"
                      onClick={() => handleReject(signIn.id)}>
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Overview Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* ...rest of your statistics cards... */}
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
      {/* ...your existing controls and intern list... */}

      {/* Recent Activity */}
      {/* ...your existing recent activity section... */}
    </div>
  );
};

export default AdminPanel;