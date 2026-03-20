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
  Settings,
  ArrowRight
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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Control Center</h1>
            <div className="flex items-center gap-2 text-slate-500 mt-1 text-sm font-medium">
              <span className="text-indigo-600 font-bold uppercase tracking-widest text-[10px]">Portal</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900 font-semibold italic">Dashboard Overview</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleViewSettings}
              className="px-5 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-xs uppercase tracking-widest hover:border-indigo-600 hover:text-indigo-600 transition-all flex items-center gap-2 shadow-sm active:scale-95"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
            <button
              onClick={handleAddTeacher}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100 active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              Register Teacher
            </button>
          </div>
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto space-y-8 pb-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            const colors: any = {
              indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' },
              blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
              green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100' },
              amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
            };
            const theme = colors[stat.color] || colors.indigo;

            return (
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${theme.bg} border-2 border-white shadow-sm transition-transform group-hover:scale-110`}>
                    <Icon className={`w-6 h-6 ${theme.text}`} />
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-1 tracking-tight">{stat.value}</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            {/* Active Sessions */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Live Nodes
                </h2>
                <Link href="/admin/analytics" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700 transition-colors bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
                  Detailed Analytics
                </Link>
              </div>
              
              <div className="divide-y divide-slate-100">
                {recentActivities.map((activity) => (
                  <div key={activity._id} className="p-6 hover:bg-slate-50 transition-all group">
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                          <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-lg tracking-tight group-hover:text-indigo-600 transition-colors">
                            {activity.subject}
                          </h3>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 font-medium">
                            <span className="uppercase tracking-wider px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold">{activity.teacher}</span>
                            <span className="text-slate-300">•</span>
                            <span className="flex items-center gap-1.5 uppercase tracking-widest text-[10px] font-black">
                              <Users className="w-3.5 h-3.5" /> 
                              {activity.present} Present
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="hidden sm:flex flex-col items-end">
                        <div className="px-3 py-1 bg-green-100/50 text-green-700 rounded-lg text-[10px] font-black uppercase tracking-widest border border-green-200/30">
                          Active Now
                        </div>
                        <div className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Terminal Node Sync</div>
                      </div>
                    </div>
                  </div>
                ))}
                {recentActivities.length === 0 && (
                  <div className="text-center py-20 grayscale opacity-40">
                    <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="font-black uppercase tracking-widest text-slate-400 text-sm">No Active Network Sessions</p>
                  </div>
                )}
              </div>
            </div>

            {/* Attendance Trends */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  Weekly Participation
                </h2>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aggregate Data</span>
              </div>
              
              <div className="space-y-6">
                {attendanceTrends.map((day, index) => (
                  <div key={index} className="group">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{day.day}</span>
                      <span className="text-xs font-black text-slate-900 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">{day.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-700 ease-out shadow-inner"
                        style={{ width: `${day.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            {/* Pending Requests */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Queue</h2>
                <div className="px-2.5 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-amber-100">
                  {pendingRequests.length} Pending
                </div>
              </div>
              
              <div className="divide-y divide-slate-100">
                {pendingRequests.map((request) => (
                  <div key={request._id} className="p-6 transition-colors hover:bg-slate-50/50">
                    <div className="flex items-start gap-4 mb-5">
                      <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center shrink-0 border border-amber-100">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 text-sm tracking-tight mb-1 truncate">
                          {request.reason?.startsWith('CLASS CANCELLATION') ? 'Session Cancellation' : 'Absence Release'}
                        </h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{request.teacherId?.name || 'Authorized Personnel'}</p>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <p className="text-xs text-slate-600 font-medium leading-relaxed italic line-clamp-2">"{request.reason}"</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApproveRequest(request._id)}
                        className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
                      >
                        Authorize
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request._id)}
                        className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-red-500 hover:text-red-500 transition-all shadow-sm active:scale-95"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))}
                {pendingRequests.length === 0 && (
                  <div className="p-12 text-center opacity-40">
                    <CheckCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clear Queue</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions Card-style */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-6 tracking-tight">System Actions</h2>
              <div className="grid grid-cols-1 gap-4">
                {[
                  { label: 'Manage Timetable', href: '/admin/timetable', icon: Calendar, color: 'bg-indigo-600 shadow-indigo-100' },
                  { label: 'Personnel Register', href: '/admin/teachers', icon: UserPlus, color: 'bg-slate-900 shadow-slate-200' },
                  { label: 'Network Analytics', href: '/admin/analytics', icon: BarChart3, color: 'bg-slate-900 shadow-slate-200' },
                ].map((action, i) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={i}
                      href={action.href}
                      className="group flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-600 hover:bg-indigo-50/30 transition-all active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xl ${action.color} transition-transform group-hover:scale-110`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{action.label}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-all group-hover:translate-x-1" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
