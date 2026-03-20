'use client';

import { useState, useEffect } from 'react';
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
    X,
    ChevronRight,
    Zap,
    ShieldCheck,
    Lock
} from 'lucide-react';
import Link from 'next/link';
import FaceCapture from '@/components/attendance/FaceCapture';

export default function StudentSettings() {
    const [profile, setProfile] = useState<{ _id: string, name: string, email: string, rollNumber?: string, enrollmentNo?: string, isFaceEnrolled: boolean } | null>(null);
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
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                   <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Synchronizing profile node...</p>
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
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Profile Matrix</h1>
            <div className="flex items-center gap-2 text-slate-500 mt-1 text-sm font-medium">
              <Link href="/student/dashboard" className="hover:text-indigo-600 transition-colors">Portal</Link>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900 font-semibold italic">Identity Configurations</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="px-5 py-2.5 bg-slate-900 text-white rounded-2xl flex items-center gap-3 shadow-xl">
                <Shield className="w-4 h-4 text-indigo-400" />
                <span className="text-[10px] font-black uppercase tracking-widest">Secured Node</span>
             </div>
          </div>
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto space-y-10 pb-20">
        {message && (
          <div className={`p-6 rounded-[32px] flex items-center gap-4 border shadow-2xl animate-in slide-in-from-top-4 duration-500 ${
            message.type === 'success' 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-emerald-50' 
            : 'bg-rose-50 text-rose-700 border-rose-100 shadow-rose-50'
          }`}>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${message.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
               {message.type === 'success' ? <CheckCircle2 className="w-6 h-6 shrink-0" /> : <AlertCircle className="w-6 h-6 shrink-0" />}
            </div>
            <span className="text-xs font-black uppercase tracking-widest">{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Identity & Status Sidebar */}
          <div className="lg:col-span-4 space-y-10">
            <section className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-700">
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
              
              <div className="flex items-center gap-4 mb-10 relative z-10">
                 <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-100">
                    <IdCard className="w-5 h-5" />
                 </div>
                 <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase tracking-widest">Identification</h2>
              </div>
              
              <div className="space-y-8 relative z-10">
                <div className="group">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-3 px-1">Network Correspondence</label>
                  <div className="flex items-center gap-4 text-xs font-black text-slate-900 bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-inner group-hover:bg-white transition-colors">
                    <Mail className="w-4 h-4 text-indigo-400" />
                    {profile?.email}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="group">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-3 px-1">Roll ID</label>
                    <div className="text-xs font-black text-slate-900 bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-inner group-hover:bg-white transition-colors text-center font-mono">
                      {profile?.rollNumber || 'N/A'}
                    </div>
                  </div>
                  <div className="group">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-3 px-1">Term Cycle</label>
                    <div className="text-xs font-black text-indigo-600 bg-indigo-50 p-5 rounded-2xl border border-indigo-100 shadow-inner group-hover:bg-white transition-colors text-center font-mono uppercase">
                      Sem 2
                    </div>
                  </div>
                </div>

                <div className="group">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-3 px-1">Registration Index</label>
                  <div className="text-xs font-black text-slate-400 bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-inner group-hover:bg-white transition-colors flex items-center gap-4 font-mono">
                    <Hash className="w-4 h-4 opacity-30" />
                    {profile?.enrollmentNo || 'N/A'}
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-700">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
              
               <div className="flex items-center gap-4 mb-10 relative z-10">
                 <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                    <Camera className="w-5 h-5" />
                 </div>
                 <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase tracking-widest">Biometrics</h2>
              </div>
              
              <div className="space-y-6 relative z-10">
                <div className="flex items-center justify-between bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sync Intelligence</span>
                  {profile?.isFaceEnrolled ? (
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-200 shadow-sm">
                       <ShieldCheck className="w-3 h-3" />
                       Verified
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-amber-100 text-amber-700 rounded-full text-[9px] font-black uppercase tracking-widest border border-amber-200 shadow-sm animate-pulse">
                       <AlertCircle className="w-3 h-3" />
                       Pending
                    </div>
                  )}
                </div>

                {profile?.isFaceEnrolled ? (
                  <button
                    onClick={handleResetFaceData}
                    className="group/wipe w-full py-5 px-6 bg-white border border-slate-100 text-slate-400 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all flex items-center justify-center gap-3 shadow-sm active:scale-95"
                  >
                    <RefreshCw className="w-4 h-4 group-hover/wipe:rotate-180 transition-transform duration-500" /> 
                    Reset Biometric Map
                  </button>
                ) : (
                  <button
                    onClick={() => setShowEnrollment(true)}
                    className="w-full py-6 px-6 bg-indigo-600 text-white rounded-[24px] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-indigo-100 active:scale-95 group/btn relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                    <Camera className="w-5 h-5 relative z-10" /> 
                    <span className="relative z-10">Initiate Enrollment</span>
                  </button>
                )}
              </div>
            </section>
          </div>

          {/* Update Profiles Form */}
          <div className="lg:col-span-8 space-y-12">
            <section className="bg-white p-12 rounded-[48px] border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-2xl hover:shadow-indigo-50 transition-all duration-700">
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50 rotate-45 -mr-24 -mt-24 opacity-30 group-hover:scale-110 transition-transform duration-1000" />
              
              <div className="flex items-center gap-4 mb-12 relative z-10">
                 <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-100">
                    <User className="w-6 h-6" />
                 </div>
                 <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase tracking-widest leading-none">Profile Matrix</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Update identified user attributes</p>
                 </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-10 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="md:col-span-2 group">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-1 transition-colors group-focus-within:text-indigo-600">Cognitive Label (Full Name)</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-[11px] uppercase tracking-widest text-slate-900 focus:bg-white focus:border-indigo-600 outline-none transition-all shadow-sm shadow-slate-100 placeholder:text-slate-200"
                      placeholder="Input legal string..."
                      required
                    />
                  </div>

                  <div className="md:col-span-2 pt-6">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
                          <Lock className="w-5 h-5" />
                       </div>
                       <div>
                          <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase tracking-widest leading-none">Security Encryption</h3>
                          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1 italic">Authorized personnel only</p>
                       </div>
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-1 transition-colors group-focus-within:text-indigo-600">New Access Key</label>
                    <div className="relative">
                      <Key className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-16 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-[11px] uppercase tracking-widest text-slate-900 focus:bg-white focus:border-indigo-600 outline-none transition-all shadow-sm shadow-slate-100 placeholder:text-slate-200"
                        placeholder="Leave null for no update"
                      />
                    </div>
                  </div>
                  
                  <div className="group">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-1 transition-colors group-focus-within:text-indigo-600">Confirm Sequence</label>
                    <div className="relative">
                      <Key className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-16 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-[11px] uppercase tracking-widest text-slate-900 focus:bg-white focus:border-indigo-600 outline-none transition-all shadow-sm shadow-slate-100 placeholder:text-slate-200"
                        placeholder="Verify sequence..."
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-8">
                  <button
                    type="submit"
                    disabled={updating}
                    className="group/btn relative w-full md:w-auto px-12 py-6 bg-slate-900 text-white rounded-[24px] font-black text-[10px] uppercase tracking-[0.3em] overflow-hidden transition-all shadow-2xl shadow-slate-100 active:scale-95 disabled:opacity-50"
                  >
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                    {updating ? <Loader2 className="w-5 h-5 animate-spin mx-auto text-white" /> : (
                      <div className="flex items-center justify-center gap-4 relative z-10">
                        <span>Commit Registry Update</span>
                        <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </section>
            
            <div className="bg-indigo-600 rounded-[48px] p-12 text-white shadow-2xl shadow-indigo-100 relative overflow-hidden group/motive">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 group-hover/motive:scale-110 transition-transform duration-1000" />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                   <div className="w-20 h-20 bg-white/20 rounded-[32px] flex items-center justify-center shrink-0 backdrop-blur-md border border-white/20">
                      <Zap className="w-10 h-10 text-white" />
                   </div>
                   <div>
                      <h4 className="text-2xl font-black mb-3 tracking-tighter uppercase tracking-widest leading-none">Security Standard</h4>
                      <p className="text-indigo-100 text-[11px] font-bold leading-relaxed opacity-80 uppercase tracking-widest italic max-w-lg">
                        Regularly recalibrating access keys and biometric data ensures the integrity of your identity across the institutional registry.
                      </p>
                   </div>
                </div>
            </div>
          </div>
        </div>
      </main>

      {/* Enrollment Modal - Refined */}
      {showEnrollment && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 z-[100] animate-in fade-in duration-300">
          <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-xl overflow-hidden border border-white/20 transform animate-in zoom-in-95 duration-500">
            <div className="bg-white px-10 py-8 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                   <Camera className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase tracking-widest leading-none">Biometric Link</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                    <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black font-mono">Telemetry Active</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowEnrollment(false)}
                className="w-14 h-14 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center transition-all group active:scale-90"
              >
                <X className="w-6 h-6 text-slate-400 group-hover:text-slate-900 transition-colors" />
              </button>
            </div>
            <div className="p-10 space-y-10">
              <div className="bg-slate-50 rounded-[32px] p-8 border border-slate-100 flex gap-6 items-start">
                <ShieldCheck className="w-10 h-10 text-indigo-600 shrink-0 mt-1" />
                <p className="text-[11px] text-slate-500 font-bold leading-relaxed uppercase tracking-widest opacity-80">
                  Facial mapping data is encrypted and stored locally. Ensure your face is clearly visible within the telemetry frame for accurate synchronization.
                </p>
              </div>
              <div className="rounded-[40px] overflow-hidden border-2 border-slate-100 shadow-2xl">
                <FaceCapture
                  studentId={profile?._id || ''}
                  mode="enroll"
                  onVerified={() => {
                    fetchProfile();
                    setTimeout(() => setShowEnrollment(false), 2000);
                  }}
                  onFailed={(err: string) => {
                    console.error('Enrollment failed:', err);
                    setMessage({ type: 'error', text: err });
                  }}
                  onCancel={() => setShowEnrollment(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    );
}
