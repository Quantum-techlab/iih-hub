
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, CheckCircle, XCircle, ChevronLeft, ChevronRight } from "lucide-react";

const AttendanceHistory = ({ user }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Mock data for demonstration
  const generateMockAttendance = () => {
    const attendance = [];
    const today = new Date();
    const currentDate = new Date(today.getFullYear(), today.getMonth(), 1);
    
    while (currentDate.getMonth() === today.getMonth()) {
      const dayOfWeek = currentDate.getDay();
      
      // Only add weekdays
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        const isPresent = Math.random() > 0.1; // 90% attendance rate
        const signInTime = new Date(currentDate);
        signInTime.setHours(8 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60));
        
        const signOutTime = new Date(currentDate);
        signOutTime.setHours(17 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60));

        attendance.push({
          date: new Date(currentDate),
          present: isPresent,
          signIn: isPresent ? signInTime : null,
          signOut: isPresent ? signOutTime : null,
        });
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return attendance.reverse();
  };

  const [attendanceData] = useState(generateMockAttendance());

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    if (!date) return "—";
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAttendanceStats = () => {
    const totalDays = attendanceData.length;
    const presentDays = attendanceData.filter(day => day.present).length;
    const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
    
    return {
      totalDays,
      presentDays,
      missedDays: totalDays - presentDays,
      attendanceRate
    };
  };

  const stats = getAttendanceStats();

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalDays}</div>
            <p className="text-sm text-gray-600">Total Days</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.presentDays}</div>
            <p className="text-sm text-gray-600">Present</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.missedDays}</div>
            <p className="text-sm text-gray-600">Missed</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.attendanceRate}%</div>
            <p className="text-sm text-gray-600">Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar View */}
      <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Attendance History</span>
            </span>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="font-medium">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {attendanceData.map((day, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  day.present 
                    ? "border-green-200 bg-green-50" 
                    : "border-red-200 bg-red-50"
                }`}
              >
                <div className="flex items-center space-x-3">
                  {day.present ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      {formatDate(day.date)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {day.present ? "Present" : "Absent"}
                    </p>
                  </div>
                </div>
                
                {day.present && (
                  <div className="text-right">
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span>In: {formatTime(day.signIn)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4 text-orange-500" />
                        <span>Out: {formatTime(day.signOut)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {attendanceData.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No attendance records found</p>
              <p className="text-sm text-gray-400">Start tracking your attendance today!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceHistory;
