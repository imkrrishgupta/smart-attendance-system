'use client';

import { useState, useEffect } from 'react';
<<<<<<< HEAD
=======
import { useRouter } from 'next/navigation';
>>>>>>> dd94954d28c9d9a240a7a5ae128a8faf522446ee
import {
  Users,
  Calendar,
  BarChart3,
  UserPlus,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  BookOpen,
  AlertCircle,
  Settings
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
<<<<<<< HEAD
  const [stats, setStats] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [attendanceTrends, setAttendanceTrends] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const [statsRes, activeSessionsRes, requestsRes, trendsRes] = await Promise.all([
        fetch('/api/admin/dashboard/stats'),
        fetch('/api/admin/dashboard/active-sessions'),
        fetch('/api/admin/requests'),
        fetch('/api/admin/dashboard/trends')
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats([
          { label: 'Total Teachers', value: statsData.totalTeachers, icon: Users, color: 'indigo' },
          { label: 'Total Students', value: statsData.totalStudents, icon: Users, color: 'blue' },
          { label: 'Active Sessions', value: statsData.activeSessions, icon: Clock, color: 'green' },
          { label: 'Avg Attendance', value: statsData.avgAttendance, icon: TrendingUp, color: 'amber' },
        ]);
      }

      if (activeSessionsRes.ok) {
        setRecentActivities(await activeSessionsRes.json());
      }

      if (requestsRes.ok) {
        setPendingRequests(await requestsRes.json());
      }

      if (trendsRes.ok) {
        setAttendanceTrends(await trendsRes.json());
      }
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); // Polling for real-time updates
=======
  const router = useRouter();

  const [stats] = useState([
    { label: 'Total Teachers', value: '48', change: '+3 this month', icon: Users, color: 'indigo' },
    { label: 'Total Students', value: '1,247', change: '+52 this month', icon: Users, color: 'blue' },
    { label: 'Active Sessions', value: '12', change: 'Right now', icon: Clock, color: 'green' },
    { label: 'Avg Attendance', value: '87.3%', change: '+2.1% from last week', icon: TrendingUp, color: 'amber' }
  ]);

  const [recentActivities, setRecentActivities] = useState([
    { id: 1, teacher: 'Dr. Sarah Johnson', subject: 'Machine Learning', status: 'active', students: 45, present: 42 },
    { id: 2, teacher: 'Prof. Michael Chen', subject: 'Data Structures', status: 'active', students: 52, present: 48 },
    { id: 3, teacher: 'Dr. Emily Brown', subject: 'Web Development', status: 'completed', students: 38, present: 35 },
    { id: 4, teacher: 'Prof. James Wilson', subject: 'Database Systems', status: 'active', students: 44, present: 41 }
  ]);

  const [pendingRequests, setPendingRequests] = useState([
    { id: 1, teacher: 'Dr. Sarah Johnson', type: 'Leave', date: '2025-02-05', reason: 'Medical' },
    { id: 2, teacher: 'Prof. Michael Chen', type: 'Class Cancellation', date: '2025-02-03', reason: 'Conference' },
    { id: 3, teacher: 'Dr. Emily Brown', type: 'Leave', date: '2025-02-07', reason: 'Personal' }
  ]);

  const [attendanceTrends] = useState([
    { day: 'Mon', percentage: 85 },
    { day: 'Tue', percentage: 88 },
    { day: 'Wed', percentage: 82 },
    { day: 'Thu', percentage: 90 },
    { day: 'Fri', percentage: 86 }
  ]);

  const handleApproveRequest = (id: number) => {
    setPendingRequests(prev => prev.filter(req => req.id !== id));
  };

  const handleRejectRequest = (id: number) => {
    setPendingRequests(prev => prev.filter(req => req.id !== id));
  };

  const handleAddTeacher = () => {
    router.push('/admin/teachers/new');
  };

  const handleViewSettings = () => {
    router.push('/admin/settings');
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setRecentActivities(prev =>
        prev.map(activity =>
          activity.status === 'active' && activity.present < activity.students
            ? { ...activity, present: Math.min(activity.present + Math.floor(Math.random() * 2), activity.students) }
            : activity
        )
      );
    }, 5000);

>>>>>>> dd94954d28c9d9a240a7a5ae128a8faf522446ee
    return () => clearInterval(interval);
  }, []);

  const handleApproveRequest = async (requestId: string) => {
    try {
      const res = await fetch(`/api/admin/requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' })
      });
      if (res.ok) {
        setPendingRequests(prev => prev.filter(req => req._id !== requestId));
        alert('Request approved!');
      }
    } catch (e) { console.error(e); }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const res = await fetch(`/api/admin/requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' })
      });
      if (res.ok) {
        setPendingRequests(prev => prev.filter(req => req._id !== requestId));
        alert('Request rejected!');
      }
    } catch (e) { console.error(e); }
  };

  const handleAddTeacher = () => {
    window.location.href = '/admin/teachers';
  };

  const handleViewSettings = () => {
    window.location.href = '/admin/settings';
  };

  const colorClasses: any = {
    indigo: 'text-indigo-600 bg-indigo-50',
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    amber: 'text-amber-600 bg-amber-50'
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
<<<<<<< HEAD
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-slate-600 mt-1">Welcome back, Administrator</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleViewSettings}
                className="px-5 py-2.5 bg-white text-slate-700 border-2 border-slate-300 rounded-lg font-medium hover:border-slate-400 transition-colors flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <button
                onClick={handleAddTeacher}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Add Teacher
              </button>
            </div>
=======
        <div className="px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-600 mt-1">Welcome back, Administrator</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleViewSettings}
              className="px-5 py-2.5 bg-white text-slate-700 border-2 border-slate-300 rounded-lg font-medium hover:border-slate-400 transition flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>

            <button
              onClick={handleAddTeacher}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Add Teacher
            </button>
>>>>>>> dd94954d28c9d9a240a7a5ae128a8faf522446ee
          </div>
        </div>
      </header>

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
<<<<<<< HEAD
            const colorClass = colorClasses[stat.color] || 'bg-slate-50 text-slate-600';

            return (
              <div key={index} className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClass}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
                <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
=======
            return (
              <div key={i} className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition">
                <div className="mb-4">
                  <Icon className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                <div className="text-slate-600 font-medium">{stat.label}</div>
                <div className="text-sm text-slate-500">{stat.change}</div>
>>>>>>> dd94954d28c9d9a240a7a5ae128a8faf522446ee
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-xl border border-slate-200">
<<<<<<< HEAD
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900">Active Sessions</h2>
                  <Link href="/admin/analytics" className="text-indigo-600 font-medium hover:text-indigo-700">
                    View Analytics
                  </Link>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div
                      key={activity._id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-slate-900">{activity.subject}</h3>
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                            Live
                          </span>
                        </div>
                        <div className="text-sm text-slate-600">{activity.teacher}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-slate-900">
                          {activity.present}
                        </div>
                        <div className="text-sm text-slate-500">
                          Students Present
                        </div>
                      </div>
                    </div>
                  ))}
                  {recentActivities.length === 0 && (
                    <div className="text-center py-8 text-slate-500 italic">
                      No active sessions currently
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-900">Weekly Attendance Trends</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {attendanceTrends.map((day, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">{day.day}</span>
                        <span className="text-sm font-bold text-slate-900">{day.percentage}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3">
                        <div
                          className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${day.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
=======
              <div className="p-6 border-b border-slate-200 flex justify-between">
                <h2 className="text-xl font-bold text-slate-900">Active Sessions</h2>
              </div>

              <div className="p-6 space-y-4">
                {recentActivities.map(activity => (
                  <div key={activity.id} className="flex justify-between p-4 bg-slate-50 rounded-lg border">
                    <div>
                      <h3 className="font-semibold text-slate-900">{activity.subject}</h3>
                      <p className="text-sm text-slate-600">{activity.teacher}</p>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-bold">
                        {activity.present}/{activity.students}
                      </div>
                      <div className="text-sm text-slate-600">
                        {Math.round((activity.present / activity.students) * 100)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Weekly Attendance Trends</h2>

              {attendanceTrends.map((d, i) => (
                <div key={i} className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{d.day}</span>
                    <span>{d.percentage}%</span>
                  </div>
                  <div className="bg-slate-200 h-3 rounded-full">
                    <div className="bg-indigo-600 h-3 rounded-full" style={{ width: `${d.percentage}%` }} />
                  </div>
>>>>>>> dd94954d28c9d9a240a7a5ae128a8faf522446ee
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="p-6 border-b border-slate-200 flex justify-between">
                <h2 className="text-xl font-bold text-slate-900">Pending Requests</h2>
                <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                  {pendingRequests.length}
                </span>
              </div>

              {pendingRequests.map(req => (
                <div key={req.id} className="p-6 border-t">
                  <p className="font-semibold">{req.type}</p>
                  <p className="text-sm text-slate-600">{req.teacher}</p>

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleApproveRequest(req.id)}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => handleRejectRequest(req.id)}
                      className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm"
                    >
                      Reject
                    </button>
                  </div>
                </div>
<<<<<<< HEAD
              </div>
              <div className="divide-y divide-slate-200">
                {pendingRequests.map((request) => (
                  <div key={request._id} className="p-6">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 mb-1">
                          {request.reason.startsWith('CLASS CANCELLATION') ? 'Cancellation Request' : 'Leave Request'}
                        </h3>
                        <p className="text-sm text-slate-600 mb-1">{request.teacherId?.name || 'Teacher'}</p>
                        <p className="text-xs text-slate-500">{new Date(request.date).toLocaleDateString()} • {request.reason}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveRequest(request._id)}
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request._id)}
                        className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-1"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
                {pendingRequests.length === 0 && (
                  <div className="p-6 text-center text-slate-500">
                    No pending requests
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-900">Quick Actions</h2>
              </div>
              <div className="p-6 space-y-3">
                <Link
                  href="/admin/timetable"
                  className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-3"
                >
                  <Calendar className="w-5 h-5" />
                  Create Timetable
                </Link>
                <Link
                  href="/admin/teachers"
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-3"
                >
                  <UserPlus className="w-5 h-5" />
                  Register Teacher
                </Link>
                <Link
                  href="/admin/analytics"
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-3"
                >
                  <BarChart3 className="w-5 h-5" />
                  View Analytics
                </Link>
              </div>
=======
              ))}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
              <button onClick={handleAddTeacher} className="w-full bg-indigo-600 text-white py-3 rounded-lg flex gap-2 justify-center">
                <UserPlus className="w-5 h-5" />
                Register Teacher
              </button>
>>>>>>> dd94954d28c9d9a240a7a5ae128a8faf522446ee
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
