import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Calendar, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Updated Ilorin Innovation Hub coordinates with higher precision
// These are the exact coordinates from Google Maps
const HUB_COORDS = { 
  lat: 8.479898,
  lng: 4.541840
};

// High-precision Haversine formula for distance calculation
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371000; // Earth's radius in meters
  
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
};

const AttendanceCard = ({ user, currentTime, isWeekday, onSignIn, onSignOut }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState("");
  const { toast } = useToast();

  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Africa/Lagos'
    });
  };

  const getHighPrecisionLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"));
        return;
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0
      };

      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    setLocationStatus("Getting precise location...");
    
    try {
      const position = await getHighPrecisionLocation();
      const { latitude, longitude, accuracy } = position.coords;
      
      console.log("User coordinates:", latitude, longitude);
      console.log("Hub coordinates:", HUB_COORDS.lat, HUB_COORDS.lng);
      
      const distanceToHub = calculateDistance(latitude, longitude, HUB_COORDS.lat, HUB_COORDS.lng);
      console.log("Calculated distance:", distanceToHub, "meters");
      
      setLocationStatus(`Location captured with ${accuracy.toFixed(1)}m accuracy`);
      
      const locationData = {
        latitude: parseFloat(latitude.toFixed(8)),
        longitude: parseFloat(longitude.toFixed(8)),
        accuracy: accuracy,
        distanceToHub: parseFloat(distanceToHub.toFixed(2)),
        timestamp: new Date().toISOString(),
        hubCoordinates: HUB_COORDS
      };

      toast({
        title: "Sign-in Submitted",
        description: `Distance: ${distanceToHub < 1000 ? 
          `${distanceToHub.toFixed(1)}m` : 
          `${(distanceToHub/1000).toFixed(2)}km`} from IIH. Pending admin approval.`,
      });
      
      onSignIn({
        timestamp: currentTime,
        location: locationData
      });
      
    } catch (error) {
      console.error("Geolocation error:", error);
      let errorMessage = "Unable to get location. ";
      
      if (error.code === 1) {
        errorMessage += "Location access denied.";
      } else if (error.code === 2) {
        errorMessage += "Location unavailable.";
      } else if (error.code === 3) {
        errorMessage += "Location request timed out.";
      } else {
        errorMessage += error.message;
      }
      
      toast({
        title: "Location Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setLocationStatus("");
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    setLocationStatus("Getting precise location...");
    
    try {
      const position = await getHighPrecisionLocation();
      const { latitude, longitude, accuracy } = position.coords;
      
      const distanceToHub = calculateDistance(latitude, longitude, HUB_COORDS.lat, HUB_COORDS.lng);
      
      setLocationStatus(`Location captured with ${accuracy.toFixed(1)}m accuracy`);
      
      const locationData = {
        latitude: parseFloat(latitude.toFixed(8)),
        longitude: parseFloat(longitude.toFixed(8)),
        accuracy: accuracy,
        distanceToHub: parseFloat(distanceToHub.toFixed(2)),
        timestamp: new Date().toISOString(),
        hubCoordinates: HUB_COORDS
      };

      toast({
        title: "Sign-out Submitted",
        description: `Distance: ${distanceToHub < 1000 ? 
          `${distanceToHub.toFixed(1)}m` : 
          `${(distanceToHub/1000).toFixed(2)}km`} from IIH. Pending admin approval.`,
      });
      
      onSignOut({
        timestamp: currentTime,
        location: locationData
      });
      
    } catch (error) {
      console.error("Geolocation error:", error);
      let errorMessage = "Unable to get location. ";
      
      if (error.code === 1) {
        errorMessage += "Location access denied.";
      } else if (error.code === 2) {
        errorMessage += "Location unavailable.";
      } else if (error.code === 3) {
        errorMessage += "Location request timed out.";
      } else {
        errorMessage += error.message;
      }
      
      toast({
        title: "Location Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setLocationStatus("");
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

        {/* Location Status */}
        {locationStatus && (
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <p className="text-sm text-blue-700">{locationStatus}</p>
            </div>
          </div>
        )}

        {/* Hub Location Info */}
        <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
          <div className="flex items-center space-x-2 mb-1">
            <MapPin className="w-4 h-4 text-gray-600" />
            <p className="text-sm font-medium text-gray-700">Ilorin Innovation Hub</p>
          </div>
          <p className="text-xs text-gray-500">
            {HUB_COORDS.lat}°N, {HUB_COORDS.lng}°E
          </p>
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
              {isLoading && locationStatus ? locationStatus : 
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
              {isLoading && locationStatus ? locationStatus :
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
