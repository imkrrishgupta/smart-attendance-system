'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Clock, CheckCircle, Users, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface SessionItem {
  _id: string;
  subject: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  presentCount: number;
  absentCount: number;
  totalMarked: number;
}

export default function Sessions() {
  const { data: authSession } = useSession();
  const teacherId = (authSession?.user as any)?.id || null;
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teacherId) return;
    setLoading(true);
    fetch(`/api/attendance/sessions?teacherId=${teacherId}`)
      .then(r => r.json())
      .then(data => {
        setSessions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [teacherId]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <Link href="/teacher/dashboard" className="hover:text-slate-700 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </Link>
            <span>›</span>
            <span className="text-slate-700">Sessions</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Session History</h1>
          <p className="text-slate-500 mt-1">View all your past and active sessions</p>
        </div>
      </header>

      <div className="p-8 max-w-6xl mx-auto">
        {loading ? (
          <div className="bg-white rounded-xl border p-8 flex items-center justify-center text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading sessions…
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-white rounded-xl border p-8 text-center text-slate-400">
            No sessions found. Create a session from the <Link href="/teacher/dashboard" className="text-blue-600 underline">Dashboard</Link>.
          </div>
        ) : (
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Subject</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Date</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Time</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Attendance</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sessions.map(s => (
                  <tr key={s._id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-4 font-medium text-slate-800">{s.subject}</td>
                    <td className="px-5 py-4 text-sm text-slate-500">
                      {new Date(s.startTime).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {s.endTime && ` — ${new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                    </td>
                    <td className="px-5 py-4">
                      {s.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Live
                        </span>
                      ) : (
                        new Date() < new Date(s.startTime) ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-semibold border border-amber-100">
                             <Clock className="w-3 h-3 text-amber-500" /> Upcoming
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">
                            <CheckCircle className="w-3 h-3" /> Completed
                          </span>
                        )
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-green-600 font-semibold">{s.presentCount}</span>
                        <span className="text-slate-300">/</span>
                        <span className="text-slate-600">{s.totalMarked}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/teacher/attendance?sessionId=${s._id}`}
                        className="text-xs px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}