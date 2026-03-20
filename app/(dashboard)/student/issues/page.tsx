'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
    MessageSquare,
    Clock,
    ShieldAlert,
    Send,
    Loader2,
    CheckCircle2,
    Inbox,
    Zap,
    Calendar,
    FileText,
    Mail
} from 'lucide-react';
import Link from 'next/link';

interface Issue {
    _id: string;
    type: string;
    description: string;
    status: 'pending' | 'resolved';
    createdAt: string;
}

export default function StudentIssuesPage() {
    const { data: session } = useSession();
    const studentId = (session?.user as { id: string })?.id;
    const [type, setType] = useState('Technical');
    const [description, setDescription] = useState('');
    const [issues, setIssues] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const fetchIssues = useCallback(async () => {
        if (!studentId) return;
        try {
            const res = await fetch(`/api/student/issues?studentId=${studentId}`);
            if (res.ok) {
                const data = await res.json();
                setIssues(data);
            }
        } catch (error) {
            console.error('Error fetching issues:', error);
        } finally {
            setLoading(false);
        }
    }, [studentId]);

    useEffect(() => {
        if (studentId) {
            fetchIssues();
        }
    }, [studentId, fetchIssues]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim()) return;

        setSubmitting(true);
        setMessage(null);

        try {
            const res = await fetch('/api/student/issues', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId,
                    type,
                    description
                })
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Issue reported to central administration.' });
                setDescription('');
                fetchIssues();
            } else {
                setMessage({ type: 'error', text: 'Failed to synchronize issue manifest.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Connectivity error. Retry protocol initiation.' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Retrieving Support Logs...</p>
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
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight leading-none">Support Manifest</h1>
                        <div className="flex items-center gap-2 text-slate-500 mt-2 text-[11px] font-bold uppercase tracking-widest">
                            <Link href="/student/dashboard" className="hover:text-indigo-600 transition-colors">Workspace</Link>
                            <span className="text-slate-300">/</span>
                            <span className="text-slate-900 italic">Anomaly Documentation</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="p-8 max-w-7xl mx-auto space-y-12 pb-20">
                {message && (
                    <div className={`p-6 rounded-[32px] flex items-center gap-4 border shadow-2xl animate-in slide-in-from-top-4 duration-500 ${
                        message.type === 'success' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-emerald-50' 
                        : 'bg-rose-50 text-rose-700 border-rose-100 shadow-rose-50'
                    }`}>
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${message.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                            {message.type === 'success' ? <CheckCircle2 className="w-6 h-6 shrink-0" /> : <ShieldAlert className="w-6 h-6 shrink-0" />}
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest">{message.text}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Report Form */}
                    <div className="lg:col-span-12">
                        <section className="bg-white p-12 rounded-[48px] border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-2xl hover:shadow-indigo-50 transition-all duration-700">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32 transition-transform group-hover:scale-110" />
                            
                            <div className="flex items-center gap-5 mb-12 relative z-10">
                                <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-100">
                                    <ShieldAlert className="w-7 h-7" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase tracking-widest leading-none">Log Anomaly</h2>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 font-mono italic">Operational Integrity Check</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="group">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-1 transition-colors group-focus-within:text-indigo-600">Discrepancy Category</label>
                                        <select 
                                            value={type}
                                            onChange={(e) => setType(e.target.value)}
                                            className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-[11px] uppercase tracking-widest text-slate-900 focus:bg-white focus:border-indigo-600 outline-none transition-all shadow-sm shadow-slate-100 appearance-none cursor-pointer"
                                        >
                                            <option>Technical</option>
                                            <option>Attendance Linkage</option>
                                            <option>Biometric Desync</option>
                                            <option>Spatial Error</option>
                                            <option>Other / Unclassified</option>
                                        </select>
                                    </div>

                                    <div className="group md:col-span-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-1 transition-colors group-focus-within:text-indigo-600">Observation Narrative</label>
                                        <textarea 
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            rows={5}
                                            className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-[32px] font-bold text-[13px] text-slate-900 focus:bg-white focus:border-indigo-600 outline-none transition-all shadow-sm shadow-slate-100 placeholder:text-slate-300 placeholder:uppercase placeholder:tracking-widest placeholder:text-[10px] placeholder:font-black"
                                            placeholder="Specify anomaly parameters in detail..."
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <button 
                                        type="submit"
                                        disabled={submitting}
                                        className="group/btn relative w-full md:w-auto px-12 py-6 bg-slate-900 text-white rounded-[24px] font-black text-[10px] uppercase tracking-[0.3em] overflow-hidden transition-all shadow-2xl shadow-slate-200 active:scale-95 disabled:opacity-50"
                                    >
                                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                                        {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto text-white" /> : (
                                            <div className="flex items-center justify-center gap-4 relative z-10">
                                                <span>Transmit Report</span>
                                                <Send className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                            </div>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </section>
                    </div>

                    {/* Registry */}
                    <div className="lg:col-span-12 space-y-8 mt-12">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
                                    <Inbox className="w-5 h-5" />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase tracking-widest">Anomaly Registry</h2>
                            </div>
                            <div className="px-5 py-2 bg-white border border-slate-200 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest shadow-sm">
                                {issues.length} Identified Units
                            </div>
                        </div>

                        <div className="grid gap-6">
                            {issues.length === 0 ? (
                                <div className="bg-white rounded-[40px] border border-slate-200 p-20 text-center shadow-sm">
                                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <MessageSquare className="w-10 h-10 text-slate-200" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase tracking-widest mb-1">Zero Discrepancies</h3>
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic font-mono">Status: All systems nominal</p>
                                </div>
                            ) : (
                                issues.map((issue) => (
                                    <div key={issue._id} className="bg-white rounded-[40px] border border-slate-200 p-10 hover:shadow-2xl hover:shadow-indigo-50 transition-all group overflow-hidden relative">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                                        
                                        <div className="flex flex-col md:flex-row justify-between gap-10 items-start relative z-10">
                                            <div className="flex-1 space-y-6">
                                                <div className="flex items-center gap-4">
                                                    <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                                        issue.status === 'resolved' 
                                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                                        : 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse'
                                                    }`}>
                                                        {issue.status}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-slate-300">
                                                        <Clock className="w-3 h-3" />
                                                        <span className="text-[9px] font-black uppercase tracking-widest">{new Date(issue.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                
                                                <div>
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <Zap className="w-4 h-4 text-indigo-400" />
                                                        <h3 className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em]">{issue.type}</h3>
                                                    </div>
                                                    <p className="text-[13px] font-bold text-slate-600 leading-relaxed italic pr-12">&quot;{issue.description}&quot;</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 shrink-0">
                                               <div className="w-14 h-14 bg-slate-50 rounded-2xl flex flex-col items-center justify-center border border-slate-100 group-hover:bg-white transition-colors">
                                                  <Calendar className="w-4 h-4 text-slate-300 mb-1" />
                                                  <span className="text-[8px] font-black text-slate-400 uppercase">{new Date(issue.createdAt).getMonth() + 1}/{new Date(issue.createdAt).getFullYear()}</span>
                                               </div>
                                               <div className="w-14 h-14 bg-slate-50 rounded-2xl flex flex-col items-center justify-center border border-slate-100 group-hover:bg-white transition-colors">
                                                  <FileText className="w-4 h-4 text-slate-300 mb-1" />
                                                  <span className="text-[8px] font-black text-slate-400 uppercase">LOG</span>
                                               </div>
                                               <div className="w-14 h-14 bg-slate-50 rounded-2xl flex flex-col items-center justify-center border border-slate-100 group-hover:bg-white transition-colors">
                                                  <Mail className="w-4 h-4 text-slate-300 mb-1" />
                                                  <span className="text-[8px] font-black text-slate-400 uppercase">SYNC</span>
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
