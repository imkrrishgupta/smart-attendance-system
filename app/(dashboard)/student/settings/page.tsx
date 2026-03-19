'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
    User,
    Mail,
    IdCard,
    Hash,
    Shield,
    Key,
    RefreshCw,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Camera,
    X
} from 'lucide-react';
import FaceCapture from '@/components/attendance/FaceCapture';

export default function StudentSettings() {
    const { data: session } = useSession();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form states
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showEnrollment, setShowEnrollment] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/user/profile');
            if (res.ok) {
                const data = await res.json();
                setProfile(data);
                setName(data.name);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password && password !== confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }

        setUpdating(true);
        setMessage(null);

        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, password: password || undefined })
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Profile updated successfully' });
                setPassword('');
                setConfirmPassword('');
                fetchProfile();
            } else {
                const data = await res.json();
                setMessage({ type: 'error', text: data.error || 'Failed to update profile' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Server error' });
        } finally {
            setUpdating(false);
        }
    };

    const handleResetFaceData = async () => {
        if (!confirm('This will delete your recorded face data. You will need to enroll again next time you mark attendance. Proceed?')) {
            return;
        }

        try {
            const res = await fetch('/api/user/profile', { method: 'DELETE' });
            if (res.ok) {
                setMessage({ type: 'success', text: 'Face data reset successfully' });
                fetchProfile();
            } else {
                setMessage({ type: 'error', text: 'Failed to reset face data' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Server error' });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Account Settings</h1>
                <p className="text-slate-500 text-sm">Manage your profile, security, and authentication data.</p>
            </div>

            {message && (
                <div className={`p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <span className="text-sm font-medium">{message.text}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Info (Read-only) */}
                <div className="lg:col-span-1 space-y-6">
                    <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <IdCard className="w-4 h-4" /> Identification
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Email Address</label>
                                <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                                    <Mail className="w-4 h-4 text-slate-400" />
                                    {profile?.email}
                                </div>
                            </div>
                            <div className="pt-4 border-t border-slate-100">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Roll Number</label>
                                <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                                    <Hash className="w-4 h-4 text-slate-400" />
                                    {profile?.rollNumber || 'N/A'}
                                </div>
                            </div>
                            <div className="pt-4 border-t border-slate-100">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Enrollment Number</label>
                                <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                                    <Shield className="w-4 h-4 text-slate-400" />
                                    {profile?.enrollmentNo || 'N/A'}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Camera className="w-4 h-4" /> Authentication
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600">Face Data</span>
                                {profile?.isFaceEnrolled ? (
                                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase">Enrolled</span>
                                ) : (
                                    <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold uppercase text-nowrap">Not Registered</span>
                                )}
                            </div>
                            {profile?.isFaceEnrolled ? (
                                <button
                                    onClick={handleResetFaceData}
                                    className="w-full mt-2 py-2 px-4 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <RefreshCw className="w-4 h-4" /> Reset Face Data
                                </button>
                            ) : (
                                <button
                                    onClick={() => setShowEnrollment(true)}
                                    className="w-full mt-2 py-3 px-4 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
                                >
                                    <Camera className="w-4 h-4" /> Register Biometrics
                                </button>
                            )}
                        </div>
                    </section>
                </div>

                {/* Enrollment Modal */}
                {showEnrollment && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-white/20">
                            <div className="bg-slate-50 px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-slate-900">Biometric Registration</h3>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-0.5">Step 1: Face Enrollment</p>
                                </div>
                                <button
                                    onClick={() => setShowEnrollment(false)}
                                    className="p-2 hover:bg-slate-200/50 rounded-full transition-colors text-slate-400"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-6">
                                <FaceCapture
                                    studentId={profile?._id}
                                    mode="enroll"
                                    onVerified={() => {
                                        fetchProfile();
                                        setTimeout(() => setShowEnrollment(false), 2000);
                                    }}
                                    onFailed={(err) => {
                                        console.error('Enrollment failed:', err);
                                        setMessage({ type: 'error', text: err });
                                    }}
                                    onCancel={() => setShowEnrollment(false)}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Update Form */}
                <div className="lg:col-span-2">
                    <section className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm h-full">
                        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-600" /> Profile & Security
                        </h2>
                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                                    placeholder="Your display name"
                                    required
                                />
                            </div>

                            <div className="pt-6 border-t border-slate-100">
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Key className="w-4 h-4 text-blue-600" /> Change Password
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-2">New Password</label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                                            placeholder="Leave blank to keep current"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-2">Confirm New Password</label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                                            placeholder="Repeat new password"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8">
                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Profile Changes'}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            </div>
        </div>
    );
}
