'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { ArrowRight, Shield, Users, BarChart3, CheckCircle, Menu, X } from 'lucide-react';

type FeatureColor = 'indigo' | 'green' | 'blue';

type Feature = {
  title: string;
  description: string;
  icon: React.ElementType;
  color: FeatureColor;
  route: string;
  benefits: string[];
};

type Technology = {
  name: string;
  category: string;
};

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const { data: session } = useSession();

  const dashboardRoute =
    session?.user.role === 'admin'
      ? '/admin/dashboard'
      : session?.user.role === 'teacher'
      ? '/teacher/dashboard'
      : '/student/dashboard';

  const features: Feature[] = [
    {
      title: 'Admin Panel',
      description: 'Complete control over system management, user administration, and attendance analytics.',
      icon: Shield,
      color: 'indigo',
      route: '/admin/dashboard',
      benefits: [
        'Manage teachers & students',
        'Create timetables',
        'Real-time monitoring',
        'Analytics & reports'
      ]
    },
    {
      title: 'Teacher Panel',
      description: 'Streamlined attendance session management with automated verification.',
      icon: Users,
      color: 'green',
      route: '/teacher/dashboard',
      benefits: [
        'Start/end sessions',
        'Monitor live attendance',
        'Resolve exceptions',
        'Submit leave requests'
      ]
    },
    {
      title: 'Student Panel',
      description: 'Simple and secure attendance marking with transparent tracking.',
      icon: BarChart3,
      color: 'blue',
      route: '/student/dashboard',
      benefits: [
        'Face authentication',
        'Location verification',
        'View attendance status',
        'Raise issues'
      ]
    }
  ];

  const technologies: Technology[] = [
    { name: 'Next.js', category: 'Frontend' },
    { name: 'Node.js', category: 'Backend' },
    { name: 'MongoDB', category: 'Database' },
    { name: 'TensorFlow', category: 'ML Engine' }
  ];

  const colorClasses: Record<FeatureColor, { bg: string; hover: string; text: string }> = {
    indigo: {
      bg: 'bg-indigo-600',
      hover: 'hover:border-indigo-600',
      text: 'text-indigo-600'
    },
    green: {
      bg: 'bg-green-600',
      hover: 'hover:border-green-600',
      text: 'text-green-600'
    },
    blue: {
      bg: 'bg-blue-600',
      hover: 'hover:border-blue-600',
      text: 'text-blue-600'
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">Smart Attendance</span>
            </div>

            <div className="hidden md:flex items-center gap-3">
              {!session && (
                <>
                  <Link
                    href="/login"
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                  >
                    Login
                  </Link>

                  <Link
                    href="/register"
                    className="px-6 py-2.5 border border-indigo-600 text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
                  >
                    Signup
                  </Link>
                </>
              )}

              {session && (
                <>
                  <Link
                    href={dashboardRoute}
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                  >
                    Dashboard
                  </Link>

                  <button
                    onClick={() => signOut()}
                    className="px-6 py-2.5 border border-red-600 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>

            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(prev => !prev)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="mt-4 md:hidden space-y-2">
              {!session && (
                <>
                  <Link
                    href="/login"
                    className="block w-full px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium text-center"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="block w-full px-6 py-2.5 border border-indigo-600 text-indigo-600 rounded-lg font-medium text-center"
                  >
                    Signup
                  </Link>
                </>
              )}

              {session && (
                <>
                  <Link
                    href={dashboardRoute}
                    className="block w-full px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium text-center"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="block w-full px-6 py-2.5 border border-red-600 text-red-600 rounded-lg font-medium"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      <section className="pt-20 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold mb-6">
                Next-Gen Attendance System
              </div>
              <h1 className="text-5xl font-bold text-slate-900 mb-6 leading-tight">
                Secure Attendance with Face Recognition & Geo-Fencing
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Eliminate proxy attendance and streamline classroom management with our AI-powered attendance system.
                Verified identity, real-time tracking, and comprehensive analytics.
              </p>

              {!session && (
                <Link
                  href="/login"
                  className="px-8 py-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors inline-flex items-center gap-2 text-lg"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </Link>
              )}

              {session && (
                <Link
                  href={dashboardRoute}
                  className="px-8 py-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors inline-flex items-center gap-2 text-lg"
                >
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5" />
                </Link>
              )}
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200">
              <div className="aspect-square bg-slate-100 rounded-xl flex items-center justify-center mb-6">
                <div className="text-center">
                  <div className="w-32 h-32 bg-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Shield className="w-16 h-16 text-white" />
                  </div>
                  <p className="text-slate-600 font-medium">ML-Powered Authentication</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-700">
                  <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                  <span>Face Recognition Verification</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700">
                  <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                  <span>GPS-Based Geo-Fencing</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700">
                  <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                  <span>Role-Based Access Control</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
