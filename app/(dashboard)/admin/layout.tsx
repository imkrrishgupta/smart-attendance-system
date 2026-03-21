'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Calendar,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  Shield,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { signOut } from 'next-auth/react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Teachers', href: '/admin/teachers', icon: Users },
    { name: 'Students', href: '/admin/students', icon: GraduationCap },
    { name: 'Timetable', href: '/admin/timetable', icon: Calendar },
    { name: 'Leave Requests', href: '/admin/leave-requests', icon: FileText },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      <aside
        className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed inset-y-0 left-0 z-50 w-60 bg-slate-900 transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-auto`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-5 py-5 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-sm">Admin Panel</h2>
                <p className="text-slate-500 text-xs">Management</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    router.push(item.href);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </button>
              );
            })}
          </nav>

          <div className="p-3 border-t border-slate-800">
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-600/90 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="lg:hidden bg-white border-b border-slate-200 px-5 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-slate-600 hover:text-slate-900"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}