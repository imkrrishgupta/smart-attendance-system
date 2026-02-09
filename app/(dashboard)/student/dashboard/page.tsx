'use client';

import { useState, useEffect } from 'react';
import { 
  Camera, 
  MapPin, 
  CheckCircle, 
  Clock, 
  Calendar,
  AlertCircle,
  TrendingUp,
  Award,
  BookOpen,
  XCircle
} from 'lucide-react';

export default function StudentDashboard() {
  const [isMarkingAttendance, setIsMarkingAttendance] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);
  const [locationVerified, setLocationVerified] = useState(false);
  const [attendanceMarked, setAttendanceMarked] = useState(false);

  const studentInfo = {
    name: 'Ruchika Sinha',
    rollNo: '2024UGCS062',
    program: 'B.Tech Computer Science',
    semester: '2nd Semester'
  };

  const stats = [
    { label: 'Total Classes', value: '48', icon: BookOpen, color: 'indigo' },
    { label: 'Present', value: '42', icon: CheckCircle, color: 'green' },
    { label: 'Absent', value: '6', icon: XCircle, color: 'red' },
    { label: 'Attendance %', value: '87.5%', icon: TrendingUp, color: 'blue' },
  ];

  const [activeSession] = useState({
    subject: 'Machine Learning',
    teacher: 'Dr. Sarah Johnson',
    time: '10:00 AM - 11:30 AM',
    room: 'Lab 301',
    startTime: '10:00 AM',
    endTime: '10:15 AM',
    isActive: true
  });

  const upcomingSessions = [
    { 
      id: 1, 
      subject: 'Deep Learning', 
      teacher: 'Prof. Michael Chen',
      time: '02:00 PM - 03:30 PM', 
      room: 'Room 205',
      status: 'upcoming'
    },
    { 
      id: 2, 
      subject: 'Neural Networks', 
      teacher: 'Dr. Emily Brown',
      time: '04:00 PM - 05:30 PM', 
      room: 'Lab 302',
      status: 'upcoming'
    },
  ];

  const [recentAttendance] = useState([
    { 
      id: 1, 
      subject: 'Machine Learning', 
      date: '2025-01-30',
      time: '10:00 AM',
      status: 'present',
      markedAt: '10:03 AM'
    },
    { 
      id: 2, 
      subject: 'Deep Learning', 
      date: '2025-01-29',
      time: '02:00 PM',
      status: 'present',
      markedAt: '02:05 PM'
    },
    { 
      id: 3, 
      subject: 'Neural Networks', 
      date: '2025-01-29',
      time: '04:00 PM',
      status: 'absent',
      markedAt: '-'
    },
    { 
      id: 4, 
      subject: 'Web Development', 
      date: '2025-01-28',
      time: '10:00 AM',
      status: 'present',
      markedAt: '10:02 AM'
    },
    { 
      id: 5, 
      subject: 'Database Systems', 
      date: '2025-01-28',
      time: '02:00 PM',
      status: 'present',
      markedAt: '02:04 AM'
    },
  ]);

  const handleStartMarkAttendance = () => {
    setIsMarkingAttendance(true);
    setFaceVerified(false);
    setLocationVerified(false);
    
    setTimeout(() => setFaceVerified(true), 2000);
    setTimeout(() => setLocationVerified(true), 4000);
  };

  const handleMarkAttendance = () => {
    if (faceVerified && locationVerified) {
      setAttendanceMarked(true);
      setTimeout(() => {
        alert('Attendance marked successfully!');
        setIsMarkingAttendance(false);
        setFaceVerified(false);
        setLocationVerified(false);
        setAttendanceMarked(false);
      }, 1000);
    }
  };

  const handleCancelMarking = () => {
    setIsMarkingAttendance(false);
    setFaceVerified(false);
    setLocationVerified(false);
  };

  const colorClasses = {
    indigo: 'bg-indigo-600',
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600'
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Student Dashboard</h1>
              <p className="text-slate-600 mt-1">Welcome back, {studentInfo.name}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-600">Roll No: {studentInfo.rollNo}</div>
              <div className="text-sm text-slate-600">{studentInfo.program}</div>
            </div>
          </div>
        </div>
      </header>

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            
            return (
              <div key={index} className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
                <div className="text-slate-600 font-medium">{stat.label}</div>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {activeSession.isActive && !attendanceMarked && (
              <div className="bg-white rounded-xl border-2 border-green-600">
                <div className="p-6 bg-green-50 border-b-2 border-green-600">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm font-semibold flex items-center gap-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      Active Session
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">{activeSession.subject}</h2>
                  <div className="flex items-center gap-4 text-sm text-slate-700">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {activeSession.time}
                    </div>
                    <div>Teacher: {activeSession.teacher}</div>
                    <div>Room: {activeSession.room}</div>
                  </div>
                </div>
                
                <div className="p-6">
                  {!isMarkingAttendance ? (
                    <div>
                      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-blue-900 font-medium mb-2">Mark your attendance now!</p>
                        <p className="text-sm text-blue-700">
                          Attendance window: {activeSession.startTime} - {activeSession.endTime}
                        </p>
                      </div>
                      <button 
                        onClick={handleStartMarkAttendance}
                        className="w-full px-6 py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Camera className="w-5 h-5" />
                        Mark Attendance
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className={`p-5 rounded-xl border-2 ${
                        faceVerified 
                          ? 'bg-green-50 border-green-600' 
                          : 'bg-blue-50 border-blue-600'
                      }`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              faceVerified ? 'bg-green-600' : 'bg-blue-600'
                            }`}>
                              <Camera className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900">Face Verification</h3>
                              <p className="text-sm text-slate-600">
                                {faceVerified ? 'Identity verified' : 'Verifying your identity...'}
                              </p>
                            </div>
                          </div>
                          {faceVerified && <CheckCircle className="w-6 h-6 text-green-600" />}
                        </div>
                        {!faceVerified && (
                          <div className="flex items-center justify-center h-48 bg-slate-200 rounded-lg">
                            <div className="text-center">
                              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                              <p className="text-slate-600 font-medium">Processing...</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className={`p-5 rounded-xl border-2 ${
                        locationVerified 
                          ? 'bg-green-50 border-green-600' 
                          : faceVerified 
                            ? 'bg-blue-50 border-blue-600'
                            : 'bg-slate-100 border-slate-300'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              locationVerified ? 'bg-green-600' : faceVerified ? 'bg-blue-600' : 'bg-slate-400'
                            }`}>
                              <MapPin className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900">Location Verification</h3>
                              <p className="text-sm text-slate-600">
                                {locationVerified 
                                  ? 'Location verified - You are in the classroom' 
                                  : faceVerified 
                                    ? 'Checking your location...'
                                    : 'Waiting for face verification'
                                }
                              </p>
                            </div>
                          </div>
                          {locationVerified && <CheckCircle className="w-6 h-6 text-green-600" />}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button 
                          onClick={handleCancelMarking}
                          className="flex-1 px-6 py-4 bg-slate-300 text-slate-700 rounded-xl font-bold text-lg hover:bg-slate-400 transition-colors"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={handleMarkAttendance}
                          disabled={!faceVerified || !locationVerified}
                          className={`flex-1 px-6 py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2 ${
                            faceVerified && locationVerified
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          <CheckCircle className="w-5 h-5" />
                          Submit Attendance
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-900">Upcoming Classes</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <div 
                      key={session.id} 
                      className="p-5 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors"
                    >
                      <h3 className="text-lg font-bold text-slate-900 mb-2">{session.subject}</h3>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {session.time}
                        </div>
                        <div>Teacher: {session.teacher}</div>
                        <div>Room: {session.room}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-900">Recent Attendance</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Subject</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Time</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Marked At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {recentAttendance.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{record.subject}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{record.date}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{record.time}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            record.status === 'present' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {record.status === 'present' ? 'Present' : 'Absent'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{record.markedAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-900">Attendance Summary</h2>
              </div>
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-blue-100 mb-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-blue-600">87.5%</div>
                    </div>
                  </div>
                  <p className="text-slate-600 font-medium">Overall Attendance</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-slate-700">Present</span>
                    <span className="text-sm font-bold text-green-700">42 days</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <span className="text-sm font-medium text-slate-700">Absent</span>
                    <span className="text-sm font-bold text-red-700">6 days</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-slate-700">Total Classes</span>
                    <span className="text-sm font-bold text-blue-700">48 days</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-900">Attendance Alert</h2>
              </div>
              <div className="p-6">
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <Award className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-green-900 mb-1">Great Attendance!</h3>
                    <p className="text-sm text-green-700">
                      Your attendance is above 75%. Keep up the good work!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-900">Quick Actions</h2>
              </div>
              <div className="p-6 space-y-3">
                <a 
                  href="/student/timetable"
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-3"
                >
                  <Calendar className="w-5 h-5" />
                  View Timetable
                </a>
                <button 
                  onClick={() => alert('Raise issue form would open here')}
                  className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-3"
                >
                  <AlertCircle className="w-5 h-5" />
                  Raise Issue
                </button>
                <button 
                  onClick={() => alert('Full history would open here')}
                  className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-3"
                >
                  <BookOpen className="w-5 h-5" />
                  View All History
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}