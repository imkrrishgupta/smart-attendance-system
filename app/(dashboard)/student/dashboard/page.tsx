'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
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
  XCircle,
  X
} from 'lucide-react';
import Link from 'next/link';

import FaceCapture from '@/components/attendance/FaceCapture';

interface ActiveSession {
  _id: string;
  subject: string;
  startTime: string;
  endTime: string;
  teacherId: { name: string };
  isActive: boolean;
}

export default function StudentDashboard() {
  const { data: session } = useSession();
  const studentId = (session?.user as any)?.id || null;
  const studentName = session?.user?.name || 'Student';
  const rollNo = (session?.user as any)?.email || '';

  // Sessions
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [markedSessionIds, setMarkedSessionIds] = useState<string[]>([]);

  // Verification Modal
  const [verifyingSession, setVerifyingSession] = useState<ActiveSession | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'checking' | 'success' | 'failed'>('idle');
  const [locationMsg, setLocationMsg] = useState('');
  const [faceStatus, setFaceStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [faceMsg, setFaceMsg] = useState('');

  // Stats (fetched from API)
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0, percentage: '0' });

  // Registration Status
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null);


  useEffect(() => {
    if (studentId) {
      fetchActiveSessions();
      fetchAttendanceStats();
      checkRegistration();
    }
  }, [studentId]);

  const checkRegistration = async () => {
    try {
      const res = await fetch(`/api/student/registration-status?studentId=${studentId}`);
      if (res.ok) {
        const { isRegistered } = await res.json();
        setIsRegistered(isRegistered);
      }
    } catch (e) { console.error(e); }
  };

  const fetchActiveSessions = async () => {
    try {
      const res = await fetch('/api/attendance/sessions');
      if (res.ok) {
        const data = await res.json();
        const activeOnly = data.filter((s: ActiveSession) => s.isActive);
        setActiveSessions(activeOnly);
      }
    } catch (e) { console.error(e); }

    // Also check which sessions are already marked
    if (studentId) {
      try {
        const res = await fetch(`/api/attendance?studentId=${studentId}`);
        if (res.ok) {
          const records = await res.json();
          setMarkedSessionIds(records.map((r: any) => r.sessionId?._id || r.sessionId));
        }
      } catch (e) { console.error(e); }
    }
  };

  const fetchAttendanceStats = async () => {
    try {
      const [recordsRes, allSessionsRes] = await Promise.all([
        fetch(`/api/attendance?studentId=${studentId}`),
        fetch('/api/attendance/sessions')
      ]);

      if (recordsRes.ok && allSessionsRes.ok) {
        const records = await recordsRes.json();
        const allSessions = await allSessionsRes.json();

        const present = records.filter((r: any) => r.status === 'present').length;
        // Total sessions that have already ended
        const totalEnded = allSessions.filter((s: any) => new Date(s.endTime) < new Date()).length;

        setStats({
          total: totalEnded,
          present,
          absent: Math.max(0, totalEnded - present),
          percentage: totalEnded > 0 ? ((present / totalEnded) * 100).toFixed(1) : '0'
        });
      }
    } catch (e) { console.error(e); }
  };

  // ── Verification Flow ──

  const openVerification = (session: ActiveSession) => {
    setVerifyingSession(session);
    setLocationStatus('idle');
    setFaceStatus('idle');
    setLocationMsg('');
    setFaceMsg('');
  };

  const closeVerification = () => {
    setVerifyingSession(null);
  };

  const verifyLocation = () => {
    setLocationStatus('checking');
    setLocationMsg('Getting your location…');

    if (!navigator.geolocation) {
      setLocationStatus('failed');
      setLocationMsg('Geolocation not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setLocationMsg('Verifying with server…');
        try {
          const res = await fetch('/api/geofence', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: verifyingSession?._id,
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude
            })
          });
          const data = await res.json();
          if (res.ok && data.isInside) {
            setLocationStatus('success');
            setLocationMsg(`Inside classroom (${data.distance}m away)`);
          } else {
            setLocationStatus('failed');
            setLocationMsg(data.error || `Outside geo-fence (${data.distance}m > ${data.allowedRadius}m)`);
          }
        } catch {
          setLocationStatus('failed');
          setLocationMsg('Server error while verifying location.');
        }
      },
      (err) => {
        setLocationStatus('failed');
        setLocationMsg(`Location error: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const confirmAttendance = async () => {
    if (!verifyingSession) return;
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: verifyingSession._id,
          studentId,
          faceVerified: true,
          locationVerified: true
        })
      });
      if (res.ok) {
        setMarkedSessionIds(prev => [...prev, verifyingSession._id]);
        closeVerification();
        fetchAttendanceStats();
      }
    } catch (e) { console.error(e); }
  };

  // ── Render ──

  const statCards = [
    { label: 'Total Classes', value: stats.total, icon: BookOpen, bg: 'bg-indigo-50', text: 'text-indigo-600' },
    { label: 'Present', value: stats.present, icon: CheckCircle, bg: 'bg-green-50', text: 'text-green-600' },
    { label: 'Absent / Pending', value: stats.absent, icon: XCircle, bg: 'bg-red-50', text: 'text-red-600' },
    { label: 'Attendance %', value: `${stats.percentage}%`, icon: TrendingUp, bg: 'bg-blue-50', text: 'text-blue-600' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Student Dashboard</h1>
              <p className="text-slate-600 mt-1">Welcome back, {studentName}</p>
            </div>
            <div className="text-right text-sm text-slate-500">
              <div>{rollNo}</div>
            </div>
          </div>
        </div>
      </header>

      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
        {/* Registration Warning */}
        {isRegistered === false && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-amber-900 text-lg">Biometrics Not Registered</h3>
                <p className="text-amber-700 text-sm">You must enroll your face data before you can mark attendance for any session.</p>
              </div>
            </div>
            <Link 
              href="/student/settings" 
              className="px-6 py-2.5 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition whitespace-nowrap"
            >
              Register Now
            </Link>
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${s.bg}`}>
                    <Icon className={`w-6 h-6 ${s.text}`} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-1">{s.value}</div>
                <div className="text-sm text-slate-500 font-medium">{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* Active Sessions */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Active Sessions</h2>
              <button onClick={fetchActiveSessions} className="text-indigo-600 font-medium hover:text-indigo-700">
                Refresh
              </button>
            </div>
          </div>
          <div className="p-6">
            {activeSessions.length === 0 ? (
              <div className="text-center text-slate-500 py-8 italic">
                No active sessions right now.
              </div>
            ) : (
              <div className="space-y-4">
                {activeSessions.map(session => {
                  const isMarked = markedSessionIds.includes(session._id);
                  return (
                    <div key={session._id} className={`flex items-center justify-between p-4 bg-slate-50 rounded-lg border transition-colors ${isMarked ? 'border-green-200 bg-green-50' : 'border-slate-200 hover:border-slate-300'}`}>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-slate-900">{session.subject}</h3>
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                            Live
                          </span>
                        </div>
                        <div className="text-sm text-slate-600">
                          <div className="flex flex-wrap gap-4">
                            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span>Teacher: {session.teacherId?.name || '—'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        {isMarked ? (
                          <span className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold text-sm whitespace-nowrap">
                            <CheckCircle className="w-4 h-4" /> Marked
                          </span>
                        ) : (
                          <button
                            onClick={() => openVerification(session)}
                            disabled={!isRegistered}
                            className={`px-6 py-2 rounded-lg font-semibold text-sm transition flex items-center gap-2 whitespace-nowrap ${
                              isRegistered 
                                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            <Camera className="w-4 h-4" /> Mark
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">Quick Actions</h2>
          </div>
          <div className="p-6 grid sm:grid-cols-3 gap-4">
            <Link href="/student/mark-attendance" className="px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-3">
              <Camera className="w-5 h-5" />
              All Sessions
            </Link>
            <Link href="/student/attendance-history" className="px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition flex items-center gap-3">
              <BookOpen className="w-5 h-5" />
              History
            </Link>
            <Link href="/student/issues" className="px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              Raise Issue
            </Link>
          </div>
        </div>
        </div>
      </div>

      {/* ── Verification Modal ── */}
      {verifyingSession && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b bg-slate-50">
              <div>
                <h3 className="font-bold text-lg text-slate-800">Attendance Verification</h3>
                <p className="text-sm text-slate-500">{verifyingSession.subject}</p>
              </div>
              <button onClick={closeVerification} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-5 space-y-5">
              {/* Step 1: Location */}
              <div className="border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="flex items-center gap-2 font-semibold text-slate-700">
                    <MapPin className="w-5 h-5 text-slate-400" /> Step 1 — Geo-Location
                  </span>
                  {locationStatus === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                  {locationStatus === 'failed' && <XCircle className="w-5 h-5 text-red-500" />}
                </div>
                {locationStatus === 'idle' && (
                  <button onClick={verifyLocation} className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition">
                    Check My Location
                  </button>
                )}
                {locationStatus !== 'idle' && (
                  <p className={`text-sm ${locationStatus === 'failed' ? 'text-red-600' : locationStatus === 'success' ? 'text-green-600' : 'text-slate-500'}`}>{locationMsg}</p>
                )}
              </div>

              {/* Step 2: Face */}
              <div className={`border rounded-xl p-4 transition ${locationStatus !== 'success' ? 'opacity-40 pointer-events-none' : ''}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="flex items-center gap-2 font-semibold text-slate-700">
                    <Camera className="w-5 h-5 text-slate-400" /> Step 2 — Face Recognition
                  </span>
                  {faceStatus === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                  {faceStatus === 'failed' && <XCircle className="w-5 h-5 text-red-500" />}
                </div>

                {faceStatus !== 'success' && (
                  <FaceCapture
                    studentId={studentId}
                    onVerified={(conf) => {
                      setFaceStatus('success');
                      setFaceMsg(`Verified — Confidence ${conf}%`);
                    }}
                    onFailed={(err) => {
                      setFaceStatus('failed');
                      setFaceMsg(err);
                    }}
                  />
                )}
                
                {faceStatus === 'success' && (
                  <p className="text-sm text-green-600 font-medium">{faceMsg}</p>
                )}
              </div>

              {/* Confirm */}
              <button
                onClick={confirmAttendance}
                disabled={locationStatus !== 'success' || faceStatus !== 'success'}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-base shadow-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ✅ Confirm Attendance
              </button>

              {(locationStatus === 'failed' || faceStatus === 'failed') && (
                <p className="text-center text-sm">
                  <Link href="/student/issues" className="text-blue-600 hover:underline">Having trouble? Raise an issue →</Link>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}