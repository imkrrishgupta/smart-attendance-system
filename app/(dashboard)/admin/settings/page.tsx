'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
    User,
    Settings,
    MapPin,
    Clock,
    Shield,
    Save,
    CheckCircle,
    AlertCircle,
    LogOut
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
                setSuccess('Settings updated successfully!');
                await update();
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to update settings');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white border-b border-slate-200">
                <div className="px-8 py-6">
                    <h1 className="text-3xl font-bold text-slate-900">Admin Settings</h1>
                    <p className="text-slate-600 mt-1">Manage your account and system configurations</p>
                </div>
            </header>

            <div className="p-8 max-w-4xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Profile Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <User className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Profile Information</h2>
                                <p className="text-sm text-slate-500">Update your personal details</p>
                            </div>
                        </div>
                        <div className="p-6 grid gap-6">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 text-left">Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 text-left">Email Address</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        disabled
                                        className="w-full px-4 py-3 rounded-lg border border-slate-100 bg-slate-50 text-slate-500 outline-none cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                <Shield className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Security</h2>
                                <p className="text-sm text-slate-500">Change your login password</p>
                            </div>
                        </div>
                        <div className="p-6 grid gap-6">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 text-left">Current Password</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.currentPassword}
                                        onChange={e => setFormData({ ...formData, currentPassword: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 text-left">New Password</label>
                                    <input
                                        type="password"
                                        placeholder="Leave blank to keep same"
                                        value={formData.newPassword}
                                        onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* System Config Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                <Settings className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">System Configuration</h2>
                                <p className="text-sm text-slate-500">Default settings for new sessions</p>
                            </div>
                        </div>
                        <div className="p-6 grid gap-6">
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <MapPin className="w-5 h-5 text-slate-400" />
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">Geo-fence Radius</p>
                                            <p className="text-xs text-slate-500">Default allowed distance (m)</p>
                                        </div>
                                    </div>
                                    <input
                                        type="number"
                                        value={formData.geoRadius}
                                        onChange={e => setFormData({ ...formData, geoRadius: e.target.value })}
                                        className="w-20 px-3 py-2 rounded-md border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <Clock className="w-5 h-5 text-slate-400" />
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">Session Duration</p>
                                            <p className="text-xs text-slate-500">Default active time (min)</p>
                                        </div>
                                    </div>
                                    <input
                                        type="number"
                                        value={formData.sessionDuration}
                                        onChange={e => setFormData({ ...formData, sessionDuration: e.target.value })}
                                        className="w-20 px-3 py-2 rounded-md border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>

                                <div className="sm:col-span-2 flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">Auto-Deactivation</p>
                                            <p className="text-xs text-slate-500">Automatically stop sessions after end time</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, autoDeactivate: !formData.autoDeactivate })}
                                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${formData.autoDeactivate ? 'bg-indigo-600' : 'bg-slate-200'}`}
                                    >
                                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.autoDeactivate ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feedback Messages */}
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
                            <AlertCircle className="w-5 h-5" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}
                    {success && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-700">
                            <CheckCircle className="w-5 h-5" />
                            <p className="text-sm font-medium">{success}</p>
                        </div>
                    )}

                    {/* Submit Action */}
                    <div className="flex justify-end pt-4 pb-12">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            Save Configuration
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
