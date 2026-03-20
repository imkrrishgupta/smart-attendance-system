'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Loader2, Calendar, Clock, Plus, CheckCircle, XCircle, AlertCircle, User, FileText, ChevronRight, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface LeaveRequest {
  _id: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function TeacherLeaveRequestsPage() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const teacherId = (session?.user as any)?.id;

  useEffect(() => {
    if (teacherId) {
      fetchRequests();
    }
  }, [teacherId]);

  const fetchRequests = async () => {
    try {
      const res = await fetch(`/api/teacher/leave?teacherId=${teacherId}`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (error) {
      console.error('Failed to fetch requests', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherId || !startDate || !endDate || !reason) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/teacher/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherId, startDate, endDate, reason })
      });

      if (res.ok) {
        setStartDate('');
        setEndDate('');
        setReason('');
        fetchRequests();
      }
    } catch (error) {
      console.error('Failed to submit request', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accessing Request Vault...</p>
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
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Protocol Modification</h1>
            <div className="flex items-center gap-2 text-slate-500 mt-1 text-sm font-medium">
              <Link href="/teacher/dashboard" className="hover:text-indigo-600 transition-colors">Portal</Link>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900 font-semibold italic">Leave Management</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="px-5 py-2.5 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center gap-3">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">{requests.length} Historical Records</span>
            </div>
          </div>
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Form Section */}
          <div className="lg:col-span-12 xl:col-span-5 space-y-8">
            <div className="bg-white rounded-[48px] border border-slate-200 shadow-sm overflow-hidden group transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-50">
              <div className="p-10 border-b border-slate-100 bg-white flex items-center gap-6">
                <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center shadow-2xl shadow-slate-200 group-hover:scale-105 transition-transform duration-500">
                  <Plus className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase tracking-widest">New Petition</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Submit leave authorization request</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Interval</label>
                      <div className="relative">
                        <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                        <input
                          type="date"
                          required
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-[24px] text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Interval</label>
                      <div className="relative">
                        <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                        <input
                          type="date"
                          required
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-[24px] text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                        />
                      </div>
                    </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rationale</label>
                  <div className="relative">
                    <FileText className="absolute left-6 top-6 w-5 h-5 text-slate-300" />
                    <textarea
                      required
                      rows={5}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-[24px] text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm resize-none"
                      placeholder="Detailed justification for absence..."
                    />
                  </div>
                </div>

                <div className="bg-amber-50 rounded-[32px] p-8 border border-amber-100 flex gap-5">
                  <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Authorization Notice</h4>
                    <p className="text-xs font-bold text-amber-700/70 leading-relaxed">
                      Petitions must be submitted at least 24 hours prior to the scheduled engagement for executive review. Class cancellations will be auto-processed upon approval.
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="group relative w-full py-6 bg-indigo-600 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center gap-4 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <ChevronRight className="w-6 h-6 relative z-10" />}
                  <span className="relative z-10">{submitting ? 'Transmitting...' : 'Commit Petition'}</span>
                </button>
              </form>
            </div>
          </div>

          {/* History Section */}
          <div className="lg:col-span-12 xl:col-span-7 space-y-8">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-slate-100">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase tracking-widest">Execution Log</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Audit of historical leave authorizations</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-6">
                {requests.length === 0 ? (
                  <div className="bg-white rounded-[48px] border border-slate-200 p-20 text-center">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">No historical data found</p>
                  </div>
                ) : (
                  requests.map((req: LeaveRequest) => (
                    <div key={req._id} className="bg-white rounded-[40px] border border-slate-200 p-8 hover:shadow-2xl hover:shadow-indigo-50 transition-all group relative overflow-hidden">
                       <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110 ${
                          req.status === 'approved' ? 'bg-emerald-50' :
                          req.status === 'rejected' ? 'bg-rose-50' : 'bg-amber-50'
                       }`} />
                       
                       <div className="flex flex-col md:flex-row justify-between items-start gap-8 relative z-10">
                          <div className="space-y-6 flex-1">
                             <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-slate-50 rounded-[20px] flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                   <Calendar className="w-6 h-6" />
                                </div>
                                <div>
                                   <div className="flex items-baseline gap-2">
                                       <span className="text-xl font-black text-slate-900 tracking-tight">
                                          {new Date(req.startDate).toLocaleDateString()}
                                       </span>
                                       <span className="text-slate-300 font-bold">to</span>
                                       <span className="text-xl font-black text-slate-900 tracking-tight">
                                          {new Date(req.endDate).toLocaleDateString()}
                                       </span>
                                   </div>
                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Scheduled Vector Range</p>
                                </div>
                             </div>
                             <div className="pl-1 space-y-2">
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Rationale Registry</p>
                                <p className="text-sm font-bold text-slate-600 leading-relaxed max-w-lg italic pr-12">
                                   "{req.reason}"
                                </p>
                             </div>
                          </div>

                          <div className="flex flex-col items-end gap-3 self-stretch justify-between">
                             <span className={`inline-flex items-center gap-2 px-4 py-2 text-[10px] rounded-full font-black uppercase tracking-widest border ${
                                req.status === 'approved' ? 'bg-emerald-100 text-emerald-700 border-emerald-200 shadow-sm shadow-emerald-50' :
                                req.status === 'rejected' ? 'bg-rose-100 text-rose-700 border-rose-200 shadow-sm shadow-rose-50' :
                                'bg-amber-100 text-amber-700 border-amber-200 shadow-sm shadow-amber-50'
                             }`}>
                                {req.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                                {req.status === 'rejected' && <XCircle className="w-3 h-3" />}
                                {req.status === 'pending' && <Clock className="w-3 h-3 animate-pulse" />}
                                {req.status}
                             </span>
                             <div className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-all">
                                <ArrowRight className="w-5 h-5" />
                             </div>
                          </div>
                       </div>
                    </div>
                  ))
                )}
              </div>
          </div>
        </div>
      </main>
    </div>
  );
}