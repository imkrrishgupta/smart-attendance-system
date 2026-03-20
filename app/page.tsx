'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import {
  ArrowRight, Shield, Users, BarChart3, CheckCircle,
  Menu, X, MapPin, Cpu, Lock, Zap, ChevronRight
} from 'lucide-react';

type FeatureColor = 'indigo' | 'green' | 'blue';

type Feature = {
  title: string;
  description: string;
  icon: React.ElementType;
  color: FeatureColor;
  route: string;
  benefits: string[];
  stat: string;
  statLabel: string;
};

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');

  * { box-sizing: border-box; }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-12px); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse-ring {
    0%   { box-shadow: 0 0 0 0 rgba(99,102,241,0.4); }
    70%  { box-shadow: 0 0 0 16px rgba(99,102,241,0); }
    100% { box-shadow: 0 0 0 0 rgba(99,102,241,0); }
  }
  @keyframes spin-slow    { to { transform: rotate(360deg); } }
  @keyframes spin-reverse { to { transform: rotate(-360deg); } }
  @keyframes shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  .font-sora { font-family: 'Sora', sans-serif; }

  .mesh-bg {
    background-color: #f8faff;
    background-image:
      radial-gradient(at 15% 40%, rgba(99,102,241,0.08) 0%, transparent 50%),
      radial-gradient(at 85% 15%, rgba(34,197,94,0.06) 0%, transparent 40%),
      radial-gradient(at 65% 85%, rgba(59,130,246,0.06) 0%, transparent 40%);
  }

  .glass-card {
    background: rgba(255,255,255,0.75);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.9);
  }

  .shimmer-btn {
    background: linear-gradient(90deg, #4338ca, #6366f1, #818cf8, #6366f1, #4338ca);
    background-size: 200% auto;
    animation: shimmer 3s linear infinite;
  }

  .animate-float         { animation: float 5s ease-in-out infinite; }
  .animate-float-delay   { animation: float 5s ease-in-out 0.8s infinite; }
  .animate-float-delay2  { animation: float 5s ease-in-out 1.6s infinite; }
  .animate-pulse-ring    { animation: pulse-ring 2.5s ease-in-out infinite; }
  .orbit-cw              { animation: spin-slow    14s linear infinite; transform-origin: center; }
  .orbit-ccw             { animation: spin-reverse 20s linear infinite; transform-origin: center; }

  .fade-up-1 { animation: fadeUp 0.7s 0.1s ease both; }
  .fade-up-2 { animation: fadeUp 0.7s 0.25s ease both; }
  .fade-up-3 { animation: fadeUp 0.7s 0.4s ease both; }
  .fade-up-4 { animation: fadeUp 0.7s 0.55s ease both; }

  .card-hover {
    transition: transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease;
  }
  .card-hover:hover {
    transform: translateY(-8px);
    box-shadow: 0 28px 56px -16px rgba(0,0,0,0.13);
  }

  .stat-gradient {
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .nav-link { position: relative; }
  .nav-link::after {
    content: '';
    position: absolute; bottom: -2px; left: 0;
    width: 0; height: 2px;
    background: #4f46e5;
    transition: width 0.25s ease;
  }
  .nav-link:hover::after { width: 100%; }

  .step-connector {
    position: absolute;
    top: 52px; left: calc(33.33% + 16px); right: calc(33.33% + 16px);
    height: 2px;
    background: linear-gradient(90deg, #c7d2fe, #6366f1, #c7d2fe);
    display: none;
  }
  @media (min-width: 768px) { .step-connector { display: block; } }
`;

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const dashboardRoute =
    session?.user.role === 'admin' ? '/admin/dashboard'
      : session?.user.role === 'teacher' ? '/teacher/dashboard'
        : '/student/dashboard';

  const features: Feature[] = [
    {
      title: 'Admin Panel',
      description: 'Full system control — manage staff, students, timetables, and deep analytics from one command centre.',
      icon: Shield, color: 'indigo', route: '/admin/dashboard',
      benefits: ['Manage teachers & students', 'Build timetables', 'Real-time monitoring', 'Analytics & reports'],
      stat: '100%', statLabel: 'Visibility',
    },
    {
      title: 'Teacher Panel',
      description: 'Launch sessions, see who\'s present live, and resolve exceptions in seconds — all from a clean interface.',
      icon: Users, color: 'green', route: '/teacher/dashboard',
      benefits: ['Start / end sessions', 'Live attendance feed', 'Exception management', 'Leave requests'],
      stat: '3×', statLabel: 'Faster than paper',
    },
    {
      title: 'Student Panel',
      description: 'Mark attendance with a tap. Face auth + GPS confirm your presence automatically — zero proxies, zero doubt.',
      icon: BarChart3, color: 'blue', route: '/student/dashboard',
      benefits: ['Face authentication', 'GPS verification', 'Attendance history', 'Raise disputes'],
      stat: '0%', statLabel: 'Proxy success rate',
    },
  ];

  const stats = [
    { value: '99.8%', label: 'Recognition accuracy' },
    { value: '<1s', label: 'Verification time' },
    { value: '0%', label: 'Proxy success rate' },
    { value: '24/7', label: 'System uptime' },
  ];

  const colorMap = {
    indigo: { bg: 'bg-indigo-600', light: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200', badge: 'bg-indigo-100 text-indigo-700', shadow: 'shadow-indigo-200' },
    green: { bg: 'bg-green-600', light: 'bg-green-50', text: 'text-green-600', border: 'border-green-200', badge: 'bg-green-100 text-green-700', shadow: 'shadow-green-200' },
    blue: { bg: 'bg-blue-600', light: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700', shadow: 'shadow-blue-200' },
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="min-h-screen mesh-bg font-sora">

        {/* ── NAV ── */}
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-lg shadow-sm border-b border-slate-100' : 'bg-transparent'}`}>
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">
                Smart<span className="text-indigo-600">Attend</span>
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              {['Features', 'How it works', 'Roles'].map(item => (
                <a key={item} href="#" className="nav-link text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">{item}</a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              {!session ? (
                <>
                  <Link href="/login" className="px-5 py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
                    Sign in
                  </Link>
                  <Link href="/register" className="shimmer-btn px-5 py-2.5 text-white text-sm font-semibold rounded-xl hover:scale-105 hover:shadow-lg hover:shadow-indigo-200 transition-all">
                    Get started →
                  </Link>
                </>
              ) : (
                <>
                  <Link href={dashboardRoute} className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors">
                    Dashboard
                  </Link>
                  <button onClick={() => signOut()} className="px-4 py-2 text-sm font-semibold text-red-500 hover:text-red-600 transition-colors">
                    Sign out
                  </button>
                </>
              )}
            </div>

            <button className="md:hidden text-slate-700" onClick={() => setMobileMenuOpen(p => !p)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden bg-white border-t border-slate-100 px-6 py-5 space-y-3">
              {!session ? (
                <>
                  <Link href="/login" className="block text-center py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700">Sign in</Link>
                  <Link href="/register" className="block text-center py-3 bg-indigo-600 rounded-xl text-sm font-semibold text-white">Get started</Link>
                </>
              ) : (
                <>
                  <Link href={dashboardRoute} className="block text-center py-3 bg-indigo-600 rounded-xl text-sm font-semibold text-white">Dashboard</Link>
                  <button onClick={() => signOut()} className="block w-full text-center py-3 border border-red-200 rounded-xl text-sm font-semibold text-red-500">Sign out</button>
                </>
              )}
            </div>
          )}
        </nav>

        {/* ── HERO ── */}
        <section className="relative overflow-hidden pt-32 pb-28 px-6">
          <div className="absolute top-16 right-16 w-[500px] h-[500px] bg-indigo-100 rounded-full blur-3xl opacity-50 pointer-events-none" />
          <div className="absolute bottom-8 left-8 w-80 h-80 bg-green-100 rounded-full blur-3xl opacity-35 pointer-events-none" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-25 pointer-events-none" />

          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">

              {/* Copy */}
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-full text-sm font-semibold mb-8 fade-up-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  AI-Powered · Real-Time Verified
                </div>

                <h1 className="text-5xl xl:text-6xl font-extrabold text-slate-900 leading-[1.06] tracking-tight mb-7 fade-up-2">
                  Attendance that<br />
                  <span className="text-indigo-600">knows the truth.</span>
                </h1>

                <p className="text-xl text-slate-500 leading-relaxed mb-10 max-w-lg fade-up-3">
                  Face recognition + geo-fencing in one seamless system.
                  Every check-in verified, every record bulletproof.
                </p>

                <div className="flex flex-wrap items-center gap-4 mb-12 fade-up-4">
                  {!session ? (
                    <>
                      <Link href="/register" className="shimmer-btn inline-flex items-center gap-2 px-8 py-4 text-white font-bold rounded-2xl hover:scale-105 hover:shadow-xl hover:shadow-indigo-300 transition-all text-base">
                        Start for free <ArrowRight className="w-5 h-5" />
                      </Link>
                      <Link href="/login" className="inline-flex items-center gap-2 px-8 py-4 border-2 border-slate-200 text-slate-700 font-semibold rounded-2xl hover:border-indigo-300 hover:text-indigo-600 transition-all text-base">
                        Sign in
                      </Link>
                    </>
                  ) : (
                    <Link href={dashboardRoute} className="shimmer-btn inline-flex items-center gap-2 px-8 py-4 text-white font-bold rounded-2xl hover:scale-105 transition-all text-base">
                      Go to Dashboard <ArrowRight className="w-5 h-5" />
                    </Link>
                  )}
                </div>

                <div className="flex flex-wrap gap-6">
                  {[{ icon: Cpu, label: 'Face Recognition' }, { icon: MapPin, label: 'GPS Geo-Fencing' }, { icon: Lock, label: 'Zero Proxies' }].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                      <Icon className="w-4 h-4 text-indigo-400" />
                      {label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Visual */}
              <div className="flex items-center justify-center">
                <div className="relative w-80 h-80">
                  {/* Outer ring */}
                  <svg className="absolute inset-0 w-full h-full orbit-cw" viewBox="0 0 320 320">
                    <circle cx="160" cy="160" r="148" fill="none" stroke="#e0e7ff" strokeWidth="1.5" strokeDasharray="6 9" />
                    <circle cx="160" cy="12" r="9" fill="#6366f1" opacity="0.65" />
                    <circle cx="308" cy="160" r="7" fill="#22c55e" opacity="0.55" />
                    <circle cx="160" cy="308" r="8" fill="#3b82f6" opacity="0.55" />
                    <circle cx="36" cy="90" r="5" fill="#a855f7" opacity="0.4" />
                  </svg>

                  {/* Inner ring */}
                  <svg className="absolute inset-8 orbit-ccw" viewBox="0 0 256 256">
                    <circle cx="128" cy="128" r="108" fill="none" stroke="#dbeafe" strokeWidth="1.5" strokeDasharray="4 7" />
                    <circle cx="128" cy="20" r="7" fill="#818cf8" opacity="0.55" />
                    <circle cx="236" cy="128" r="5" fill="#34d399" opacity="0.5" />
                    <circle cx="32" cy="160" r="6" fill="#60a5fa" opacity="0.45" />
                  </svg>

                  {/* Centre card */}
                  <div className="absolute inset-14 glass-card rounded-3xl flex flex-col items-center justify-center gap-3 animate-float shadow-2xl shadow-indigo-100">
                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center animate-pulse-ring">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-center px-2">
                      <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Verified</div>
                      <div className="text-3xl font-extrabold text-green-500 mt-0.5 leading-none">✓</div>
                    </div>
                  </div>

                  {/* Floating badges */}
                  <div className="absolute -top-4 -right-8 glass-card rounded-2xl px-4 py-2.5 shadow-lg animate-float-delay flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                      <CheckCircle className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">Face matched</span>
                  </div>

                  <div className="absolute -bottom-4 -left-8 glass-card rounded-2xl px-4 py-2.5 shadow-lg animate-float-delay2 flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
                      <MapPin className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">Location verified</span>
                  </div>

                  <div className="absolute top-1/2 -right-14 -translate-y-1/2 glass-card rounded-2xl px-3 py-2 shadow-md animate-float flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-xs font-bold text-slate-700">0.6s</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="border-y border-slate-200 bg-white/80 backdrop-blur">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {stats.map(({ value, label }) => (
                <div key={label}>
                  <div className="text-4xl font-extrabold stat-gradient mb-1">{value}</div>
                  <div className="text-sm text-slate-400 font-medium">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="py-28 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full uppercase tracking-widest mb-4">How it works</span>
              <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Three steps to verified attendance</h2>
            </div>

            <div className="relative grid md:grid-cols-3 gap-8">
              <div className="step-connector" />
              {[
                { step: '01', icon: Cpu, color: 'bg-indigo-600', shadow: 'shadow-indigo-200', title: 'Face scan', desc: 'TensorFlow matches the student\'s face against their registered model in under a second.' },
                { step: '02', icon: MapPin, color: 'bg-blue-600', shadow: 'shadow-blue-200', title: 'Location lock', desc: 'GPS confirms they\'re inside the classroom geo-fence — no match means no attendance.' },
                { step: '03', icon: Zap, color: 'bg-green-600', shadow: 'shadow-green-200', title: 'Instant record', desc: 'Attendance is marked, the teacher\'s dashboard updates live, admin sees it all in real time.' },
              ].map(({ step, icon: Icon, color, shadow, title, desc }) => (
                <div key={step} className="relative bg-white rounded-3xl p-8 border border-slate-100 shadow-sm card-hover text-center">
                  <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xl ${shadow}`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-1">{step}</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURE CARDS ── */}
        <section className="py-24 px-6 bg-white/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full uppercase tracking-widest mb-4">Role-based access</span>
              <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Built for everyone in the room</h2>
              <p className="text-slate-400 mt-3 text-lg max-w-xl mx-auto">Admin, teacher, or student — each role gets exactly the tools they need.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map(feature => {
                const Icon = feature.icon;
                const c = colorMap[feature.color];
                return (
                  <div key={feature.title} className={`group relative bg-white rounded-3xl p-8 border-2 ${c.border} card-hover overflow-hidden cursor-pointer`}>
                    {/* Hover glow */}
                    <div className={`absolute inset-0 ${c.light} opacity-0 group-hover:opacity-40 transition-opacity duration-300 rounded-3xl`} />

                    {/* Stat badge */}
                    <div className={`absolute top-6 right-6 ${c.badge} px-3 py-1.5 rounded-full`}>
                      <span className="text-sm font-extrabold">{feature.stat}</span>
                      <span className="text-xs font-medium opacity-60 ml-1">{feature.statLabel}</span>
                    </div>

                    {/* Icon */}
                    <div className={`relative w-14 h-14 ${c.bg} rounded-2xl flex items-center justify-center mb-6 shadow-xl ${c.shadow} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>

                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6">{feature.description}</p>

                    <ul className="space-y-2.5 mb-8">
                      {feature.benefits.map(b => (
                        <li key={b} className="flex items-center gap-3 text-slate-600 text-sm">
                          <CheckCircle className={`w-4 h-4 shrink-0 ${c.text}`} />
                          {b}
                        </li>
                      ))}
                    </ul>

                    <Link href={feature.route} className={`inline-flex items-center gap-2 text-sm font-bold ${c.text} group-hover:gap-3 transition-all`}>
                      Open {feature.title} <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-28 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="relative rounded-3xl overflow-hidden bg-indigo-600 px-12 py-20 text-center shadow-2xl shadow-indigo-300">
              <div className="absolute -top-20 -right-20 w-72 h-72 bg-indigo-500 rounded-full opacity-50" />
              <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-700 rounded-full opacity-40" />
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

              <div className="relative z-10">
                <h2 className="text-5xl font-extrabold text-white mb-5 tracking-tight leading-tight">
                  Ready to eliminate<br />proxy attendance?
                </h2>
                <p className="text-indigo-200 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
                  Get running in minutes. No hardware required — just your institution's roster and a smartphone camera.
                </p>
                {!session ? (
                  <div className="flex flex-wrap justify-center gap-4">
                    <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 font-bold rounded-2xl hover:scale-105 hover:shadow-xl transition-all text-base">
                      Create free account <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link href="/login" className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-2xl hover:bg-white/10 transition-all text-base">
                      Already have an account?
                    </Link>
                  </div>
                ) : (
                  <Link href={dashboardRoute} className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 font-bold rounded-2xl hover:scale-105 transition-all text-base">
                    Go to your dashboard <ArrowRight className="w-5 h-5" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="border-t border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-slate-900 text-sm">SmartAttend</span>
            </div>
            <p className="text-slate-400 text-xs">Built with Next.js · MongoDB · TensorFlow &nbsp;·&nbsp; © {new Date().getFullYear()}</p>
            <div className="flex gap-6">
              {['Privacy', 'Terms', 'Contact'].map(link => (
                <a key={link} href="#" className="text-slate-400 text-xs hover:text-slate-700 transition-colors">{link}</a>
              ))}
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}