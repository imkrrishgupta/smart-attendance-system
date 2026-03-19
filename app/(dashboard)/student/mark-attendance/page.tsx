'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { CheckCircle, Clock, User, X, Camera, MapPin, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import FaceCapture from '@/components/attendance/FaceCapture';

interface Session {
  _id: string;
  subject: string;
  startTime: string;
  endTime: string;
  teacherId: { name: string };
  isActive: boolean;
}

export default function MarkAttendance() {
  const { data: authSession } = useSession();
  const studentId = (authSession?.user as any)?.id || null;

  const [sessions, setSessions] = useState<Session[]>([]);
  const [markedSessionIds, setMarkedSessionIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Verification Modal State
  const [verifyingSession, setVerifyingSession] = useState<Session | null>(null);
  const [locationStatus, setLocationStatus] = useState<'pending' | 'checking' | 'success' | 'failed'>('pending');
  const [locationMsg, setLocationMsg] = useState('');
  const [faceVerified, setFaceVerified] = useState(false);

  // Registration Status
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null);

  useEffect(() => {
    if (studentId) {
      fetchSessions();
      fetchAttendanceHistory();
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

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/attendance/sessions');
      if (res.ok) {
        const data = await res.json();
        const activeOnly = data.filter((s: Session) => s.isActive);
        setSessions(activeOnly);
      }
    } catch (error) {
      console.error('Failed to fetch sessions', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceHistory = async () => {
    try {
      const res = await fetch(`/api/attendance?studentId=${studentId}`);
      if (res.ok) {
        const history = await res.json();
        const marked = history.map((record: any) => record.sessionId?._id || record.sessionId);
        setMarkedSessionIds(marked);
      }
    } catch (error) {
      console.error('Failed to fetch attendance history', error);
    }
  };

  const startVerification = (session: Session) => {
    setVerifyingSession(session);
    setLocationStatus('pending');
    setLocationMsg('');
    setFaceVerified(false);
  };

  const closeVerification = () => {
    setVerifyingSession(null);
  };

  const verifyLocation = () => {
    setLocationStatus('checking');
    setLocationMsg('Engaging Satellites...');

    if (!navigator.geolocation) {
      setLocationStatus('failed');
      setLocationMsg('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          setLocationMsg('Triangulating Position...');
          const res = await fetch('/api/geofence', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: verifyingSession?._id,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            })
          });

          const data = await res.json();
          if (res.ok && data.isInside) {
            setLocationStatus('success');
            setLocationMsg(`Verified Inside Radius (${data.distance}m)`);
          } else {
            setLocationStatus('failed');
            setLocationMsg(data.error || `Position Outside Allowed Zone (${data.distance}m)`);
          }
        } catch (error) {
          setLocationStatus('failed');
          setLocationMsg('Communication link failed.');
        }
      },
      (error) => {
        setLocationStatus('failed');
        setLocationMsg(`Signal lost: ${error.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const submitAttendance = async () => {
    if (!verifyingSession || locationStatus !== 'success' || !faceVerified) return;

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
        setMarkedSessionIds([...markedSessionIds, verifyingSession._id]);
        closeVerification();
      } else {
        alert('Transmission error. Please re-initiate.');
      }
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const getStatusButton = (session: Session) => {
    if (markedSessionIds.includes(session._id)) {
      return (
        <button disabled className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold text-sm flex items-center gap-2 whitespace-nowrap">
          <CheckCircle className="w-4 h-4" /> Marked
        </button>
      );
    }

    if (!session.isActive) {
      return (
        <button disabled className="px-4 py-2 bg-slate-100 text-slate-400 rounded-lg font-semibold text-sm cursor-not-allowed whitespace-nowrap">
          Inactive
        </button>
      );
    }

    return (
      <button
        onClick={() => startVerification(session)}
        disabled={!isRegistered}
        className={`px-6 py-2 rounded-lg font-semibold text-sm transition flex items-center gap-2 whitespace-nowrap ${
          isRegistered 
            ? 'bg-blue-600 text-white hover:bg-blue-700' 
            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
        }`}
      >
        <Camera className="w-4 h-4" /> Mark
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Mark Attendance</h1>
              <p className="text-slate-600 mt-1">Current Sessions</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
        {/* Registration Warning */}
        {isRegistered === false && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-red-900 text-lg">Biometrics Not Registered</h3>
                <p className="text-red-700 text-sm">Your biometric profile is missing. Attendance logging is disabled until you register.</p>
              </div>
            </div>
            <Link 
              href="/student/settings" 
              className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition whitespace-nowrap"
            >
              Register Now
            </Link>
          </div>
        )}

        {/* Sessions Section */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Active Sessions</h2>
              <button 
                onClick={fetchSessions} 
                className="text-indigo-600 font-medium hover:text-indigo-700"
              >
                Refresh
              </button>
            </div>
          </div>
          <div className="p-6">

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center text-slate-500 py-8 italic">
              No active sessions right now.
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-slate-900">{session.subject}</h3>
                      {session.isActive && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          Live
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-slate-600">
                      <div className="flex flex-wrap gap-4">
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>Teacher: {session.teacherId?.name || '—'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    {getStatusButton(session)}
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
        </div>
        </div>
      </div>

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
                  {locationStatus === 'failed' && <X className="w-5 h-5 text-red-500" />}
                </div>
                {locationStatus === 'pending' && (
                  <button onClick={verifyLocation} className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition">
                    Check My Location
                  </button>
                )}
                {locationStatus !== 'pending' && (
                  <p className={`text-sm ${locationStatus === 'failed' ? 'text-red-600' : locationStatus === 'success' ? 'text-green-600' : 'text-slate-500'}`}>{locationMsg}</p>
                )}
              </div>

              {/* Step 2: Face */}
              <div className={`border rounded-xl p-4 transition ${locationStatus !== 'success' ? 'opacity-40 pointer-events-none' : ''}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="flex items-center gap-2 font-semibold text-slate-700">
                    <Camera className="w-5 h-5 text-slate-400" /> Step 2 — Face Recognition
                  </span>
                  {faceVerified && <CheckCircle className="w-5 h-5 text-green-500" />}
                </div>

                {!faceVerified ? (
                  <FaceCapture
                    studentId={studentId}
                    onVerified={() => setFaceVerified(true)}
                    onFailed={() => setFaceVerified(false)}
                    onCancel={closeVerification}
                  />
                ) : (
                  <p className="text-sm text-green-600 font-medium">Biometrics verified ✓</p>
                )}
              </div>

              {/* Confirm */}
              <button
                onClick={submitAttendance}
                disabled={locationStatus !== 'success' || !faceVerified}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-base shadow-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ✅ Confirm Attendance
              </button>

              {(locationStatus === 'failed') && (
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

