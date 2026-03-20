"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus, Mail, Lock, User, Loader2, ChevronRight, Check, AlertTriangle } from "lucide-react";
import Link from 'next/link';
import axios from "axios";

export default function AddTeacherPage() {
  const router = useRouter();

  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const res = await axios.post("/api/teachers", user);

      setSuccess("Faculty credentials registered successfully");

      setUser({
        name: "",
        email: "",
        password: "",
      });

      setTimeout(() => {
        router.push("/admin/teachers");
        router.refresh();
      }, 1500);

    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to establish faculty record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <Link 
              href="/admin/teachers" 
              className="w-12 h-12 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Register Faculty</h1>
              <div className="flex items-center gap-2 text-slate-500 mt-1 text-sm font-medium">
                <Link href="/admin/dashboard" className="hover:text-indigo-600 transition-colors">Portal</Link>
                <span className="text-slate-300">/</span>
                <Link href="/admin/teachers" className="hover:text-indigo-600 transition-colors">Faculty</Link>
                <span className="text-slate-300">/</span>
                <span className="text-slate-900 font-semibold italic">New Admission</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="p-8 max-w-2xl mx-auto py-20">
        <div className="bg-white rounded-[48px] border border-slate-200 shadow-sm overflow-hidden group transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-50">
          <div className="p-10 border-b border-slate-100 bg-white flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center shadow-2xl shadow-slate-200 group-hover:scale-105 transition-transform duration-500">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase tracking-widest">Faculty Onboarding</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Create new secure access credentials</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-10 space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-left">Full Name</label>
                <div className="relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter full legal name"
                    value={user.name}
                    onChange={handleChange}
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-[24px] text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-300 shadow-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-left">Email Address</label>
                <div className="relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder="faculty@institution.edu"
                    value={user.email}
                    onChange={handleChange}
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-[24px] text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-300 shadow-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-left">Initial Security Token</label>
                <div className="relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={user.password}
                    onChange={handleChange}
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-[24px] text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-300 shadow-sm"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Status Messages */}
            {error && (
              <div className="p-6 bg-red-50 border border-red-100 rounded-[24px] flex items-center gap-4 text-red-700 animate-in slide-in-from-top-2 duration-300">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <p className="text-xs font-bold tracking-tight">{error}</p>
              </div>
            )}
            {success && (
              <div className="p-6 bg-green-50 border border-green-100 rounded-[24px] flex items-center gap-4 text-green-700 animate-in slide-in-from-top-2 duration-300">
                <Check className="w-5 h-5 flex-shrink-0" />
                <p className="text-xs font-bold tracking-tight">{success}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full py-6 bg-indigo-600 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-4 overflow-hidden mt-6"
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <UserPlus className="w-6 h-6 relative z-10" />
              )}
              <span className="relative z-10">{loading ? 'Processing...' : 'Complete Registration'}</span>
              <ChevronRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
