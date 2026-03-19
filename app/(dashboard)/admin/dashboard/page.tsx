'use client';

import { useState, useEffect } from 'react';
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
          </div>
        </div>
      </header>

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
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
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-xl border border-slate-200">
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
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900">Pending Requests</h2>
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold">
                    {pendingRequests.length}
                  </span>
                </div>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}