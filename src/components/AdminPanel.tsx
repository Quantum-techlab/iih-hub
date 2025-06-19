
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
    
    // Simulate export process
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
      {/* Overview Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
      <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Intern Management</span>
            </span>
            <Button
              onClick={handleExportReport}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name or intern ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              {["all", "present", "absent", "at_risk"].map((filter) => (
                <Button
                  key={filter}
                  variant={selectedFilter === filter ? "default" : "outline"}
                  onClick={() => setSelectedFilter(filter)}
                  size="sm"
                  className={selectedFilter === filter ? "bg-gradient-to-r from-blue-600 to-indigo-600" : ""}
                >
                  {filter === "all" && "All"}
                  {filter === "present" && "Present"}
                  {filter === "absent" && "Absent"}
                  {filter === "at_risk" && "At Risk"}
                </Button>
              ))}
            </div>
          </div>

          {/* Intern List */}
          <div className="space-y-3">
            {filteredInterns.map((intern) => (
              <div
                key={intern.id}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-white/50 hover:bg-white/70 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                    <span className="font-medium text-blue-600">
                      {intern.name.charAt(0)}
                    </span>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900">{intern.name}</h3>
                      {intern.missedDays >= 3 && (
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {intern.internId} • {intern.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <div className={`font-medium ${getAttendanceRateColor(intern.attendanceRate)}`}>
                      {intern.attendanceRate}%
                    </div>
                    <p className="text-xs text-gray-500">Attendance</p>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-medium text-gray-900">{intern.missedDays}</div>
                    <p className="text-xs text-gray-500">Missed Days</p>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      {intern.lastSignIn.toLocaleDateString()}
                    </div>
                    <p className="text-xs text-gray-500">Last Sign In</p>
                  </div>
                  
                  {getStatusBadge(intern.status)}
                </div>
              </div>
            ))}
          </div>

          {filteredInterns.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No interns found</p>
              <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { intern: "Adebayo Oluwaseun", action: "Signed in", time: "8:30 AM", type: "sign_in" },
              { intern: "Chinedu Okoro", action: "Signed out", time: "5:15 PM", type: "sign_out" },
              { intern: "Aisha Abdullahi", action: "Signed in", time: "9:00 AM", type: "sign_in" },
              { intern: "Fatima Hassan", action: "Marked absent", time: "11:59 PM", type: "absent" }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === "sign_in" ? "bg-green-500" :
                    activity.type === "sign_out" ? "bg-blue-500" : "bg-red-500"
                  }`} />
                  <span className="text-gray-900">{activity.intern}</span>
                  <span className="text-gray-600">{activity.action}</span>
                </div>
                <span className="text-sm text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;
