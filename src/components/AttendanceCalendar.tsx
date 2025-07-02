import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

// Real Ilorin Innovation Hub coordinates from Google Maps
const HUB_COORDS = { lat: 8.479898, lng: 4.541840 };

function haversine(lat1, lon1, lat2, lon2) {
  const toRad = x => (x * Math.PI) / 180;
  const R = 6371000;
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
}

const AttendanceCalendar = ({ attendance = {} }) => {
  const [today] = useState(new Date());
  const [distance, setDistance] = useState(null);
  const [loading, setLoading] = useState(false);

  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const getLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const { latitude, longitude } = pos.coords;
          const dist = haversine(latitude, longitude, HUB_COORDS.lat, HUB_COORDS.lng);
          setDistance(dist);
          setLoading(false);
        },
        () => {
          alert("Location permission denied or unavailable");
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      alert("Geolocation not supported");
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
        <div className="grid grid-cols-7 gap-2 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
            <div key={d} className="text-center font-bold text-gray-600">
              {d}
            </div>
          ))}
          {calendarDays}
        </div>
        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1"><span className="w-4 h-4 bg-green-500 rounded inline-block"></span>Present</div>
          <div className="flex items-center gap-1"><span className="w-4 h-4 bg-red-500 rounded inline-block"></span>Absent</div>
          <div className="flex items-center gap-1"><span className="w-4 h-4 bg-gray-100 border border-gray-300 rounded inline-block"></span>Yet to come</div>
        </div>
        <Button onClick={getLocation} disabled={loading}>
          {loading ? "Getting location..." : "Check Distance to Hub"}
        </Button>
        {distance !== null && (
          <div className="mt-2 text-blue-700 font-medium">
            You are {distance < 1000 ? `${distance.toFixed(1)} meters` : `${(distance/1000).toFixed(2)} km`} from Ilorin Innovation Hub.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AttendanceCalendar;
