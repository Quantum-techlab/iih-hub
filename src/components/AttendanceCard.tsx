import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Calendar, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AttendanceCard = ({ user, currentTime, isWeekday, onSignIn, onSignOut }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Africa/Lagos'
    });
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    
    // Get geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          toast({
            title: "Sign-in Submitted",
            description: `Location captured. Pending admin approval.`,
          });
          
          onSignIn({
            timestamp: currentTime,
            location: { latitude, longitude }
          });
          
          setIsLoading(false);
        },
        (error) => {
          toast({
            title: "Location Error",
            description: "Unable to get location. Sign-in cancelled.",
            variant: "destructive",
          });
          setIsLoading(false);
        }
      );
    } else {
      toast({
        title: "Location Not Supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    
    // Get geolocation for sign-out too
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          toast({
            title: "Sign-out Submitted",
            description: `Location captured. Pending admin approval.`,
          });
          
          onSignOut({
            timestamp: currentTime,
            location: { latitude, longitude }
          });
          
          setIsLoading(false);
        },
        (error) => {
          toast({
            title: "Location Error",
            description: "Unable to get location. Sign-out cancelled.",
            variant: "destructive",
          });
          setIsLoading(false);
        }
      );
    } else {
      toast({
        title: "Location Not Supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
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

    if (user.pendingSignIn) {
      return {
        icon: Clock,
        iconColor: "text-orange-500",
        status: "Pending Approval",
        message: `Sign-in submitted at ${formatTime(user.pendingSignIn.timestamp)} WAT`,
        bgColor: "bg-orange-50"
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

  const canSignIn = isWeekday && !user.signedInToday && !user.pendingSignIn;
  const canSignOut = isWeekday && (user.signedInToday || user.pendingSignIn) && 
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
              onClick={handleSignIn}
              disabled={!canSignIn || isLoading}
              className={`w-full ${
                canSignIn && !isLoading
                  ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  : "bg-gray-300"
              } text-white`}
            >
              {isLoading ? "Getting Location..." : 
               user.pendingSignIn ? "Sign-in Pending" :
               user.signedInToday ? "Already Signed In" : "Sign In"}
            </Button>
            
            <Button
              onClick={handleSignOut}
              disabled={!canSignOut || isLoading}
              variant="outline"
              className={`w-full ${
                canSignOut && !isLoading
                  ? "border-orange-300 text-orange-600 hover:bg-orange-50"
                  : "border-gray-300 text-gray-400"
              }`}
            >
              {isLoading ? "Getting Location..." :
               !user.signedInToday && !user.pendingSignIn
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