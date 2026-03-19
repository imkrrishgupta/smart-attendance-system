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
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { BRANCHES, SEMESTERS } from '@/lib/constants';

interface SessionItem {
  _id: string;
  subject: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
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
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

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
    try {
      const res = await fetch('/api/attendance/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: newSubject,
          teacherId,
          startTime: newStart,
          endTime: newEnd || undefined,
          radius: parseInt(newRadius) || 100,
          branch: newBranch,
          semester: newSemester
        })
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

    // Check if starting too early
    if (!currentActive) {
      const session = sessions.find(s => s._id === sessionId);
      if (session) {
        const startTime = new Date(session.startTime);
        const now = new Date();
        const thirtyMinBefore = new Date(startTime.getTime() - 30 * 60 * 1000);

        if (now < thirtyMinBefore) {
          alert(`You can only start this session 30 minutes before the scheduled time (${startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}).`);
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
      const res = await fetch('/api/teacher/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId,
          date: session.startTime,
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
    { label: 'Total Sessions', value: teacherStats.totalSessions, icon: Calendar, bg: 'bg-indigo-50', text: 'text-indigo-600' },
    { label: 'Active Now', value: teacherStats.activeSessions, icon: Play, bg: 'bg-green-50', text: 'text-green-600' },
    { label: 'Total Present', value: teacherStats.totalPresent, icon: UserCheck, bg: 'bg-blue-50', text: 'text-blue-600' },
    { label: 'Pending Issues', value: teacherStats.pendingIssues, icon: AlertCircle, bg: 'bg-amber-50', text: 'text-amber-600' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Teacher Dashboard</h1>
            <p className="text-slate-500 mt-1">Welcome, {teacherName}</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="px-5 py-2.5 bg-green-600 text-white rounded-lg font-semibold text-sm hover:bg-green-700 transition flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" /> New Session
          </button>
        </div>
      </header>

      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="bg-white rounded-xl p-5 border border-slate-200 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${s.bg}`}>
                  <Icon className={`w-6 h-6 ${s.text}`} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{s.value}</div>
                  <div className="text-sm text-slate-500">{s.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Today's Schedule */}
        <TodaySchedule teacherId={teacherId} onStartSession={(subject, branch, semester) => {
          setNewSubject(subject || '');
          setNewBranch(branch || '');
          setNewSemester(semester || '');
          setShowCreate(true);
        }} />

        {/* Active Sessions */}
        {activeSessions.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <h2 className="text-xl font-bold text-slate-800">Live Sessions</h2>
              <button onClick={fetchSessions} className="ml-auto text-sm text-blue-600 hover:underline flex items-center gap-1">
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>
            <div className="grid gap-4">
              {activeSessions.map(s => (
                <div key={s._id} className="bg-white rounded-xl border-2 border-green-300 p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">{s.subject}</h3>
                      <div className="flex flex-wrap items-center gap-3 mt-1">
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Started {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-sm font-semibold text-amber-600 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Expires {new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleSession(s._id, true)}
                      className="px-5 py-2.5 bg-red-600 text-white rounded-lg font-semibold text-sm hover:bg-red-700 transition flex items-center gap-2"
                    >
                      <Square className="w-4 h-4" /> End Session
                    </button>
                  </div>
                  {/* Real-time stats */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-3xl font-bold text-green-600">{s.presentCount}</div>
                      <div className="text-sm text-green-700 font-medium">Present</div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                      <div className="text-3xl font-bold text-red-600">{s.absentCount}</div>
                      <div className="text-sm text-red-700 font-medium">Absent / Pending</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-3xl font-bold text-blue-600">{s.totalMarked}</div>
                      <div className="text-sm text-blue-700 font-medium">Total Marked</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link
                      href={`/teacher/attendance?sessionId=${s._id}`}
                      className="text-sm text-blue-600 hover:underline font-medium"
                    >
                      View student details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Sessions */}
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-4">All Sessions</h2>
          {loading ? (
            <div className="bg-white rounded-xl border p-8 flex items-center justify-center text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading sessions…
            </div>
          ) : sessions.length === 0 ? (
            <div className="bg-white rounded-xl border p-8 text-center text-slate-400">
              No sessions yet. Create your first session above.
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Subject</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Date / Time</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Attendance</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sessions.map(s => (
                    <tr key={s._id} className="hover:bg-slate-50 transition">
                      <td className="px-5 py-4 font-medium text-slate-800">{s.subject}</td>
                      <td className="px-5 py-4 text-sm text-slate-500 font-medium">
                        {new Date(s.startTime).toLocaleDateString()}{' '}
                        <span className="text-slate-400">
                          {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {' '}-{' '}
                          {new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {s.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Live
                          </span>
                        ) : (
                          new Date() > new Date(s.endTime) ? (
                            <span className="px-2.5 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold border border-red-100">
                              Expired
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">
                              Pending
                            </span>
                          )
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm">
                        <span className="text-green-600 font-semibold">{s.presentCount}</span>
                        <span className="text-slate-400 mx-1">/</span>
                        <span className="text-slate-600">{s.totalMarked}</span>
                      </td>
                      <td className="px-5 py-4 text-right space-x-2">
                        {s.isActive ? (
                          <button onClick={() => toggleSession(s._id, true)} className="text-xs px-3 py-1.5 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200">
                            Stop
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleSession(s._id, false)}
                            disabled={new Date() > new Date(s.endTime)}
                            className="text-xs px-3 py-1.5 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 disabled:opacity-50 disabled:bg-slate-100 disabled:text-slate-400"
                          >
                            Start
                          </button>
                        )}
                        <Link href={`/teacher/attendance?sessionId=${s._id}`} className="text-xs px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200">
                          View
                        </Link>
                        <button onClick={() => deleteSession(s._id)} className="text-xs px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg font-medium hover:bg-slate-200">
                          Delete
                        </button>
                        {!s.isActive && new Date() < new Date(s.startTime) && (
                          <button onClick={() => handleCancelSession(s)} className="text-xs px-3 py-1.5 bg-amber-100 text-amber-600 rounded-lg font-medium hover:bg-amber-200">
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Link href="/teacher/issues" className="bg-white rounded-xl border p-5 hover:border-blue-300 transition flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center"><AlertCircle className="w-5 h-5 text-purple-600" /></div>
            <span className="font-semibold text-slate-700">Student Issues</span>
          </Link>
          <Link href="/teacher/requests" className="bg-white rounded-xl border p-5 hover:border-blue-300 transition flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center"><Calendar className="w-5 h-5 text-amber-600" /></div>
            <span className="font-semibold text-slate-700">Leave Requests</span>
          </Link>
        </div>
      </div>

      {/* Create Session Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">Create Attendance Session</h3>
              <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={newSubject}
                  onChange={e => setNewSubject(e.target.value)}
                  placeholder="e.g. Machine Learning"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
                  <input
                    type="datetime-local"
                    value={newStart}
                    onChange={e => setNewStart(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
                  <input
                    type="datetime-local"
                    value={newEnd}
                    onChange={e => setNewEnd(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Branch</label>
                  <select
                    value={newBranch}
                    onChange={e => setNewBranch(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                    required
                  >
                    <option value="" disabled>Select Branch</option>
                    {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Semester</label>
                  <select
                    value={newSemester}
                    onChange={e => setNewSemester(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                    required
                  >
                    <option value="" disabled>Select Semester</option>
                    {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
              </div>

              {/* Geo-Fence */}
              <div className="border rounded-lg p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700 flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-slate-400" /> Geo-Fence Location
                  </span>
                  <button onClick={useMyLocation} className="text-xs text-blue-600 hover:underline">
                    Use my location
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs text-slate-500">Latitude</label>
                    <input type="text" value={geoLat} onChange={e => setGeoLat(e.target.value)} placeholder="0.0" className="w-full px-2 py-1.5 border rounded text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Longitude</label>
                    <input type="text" value={geoLng} onChange={e => setGeoLng(e.target.value)} placeholder="0.0" className="w-full px-2 py-1.5 border rounded text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Radius (m)</label>
                    <input type="text" value={newRadius} onChange={e => setNewRadius(e.target.value)} placeholder="100" className="w-full px-2 py-1.5 border rounded text-sm" />
                  </div>
                </div>
              </div>

              <button
                onClick={handleCreateSession}
                disabled={creating || !newSubject || !newStart || !newBranch || !newSemester}
                className="w-full py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Creating…' : 'Create Session'}
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

  useEffect(() => {
    if (teacherId) {
      fetch(`/api/teacher/timetable?teacherId=${teacherId}`)
        .then(res => res.json())
        .then(data => {
          const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const today = days[new Date().getDay()];
          const todayClasses = data.filter((item: any) => item.day === today);
          setSchedule(todayClasses);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [teacherId]);

  if (loading) return null;
  if (schedule.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Calendar className="w-5 h-5 text-slate-400" />
        <h2 className="text-xl font-bold text-slate-800">Today's Schedule</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {schedule.map((slot, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 hover:border-indigo-300 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded">
                  {slot.startTime} - {slot.endTime}
                </span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{slot.room}</span>
              </div>
              <h3 className="font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{slot.subject}</h3>
            </div>
            <button
              onClick={() => onStartSession(slot.subject, slot.branch, slot.semester)}
              className="mt-4 text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group/btn"
            >
              Start Attendance Session
              <Plus className="w-3 h-3 group-hover/btn:scale-125 transition-transform" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
