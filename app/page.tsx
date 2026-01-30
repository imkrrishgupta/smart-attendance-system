'use client';

import { useState } from 'react';
import Link from 'next/link';
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

            <div className="hidden md:block">
              <Link
                href="/login"
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Login
              </Link>
            </div>

            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(prev => !prev)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="mt-4 md:hidden">
              <Link
                href="/login"
                className="block w-full px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors text-center"
              >
                Login
              </Link>
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
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/login"
                  className="px-8 py-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2 text-lg"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <button className="px-8 py-4 bg-white text-slate-700 rounded-lg font-semibold border-2 border-slate-300 hover:border-slate-400 transition-colors text-lg">
                  Learn More
                </button>
              </div>
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

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Three Powerful Panels
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Role-based dashboards designed for administrators, teachers, and students
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const colors = colorClasses[feature.color];

              return (
                <Link
                  key={index}
                  href={feature.route}
                  className={`block bg-slate-50 rounded-xl p-8 border-2 border-slate-200 ${colors.hover} transition-colors cursor-pointer`}
                >
                  <div className={`w-14 h-14 ${colors.bg} rounded-xl flex items-center justify-center mb-6`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                  <p className="text-slate-600 mb-6">{feature.description}</p>
                  <ul className="space-y-3 text-slate-700">
                    {feature.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className={`w-5 h-5 ${colors.text} shrink-0 mt-0.5`} />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Powered by Advanced Technology
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Built with cutting-edge machine learning and modern web technologies
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {technologies.map((tech, index) => (
              <div
                key={index}
                className="bg-slate-800 rounded-xl p-6 text-center border border-slate-700"
              >
                <div className="text-3xl font-bold text-white mb-2">{tech.name}</div>
                <div className="text-slate-400">{tech.category}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">Smart Attendance System</span>
          </div>
          <p className="text-slate-600">
            © 2025 Smart Attendance Management System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
