'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { AlertCircle, User, Clock, CheckCircle, MoreVertical, Loader2, Zap, Calendar, FileText, Mail } from 'lucide-react';
import Link from 'next/link';

interface Issue {
    _id: string;
    studentId: {
        name: string;
        rollNumber: string;
        email: string;
    };
    sessionId: {
        subject: string;
        startTime: string;
    };
    issueType: string;
    description: string;
    status: 'pending' | 'resolved';
    createdAt: string;
}

export default function TeacherIssuesPage() {
    const { data: session } = useSession();
    const [issues, setIssues] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(true);
    const teacherId = (session?.user as any)?.id;

    useEffect(() => {
        if (teacherId) {
            fetchIssues();
        }
    }, [teacherId]);

    const fetchIssues = async () => {
        if (!teacherId) return;
        try {
            const res = await fetch(`/api/student/issues?teacherId=${teacherId}`);
            if (res.ok) {
                const data = await res.json();
                setIssues(data);
            }
        } catch (error) {
            console.error('Failed to fetch issues', error);
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (issueId: string) => {
        try {
            const res = await fetch(`/api/teacher/issues/${issueId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'resolved', resolvedBy: teacherId })
            });
            if (res.ok) {
                fetchIssues(); // Refresh the list
            }
        } catch (error) {
            console.error('Failed to resolve issue', error);
        }
    };

    const getIssueTypeLabel = (type: string) => {
        const types: Record<string, string> = {
            face_mismatch: 'Face Mismatch',
            location_fail: 'Location Verification Failed',
            session_inactive: 'Session Inactive',
            other: 'Other'
        };
        return types[type] || type;
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Loading Incident registry...</p>
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
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Support Incidents</h1>
                        <div className="flex items-center gap-2 text-slate-500 mt-1 text-sm font-medium">
                            <Link href="/teacher/dashboard" className="hover:text-indigo-600 transition-colors">Portal</Link>
                            <span className="text-slate-300">/</span>
                            <span className="text-slate-900 font-semibold italic">Dispute Registry</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-5 py-2.5 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center gap-3">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">{issues.length} Active Disputations</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="p-8 max-w-6xl mx-auto space-y-10 pb-24">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-slate-100">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase tracking-widest">Reported Concerns</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Audit of student-reported attendance failures</p>
                    </div>
                </div>

                <div className="grid gap-6">
                    {issues.length === 0 ? (
                        <div className="bg-white rounded-[48px] border border-slate-200 p-20 text-center shadow-sm">
                            <CheckCircle className="w-16 h-16 text-emerald-100 mx-auto mb-6" />
                            <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase tracking-widest mb-2">Registry Clear</h3>
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Zero pending incidents detected</p>
                        </div>
                    ) : (
                        issues.map((issue: Issue) => (
                            <div key={issue._id} className="bg-white rounded-[40px] border border-slate-200 p-10 hover:shadow-2xl hover:shadow-indigo-50 transition-all flex flex-col lg:flex-row gap-10 relative group overflow-hidden">
                                <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 ${
                                    issue.status === 'resolved' ? 'bg-emerald-50' : 'bg-amber-50'
                                }`} />

                                <div className="flex-1 space-y-8 relative z-10">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-sm overflow-hidden">
                                                   <User className="w-8 h-8" />
                                                </div>
                                                <div>
                                                   <h3 className="text-2xl font-black text-slate-900 tracking-tight">{issue.studentId?.name}</h3>
                                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Roll ID: <span className="text-indigo-600">{issue.studentId?.rollNumber}</span></p>
                                                </div>
                                            </div>
                                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-100">
                                                <Zap className="w-3 h-3 text-indigo-400" />
                                                {getIssueTypeLabel(issue.issueType)}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-3 self-stretch justify-between">
                                            <span className={`inline-flex items-center gap-2 px-4 py-2 text-[10px] rounded-full font-black uppercase tracking-widest border ${
                                                issue.status === 'resolved' 
                                                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                                                    : 'bg-amber-100 text-amber-700 border-amber-200'
                                            }`}>
                                                {issue.status === 'resolved' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3 animate-pulse" />}
                                                {issue.status}
                                            </span>
                                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest font-mono">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(issue.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 rounded-[32px] p-8 border border-slate-100 group-hover:bg-white transition-colors duration-500">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center">
                                                <FileText className="w-3 h-3 text-indigo-600" />
                                            </div>
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Incident Rationalization</span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-600 leading-relaxed italic">
                                            "{issue.description}"
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-8 pt-2">
                                        <div className="flex items-center gap-3 group/meta">
                                            <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover/meta:bg-indigo-50 group-hover/meta:text-indigo-600 transition-all border border-slate-100">
                                                <Zap className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Subject Context</p>
                                                <p className="text-[11px] font-black text-slate-900 uppercase tracking-tighter">{issue.sessionId?.subject}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 group/meta">
                                            <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover/meta:bg-indigo-50 group-hover/meta:text-indigo-600 transition-all border border-slate-100">
                                                <Mail className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Correspondence</p>
                                                <p className="text-[11px] font-black text-slate-900 uppercase tracking-tighter">{issue.studentId?.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:w-px lg:bg-slate-100 self-stretch invisible lg:visible"></div>

                                <div className="flex flex-col justify-center lg:min-w-[180px] relative z-10">
                                    {issue.status === 'pending' ? (
                                        <button
                                            onClick={() => handleResolve(issue._id)}
                                            className="group/btn relative w-full py-6 px-8 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-[24px] hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 flex items-center justify-center gap-3 overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                                            <CheckCircle className="w-5 h-5 relative z-10" />
                                            <span className="relative z-10">Execute Repair</span>
                                        </button>
                                    ) : (
                                        <div className="text-center p-6 bg-emerald-50 rounded-[32px] border border-emerald-100">
                                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-4">
                                                <CheckCircle className="w-8 h-8" />
                                            </div>
                                            <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Resolution Finalized</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}
