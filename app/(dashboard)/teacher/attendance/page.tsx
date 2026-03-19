'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle,
  XCircle,
  Users,
  UserCheck,
  UserX,
  RefreshCw,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

interface AttendanceRecord {
  _id: string;
  studentId: { _id: string; name: string; email: string; rollNumber?: string };
  status: string;
  faceVerified: boolean;
  locationVerified: boolean;
  markedBy?: { name: string };
  createdAt: string;
}

interface SessionDetail {
  _id: string;
  subject: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

import { Suspense } from 'react';

// ... (interfaces stay same)

function TeacherAttendanceContent() {
  const { data: authSession } = useSession();
  const teacherId = (authSession?.user as any)?.id || null;
  const searchParams = useSearchParams();
  const sessionIdParam = searchParams.get('sessionId');

  const [sessions, setSessions] = useState<SessionDetail[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState(sessionIdParam || '');
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [sessionInfo, setSessionInfo] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);

  // Fetch teacher's sessions for the dropdown
  useEffect(() => {
    if (!teacherId) return;
    fetch(`/api/attendance/sessions?teacherId=${teacherId}`)
      .then(r => r.json())
      .then(data => setSessions(data))
      .catch(console.error);
  }, [teacherId]);

  // Fetch attendance for selected session
  const fetchAttendance = useCallback(async () => {
    if (!selectedSessionId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/attendance/sessions/${selectedSessionId}`);
      if (res.ok) {
        const data = await res.json();
        setAttendance(data.attendance || []);
        setSessionInfo(data.session || null);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [selectedSessionId]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const handleManualMark = async (studentId: string, status: string) => {
    setMarkingId(studentId);
    try {
      await fetch('/api/attendance/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: selectedSessionId, studentId, status, teacherId })
      });
      fetchAttendance();
    } catch (e) { console.error(e); }
    setMarkingId(null);
  };

  const presentCount = attendance.filter(a => a.status === 'present').length;
  const absentCount = attendance.filter(a => a.status === 'absent').length;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <Link href="/teacher/dashboard" className="hover:text-slate-700 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </Link>
            <span>›</span>
            <span className="text-slate-700">Attendance</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Attendance Management</h1>
        </div>
      </header>

      <div className="p-8 max-w-6xl mx-auto space-y-6">
        {/* Session Picker */}
        <div className="bg-white rounded-xl border p-5">
          <label className="block text-sm font-medium text-slate-700 mb-2">Select Session</label>
          <select
            value={selectedSessionId}
            onChange={e => setSelectedSessionId(e.target.value)}
            className="w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-green-500"
          >
            <option value="">— Choose a session —</option>
            {sessions.map(s => (
              <option key={s._id} value={s._id}>
                {s.subject} — {new Date(s.startTime).toLocaleDateString()} {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {s.isActive ? ' (LIVE)' : ''}
              </option>
            ))}
          </select>
        </div>

        {selectedSessionId && (
          <>
            {/* Stats */}
            {sessionInfo && (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border p-5 flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-800">{attendance.length}</div>
                    <div className="text-xs text-slate-500">Total Records</div>
                  </div>
                </div>
                <div className="bg-white rounded-xl border p-5 flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{presentCount}</div>
                    <div className="text-xs text-slate-500">Present</div>
                  </div>
                </div>
                <div className="bg-white rounded-xl border p-5 flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                    <UserX className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{absentCount}</div>
                    <div className="text-xs text-slate-500">Absent</div>
                  </div>
                </div>
              </div>
            )}

            {/* Attendance List */}
            <div className="bg-white rounded-xl border overflow-hidden">
              <div className="px-5 py-4 border-b flex items-center justify-between">
                <h2 className="font-bold text-slate-800">Student Attendance</h2>
                <button onClick={fetchAttendance} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" /> Refresh
                </button>
              </div>

              {loading ? (
                <div className="p-8 flex items-center justify-center text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading…
                </div>
              ) : attendance.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  No attendance records for this session yet.
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Student</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Roll No</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Verification</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Time</th>
                      <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Manual Mark</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attendance.map(a => (
                      <tr key={a._id} className="hover:bg-slate-50">
                        <td className="px-5 py-3 font-medium text-slate-800 text-sm">{a.studentId?.name || '—'}</td>
                        <td className="px-5 py-3 text-sm text-slate-500">{a.studentId?.rollNumber || '—'}</td>
                        <td className="px-5 py-3">
                          {a.status === 'present' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                              <CheckCircle className="w-3 h-3" /> Present
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                              <XCircle className="w-3 h-3" /> Absent
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-xs text-slate-500">
                          {a.markedBy ? (
                            <span className="text-amber-600">Manual ({a.markedBy.name})</span>
                          ) : (
                            <>
                              Face: {a.faceVerified ? '✓' : '✗'} | Geo: {a.locationVerified ? '✓' : '✗'}
                            </>
                          )}
                        </td>
                        <td className="px-5 py-3 text-xs text-slate-500">
                          {new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-5 py-3 text-right space-x-1">
                          <button
                            onClick={() => handleManualMark(a.studentId._id, 'present')}
                            disabled={markingId === a.studentId._id}
                            className="text-xs px-2.5 py-1 bg-green-100 text-green-700 rounded font-medium hover:bg-green-200 disabled:opacity-50"
                          >
                            Present
                          </button>
                          <button
                            onClick={() => handleManualMark(a.studentId._id, 'absent')}
                            disabled={markingId === a.studentId._id}
                            className="text-xs px-2.5 py-1 bg-red-100 text-red-700 rounded font-medium hover:bg-red-200 disabled:opacity-50"
                          >
                            Absent
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function TeacherAttendance() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    }>
      <TeacherAttendanceContent />
    </Suspense>
  );
}
