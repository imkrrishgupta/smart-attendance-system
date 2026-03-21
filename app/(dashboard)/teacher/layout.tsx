'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  PlayCircle,
  ClipboardList,
  FileText,
  AlertCircle,
  Calendar,
  LogOut,
  GraduationCap,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const teacherName = session?.user?.name || 'Teacher';

  const navigation = [
    { name: 'Dashboard', href: '/teacher/dashboard', icon: LayoutDashboard },
    { name: 'My Timetable', href: '/teacher/timetable', icon: Calendar },
    { name: 'Sessions', href: '/teacher/sessions', icon: PlayCircle },
    { name: 'Attendance', href: '/teacher/attendance', icon: ClipboardList },
    { name: 'Issues', href: '/teacher/issues', icon: AlertCircle },
    { name: 'Leave Requests', href: '/teacher/requests', icon: FileText },
  ];

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-auto`}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between p-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold">Teacher Panel</h2>
                <p className="text-slate-400 text-xs truncate max-w-[140px]">{teacherName}</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                      ? 'bg-green-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-300 hover:bg-red-600 hover:text-white transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="lg:hidden bg-white border-b border-slate-200 px-6 py-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-slate-600 hover:text-slate-900"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}