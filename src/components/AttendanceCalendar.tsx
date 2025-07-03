
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

// Updated Ilorin Innovation Hub coordinates with higher precision
const HUB_COORDS = { 
  lat: 8.479898,
  lng: 4.541840
};

// High-precision Haversine formula for distance calculation
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371000; // Earth's radius in meters
  
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}

const AttendanceCalendar = ({ attendance = {} }) => {
  const [today] = useState(new Date());
  const [distance, setDistance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);

  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const getLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0
      };

      navigator.geolocation.getCurrentPosition(
        pos => {
          const { latitude, longitude, accuracy } = pos.coords;
          console.log("User location:", latitude, longitude);
          console.log("Location accuracy:", accuracy, "meters");
          console.log("Hub location:", HUB_COORDS.lat, HUB_COORDS.lng);
          
          setUserLocation({ lat: latitude, lng: longitude });
          setLocationAccuracy(accuracy);
          
          const dist = haversine(latitude, longitude, HUB_COORDS.lat, HUB_COORDS.lng);
          console.log("Calculated distance:", dist, "meters");
          
          setDistance(dist);
          setLoading(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          let errorMessage = "Location error: ";
          
          if (error.code === 1) {
            errorMessage += "Location access denied.";
          } else if (error.code === 2) {
            errorMessage += "Location unavailable.";
          } else if (error.code === 3) {
            errorMessage += "Location request timed out.";
          } else {
            errorMessage += error.message;
          }
          
          alert(errorMessage);
          setLoading(false);
        },
        options
      );
    } else {
      alert("Geolocation not supported by this browser");
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
        <div className="grid grid-cols-7 gap-2 mb-4">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
            <div key={d} className="text-center font-bold text-gray-600">
              {d}
            </div>
          ))}
          {calendarDays}
        </div>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1">
            <span className="w-4 h-4 bg-green-500 rounded inline-block"></span>
            Present
          </div>
          <div className="flex items-center gap-1">
            <span className="w-4 h-4 bg-red-500 rounded inline-block"></span>
            Absent
          </div>
          <div className="flex items-center gap-1">
            <span className="w-4 h-4 bg-gray-100 border border-gray-300 rounded inline-block"></span>
            Yet to come
          </div>
        </div>

        {/* Hub Location Info */}
        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 mb-3">
          <div className="text-sm font-medium text-blue-900 mb-1">
            Ilorin Innovation Hub Location
          </div>
          <div className="text-xs text-blue-700">
            Coordinates: {HUB_COORDS.lat}°N, {HUB_COORDS.lng}°E
          </div>
          <div className="text-xs text-blue-600">
            Decimal: {HUB_COORDS.lat.toFixed(6)}, {HUB_COORDS.lng.toFixed(6)}
          </div>
        </div>
        
        <Button onClick={getLocation} disabled={loading} className="w-full">
          {loading ? "Getting precise location..." : "Check Distance to Hub"}
        </Button>
        
        {distance !== null && (
          <div className="mt-3 p-3 rounded-lg bg-green-50 border border-green-200">
            <div className="text-green-800 font-medium text-sm">
              Distance to IIH: {distance < 1000 ? 
                `${distance.toFixed(1)} meters` : 
                `${(distance/1000).toFixed(2)} km`}
            </div>
            {locationAccuracy && (
              <div className="text-green-700 text-xs mt-1">
                Location accuracy: ±{locationAccuracy.toFixed(1)} meters
              </div>
            )}
            {userLocation && (
              <div className="text-xs text-green-600 mt-1">
                Your coordinates: {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AttendanceCalendar;
