
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, TrendingUp, AlertTriangle, User, Phone, Mail } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const InternAnalytics = ({ intern, onBack }: { intern: any; onBack: () => void }) => {
  const [selectedMonth, setSelectedMonth] = useState("2025-01");

  // Generate chart data for attendance trends
  const attendanceTrendData = Object.entries(intern.monthlyData || {}).map(([month, data]: [string, any]) => ({
    month: new Date(month + "-01").toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    rate: data.rate,
    present: data.presentDays,
    absent: data.absentDays
  }));

  const selectedMonthData = intern.monthlyData?.[selectedMonth];
  const missedDaysInMonth = intern.missedDaysDetails?.filter((day: any) => 
    day.date.startsWith(selectedMonth)
  ) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 space-x-4">
            <Button
              variant="ghost"
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900">{intern.name} - Analytics</h1>
                <p className="text-xs text-gray-500">{intern.internId} • {intern.department}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Intern Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <User className="w-5 h-5 text-blue-600" />
                <span>Contact Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span>{intern.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span>{intern.phone}</span>
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Supervisor:</strong> {intern.supervisor}
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Start Date:</strong> {intern.joinDate}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span>Overall Stats</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="text-2xl font-bold text-green-600">{intern.attendanceRate}%</div>
                  <p className="text-sm text-gray-600">Attendance Rate</p>
                </div>
                <div>
                  <div className="text-xl font-semibold text-blue-600">{intern.timeAnalytics?.totalHours}</div>
                  <p className="text-sm text-gray-600">Total Hours</p>
                </div>
                <div>
                  <div className="text-xl font-semibold text-purple-600">{intern.timeAnalytics?.punctualityRate}%</div>
                  <p className="text-sm text-gray-600">Punctuality Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Clock className="w-5 h-5 text-orange-500" />
                <span>Time Analytics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="text-lg font-semibold text-gray-900">{intern.timeAnalytics?.avgSignIn}</div>
                  <p className="text-sm text-gray-600">Avg. Sign In</p>
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900">{intern.timeAnalytics?.avgSignOut}</div>
                  <p className="text-sm text-gray-600">Avg. Sign Out</p>
                </div>
                <div>
                  <div className="text-lg font-semibold text-red-600">{intern.missedDays}</div>
                  <p className="text-sm text-gray-600">Total Missed Days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Trend Chart */}
        <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Attendance Trend</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="rate" stroke="#3B82F6" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Breakdown */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Monthly Breakdown</span>
                </span>
                <select 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="text-sm border rounded px-2 py-1"
                >
                  {Object.keys(intern.monthlyData || {}).map(month => (
                    <option key={month} value={month}>
                      {new Date(month + "-01").toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </option>
                  ))}
                </select>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedMonthData && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{selectedMonthData.totalDays}</div>
                      <p className="text-sm text-gray-600">Total Days</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{selectedMonthData.presentDays}</div>
                      <p className="text-sm text-gray-600">Present</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{selectedMonthData.absentDays}</div>
                      <p className="text-sm text-gray-600">Absent</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-purple-600">{selectedMonthData.rate}%</div>
                    <p className="text-sm text-gray-600">Attendance Rate</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span>Missed Days - {new Date(selectedMonth + "-01").toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {missedDaysInMonth.length === 0 ? (
                <div className="text-center py-8 text-green-600">
                  <div className="text-2xl font-bold">Perfect Attendance!</div>
                  <p className="text-sm">No missed days this month</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {missedDaysInMonth.map((day: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <div className="font-medium text-red-900">
                          {new Date(day.date).toLocaleDateString('en-US', { 
                            weekday: 'long',
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                        <div className="text-sm text-red-700">{day.reason}</div>
                      </div>
                      <Badge variant={day.type === 'excused' ? 'default' : 'destructive'}>
                        {day.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* All Missed Days (All Months) */}
        <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <span>All Missed Days History</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {intern.missedDaysDetails?.length === 0 ? (
              <div className="text-center py-8 text-green-600">
                <div className="text-2xl font-bold">Excellent Record!</div>
                <p className="text-sm">No missed days in the entire internship period</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {intern.missedDaysDetails?.map((day: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white/50">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {new Date(day.date).toLocaleDateString('en-US', { 
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="text-sm text-gray-600">{day.reason}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={day.type === 'excused' ? 'default' : 'destructive'}>
                        {day.type}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(day.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InternAnalytics;
