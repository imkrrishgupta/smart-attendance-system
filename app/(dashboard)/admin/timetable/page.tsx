'use client';

import { useState, useEffect } from 'react';
import { Settings, Plus, Search, Calendar, MapPin, User, X, Clock, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { BRANCHES, SEMESTERS } from '@/lib/constants';

export default function AdminTimetable() {
  const [timetable, setTimetable] = useState<any[]>([]);
  const [allSessions, setAllSessions] = useState<any[]>([]);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sessionSearchTerm, setSessionSearchTerm] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    subject: '',
    teacherId: '',
    day: 'Monday',
    startTime: '09:00',
    endTime: '10:00',
    room: '',
    branch: BRANCHES[0],
    semester: SEMESTERS[0]
  });
  const [saving, setSaving] = useState(false);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const fetchData = async () => {
    try {
      const [timetableRes, teachersRes, sessionsRes] = await Promise.all([
        fetch('/api/admin/timetable'),
        fetch('/api/admin/teachers'),
        fetch('/api/attendance/sessions')
      ]);
      if (timetableRes.ok) setTimetable(await timetableRes.json());
      if (teachersRes.ok) setTeachers(await teachersRes.json());
      if (sessionsRes.ok) {
        const sessions = await sessionsRes.json();
        setAllSessions(sessions);
        setActiveSessions(sessions.filter((s: any) => s.isActive));
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowAddModal(false);
        setFormData({ subject: '', teacherId: '', day: 'Monday', startTime: '09:00', endTime: '10:00', room: '', branch: BRANCHES[0], semester: SEMESTERS[0] });
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to add schedule');
      }
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('Are you sure you want to remove this schedule?')) return;
    try {
        const res = await fetch(`/api/admin/timetable/${id}`, { method: 'DELETE' });
        if (res.ok) fetchData();
        else alert('Failed to delete schedule');
    } catch (e) { console.error(e); }
  };

  const filteredTimetable = timetable.filter(item =>
    item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.teacherId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Academic Schedule</h1>
            <div className="flex items-center gap-2 text-slate-500 mt-1 text-sm font-medium">
              <Link href="/admin/dashboard" className="hover:text-indigo-600 transition-colors">Portal</Link>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900 font-semibold italic">Master Timetable</span>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Define Schedule
          </button>
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto space-y-10 pb-12">
        {/* Search Registry */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-2 overflow-hidden max-w-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter master schedule by subject or faculty name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-transparent border-none rounded-2xl focus:ring-0 outline-none text-sm font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-medium"
            />
          </div>
        </div>

        {/* Live Classes Monitoring */}
        {activeSessions.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />
                <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase tracking-[0.05em]">Live Monitoring</h2>
                <span className="px-3 py-1 bg-green-50 text-green-700 text-[10px] font-black rounded-lg uppercase tracking-widest border border-green-100">Live Encounters</span>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{activeSessions.length} active nodes</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeSessions.map((session) => (
                <div key={session._id} className="bg-slate-900 rounded-[32px] shadow-2xl p-8 relative overflow-hidden group border border-slate-800">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-green-500/20 transition-all" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                       <span className="px-3 py-1 bg-green-500 text-white text-[9px] font-black rounded-full shadow-lg shadow-green-500/20">LIVE CLASS</span>
                       <div className="flex items-center gap-1.5 text-slate-400">
                          <Clock className="w-3.5 h-3.5 text-green-500" />
                          <span className="text-[10px] font-bold">STARTED {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                       </div>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-6 tracking-tight line-clamp-1 group-hover:text-green-400 transition-colors">
                      {session.subject}
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/10 group-hover:border-green-500/30 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                          <User className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Authorized Faculty</p>
                          <p className="text-sm font-bold text-white tracking-tight">{session.teacherId?.name || 'Academic Observer'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 pt-2">
                        <div>
                          <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Branch</p>
                          <p className="text-xs font-bold text-slate-300">{session.branch || 'GENERAL'}</p>
                        </div>
                        <div className="w-px h-6 bg-slate-800" />
                        <div>
                          <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Semester</p>
                          <p className="text-xs font-bold text-slate-300">{session.semester || 'ALL'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Master Timetable Section */}
        <div className="space-y-8 pt-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100 shadow-sm">
                <Calendar className="w-5 h-5 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase tracking-widest">Master Schedule</h2>
            </div>
            {searchTerm && (
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 animate-pulse">
                Filtered Registry
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              <div className="col-span-full py-20 text-center">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accessing Schedule Vault...</p>
              </div>
            ) : filteredTimetable.length === 0 ? (
              <div className="col-span-full py-24 text-center border-4 border-dashed border-slate-100 rounded-[48px] opacity-40">
                <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Academic Entries Identified</p>
              </div>
            ) : (
              filteredTimetable.map((item) => (
                <div key={item._id} className="bg-white rounded-[40px] border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-indigo-100 hover:border-indigo-600 transition-all p-8 group relative flex flex-col justify-between overflow-hidden">
                  <div className="absolute top-0 left-0 w-2 h-0 group-hover:h-full bg-indigo-600 transition-all duration-300" />
                  
                  <div>
                    <div className="flex justify-between items-start mb-8">
                      <div className="px-4 py-1.5 bg-slate-900 text-white text-[10px] font-black rounded-xl uppercase tracking-widest group-hover:bg-indigo-600 transition-colors shadow-xl shadow-slate-200 group-hover:shadow-indigo-200">
                        {item.day}
                      </div>
                      <button 
                        onClick={() => handleDeleteSchedule(item._id)}
                        className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-300 hover:bg-red-50 hover:text-red-500 hover:border-red-100 border border-transparent transition-all flex items-center justify-center group-hover:opacity-100 active:scale-90"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h3 className="text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-2 tracking-tight line-clamp-2 leading-tight">
                      {item.subject}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-8">
                      <User className="w-3.5 h-3.5 text-indigo-500" />
                      {item.teacherId?.name || 'Observer Unassigned'}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-indigo-50/50 group-hover:border-indigo-100 transition-all">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-indigo-500" /> Slot
                        </p>
                        <p className="text-xs font-bold text-slate-900 tracking-tighter">{item.startTime} - {item.endTime}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-indigo-50/50 group-hover:border-indigo-100 transition-all">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-indigo-500" /> Sector
                        </p>
                        <p className="text-xs font-bold text-slate-900 tracking-tighter line-clamp-1">{item.room}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-6 border-t border-slate-50">
                    <span className="px-3 py-1.5 bg-slate-50 text-slate-500 text-[9px] font-black uppercase tracking-widest rounded-lg border border-slate-100">
                      {item.branch || 'GEN'}
                    </span>
                    <span className="px-3 py-1.5 bg-slate-50 text-slate-500 text-[9px] font-black uppercase tracking-widest rounded-lg border border-slate-100">
                      SEM {item.semester || 'ALL'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Session Execution Log (Historical/Date-wise) */}
        <div className="space-y-8 pt-10 border-t border-slate-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100 shadow-sm">
                <Clock className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase tracking-widest">Execution Registry</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Audit of teacher-initiated sessions</p>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-1 overflow-hidden w-full md:w-80">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Seach by date or subject..."
                  value={sessionSearchTerm}
                  onChange={(e) => setSessionSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-transparent border-none focus:ring-0 outline-none text-xs font-bold text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[48px] border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Temporal Vector</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Day</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject Node</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Faculty</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Branch/Sem</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {allSessions
                    .filter(s => 
                      s.subject.toLowerCase().includes(sessionSearchTerm.toLowerCase()) ||
                      new Date(s.startTime).toLocaleDateString().includes(sessionSearchTerm)
                    )
                    .map((s) => {
                      const startDate = new Date(s.startTime);
                      const dayName = startDate.toLocaleDateString('en-US', { weekday: 'long' });
                      return (
                        <tr key={s._id} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <Calendar className="w-4 h-4 text-slate-300" />
                              <span className="text-sm font-bold text-slate-900">{startDate.toLocaleDateString('en-GB')}</span>
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 block pl-7">
                              {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <span className="px-3 py-1 bg-slate-900 text-white text-[9px] font-black rounded-lg uppercase tracking-widest">
                               {dayName}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <p className="text-sm font-bold text-slate-900">{s.subject}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.room || 'Stationary Unit'}</p>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 font-black text-[10px]">
                                {s.teacherId?.name?.charAt(0) || 'A'}
                              </div>
                              <span className="text-xs font-bold text-slate-600">{s.teacherId?.name || 'Observer'}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              {s.branch || 'GEN'} • SEM {s.semester || 'ALL'}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                             {(() => {
                               const now = new Date();
                               const start = new Date(s.startTime);
                               if (s.isActive) return (
                                 <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-green-100 text-green-700">
                                   <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                   Active
                                 </div>
                               );
                               if (start > now) return (
                                 <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-100 text-amber-700">
                                   <Clock className="w-3 h-3" />
                                   Upcoming
                                 </div>
                               );
                               return (
                                 <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-500">
                                   Archived
                                 </div>
                               );
                             })()}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
              {allSessions.length === 0 && (
                <div className="py-20 text-center bg-slate-50/30">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Historical Registry Empty</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Define Schedule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
          <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-2xl overflow-hidden border border-white/20 transform animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between p-10 border-b border-slate-100 bg-white">
              <div>
                <h3 className="font-bold text-3xl text-slate-900 tracking-tight">Define Schedule</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">Master Plan Formulation</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="w-12 h-12 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center transition-colors group"
              >
                <X className="w-7 h-7 text-slate-400 group-hover:text-slate-900 transition-colors" />
              </button>
            </div>
            
            <form onSubmit={handleAddSchedule} className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Academic Subject Title</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Advanced Quantum Mechanics"
                    className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[24px] text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-300"
                  />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Assign Observer (Teacher)</label>
                  <select
                    required
                    value={formData.teacherId}
                    onChange={e => setFormData({ ...formData, teacherId: e.target.value })}
                    className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[24px] text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-no-repeat transition-all"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 1.5rem center', backgroundSize: '1.25rem' }}
                  >
                    <option value="">Select Personnel</option>
                    {teachers.map(t => (
                      <option key={t._id} value={t._id}>{t.name} ({t.branch || 'GENERAL'})</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Operational Day</label>
                  <select
                    required
                    value={formData.day}
                    onChange={e => setFormData({ ...formData, day: e.target.value })}
                    className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[24px] text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-no-repeat transition-all"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 1.5rem center', backgroundSize: '1.25rem' }}
                  >
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Start Vector (Time)</label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[24px] text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">End Vector (Time)</label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[24px] text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Operational Unit (Branch)</label>
                  <select
                    required
                    value={formData.branch}
                    onChange={e => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[24px] text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 bg-white transition-all appearance-none bg-no-repeat"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 1.5rem center', backgroundSize: '1.25rem' }}
                  >
                    <option value="" disabled>Select Branch</option>
                    {BRANCHES.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Target Term (Semester)</label>
                  <select
                    required
                    value={formData.semester}
                    onChange={e => setFormData({ ...formData, semester: e.target.value })}
                    className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[24px] text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 bg-white transition-all appearance-none bg-no-repeat"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 1.5rem center', backgroundSize: '1.25rem' }}
                  >
                    <option value="" disabled>Select Semester</option>
                    {SEMESTERS.map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Sector (Room/Hall)</label>
                  <input
                    type="text"
                    required
                    value={formData.room}
                    onChange={e => setFormData({ ...formData, room: e.target.value })}
                    placeholder="e.g. Laboratory Delta-4"
                    className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[24px] text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={saving || !formData.teacherId || !formData.branch || !formData.semester}
                className="w-full py-6 bg-indigo-600 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50 mt-6 active:scale-95"
              >
                {saving ? 'Syncing Schedule...' : 'Authorize Schedule Entry'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}