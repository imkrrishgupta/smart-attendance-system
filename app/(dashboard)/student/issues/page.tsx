'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { AlertCircle, CheckCircle, Clock, Send, Inbox, ArrowRight, Loader2, MessageSquare, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

interface Session {
    _id: string;
    subject: string;
    startTime: string;
}

interface Issue {
    _id: string;
    sessionId: Session;
    issueType: string;
    description: string;
    status: 'pending' | 'resolved';
    createdAt: string;
}

export default function StudentIssuesPage() {
    const { data: session } = useSession();
    const [issues, setIssues] = useState<Issue[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedSession, setSelectedSession] = useState('');
    const [issueType, setIssueType] = useState('face_mismatch');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const studentId = (session?.user as any)?.id;

    useEffect(() => {
        fetchSessions();
    }, []);

    useEffect(() => {
        if (studentId) {
            fetchIssues();
        }
    }, [studentId]);

    const fetchSessions = async () => {
        try {
            const res = await fetch('/api/attendance/sessions');
            if (res.ok) {
                const data = await res.json();
                setSessions(data);
            }
        } catch (error) {
            console.error('Failed to fetch sessions', error);
        }
    };

    const fetchIssues = async () => {
        try {
            const res = await fetch(`/api/student/issues?studentId=${studentId}`);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!studentId || !selectedSession || !issueType || !description) return;

        setSubmitting(true);
        try {
            const res = await fetch('/api/student/issues', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId, sessionId: selectedSession, issueType, description })
            });

            if (res.ok) {
                setSelectedSession('');
                setDescription('');
                setIssueType('face_mismatch');
                fetchIssues();
            }
        } catch (error) {
            console.error('Failed to submit issue', error);
        } finally {
            setSubmitting(false);
        }
    };

    const getIssueTypeLabel = (type: string) => {
        const types: Record<string, string> = {
            face_mismatch: 'Face Biometric Mismatch',
            location_fail: 'Spatial Coordinate Error',
            session_inactive: 'Terminal Node Locked',
            other: 'Miscellaneous Discrepancy'
        };
        return types[type] || type;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <header className="bg-white border-b border-slate-200">
                <div className="px-8 py-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Support Interface</h1>
                            <div className="flex items-center gap-2 text-slate-500 mt-2 font-medium">
                                <Link href="/student/dashboard" className="hover:text-blue-600 transition-colors">Neural</Link>
                                <span className="text-slate-300">/</span>
                                <span className="text-slate-900 font-bold">Discrepancy Logs</span>
                            </div>
                        </div>
                        <div className="bg-blue-50 px-6 py-3 rounded-2xl border border-blue-100">
                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest leading-none mb-1">Authenticated ID</p>
                            <p className="text-blue-900 font-bold text-sm">{(session?.user as any)?.email}</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="p-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Form Section */}
                <div className="lg:col-span-5 space-y-8">
                    <div className="bg-white rounded-[40px] border border-slate-200 p-10 shadow-sm relative overflow-hidden group">
                        <div className="relative z-10">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3 mb-8 uppercase">
                                <ShieldAlert className="w-6 h-6 text-blue-600" />
                                Raise Discrepancy
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Subject Node</label>
                                    <select
                                        required
                                        value={selectedSession}
                                        onChange={(e) => setSelectedSession(e.target.value)}
                                        className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                                    >
                                        <option value="" disabled>Select active session...</option>
                                        {sessions.map((s: Session) => (
                                            <option key={s._id} value={s._id}>{s.subject} [{new Date(s.startTime).toLocaleDateString()}]</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Discrepancy Category</label>
                                    <select
                                        required
                                        value={issueType}
                                        onChange={(e) => setIssueType(e.target.value)}
                                        className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                                    >
                                        <option value="face_mismatch">Face Biometric Mismatch (&lt; 85%)</option>
                                        <option value="location_fail">Spatial Coordinate Verification Failure</option>
                                        <option value="session_inactive">Terminal Node Inactivity Error</option>
                                        <option value="other">Miscellaneous Technical Anomaly</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Detailed Observation</label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                                        placeholder="Describe the anomaly detected..."
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-2xl shadow-slate-900/10 disabled:opacity-50 flex items-center justify-center gap-3 group"
                                >
                                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                        <>
                                            Transmit Report
                                            <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl -mr-16 -mt-16"></div>
                    </div>

                    <div className="bg-slate-900 rounded-[30px] p-8 text-white relative overflow-hidden border border-white/5">
                        <div className="relative z-10 flex gap-4">
                            <Clock className="w-6 h-6 text-blue-400 shrink-0" />
                            <div>
                                <h4 className="text-sm font-black uppercase tracking-widest mb-2 text-slate-400">Response Protocol</h4>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    All submitted logs are reviewed by the neural grid administrators. Verification status updates will appear in your dynamic history.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* History Section */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Archived Logs</h2>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-4 py-2 rounded-xl border border-slate-200">Total: {issues.length}</span>
                    </div>

                    <div className="space-y-4">
                        {issues.length === 0 ? (
                            <div className="bg-white rounded-[40px] border border-slate-200 p-20 text-center flex flex-col items-center justify-center space-y-6 grayscale opacity-40">
                                <Inbox className="w-16 h-16 text-slate-300" />
                                <p className="font-black uppercase tracking-widest text-slate-400 text-sm italic">Universal Clear: No Anomalies Logged</p>
                            </div>
                        ) : (
                            issues.map((issue: Issue) => (
                                <div key={issue._id} className="bg-white rounded-[32px] border border-slate-200 p-8 hover:border-blue-500 transition-all duration-300 shadow-sm group">
                                    <div className="flex flex-col sm:flex-row justify-between gap-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                    <MessageSquare className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase text-sm tracking-tight">
                                                        {issue.sessionId?.subject || 'Reference Null'}
                                                    </h3>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{getIssueTypeLabel(issue.issueType)}</p>
                                                </div>
                                            </div>
                                            <p className="text-slate-600 font-medium leading-relaxed mb-4 pl-13">
                                                {issue.description}
                                            </p>
                                            <div className="flex items-center gap-6 pl-13">
                                                <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(issue.createdAt).toLocaleDateString()}
                                                </div>
                                                <div className="px-3 py-1 bg-slate-50 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-tighter">UID-{issue._id.slice(-8).toUpperCase()}</div>
                                            </div>
                                        </div>
                                        <div className="flex sm:flex-col justify-between items-center sm:items-end gap-2 shrink-0">
                                            <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm transition-all ${
                                                issue.status === 'resolved' 
                                                ? 'bg-green-100 text-green-700 border border-green-200' 
                                                : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                                            }`}>
                                                {issue.status}
                                            </span>
                                            <div className="text-slate-300 group-hover:text-blue-200 transition-colors hidden sm:block">
                                                <ArrowRight className="w-6 h-6" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
