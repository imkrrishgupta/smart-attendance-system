'use client';

import { useState, useEffect } from 'react';
import {
  Play,
  Square,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  Calendar,
  AlertCircle,
  UserCheck,
  FileText,
  Settings
} from 'lucide-react';

/* =======================
   TYPES
======================= */

type ClassItem = {
  id: number;
  subject: string;
  time: string;
  room: string;
  students: number;
  status: string;
};

type SessionData = {
  present: number;
  marking: number;
  absent: number;
};

type AttendanceIssue = {
  id: number;
  student: string;
  rollNo: string;
  subject: string;
  date: string;
  issue: string;
  status: string;
};

/* =======================
   COMPONENT
======================= */

export default function TeacherDashboard() {
  const [activeSession, setActiveSession] = useState<number | null>(null);

  const [sessionData, setSessionData] = useState<SessionData>({
    present: 0,
    marking: 0,
    absent: 0
  });

  const [upcomingClasses] = useState<ClassItem[]>([
    {
      id: 1,
      subject: 'Machine Learning',
      time: '10:00 AM - 11:30 AM',
      room: 'Lab 301',
      students: 45,
      status: 'upcoming'
    },
    {
      id: 2,
      subject: 'Deep Learning',
      time: '02:00 PM - 03:30 PM',
      room: 'Room 205',
      students: 38,
      status: 'upcoming'
    },
    {
      id: 3,
      subject: 'Neural Networks',
      time: '04:00 PM - 05:30 PM',
      room: 'Lab 302',
      students: 42,
      status: 'upcoming'
    }
  ]);

  const todayStats = [
    { label: 'Classes Today', value: '4', icon: Calendar },
    { label: 'Total Students', value: '165', icon: Users },
    { label: 'Avg Attendance', value: '89%', icon: UserCheck },
    { label: 'Pending Issues', value: '3', icon: AlertCircle }
  ];

  const [recentSessions] = useState([
    { id: 1, subject: 'Machine Learning', date: '2025-01-30', time: '10:00 AM', total: 45, present: 42, absent: 3 },
    { id: 2, subject: 'Deep Learning', date: '2025-01-29', time: '02:00 PM', total: 38, present: 36, absent: 2 },
    { id: 3, subject: 'Neural Networks', date: '2025-01-29', time: '04:00 PM', total: 42, present: 40, absent: 2 }
  ]);

  const [attendanceIssues, setAttendanceIssues] = useState<AttendanceIssue[]>([
    {
      id: 1,
      student: 'Rajesh Kumar',
      rollNo: '2024UGCS045',
      subject: 'Machine Learning',
      date: '2025-01-30',
      issue: 'Face recognition failed',
      status: 'pending'
    },
    {
      id: 2,
      student: 'Priya Sharma',
      rollNo: '2024UGCS067',
      subject: 'Deep Learning',
      date: '2025-01-29',
      issue: 'Outside geo-fence area',
      status: 'pending'
    }
  ]);

  /* =======================
     HANDLERS
  ======================= */

  const handleStartSession = (classId: number) => {
    const classItem = upcomingClasses.find(c => c.id === classId);
    if (!classItem) return;

    setActiveSession(classId);
    setSessionData({
      present: 0,
      marking: classItem.students,
      absent: 0
    });
  };

  const handleEndSession = () => {
    if (!confirm('End this session?')) return;

    setActiveSession(null);
    setSessionData({ present: 0, marking: 0, absent: 0 });
  };

  const handleMarkPresent = (issueId: number) => {
    setAttendanceIssues(prev => prev.filter(i => i.id !== issueId));
  };

  const handleRejectIssue = (issueId: number) => {
    setAttendanceIssues(prev => prev.filter(i => i.id !== issueId));
  };

  /* =======================
     SESSION SIMULATION
  ======================= */

  useEffect(() => {
    if (!activeSession) return;

    const interval = setInterval(() => {
      setSessionData(prev => {
        if (prev.marking <= 0) return prev;

        const classItem = upcomingClasses.find(c => c.id === activeSession);
        if (!classItem) return prev;

        const increment = Math.min(
          prev.marking,
          Math.floor(Math.random() * 3) + 1
        );

        return {
          present: prev.present + increment,
          marking: prev.marking - increment,
          absent: Math.max(
            0,
            classItem.students - (prev.present + increment + prev.absent)
          )
        };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [activeSession, upcomingClasses]);

  /* =======================
     UI
  ======================= */

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <h1 className="text-3xl font-bold mb-6">Teacher Dashboard</h1>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {todayStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-6 rounded-xl border">
              <Icon className="w-6 h-6 mb-3 text-indigo-600" />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-slate-600">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* CLASSES */}
      <div className="bg-white rounded-xl border p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Today's Classes</h2>

        {upcomingClasses.map(cls => (
          <div key={cls.id} className="border p-4 rounded-lg mb-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold">{cls.subject}</h3>
                <p className="text-sm text-slate-600">
                  {cls.time} • {cls.room} • {cls.students} students
                </p>
              </div>

              {activeSession === cls.id ? (
                <button
                  onClick={handleEndSession}
                  className="bg-red-600 text-white px-4 py-2 rounded"
                >
                  <Square className="inline w-4 h-4 mr-1" />
                  End
                </button>
              ) : (
                <button
                  onClick={() => handleStartSession(cls.id)}
                  disabled={activeSession !== null}
                  className="bg-green-600 text-white px-4 py-2 rounded disabled:bg-slate-300"
                >
                  <Play className="inline w-4 h-4 mr-1" />
                  Start
                </button>
              )}
            </div>

            {activeSession === cls.id && (
              <div className="grid grid-cols-3 mt-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">{sessionData.present}</div>
                  <p>Present</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-amber-600">{sessionData.marking}</div>
                  <p>Marking</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">{sessionData.absent}</div>
                  <p>Absent</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ISSUES */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-xl font-bold mb-4">Attendance Issues</h2>

        {attendanceIssues.length === 0 && (
          <p className="text-slate-500">No pending issues</p>
        )}

        {attendanceIssues.map(issue => (
          <div key={issue.id} className="border p-4 rounded-lg mb-3">
            <p className="font-semibold">{issue.student}</p>
            <p className="text-sm text-slate-600">{issue.issue}</p>

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleMarkPresent(issue.id)}
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                <CheckCircle className="inline w-4 h-4 mr-1" />
                Approve
              </button>
              <button
                onClick={() => handleRejectIssue(issue.id)}
                className="bg-red-600 text-white px-3 py-1 rounded"
              >
                <XCircle className="inline w-4 h-4 mr-1" />
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
