'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  Camera,
  MapPin,
  CheckCircle,
  Clock,
  Calendar,
  AlertCircle,
  RefreshCw,
  User,
  Lock,
  ChevronRight,
  History,
  MessageSquare,
  ArrowRight,
  Activity,
  Play,
  Loader2,
  X,
  Target,
  XCircle,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import FaceCapture from '@/components/attendance/FaceCapture';
import GeoFenceCheck from '@/components/attendance/GeoFenceCheck';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

interface ActiveSession {
  _id: string;
  subject: string;
  teacherId: { name: string };
  startTime: string;
  endTime: string;
  room: string;
  branch?: string;
  semester?: string;
  isActive?: boolean;
}

export default function StudentDashboard() {
  const { data: session } = useSession();
  const studentId = (session?.user as { id: string })?.id;
  const branch = (session?.user as any)?.branch;
  const semester = (session?.user as any)?.semester;

  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [markedSessionIds, setMarkedSessionIds] = useState<string[]>([]);
  const [stats, setStats] = useState({ 
    total: 0, 
    present: 0, 
    percentage: '0%',
    subjectData: [] as { subject: string, presence: number, fullLabel: string }[]
  });
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null);

  // Verification Modal State
  const [verifyingSession, setVerifyingSession] = useState<ActiveSession | null>(null);
  const [step, setStep] = useState<'location' | 'face'>('location');
  const [locationVerified, setLocationVerified] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);
  const [faceMsg, setFaceMsg] = useState('');

  const checkRegistration = useCallback(async () => {
    if (!studentId) return;
    try {
      const res = await fetch(`/api/student/registration-status?studentId=${studentId}`);
      if (res.ok) {
        const data = await res.json();
        setIsRegistered(data.isRegistered);
      }
    } catch (e) { console.error(e); }
  }, [studentId]);

  const fetchAttendanceStats = useCallback(async () => {
    if (!studentId) return;
    try {
      const res = await fetch(`/api/attendance?studentId=${studentId}`);
      if (res.ok) {
        const records = await res.json();

        // Calculate stats for current semester (Dashboard Default)
        const currentSemRecords = records.filter((r: any) => 
          r.sessionId?.semester?.toString() === semester?.toString()
        );

        const presentCount = currentSemRecords.filter((r: any) => r.status === 'present').length;
        const totalCount = currentSemRecords.length;

        // Calculate subject-wise stats (Current Semester)
        const subjectStats: Record<string, { total: number, present: number }> = {};
        currentSemRecords.forEach((r: any) => {
          const subject = r.sessionId?.subject || 'Unknown';
          if (!subjectStats[subject]) subjectStats[subject] = { total: 0, present: 0 };
          subjectStats[subject].total++;
          if (r.status === 'present') subjectStats[subject].present++;
        });

        const subjectData = Object.keys(subjectStats).map(subject => ({
          subject,
          presence: Math.round((subjectStats[subject].present / subjectStats[subject].total) * 100),
          fullLabel: `${subject} (${subjectStats[subject].present}/${subjectStats[subject].total})`
        })).sort((a, b) => b.presence - a.presence);

        setStats({
          present: presentCount,
          total: totalCount,
          percentage: totalCount > 0 ? `${Math.round((presentCount / totalCount) * 100)}%` : '0%',
          subjectData
        });

        setMarkedSessionIds(records.filter((r: any) => r.status === 'present').map((r: any) => r.sessionId?._id || r.sessionId));
      }
    } catch (e) { console.error(e); }
  }, [studentId, semester]);

  const fetchActiveSessions = useCallback(async () => {
    try {
      const res = await fetch('/api/attendance/sessions');
      if (res.ok) {
        const data = await res.json();
        const activeOnly = data.filter((s: ActiveSession) => 
          s.isActive && 
          (!s.branch || s.branch === branch) && 
          (!s.semester || s.semester === semester)
        );
        setActiveSessions(activeOnly);
      }
    } catch (e) { console.error(e); }
    finally {
      setLoading(false);
    }
  }, [branch, semester]);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (studentId) {
      checkRegistration();
      fetchActiveSessions();
      fetchAttendanceStats();
    }
  }, [studentId, checkRegistration, fetchActiveSessions, fetchAttendanceStats]);

  const openVerification = (session: ActiveSession) => {
    setVerifyingSession(session);
    setStep('location');
    setLocationVerified(false);
    setFaceVerified(false);
    setFaceMsg('');
  };

  const handleLocationSuccess = () => {
    setLocationVerified(true);
    setTimeout(() => setStep('face'), 800);
  };

  const handleFaceSuccess = async () => {
    if (!verifyingSession || !studentId) return;
    setFaceVerified(true);
    setFaceMsg('Biometrics Validated');
    
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          sessionId: verifyingSession._id,
          faceVerified: true,
          locationVerified: true
        })
      });

      if (res.ok) {
        setFaceMsg('Attendance Recorded');
        setTimeout(() => {
          setVerifyingSession(null);
          fetchActiveSessions();
          fetchAttendanceStats();
        }, 2000);
      }
    } catch (e) {
      setFaceMsg('Network error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Synchronizing Student Node...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Student Workspace</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Operational Environment // Active</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-[2px] rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-300">
               <div className="px-5 py-2.5 bg-white rounded-[14px] flex items-center gap-3">
                  <Activity className="w-4 h-4 text-indigo-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Health: Nominal</span>
               </div>
            </div>
          </div>
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto space-y-12">
        {/* Registration Warning */}
        {isRegistered === false && (
          <div className="bg-rose-600 p-8 rounded-[32px] text-white shadow-2xl shadow-rose-100 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
            <div className="flex items-center gap-6 relative z-10">
              <div className="w-16 h-16 bg-white/20 rounded-[24px] flex items-center justify-center backdrop-blur-md">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight">Biometric Registration Required</h3>
                <p className="text-rose-100 text-xs font-bold uppercase tracking-widest opacity-80 mt-1">Link your facial identity model to enable attendance protocols.</p>
              </div>
            </div>
            <Link href="/student/settings" className="px-8 py-3.5 bg-white text-rose-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 transition-all flex items-center gap-3 shadow-xl active:scale-95 whitespace-nowrap">
              Begin Registration <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Validated Present', value: stats.present, icon: CheckCircle, color: 'emerald' },
            { label: 'Identity Status', value: isRegistered ? 'Secure' : 'Open', icon: Lock, color: isRegistered ? 'indigo' : 'rose' },
            { label: 'Ingestion Index', value: stats.percentage, icon: Activity, color: 'slate' },
            { label: 'Domain Total', value: stats.total, icon: Target, color: 'indigo' },
          ].map((s, i) => (
            <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500">
               <div className={`absolute top-0 right-0 w-24 h-24 bg-${s.color}-50 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform`} />
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">{s.label}</p>
               <div className="flex items-baseline gap-2 relative z-10">
                  <h3 className={`text-3xl font-black text-${s.color}-600 tracking-tight`}>{s.value}</h3>
                  <s.icon className={`w-4 h-4 text-${s.color}-400`} />
               </div>
            </div>
          ))}
        </div>

        {/* Analytics Section */}
        {stats.subjectData.length > 0 && (
          <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm space-y-8">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                   <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase tracking-widest leading-none">Intelligence Map</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Presence percentage per academic sector</p>
                </div>
              </div>
            </div>

            <div className="h-[400px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.subjectData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis 
                    dataKey="subject" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }} 
                    angle={-45}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} 
                    domain={[0, 100]}
                    unit="%"
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-900 px-4 py-3 rounded-2xl border border-slate-800 shadow-2xl">
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">{payload[0].payload.subject}</p>
                            <p className="text-xl font-black text-white">{payload[0].value}% <span className="text-slate-400 text-xs font-medium ml-1">Presence</span></p>
                            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-2">{payload[0].payload.fullLabel}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar 
                    dataKey="presence" 
                    radius={[12, 12, 0, 0]} 
                    barSize={40}
                    animationDuration={1500}
                  >
                    {stats.subjectData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.presence >= 75 ? '#10b981' : entry.presence >= 60 ? '#f59e0b' : '#ef4444'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Active Sessions */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-100">
                   <Clock className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase tracking-widest">Active Intervals</h2>
              </div>
              <div className="px-4 py-1.5 bg-white border border-slate-200 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest shadow-sm">
                Live Data
              </div>
            </div>

            <div className="grid gap-6">
              {activeSessions.length === 0 ? (
                <div className="bg-white rounded-[40px] border border-slate-200 p-24 text-center shadow-sm">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <History className="w-10 h-10 text-slate-200" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase tracking-widest mb-2">Zero Active Clusters</h3>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">All academic sectors are currently inert</p>
                </div>
              ) : (
                activeSessions.map((session) => {
                  const isMarked = markedSessionIds.includes(session._id);
                  return (
                    <div key={session._id} className="bg-white rounded-[40px] border border-slate-200 p-10 hover:shadow-2xl hover:shadow-indigo-50 transition-all group overflow-hidden relative">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
                      
                      <div className="flex flex-col md:flex-row justify-between gap-10 items-start md:items-center relative z-10">
                        <div className="flex items-center gap-8">
                          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center border-2 border-white shadow-2xl transition-transform group-hover:scale-105 ${isMarked ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                             {isMarked ? <CheckCircle className="w-10 h-10" /> : <Play className="w-10 h-10 ml-1" />}
                          </div>
                          <div>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-3">
                              {session.subject}
                            </h3>
                            <div className="flex flex-wrap items-center gap-6">
                              <div className="flex items-center gap-2">
                                <User className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{session.teacherId?.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{session.room}</span>
                              </div>
                                <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                                  <Clock className="w-3 h-3 text-slate-300" />
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono italic">
                                    {new Date() > new Date(session.endTime) ? 'Expired' : 
                                      `Expires in: ${Math.max(0, Math.floor((new Date(session.endTime).getTime() - new Date().getTime()) / 60000))}m`}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {isMarked ? (
                            <div className="px-8 py-3 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-100 flex items-center gap-3 shadow-lg shadow-emerald-50">
                              <ShieldCheck className="w-4 h-4" />
                              Verified present
                            </div>
                          ) : new Date() > new Date(session.endTime) ? (
                            <div className="px-8 py-3 bg-rose-50 text-rose-700 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-rose-100 flex items-center gap-3 opacity-50">
                               <XCircle className="w-4 h-4" />
                               Registry Closed
                            </div>
                          ) : (
                            <button
                              onClick={() => openVerification(session)}
                              className="group/btn px-10 py-5 bg-slate-900 text-white rounded-[24px] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-indigo-600 transition-all flex items-center gap-3 shadow-2xl shadow-slate-200 active:scale-95"
                            >
                               Start Ingestion <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                })
              )}
            </div>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="lg:col-span-4 space-y-10">
            <div className="flex items-center gap-4 px-2">
                <div className="w-10 h-10 bg-slate-200 rounded-2xl flex items-center justify-center text-slate-600 shadow-sm font-black">
                   <ChevronRight className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase tracking-widest">Rapid Link</h2>
            </div>
            
            <div className="grid gap-6">
               {[
                { label: 'Archive Logs', icon: History, link: '/student/attendance-history', color: 'slate' },
                { label: 'Sequence Map', icon: Calendar, link: '/student/timetable', color: 'indigo' },
                { label: 'Support Node', icon: MessageSquare, link: '/student/issues', color: 'slate' },
                { label: 'Identity Config', icon: User, link: '/student/settings', color: 'indigo' },
               ].map((action, i) => (
                 <Link key={i} href={action.link} className="group bg-white p-6 rounded-[32px] border border-slate-200 flex items-center justify-between hover:shadow-2xl hover:shadow-indigo-50 hover:border-indigo-100 transition-all duration-500">
                   <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-2xl bg-${action.color}-50 text-${action.color}-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-${action.color}-600 group-hover:text-white shadow-sm shadow-${action.color}-100 transition-all duration-500`}>
                        <action.icon className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] group-hover:text-indigo-600 transition-colors">{action.label}</span>
                   </div>
                   <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all">
                      <ArrowRight className="w-4 h-4" />
                   </div>
                 </Link>
               ))}
            </div>

            <div className="bg-indigo-600 rounded-[48px] p-10 text-white shadow-2xl shadow-indigo-100 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
               <div className="relative z-10">
                  <div className="w-14 h-14 bg-white opacity-20 rounded-[24px] mb-8" />
                  <h3 className="text-2xl font-black mb-4 tracking-tighter uppercase tracking-widest leading-none">Intelligence Hub</h3>
                  <p className="text-indigo-100 text-[10px] font-bold leading-relaxed uppercase tracking-widest opacity-80 mb-8">Data accuracy is paramount. Audit your sequence map regularly to ensure synchronization with academic intervals.</p>
                  <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-900/10 hover:bg-indigo-50 active:scale-95 transition-all">Audit Now</button>
               </div>
            </div>
          </div>
        </div>
      </main>

      {/* Verification Modal */}
      {verifyingSession && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 z-[100] animate-in fade-in duration-500">
          <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-4xl overflow-hidden border border-white/20 transform animate-in zoom-in-95 duration-500">
            <div className="flex h-[700px]">
              {/* Sidebar Info */}
              <div className="w-1/3 bg-slate-900 p-12 text-white flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 rounded-full -mr-32 -mt-32 blur-3xl opacity-20" />
                <div className="relative z-10">
                  <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em] mb-6">Validation Protocol</h3>
                  <h2 className="text-4xl font-black tracking-tight leading-none mb-4 uppercase">{verifyingSession.subject}</h2>
                  <div className="space-y-6 mt-12">
                     <div className="flex items-center gap-4 group">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-indigo-300">
                           <User className="w-5 h-5" />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Faculty Origin</p>
                           <p className="text-sm font-black uppercase">{verifyingSession.teacherId?.name}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4 group">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-indigo-300">
                           <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Target Sector</p>
                           <p className="text-sm font-black uppercase">{verifyingSession.room}</p>
                        </div>
                     </div>
                  </div>
                </div>
                
                <div className="relative z-10 pt-12 border-t border-white/10">
                   <div className="flex items-center gap-3 mb-4">
                      <div className={`w-3 h-3 rounded-full ${step === 'location' ? 'bg-indigo-500 animate-pulse' : 'bg-emerald-500'}`} />
                      <span className={`text-[10px] font-black uppercase tracking-widest ${step === 'location' ? 'text-white' : 'text-white/40'}`}>Spatial Scan</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${step === 'face' ? 'bg-indigo-500 animate-pulse outline outline-4 outline-indigo-500/20' : 'bg-white/10'}`} />
                      <span className={`text-[10px] font-black uppercase tracking-widest ${step === 'face' ? 'text-white' : 'text-white/40'}`}>Biometric Link</span>
                   </div>
                </div>
              </div>

              {/* Main Interface */}
              <div className="flex-1 flex flex-col relative bg-white">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-full border border-slate-100">Synchronizing Secure Channel</span>
                   <button onClick={() => setVerifyingSession(null)} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all active:scale-90">
                      <X className="w-5 h-5" />
                   </button>
                </div>

                <div className="flex-1 p-12 overflow-hidden">
                  {step === 'location' ? (
                    <div className="h-full flex flex-col">
                      <div className="flex-1 rounded-[40px] overflow-hidden border-2 border-slate-100 shadow-inner group relative">
                        <div className="p-10 h-full flex flex-col items-center justify-center">
                          <GeoFenceCheck 
                            sessionId={verifyingSession._id}
                            onVerified={handleLocationSuccess}
                            onFailed={(err) => setFaceMsg(err)}
                          />
                        </div>
                        {!locationVerified && (
                           <div className="absolute inset-x-8 bottom-8 bg-slate-900/90 backdrop-blur-xl p-6 rounded-[24px] text-white flex items-center justify-between animate-in slide-in-from-bottom-10">
                              <div className="flex items-center gap-4">
                                 <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
                                 <span className="text-[10px] font-black uppercase tracking-[0.2em]">Acquiring Global Coordinates...</span>
                              </div>
                              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Spatial Sync Active</span>
                           </div>
                        )}
                        {locationVerified && (
                          <div className="absolute inset-0 bg-emerald-600/10 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-500">
                             <div className="bg-white p-8 rounded-full shadow-2xl scale-125 animate-in zoom-in">
                                <ShieldCheck className="w-12 h-12 text-emerald-600" />
                             </div>
                          </div>
                        )}
                      </div>
                      <div className="mt-8 flex items-center justify-between px-2">
                        <div>
                           <h4 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none mb-2">Spatial Calibration</h4>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic font-mono">Status: {locationVerified ? 'Aligned' : 'Acquiring Link...'}</p>
                        </div>
                        <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center">
                           <MapPin className="w-6 h-6 text-indigo-600" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col">
                      <div className="flex-1 rounded-[40px] overflow-hidden border-2 border-slate-100 shadow-inner relative bg-black">
                        <FaceCapture 
                          studentId={studentId || ''} 
                          onVerified={handleFaceSuccess}
                          onFailed={(err: string) => setFaceMsg(err)}
                          mode="verify"
                        />
                        {faceMsg && (
                           <div className="absolute inset-x-8 bottom-8 bg-black/80 backdrop-blur-md p-6 rounded-[24px] text-white flex items-center justify-between animate-in slide-in-from-bottom-10 border border-white/10 shadow-2xl">
                              <div className="flex items-center gap-4">
                                 <AlertCircle className="w-5 h-5 text-indigo-400" />
                                 <span className="text-[10px] font-black uppercase tracking-[0.2em]">{faceMsg}</span>
                              </div>
                           </div>
                        )}
                        {faceVerified && (
                          <div className="absolute inset-0 bg-emerald-600/10 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-500">
                             <div className="bg-white p-10 rounded-full shadow-2xl scale-125 animate-in zoom-in">
                                <ShieldCheck className="w-16 h-16 text-emerald-600" />
                             </div>
                          </div>
                        )}
                      </div>
                      <div className="mt-8 flex items-center justify-between px-2">
                        <div>
                           <h4 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none mb-2">Biometric Ingestion</h4>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic font-mono">Status: {faceVerified ? 'Identified' : 'Scanning Neural Map...'}</p>
                        </div>
                        <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center">
                           <Camera className="w-6 h-6 text-indigo-600" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}