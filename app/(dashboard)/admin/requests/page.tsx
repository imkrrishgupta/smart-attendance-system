'use client';

import { useState, useEffect } from 'react';
import { Check, X, Clock, User, Calendar, ArrowUpRight, Loader2, Mail } from 'lucide-react';
import Link from 'next/link';

interface LeaveRequest {
    _id: string;
    teacherId: {
        _id: string;
        name: string;
        email: string;
        branch?: string;
    };
    startDate: string;
    endDate: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
}

export default function AdminLeaveRequestsPage() {
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await fetch('/api/teacher/leave');
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

    const handleAction = async (id: string, status: 'approved' | 'rejected') => {
        try {
            const res = await fetch(`/api/admin/requests/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                fetchRequests();
            }
        } catch (error) {
            console.error(`Failed to ${status} request`, error);
        }
    };

    const stats = {
        total: requests.length,
        pending: requests.filter((r: LeaveRequest) => r.status === 'pending').length,
        approved: requests.filter((r: LeaveRequest) => r.status === 'approved').length
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hydrating Request Registry...</p>
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
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Leave Authorization</h1>
                        <div className="flex items-center gap-2 text-slate-500 mt-1 text-sm font-medium">
                            <Link href="/admin/dashboard" className="hover:text-indigo-600 transition-colors">Portal</Link>
                            <span className="text-slate-300">/</span>
                            <span className="text-slate-900 font-semibold italic">Faculty Requests</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="p-8 max-w-7xl mx-auto space-y-10 pb-12">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">Total Applications</p>
                        <h3 className="text-4xl font-black text-slate-900 relative z-10 tracking-tight">{stats.total}</h3>
                    </div>
                    <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10 text-yellow-600">Awaiting Decision</p>
                        <h3 className="text-4xl font-black text-slate-900 relative z-10 tracking-tight text-yellow-600">{stats.pending}</h3>
                    </div>
                    <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10 text-green-600">Authorized Absences</p>
                        <h3 className="text-4xl font-black text-slate-900 relative z-10 tracking-tight text-green-600">{stats.approved}</h3>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white">
                                <Mail className="w-5 h-5" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase tracking-widest">Incoming Requests</h2>
                        </div>
                    </div>

                    <div className="grid gap-6">
                        {requests.length === 0 ? (
                            <div className="py-32 text-center bg-white rounded-[48px] border-4 border-dashed border-slate-100 opacity-40">
                                <Mail className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registry Empty: No Requests Found</p>
                            </div>
                        ) : (
                            requests.map((req: LeaveRequest) => (
                                <div key={req._id} className="bg-white rounded-[40px] p-8 border border-slate-200 hover:border-indigo-600 hover:shadow-2xl hover:shadow-indigo-50/50 transition-all group relative grid grid-cols-1 lg:grid-cols-4 gap-8 overflow-hidden items-center">
                                    <div className="absolute top-0 left-0 w-2 h-0 group-hover:h-full bg-indigo-600 transition-all duration-300" />
                                    
                                    <div className="col-span-1 lg:col-span-1 flex items-center gap-6">
                                        <div className="w-20 h-20 rounded-[28px] bg-slate-900 flex items-center justify-center text-white text-3xl font-black group-hover:scale-105 transition-transform shadow-2xl shadow-slate-200">
                                            {req.teacherId.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight">{req.teacherId.name}</h3>
                                            <p className="text-xs font-medium text-slate-400 lowercase">{req.teacherId.email}</p>
                                        </div>
                                    </div>

                                    <div className="col-span-1 lg:col-span-2 space-y-4">
                                        <div className="flex items-center gap-6">
                                            <div className="px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3">
                                                <Calendar className="w-4 h-4 text-indigo-500" />
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-slate-900 tracking-tight">{new Date(req.startDate).toLocaleDateString()}</span>
                                                    <span className="text-[10px] font-black text-slate-300 uppercase">to</span>
                                                    <span className="text-sm font-bold text-slate-900 tracking-tight">{new Date(req.endDate).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full border ${
                                                    req.status === 'approved' ? 'bg-green-50 text-green-700 border-green-100' :
                                                    req.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                                                    'bg-yellow-50 text-yellow-700 border-yellow-100'
                                                }`}>
                                                    {req.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 italic text-slate-600 relative">
                                            <div className="absolute top-0 left-0 w-12 h-12 bg-white rounded-br-3xl -ml-2 -mt-2 -rotate-12 opacity-50" />
                                            <span className="relative z-10 font-medium leading-relaxed block overflow-hidden line-clamp-2" title={req.reason}>
                                                &ldquo;{req.reason}&rdquo;
                                            </span>
                                        </div>
                                    </div>

                                    <div className="col-span-1 lg:col-span-1 flex lg:justify-end gap-3">
                                        {req.status === 'pending' ? (
                                            <>
                                                <button
                                                    onClick={() => handleAction(req._id, 'approved')}
                                                    className="flex-1 lg:flex-none px-6 py-4 bg-green-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-green-600 transition-all shadow-lg shadow-green-100 active:scale-95 flex items-center justify-center gap-2"
                                                >
                                                    <Check className="w-4 h-4" /> Approve
                                                </button>
                                                <button
                                                    onClick={() => handleAction(req._id, 'rejected')}
                                                    className="w-16 h-16 bg-white border border-slate-100 text-slate-300 rounded-2xl hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all flex items-center justify-center active:scale-95 shadow-sm"
                                                >
                                                    <X className="w-6 h-6" />
                                                </button>
                                            </>
                                        ) : (
                                            <div className="px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                                                Decision Finalized
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
