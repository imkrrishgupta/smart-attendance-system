'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const roles = [
    {
      title: 'Student',
      description: 'Mark attendance with face recognition',
      icon: '🎓',
      path: '/student/login',
      gradient: 'linear-gradient(135deg, #00f0ff 0%, #0ea5e9 100%)',
      delay: '0s'
    },
    {
      title: 'Teacher',
      description: 'Manage attendance sessions & students',
      icon: '👨‍🏫',
      path: '/teacher/dashboard',
      gradient: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
      delay: '0.1s'
    },
    {
      title: 'Admin',
      description: 'System management & analytics',
      icon: '⚙️',
      path: '/admin/dashboard',
      gradient: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
      delay: '0.2s'
    }
  ];

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="container max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-16 fade-in">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00f0ff] to-[#7c3aed] flex items-center justify-center text-2xl">
              🎯
            </div>
            <span className="text-sm font-semibold tracking-wider text-[#00f0ff] uppercase">
              Next-Gen Attendance
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Smart Attendance
            <br />
            <span className="bg-gradient-to-r from-[#00f0ff] via-[#7c3aed] to-[#ec4899] bg-clip-text text-transparent">
              System
            </span>
          </h1>
          
          <p className="text-xl text-[#a1a1b5] max-w-2xl mx-auto leading-relaxed">
            AI-powered face recognition with geo-fencing technology for 
            <span className="text-white font-semibold"> seamless </span>
            and 
            <span className="text-white font-semibold"> secure </span>
            attendance management
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {roles.map((role, index) => (
            <div
              key={role.title}
              className="role-card"
              style={{
                animationDelay: mounted ? role.delay : '0s',
                opacity: mounted ? 1 : 0
              }}
              onClick={() => router.push(role.path)}
            >
              <div className="relative p-8 h-full">
                {/* Glow Effect */}
                <div 
                  className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background: role.gradient,
                    filter: 'blur(20px)',
                    zIndex: -1
                  }}
                />
                
                {/* Card Content */}
                <div className="relative z-10">
                  <div className="text-6xl mb-6 transform transition-transform duration-300 group-hover:scale-110">
                    {role.icon}
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-3 text-white">
                    {role.title}
                  </h3>
                  
                  <p className="text-[#a1a1b5] mb-6 leading-relaxed">
                    {role.description}
                  </p>
                  
                  <div className="flex items-center text-[#00f0ff] font-semibold group-hover:translate-x-2 transition-transform duration-300">
                    Access Portal
                    <svg 
                      className="w-5 h-5 ml-2" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M17 8l4 4m0 0l-4 4m4-4H3" 
                      />
                    </svg>
                  </div>
                </div>

                {/* Top Border Gradient */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: role.gradient }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-4 gap-4 fade-in" style={{ animationDelay: '0.3s' }}>
          {[
            { icon: '🤖', text: 'AI Recognition' },
            { icon: '📍', text: 'Geo-Fencing' },
            { icon: '📊', text: 'Real-time Analytics' },
            { icon: '🔒', text: 'Secure & Private' }
          ].map((feature, index) => (
            <div 
              key={index}
              className="bg-[#1e1e2e] border border-[rgba(255,255,255,0.1)] rounded-xl p-6 text-center hover:border-[rgba(0,240,255,0.3)] transition-all duration-300 hover:-translate-y-1"
            >
              <div className="text-3xl mb-3">{feature.icon}</div>
              <div className="text-sm font-semibold text-[#a1a1b5]">{feature.text}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-[#6b6b7f] text-sm fade-in" style={{ animationDelay: '0.4s' }}>
          <p>Powered by Advanced Face Recognition & Machine Learning</p>
        </div>
      </div>

      <style jsx>{`
        .role-card {
          background: rgba(30, 30, 46, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 1.5rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(10px);
          animation: fadeIn 0.5s ease-out forwards;
          opacity: 0;
        }

        .role-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 1.5rem;
          padding: 1px;
          background: linear-gradient(135deg, rgba(0, 240, 255, 0.3), rgba(124, 58, 237, 0.3));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.3s;
        }

        .role-card:hover {
          transform: translateY(-8px);
          border-color: rgba(0, 240, 255, 0.3);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }

        .role-card:hover::before {
          opacity: 1;
        }

        .group:hover .group-hover\\:scale-110 {
          transform: scale(1.1);
        }

        .group:hover .group-hover\\:translate-x-2 {
          transform: translateX(0.5rem);
        }

        .group:hover .group-hover\\:opacity-100 {
          opacity: 1;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .fade-in {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </main>
  );
}