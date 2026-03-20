'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
    User,
    Settings,
    MapPin,
    Clock,
    Shield,
    Save,
    CheckCircle,
    AlertCircle,
    ChevronRight,
    Lock,
    Cpu,
    Loader2
} from 'lucide-react';

export default function AdminSettingsPage() {
    const { data: session, update } = useSession();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        geoRadius: '100',
        sessionDuration: '60',
        autoDeactivate: true
    });

    useEffect(() => {
        if (session?.user) {
            setFormData(prev => ({
                ...prev,
                name: session.user.name || '',
                email: session.user.email || ''
            }));
        }
    }, [session]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                })
            });

            if (res.ok) {
                setSuccess('Security credentials and profile updated successfully!');
                await update();
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to sync settings with vault');
            }
        } catch (err) {
            setError('Operational error occurred during synchronization');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Preferences</h1>
                        <div className="flex items-center gap-2 text-slate-500 mt-1 text-sm font-medium">
                            <Link href="/admin/dashboard" className="hover:text-indigo-600 transition-colors">Portal</Link>
                            <span className="text-slate-300">/</span>
                            <span className="text-slate-900 font-semibold italic">Control Center</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="p-8 max-w-5xl mx-auto pb-24">
                <form onSubmit={handleSubmit} className="space-y-12">
                    {/* Identity Module */}
                    <div className="bg-white rounded-[48px] border border-slate-200 shadow-sm overflow-hidden group transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200/50">
                        <div className="p-10 border-b border-slate-100 bg-white flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center shadow-2xl shadow-slate-200 group-hover:scale-105 transition-transform duration-500">
                                    <User className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase tracking-widest">Identity Profile</h2>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Official administrator credentials</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-10 grid gap-8 transition-all duration-500">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-left">Legal Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Administrator Name"
                                        className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[24px] text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-300 shadow-sm"
                                    />
                                </div>
                                <div className="space-y-2 text-left">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-left">Internal Registry Email</label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            value={formData.email}
                                            disabled
                                            className="w-full px-6 py-5 bg-slate-50 border border-slate-100 text-slate-400 rounded-[24px] text-sm font-bold outline-none cursor-not-allowed italic shadow-inner"
                                        />
                                        <Lock className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security Subsystem */}
                    <div className="bg-white rounded-[48px] border border-slate-200 shadow-sm overflow-hidden group transition-all duration-500 hover:shadow-2xl hover:shadow-red-50">
                        <div className="p-10 border-b border-slate-100 bg-white flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-red-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-red-100 group-hover:scale-105 transition-transform duration-500">
                                    <Shield className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase tracking-widest">Access Control</h2>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Encryption & core security tokens</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-10 grid gap-8 transition-all duration-500">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-left">Verified Password</label>
                                    <input
                                        type="password"
                                        placeholder="Current Identity Token"
                                        value={formData.currentPassword}
                                        onChange={e => setFormData({ ...formData, currentPassword: e.target.value })}
                                        className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[24px] text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-300 shadow-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-left">New Security Token</label>
                                    <input
                                        type="password"
                                        placeholder="Leave blank to maintain current"
                                        value={formData.newPassword}
                                        onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
                                        className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[24px] text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-300 shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Operational Core (Config) */}
                    <div className="bg-white rounded-[48px] border border-slate-200 shadow-sm overflow-hidden group transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-50">
                        <div className="p-10 border-b border-slate-100 bg-white flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-100 group-hover:scale-105 transition-transform duration-500">
                                    <Cpu className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase tracking-widest">Internal Engine</h2>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">System-wide operational parameters</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-10 space-y-8 transition-all duration-500">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="flex items-center justify-between p-8 bg-slate-50 rounded-[32px] border border-slate-100 group/item hover:bg-white hover:border-indigo-600 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-indigo-50/50">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm group-hover/item:bg-indigo-50 group-hover/item:border-indigo-100 transition-colors">
                                            <MapPin className="w-6 h-6 text-indigo-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 tracking-tight">Geo-Fence Radius</p>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Allowed distance (meters)</p>
                                        </div>
                                    </div>
                                    <input
                                        type="number"
                                        value={formData.geoRadius}
                                        onChange={e => setFormData({ ...formData, geoRadius: e.target.value })}
                                        className="w-24 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-black text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none text-center shadow-inner"
                                    />
                                </div>

                                <div className="flex items-center justify-between p-8 bg-slate-50 rounded-[32px] border border-slate-100 group/item hover:bg-white hover:border-indigo-600 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-indigo-50/50">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm group-hover/item:bg-amber-50 group-hover/item:border-amber-100 transition-colors">
                                            <Clock className="w-6 h-6 text-amber-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 tracking-tight">Session Lifespan</p>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Default duration (minutes)</p>
                                        </div>
                                    </div>
                                    <input
                                        type="number"
                                        value={formData.sessionDuration}
                                        onChange={e => setFormData({ ...formData, sessionDuration: e.target.value })}
                                        className="w-24 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-black text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none text-center shadow-inner"
                                    />
                                </div>

                                <div className="md:col-span-2 flex items-center justify-between p-8 bg-slate-50 rounded-[32px] border border-slate-100 group/item hover:bg-white hover:border-green-600 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-green-50/50">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm group-hover/item:bg-green-50 group-hover/item:border-green-100 transition-colors">
                                            <CheckCircle className="w-6 h-6 text-green-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 tracking-tight">Auto-Shutdown Protocol</p>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Deactivate sessions upon expiration</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, autoDeactivate: !formData.autoDeactivate })}
                                        className={`relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-4 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${formData.autoDeactivate ? 'bg-green-500' : 'bg-slate-200'}`}
                                    >
                                        <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-xl ring-0 transition duration-300 ease-in-out ${formData.autoDeactivate ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feedback Integration */}
                    {error && (
                        <div className="p-8 bg-red-50 border border-red-100 rounded-[32px] flex items-center gap-5 text-red-700 animate-in slide-in-from-top-4 duration-300 shadow-sm">
                            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0 border border-red-200">
                                <AlertCircle className="w-7 h-7 text-red-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">System Error</p>
                                <p className="text-sm font-bold tracking-tight">{error}</p>
                            </div>
                        </div>
                    )}
                    {success && (
                        <div className="p-8 bg-green-50 border border-green-100 rounded-[32px] flex items-center gap-5 text-green-700 animate-in slide-in-from-top-4 duration-300 shadow-sm">
                            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0 border border-green-200">
                                <CheckCircle className="w-7 h-7 text-green-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Protocol Success</p>
                                <p className="text-sm font-bold tracking-tight">{success}</p>
                            </div>
                        </div>
                    )}

                    {/* Execution Action */}
                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative px-10 py-6 bg-indigo-600 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center gap-4 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            {loading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <Save className="w-6 h-6 relative z-10" />
                            )}
                            <span className="relative z-10 font-black">{loading ? 'Syncing...' : 'Commit Preferences'}</span>
                            <ChevronRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
