
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin } from "lucide-react";
import { useAttendance } from "@/hooks/useAttendance";

const AttendanceHistory = () => {
  const { attendanceRecords, loading } = useAttendance();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "signed_in":
        return <Badge className="bg-green-100 text-green-800">Present</Badge>;
      case "signed_out":
        return <Badge className="bg-blue-100 text-blue-800">Complete</Badge>;
      case "absent":
        return <Badge className="bg-red-100 text-red-800">Absent</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return "N/A";
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          <span>Attendance History</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {attendanceRecords.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No attendance records found.</p>
            <p className="text-sm">Start tracking your attendance today!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {attendanceRecords.map((record) => (
              <div
                key={record.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border border-gray-200 bg-white/50 hover:bg-white/70 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-medium text-gray-900">
                      {formatDate(record.date)}
                    </h3>
                    {getStatusBadge(record.status)}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    {record.sign_in_time && (
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>In: {formatTime(record.sign_in_time)}</span>
                      </div>
                    )}
                    {record.sign_out_time && (
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>Out: {formatTime(record.sign_out_time)}</span>
                      </div>
                    )}
                    {record.total_hours && (
                      <div className="flex items-center space-x-1">
                        <span>Total: {record.total_hours.toFixed(1)}h</span>
                      </div>
                    )}
                  </div>
                  {record.sign_in_location && (
                    <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                      <MapPin className="w-3 h-3" />
                      <span>
                        Distance: {record.sign_in_location.distanceToHub}m from IIH
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AttendanceHistory;
