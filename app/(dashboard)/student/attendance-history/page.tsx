'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { SEMESTERS } from '@/lib/constants';
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
import {
  Calendar,
  Filter,
  Loader2,
  XCircle,
  Search,
  Clock,
  PieChart,
  Activity,
  Zap,
  ShieldCheck,
  FileText,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

interface AttendanceRecord {
  _id: string;
  sessionId: {
    _id: string;
    subject: string;
    startTime: string;
    endTime: string;
    branch?: string;
    semester?: string;
  };
  status: 'present' | 'absent';
  createdAt: string;
}

export default function AttendanceHistory() {
  const { data: session } = useSession();
  const studentId = (session?.user as { id: string })?.id;

  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [selectedSemester, setSelectedSemester] = useState('All Semesters');
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [currentPage, setCurrentPage] = useState(1);

  const semesters = [
    'All Semesters',
    ...SEMESTERS.map(s => `Sem ${s}`)
  ];

  const subjects = [
    'All Subjects',
    ...Array.from(
      new Set(attendanceData.map((r) => r.sessionId?.subject).filter(Boolean))
    )
  ];

  const fetchAttendance = useCallback(async () => {
    if (!studentId) return;
    try {
      const res = await fetch(`/api/attendance?studentId=${studentId}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setAttendanceData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    if (studentId) {
      fetchAttendance();
    }
  }, [studentId, fetchAttendance]);

  const filteredData = attendanceData.filter((record) => {
    const matchesSubject = selectedSubject === 'All Subjects' || 
                          record.sessionId?.subject === selectedSubject;
    
    // Check if session semester matches the selected filter (normalized)
    const recordSemStr = record.sessionId?.semester ? `Sem ${record.sessionId.semester}` : '';
    const matchesSemester = selectedSemester === 'All Semesters' || 
                           recordSemStr === selectedSemester;
                           
    return matchesSubject && matchesSemester;
  });

  const stats = {
    totalClasses: filteredData.length,
    present: filteredData.filter((r) => r.status === 'present').length,
    absent: filteredData.filter((r) => r.status === 'absent').length,
    get overall() {
      return this.totalClasses > 0
        ? `${Math.round((this.present / this.totalClasses) * 100)}%`
        : '0%';
    }
  };

  const chartData = useMemo(() => {
    const semFiltered = attendanceData.filter(r => 
      selectedSemester === 'All Semesters' || 
      (r.sessionId?.semester ? `Sem ${r.sessionId.semester}` : '') === selectedSemester
    );
    
    const subjectStats: Record<string, { total: number, present: number }> = {};
    semFiltered.forEach((r) => {
      const subj = r.sessionId?.subject || 'Unknown';
      if (!subjectStats[subj]) subjectStats[subj] = { total: 0, present: 0 };
      subjectStats[subj].total++;
      if (r.status === 'present') subjectStats[subj].present++;
    });

    return Object.keys(subjectStats).map(subject => ({
      subject,
      presence: Math.round((subjectStats[subject].present / subjectStats[subject].total) * 100),
      fullLabel: `${subject} (${subjectStats[subject].present}/${subjectStats[subject].total})`
    })).sort((a, b) => b.presence - a.presence);
  }, [attendanceData, selectedSemester]);

  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Loading Attendance Archive...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Attendance Ledger</h1>
            <div className="flex items-center gap-2 text-slate-500 mt-1 text-sm font-medium">
              <Link href="/student/dashboard" className="hover:text-indigo-600 transition-colors">Portal</Link>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900 font-semibold italic">Cryptographic History</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="px-5 py-2.5 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center gap-3">
                <Activity className="w-4 h-4 text-indigo-600" />
                <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Aggregate Score: {stats.overall}</span>
             </div>
          </div>
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto space-y-10 pb-20">
        {/* Analytics Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Validated Present', value: stats.present, icon: ShieldCheck, color: 'emerald' },
            { label: 'Incident / Absent', value: stats.absent, icon: XCircle, color: 'rose' },
            { label: 'Total Ingested', value: stats.totalClasses, icon: FileText, color: 'slate' },
            { label: 'Efficiency Index', value: stats.overall, icon: PieChart, color: 'indigo' },
          ].map((s, i) => (
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white rounded-[40px] border border-slate-200 p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                 <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-100">
                   <Filter className="w-5 h-5" />
                 </div>
                 <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase tracking-widest">Filter Ops</h3>
              </div>
              
              <div className="space-y-8">
                <div className="group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1 transition-colors group-focus-within:text-indigo-600">Subject Context</label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => {
                      setSelectedSubject(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-900 focus:bg-white focus:border-indigo-600 transition-all outline-none shadow-sm shadow-slate-100"
                  >
                    {subjects.map((subj) => (
                      <option key={subj} value={subj}>{subj}</option>
                    ))}
                  </select>
                </div>

                <div className="group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1 transition-colors group-focus-within:text-indigo-600">Semester Period</label>
                  <select
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-900 focus:bg-white focus:border-indigo-600 transition-all outline-none shadow-sm shadow-slate-100"
                  >
                    {semesters.map((sem) => (
                      <option key={sem} value={sem}>{sem}</option>
                    ))}
                  </select>
                </div>

                <div className="pt-4">
                  <div className="bg-indigo-600 rounded-[32px] p-8 text-white shadow-2xl shadow-indigo-100 relative overflow-hidden group/hint">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover/hint:scale-110 transition-transform" />
                    <Zap className="w-8 h-8 mb-4 text-indigo-300" />
                    <p className="text-[10px] font-bold text-indigo-100 leading-relaxed uppercase tracking-widest opacity-80">
                      Viewing logs for <span className="text-white">{selectedSubject}</span> in the <span className="text-white">{selectedSemester}</span> cycle.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Records List */}
          <div className="lg:col-span-3 space-y-8">
            {chartData.length > 0 && (
              <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                      <BarChart className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase tracking-widest leading-none">Sub-Sector Performance</h2>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">{selectedSemester} Distribution</p>
                    </div>
                  </div>
                </div>

                <div className="h-[300px] w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis 
                        dataKey="subject" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 9, fontWeight: 800 }} 
                        angle={-30}
                        textAnchor="end"
                        interval={0}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 800 }} 
                        domain={[0, 100]}
                        unit="%"
                      />
                      <Tooltip 
                        cursor={{ fill: '#f8fafc' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-slate-900 px-4 py-3 rounded-2xl border border-slate-800 shadow-2xl">
                                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">{payload[0].payload.subject}</p>
                                <p className="text-lg font-black text-white">{payload[0].value}%</p>
                                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">{payload[0].payload.fullLabel}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar 
                        dataKey="presence" 
                        radius={[10, 10, 0, 0]} 
                        barSize={32}
                        animationDuration={1500}
                      >
                        {chartData.map((entry, index) => (
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

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-slate-100">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase tracking-widest">Archive Registry</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Timeline of attendance ingestions</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[48px] border border-slate-200 overflow-hidden shadow-sm">
              {paginatedData.length === 0 ? (
                <div className="text-center py-32 bg-white flex flex-col items-center">
                  <Search className="w-20 h-20 text-slate-100 mb-8" />
                  <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase tracking-widest mb-2">Zero Matches Found</h3>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Adjust parameters to recalibrate search results</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {paginatedData.map((record) => (
                    <div key={record._id} className="p-10 hover:bg-slate-50 transition-all group overflow-hidden relative">
                      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 ${record.status === 'present' ? 'bg-emerald-50' : 'bg-rose-50'}`} />
                      
                      <div className="flex items-center justify-between gap-10 relative z-10">
                        <div className="flex items-center gap-8 flex-1">
                          <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center border-2 border-white shadow-xl flex-shrink-0 transition-transform group-hover:scale-105 ${record.status === 'present' ? 'bg-emerald-50 text-emerald-600 shadow-emerald-50' : 'bg-rose-50 text-rose-600 shadow-rose-50'}`}>
                            {record.status === 'present' ? <ShieldCheck className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
                          </div>
                          <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-3 uppercase tracking-tight">
                              {record.sessionId?.subject || 'Undefined Session'}
                            </h3>
                            <div className="flex flex-wrap items-center gap-6">
                              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" /> 
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">
                                  {new Date(record.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-indigo-400" /> 
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">
                                  {new Date(record.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shadow-2xl transition-all group-hover:scale-105 ${
                          record.status === 'present'
                            ? 'bg-emerald-100/50 text-emerald-700 border-emerald-200 shadow-emerald-50'
                            : 'bg-rose-100/50 text-rose-700 border-rose-200 shadow-rose-50'
                        }`}>
                          {record.status === 'present' ? 'Verified' : 'Missed'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center px-12 py-10 bg-slate-50/50 border-t border-slate-100">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">
                    Fragment <span className="text-slate-900">{currentPage}</span> of {totalPages} <span className="text-slate-200 mx-4">|</span> {filteredData.length} records detected
                  </div>
                  <div className="flex gap-4">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                      className="w-14 h-14 bg-white border border-slate-200 text-slate-600 rounded-[20px] hover:border-indigo-600 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xl flex items-center justify-center active:scale-90"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                      className="w-14 h-14 bg-indigo-600 text-white rounded-[20px] hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-2xl shadow-indigo-100 flex items-center justify-center active:scale-90"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}