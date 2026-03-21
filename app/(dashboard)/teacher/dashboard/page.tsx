'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
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
  Plus,
  MapPin,
  RefreshCw,
  Loader2,
  ChevronRight,
  ArrowRight,
  X,
  Zap,
  Check
} from 'lucide-react';
import Link from 'next/link';
import { BRANCHES, SEMESTERS } from '@/lib/constants';

interface SessionItem {
  _id: string;
  subject: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  branch?: string;
  semester?: string;
  geoLocation?: { lat: number; lng: number; radius: number };
  presentCount: number;
  absentCount: number;
  totalMarked: number;
}

export default function TeacherDashboard() {
  const { data: authSession } = useSession();
  const teacherId = (authSession?.user as any)?.id || null;
  const teacherName = authSession?.user?.name || 'Teacher';

  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSchedule, setLoadingSchedule] = useState(true);

  // Create Session modal
  const [showCreate, setShowCreate] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');
  const [newRadius, setNewRadius] = useState('100');
  const [geoLat, setGeoLat] = useState('');
  const [geoLng, setGeoLng] = useState('');
  const [newBranch, setNewBranch] = useState(BRANCHES[0]);
  const [newSemester, setNewSemester] = useState(SEMESTERS[0]);
  const [creating, setCreating] = useState(false);

  const fetchSessions = useCallback(async () => {
    if (!teacherId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/attendance/sessions?teacherId=${teacherId}`);
      if (res.ok) setSessions(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [teacherId]);

  const fetchTodaySchedule = useCallback(async () => {
    if (!teacherId) return;
    setLoadingSchedule(true);
    try {
      const res = await fetch(`/api/teacher/timetable?teacherId=${teacherId}`);
      if (res.ok) {
        const data = await res.json();
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const todayName = days[new Date().getDay()];
        const todayClasses = data.filter((item: any) => item.day === todayName);
        setTodaySchedule(todayClasses);
      }
    } catch (e) { console.error(e); }
    setLoadingSchedule(false);
  }, [teacherId]);

  useEffect(() => {
    fetchSessions();
    fetchTodaySchedule();
  }, [fetchSessions, fetchTodaySchedule]);

  // Polling for active sessions
  useEffect(() => {
    const hasActive = sessions.some(s => s.isActive);
    if (!hasActive) return;
    const interval = setInterval(fetchSessions, 8000);
    return () => clearInterval(interval);
  }, [sessions, fetchSessions]);

  const handleCreateSession = async () => {
    if (!newSubject || !newStart || !teacherId) return;
    setCreating(true);
    const payload = {
      subject: newSubject,
      teacherId,
      startTime: newStart,
      endTime: newEnd || undefined,
      lat: parseFloat(geoLat) || undefined,
      lng: parseFloat(geoLng) || undefined,
      radius: parseInt(newRadius) || 100,
      branch: newBranch,
      semester: newSemester
    };
    console.log('[Teacher Dashboard] Creating session with payload:', payload);

    try {
      const res = await fetch('/api/attendance/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowCreate(false);
        setNewSubject('');
        setNewStart('');
        setNewEnd('');
        setGeoLat('');
        setGeoLng('');
        setNewBranch(BRANCHES[0]);
        setNewSemester(SEMESTERS[0]);
        fetchSessions();
      }
    } catch (e) { console.error(e); }
    setCreating(false);
  };

  const toggleSession = async (sessionId: string, currentActive: boolean) => {
    const action = currentActive ? 'Stop' : 'Start';

    if (!currentActive) {
      const session = sessions.find(s => s._id === sessionId);
      if (session) {
        const startTime = new Date(session.startTime);
        const now = new Date();
        if (now < startTime) {
          alert(`You can only start this session at the scheduled time (${startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}).`);
          return;
        }
      }
    }

    if (currentActive && !confirm(`${action} this session?`)) return;
    try {
      await fetch(`/api/attendance/sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentActive })
      });
      fetchSessions();
    } catch (e) { console.error(e); }
  };

  const deleteSession = async (sessionId: string) => {
    if (!confirm('Delete this session and all its attendance records?')) return;
    try {
      await fetch(`/api/attendance/sessions/${sessionId}`, { method: 'DELETE' });
      fetchSessions();
    } catch (e) { console.error(e); }
  };

  const handleCancelSession = async (session: SessionItem) => {
    if (!confirm(`Are you sure you want to request cancellation for ${session.subject}? This will notify the admin.`)) return;
    try {
      const res = await fetch('/api/teacher/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId,
          startDate: session.startTime,
          endDate: session.endTime,
          reason: `CLASS CANCELLATION: ${session.subject} scheduled for ${new Date(session.startTime).toLocaleString()}`,
          status: 'pending'
        })
      });
      if (res.ok) {
        alert('Cancellation request submitted to Admin.');
      }
    } catch (e) { console.error(e); }
  };

  const useMyLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLat(pos.coords.latitude.toFixed(6));
        setGeoLng(pos.coords.longitude.toFixed(6));
      },
      () => alert('Could not get your location')
    );
  };

  const [teacherStats, setTeacherStats] = useState({
    totalSessions: 0,
    activeSessions: 0,
    totalPresent: 0,
    pendingIssues: 0
  });

  const fetchStats = useCallback(async () => {
    if (!teacherId) return;
    try {
      const res = await fetch(`/api/teacher/dashboard/stats?teacherId=${teacherId}`);
      if (res.ok) setTeacherStats(await res.json());
    } catch (e) { console.error(e); }
  }, [teacherId]);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const activeSessions = sessions.filter(s => s.isActive);

  const stats = [
    { label: 'Total Sessions', value: teacherStats.totalSessions, icon: Calendar, color: 'indigo' },
    { label: 'Live Now', value: teacherStats.activeSessions, icon: Zap, color: 'emerald' },
    { label: 'Avg Attendance', value: teacherStats.totalPresent, icon: UserCheck, color: 'blue' },
    { label: 'Open Issues', value: teacherStats.pendingIssues, icon: AlertCircle, color: 'amber' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Faculty Dashboard</h1>
            <div className="flex items-center gap-2 text-slate-500 mt-1 text-sm font-medium">
              <span className="text-slate-900 font-semibold italic">Welcome, {teacherName}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowCreate(true)}
              className="px-6 py-4 bg-slate-900 text-white rounded-2xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-slate-200"
            >
              <Plus className="w-4 h-4" /> Initiate Session
            </button>
          </div>
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto space-y-10 pb-20">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all">
              <div className={`absolute top-0 right-0 w-24 h-24 bg-${s.color}-50 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform`} />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">{s.label}</p>
              <div className="flex items-baseline gap-2 relative z-10">
                <h3 className={`text-3xl font-black text-${s.color}-600 tracking-tight`}>{s.value}</h3>
                <s.icon className={`w-4 h-4 text-${s.color}-400`} />
              </div>
            </div>
          ))}
        </div>

        {/* Today's Schedule Section */}
        <TodaySchedule teacherId={teacherId} onStartSession={(subject, branch, semester) => {
          setNewSubject(subject || '');
          setNewBranch(branch || '');
          setNewSemester(semester || '');
          setShowCreate(true);
        }} />

        {/* Live Monitoring Section */}
        {activeSessions.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-100 animate-pulse">
                  <Play className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase tracking-widest">Active Operations</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Real-time attendance ingestion</p>
                </div>
              </div>
              <button 
                onClick={fetchSessions}
                className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>

            <div className="grid gap-6">
              {activeSessions.map(s => (
                <div key={s._id} className="bg-white rounded-[40px] border-2 border-emerald-500/20 shadow-2xl shadow-emerald-50 overflow-hidden group">
                  <div className="p-10 border-b border-slate-50 flex flex-col lg:flex-row justify-between gap-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">Live Execution</span>
                        <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest italic">{s.subject}</span>
                      </div>
                      <h3 className="text-3xl font-black text-slate-900 tracking-tight">{s.subject}</h3>
                      <div className="flex flex-wrap items-center gap-5 text-slate-500">
                        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                          <Clock className="w-4 h-4 text-emerald-500" />
                          <span className="text-xs font-bold font-mono">Started: {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-rose-50 px-4 py-2 rounded-xl border border-rose-100">
                          <Clock className="w-4 h-4 text-rose-500" />
                          <span className="text-xs font-bold font-mono text-rose-600 uppercase tracking-widest">Expires: {new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <Link
                          href={`/teacher/attendance?sessionId=${s._id}`}
                          className="px-8 py-5 bg-slate-900 text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-xl hover:scale-105 active:scale-95 transition-all"
                        >
                          Telemetry Feed <ArrowRight className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => toggleSession(s._id, true)}
                          className="p-5 bg-rose-50 text-rose-600 rounded-[24px] border border-rose-100 hover:bg-rose-100 transition-all shadow-sm"
                          title="Terminate Session"
                        >
                          <Square className="w-6 h-6 fill-current" />
                        </button>
                    </div>
                  </div>
                  
                  <div className="p-10 bg-slate-50 grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-[32px] border border-slate-200">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Present Logins</p>
                      <h4 className="text-4xl font-black text-emerald-600 tracking-tighter">{s.presentCount}</h4>
                    </div>
                    <div className="bg-white p-6 rounded-[32px] border border-slate-200">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pending / Absent</p>
                      <h4 className="text-4xl font-black text-rose-600 tracking-tighter">{s.absentCount}</h4>
                    </div>
                    <div className="bg-white p-6 rounded-[32px] border border-slate-200 md:col-span-1 col-span-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Registry Completion</p>
                      <div className="flex items-center gap-4">
                        <h4 className="text-4xl font-black text-slate-900 tracking-tighter">
                          {Math.round((s.presentCount / (s.presentCount + s.absentCount)) * 100) || 0}%
                        </h4>
                        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 transition-all duration-1000" 
                            style={{ width: `${Math.round((s.presentCount / (s.presentCount + s.absentCount)) * 100) || 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Daily Schedule (Admin Allotted) */}
        <div className="space-y-6 pt-10 border-t border-slate-200">
          <div className="flex items-center gap-4 px-2">
            <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100 shadow-sm">
              <Calendar className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase tracking-widest">Daily Schedule</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Admin Allotted Instructional Modules</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loadingSchedule ? (
              [1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm animate-pulse h-32" />
              ))
            ) : todaySchedule.length === 0 ? (
              <div className="col-span-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px] p-12 text-center">
                 <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">No Allotted Classes for Today</p>
              </div>
            ) : (
              todaySchedule.map((item, idx) => (
                <div key={idx} className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 rounded-full -mr-8 -mt-8 group-hover:scale-110 transition-transform" />
                   <div className="flex justify-between items-start mb-4 relative z-10">
                      <span className="px-3 py-1 bg-slate-900 text-white text-[9px] font-black rounded-lg uppercase tracking-widest">
                        {item.startTime}
                      </span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {item.room}
                      </span>
                   </div>
                   <h4 className="text-sm font-black text-slate-900 mb-2 truncate uppercase tracking-tight">{item.subject}</h4>
                   <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        {item.branch} • SEM {item.semester}
                      </span>
                   </div>
                   <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[8px] font-black text-slate-300 uppercase">Synchronized Matrix</span>
                      <ArrowRight className="w-3 h-3 text-indigo-400" />
                   </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Historical Registry List */}
        <div className="bg-white rounded-[48px] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase tracking-widest">Attendance Archive</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Previous 50 instructional sessions</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Session Logic</th>
                  <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                  <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Operational Status</th>
                  <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Metric</th>
                  <th className="px-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sessions.map(s => (
                  <tr key={s._id} className="group hover:bg-slate-50/50 transition-all">
                    <td className="px-10 py-6">
                      <p className="text-sm font-black text-slate-900 tracking-tight">{s.subject}</p>
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">
                        {s.branch || 'N/A'} // Sem {s.semester || 'N/A'}
                      </p>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-500">{new Date(s.startTime).toLocaleDateString()}</span>
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                          {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      {s.isActive ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-200">
                          <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse" /> Live Now
                        </div>
                      ) : (
                        new Date() > new Date(s.endTime) ? (
                          <div className="inline-flex items-center px-3 py-1.5 bg-slate-100 text-slate-400 rounded-full text-[9px] font-black uppercase tracking-widest">
                            Archive Complete
                          </div>
                        ) : (
                          <div className="inline-flex items-center px-3 py-1.5 bg-amber-50 text-amber-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-amber-100">
                            Pre-Execution
                          </div>
                        )
                      )}
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-2">
                         <span className="text-sm font-black text-indigo-600">{s.presentCount}</span>
                         <span className="text-slate-300">/</span>
                         <span className="text-xs font-bold text-slate-400">{s.totalMarked}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-right space-x-2">
                       {s.isActive ? (
                          <button onClick={() => toggleSession(s._id, true)} className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all">
                            Terminate
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleSession(s._id, false)}
                            disabled={new Date() > new Date(s.endTime)}
                            className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-emerald-50 disabled:hover:text-emerald-600"
                          >
                            Initiate
                          </button>
                        )}
                        <Link href={`/teacher/attendance?sessionId=${s._id}`} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all inline-block">
                          Metrics
                        </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {sessions.length === 0 && !loading && (
               <div className="p-20 text-center">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Zero session data detected in registry</p>
               </div>
            )}
          </div>
        </div>

        {/* Intelligence Links */}
        <div className="grid sm:grid-cols-2 gap-6 pb-12">
          <Link href="/teacher/issues" className="group bg-white rounded-[32px] border border-slate-200 p-8 hover:border-indigo-600 transition-all flex items-center justify-between shadow-sm hover:shadow-2xl">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-900 tracking-tight">Support Incidents</h4>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Review student attendance disputes</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/teacher/requests" className="group bg-white rounded-[32px] border border-slate-200 p-8 hover:border-amber-600 transition-all flex items-center justify-between shadow-sm hover:shadow-2xl">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-400 group-hover:bg-amber-600 group-hover:text-white transition-all">
                <Calendar className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-900 tracking-tight">Protocol Modification</h4>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Leave & schedule cancellation vault</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </main>

      {/* Initiation Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between p-10 border-b border-slate-100 bg-white">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase tracking-widest">Start Session</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Configure instructional metadata</p>
                </div>
              </div>
              <button 
                onClick={() => setShowCreate(false)} 
                className="w-12 h-12 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-10 space-y-8">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Academic Subject</label>
                <input
                  type="text"
                  value={newSubject}
                  onChange={e => setNewSubject(e.target.value)}
                  placeholder="e.g., QUANTUM CRYPTOGRAPHY"
                  className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[24px] text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Initiation</label>
                  <input
                    type="datetime-local"
                    value={newStart}
                    onChange={e => setNewStart(e.target.value)}
                    className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[24px] text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expiration</label>
                  <input
                    type="datetime-local"
                    value={newEnd}
                    onChange={e => setNewEnd(e.target.value)}
                    className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[24px] text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Faculty</label>
                  <select
                    value={newBranch}
                    onChange={e => setNewBranch(e.target.value)}
                    className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[24px] text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  >
                    {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Term</label>
                  <select
                    value={newSemester}
                    onChange={e => setNewSemester(e.target.value)}
                    className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[24px] text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  >
                    {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
              </div>

              <div className="bg-slate-50 rounded-[32px] p-6 space-y-4 border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-indigo-500" /> Geo-Fence Protocol
                  </span>
                  <button onClick={useMyLocation} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">
                    Auto-Detect
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <input type="text" value={geoLat} onChange={e => setGeoLat(e.target.value)} placeholder="Lat" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 text-center" />
                  </div>
                  <div>
                    <input type="text" value={geoLng} onChange={e => setGeoLng(e.target.value)} placeholder="Lng" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 text-center" />
                  </div>
                  <div>
                    <input type="text" value={newRadius} onChange={e => setNewRadius(e.target.value)} placeholder="Rad (m)" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 text-center" />
                  </div>
                </div>
              </div>

              <button
                onClick={handleCreateSession}
                disabled={creating || !newSubject || !newStart}
                className="w-full py-6 bg-slate-900 text-white rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-slate-200 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 disabled:hover:scale-100 flex items-center justify-center gap-4"
              >
                {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                {creating ? 'Establishing Connection...' : 'Activate Operational Session'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TodaySchedule({ teacherId, onStartSession }: { teacherId: string | null; onStartSession: (subject: string, branch: string, semester: string) => void }) {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (teacherId) {
      fetch(`/api/teacher/timetable?teacherId=${teacherId}`)
        .then(res => res.json())
        .then(data => {
          const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const today = days[currentTime.getDay()];
          const todayClasses = data.filter((item: any) => item.day === today);
          setSchedule(todayClasses);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [teacherId, currentTime]);

  if (loading || schedule.length === 0) return null;

  const isTimePassed = (timeStr: string) => {
    if (!timeStr) return false;
    const time = timeStr.split(' ')[0];
    const [hours, minutes] = time.split(':').map(Number);
    const scheduledTime = new Date();
    let adjustedHours = hours;
    if (timeStr.toLowerCase().includes('pm') && hours < 12) adjustedHours += 12;
    if (timeStr.toLowerCase().includes('am') && hours === 12) adjustedHours = 0;
    scheduledTime.setHours(adjustedHours, minutes, 0, 0);
    return currentTime > scheduledTime;
  };

  const isTimeBefore = (timeStr: string) => {
    if (!timeStr) return false;
    const time = timeStr.split(' ')[0];
    const [hours, minutes] = time.split(':').map(Number);
    const scheduledTime = new Date();
    let adjustedHours = hours;
    if (timeStr.toLowerCase().includes('pm') && hours < 12) adjustedHours += 12;
    if (timeStr.toLowerCase().includes('am') && hours === 12) adjustedHours = 0;
    scheduledTime.setHours(adjustedHours, minutes, 0, 0);
    return currentTime < scheduledTime;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
          <Calendar className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase tracking-widest">Instructional Manifest</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Scheduled sessions for the current solar cycle</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schedule.map((slot, i) => {
          const expired = isTimePassed(slot.endTime);
          const tooEarly = isTimeBefore(slot.startTime);
          const isCancelled = slot.isCancelled || slot.exceptionInfo?.status === 'cancelled';
          const isSubstitution = slot.isSubstitution;

          return (
            <div key={i} className={`bg-white rounded-[40px] border ${isCancelled ? 'border-red-100 bg-red-50/10' : 'border-slate-200'} p-8 hover:border-indigo-600 transition-all flex flex-col justify-between group shadow-sm hover:shadow-2xl relative overflow-hidden`}>
              {isSubstitution && (
                <div className="absolute top-0 right-0 p-3 bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest rounded-bl-2xl">
                   Substitution
                </div>
              )}
              {isCancelled && (
                <div className="absolute top-0 right-0 p-3 bg-red-500 text-white text-[8px] font-black uppercase tracking-widest rounded-bl-2xl">
                   Cancelled
                </div>
              )}

              <div>
                <div className="flex justify-between items-start mb-6">
                  <span className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${expired || isCancelled || tooEarly ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-500 border border-indigo-100'}`}>
                    {slot.startTime} - {slot.endTime}
                  </span>
                  <div className="px-3 py-1.5 bg-slate-900 rounded-full text-[9px] font-black text-white uppercase tracking-widest">
                    {slot.room}
                  </div>
                </div>
                <h3 className={`text-xl font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors tracking-tight leading-tight ${isCancelled ? 'line-through opacity-40' : ''}`}>{slot.subject}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {slot.branch} • Sem {slot.semester}
                  {isSubstitution && <span className="text-emerald-600 ml-2">(Covering: {slot.originalTeacher})</span>}
                </p>
              </div>
              
              {isCancelled ? (
                <div className="mt-8 pt-4 border-t border-slate-50 flex items-center gap-2 text-[10px] font-black text-red-400 uppercase tracking-widest">
                  <XCircle className="w-4 h-4 opacity-30" />
                  Leave Authorized
                </div>
              ) : expired ? (
                <div className="mt-8 pt-4 border-t border-slate-50 flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                  <XCircle className="w-4 h-4 opacity-30" />
                  Temporal Window Closed
                </div>
              ) : tooEarly ? (
                <div className="mt-8 pt-4 border-t border-slate-50 flex items-center gap-2 text-[10px] font-black text-amber-500 uppercase tracking-widest">
                  <Clock className="w-4 h-4 opacity-30 animate-pulse" />
                  Activation Pending
                </div>
              ) : (
                <button
                  onClick={() => onStartSession(slot.subject, slot.branch, slot.semester)}
                  className="mt-8 group/btn px-6 py-4 bg-indigo-50 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  Initiate session
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
