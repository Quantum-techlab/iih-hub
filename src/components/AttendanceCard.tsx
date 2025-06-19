
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

const AttendanceCard = ({ user, currentTime, isWeekday, onSignIn, onSignOut }) => {
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Africa/Lagos'
    });
  };

  const getStatusInfo = () => {
    if (!isWeekday) {
      return {
        icon: AlertCircle,
        iconColor: "text-gray-500",
        status: "Weekend",
        message: "Attendance tracking is only available Monday to Friday",
        bgColor: "bg-gray-50"
      };
    }

    if (user.signedInToday) {
      const hasSignedOut = user.lastSignOut && 
        new Date(user.lastSignOut).toDateString() === currentTime.toDateString();
      
      if (hasSignedOut) {
        return {
          icon: CheckCircle,
          iconColor: "text-green-500",
          status: "Complete",
          message: `Signed in at ${formatTime(user.lastSignIn)} • Signed out at ${formatTime(user.lastSignOut)}`,
          bgColor: "bg-green-50"
        };
      }
      
      return {
        icon: Clock,
        iconColor: "text-blue-500",
        status: "Signed In",
        message: `Signed in at ${formatTime(user.lastSignIn)} WAT`,
        bgColor: "bg-blue-50"
      };
    }

    return {
      icon: XCircle,
      iconColor: "text-red-500",
      status: "Not Signed In",
      message: "You haven't signed in today",
      bgColor: "bg-red-50"
    };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  const canSignIn = isWeekday && !user.signedInToday;
  const canSignOut = isWeekday && user.signedInToday && 
    (!user.lastSignOut || new Date(user.lastSignOut).toDateString() !== currentTime.toDateString());

  return (
    <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center space-x-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <span>Today's Attendance</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Display */}
        <div className={`p-4 rounded-lg ${statusInfo.bgColor}`}>
          <div className="flex items-center space-x-3">
            <StatusIcon className={`w-6 h-6 ${statusInfo.iconColor}`} />
            <div>
              <p className="font-medium text-gray-900">{statusInfo.status}</p>
              <p className="text-sm text-gray-600">{statusInfo.message}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isWeekday && (
          <div className="space-y-2">
            <Button
              onClick={onSignIn}
              disabled={!canSignIn}
              className={`w-full ${
                canSignIn
                  ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  : "bg-gray-300"
              } text-white`}
            >
              {user.signedInToday ? "Already Signed In" : "Sign In"}
            </Button>
            
            <Button
              onClick={onSignOut}
              disabled={!canSignOut}
              variant="outline"
              className={`w-full ${
                canSignOut
                  ? "border-orange-300 text-orange-600 hover:bg-orange-50"
                  : "border-gray-300 text-gray-400"
              }`}
            >
              {!user.signedInToday 
                ? "Sign In First" 
                : user.lastSignOut && new Date(user.lastSignOut).toDateString() === currentTime.toDateString()
                  ? "Already Signed Out"
                  : "Sign Out"
              }
            </Button>
          </div>
        )}

        {!isWeekday && (
          <div className="text-center py-4">
            <p className="text-gray-500">Enjoy your weekend! 🎉</p>
            <p className="text-sm text-gray-400">See you on Monday</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AttendanceCard;
