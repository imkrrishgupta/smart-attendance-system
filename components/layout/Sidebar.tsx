'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
    LayoutDashboard,
    CheckSquare,
    Clock,
    Calendar,
    Users,
    FileText,
    AlertCircle,
    Settings,
    LogOut,
    X,
    GraduationCap,
    ShieldCheck
} from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const navByRole: Record<string, { name: string; href: string; icon: any }[]> = {
    student: [
        { name: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
        { name: 'Mark Attendance', href: '/student/mark-attendance', icon: CheckSquare },
        { name: 'Attendance History', href: '/student/attendance-history', icon: Clock },
        { name: 'Timetable', href: '/student/timetable', icon: Calendar },
        { name: 'Issues', href: '/student/issues', icon: AlertCircle },
        { name: 'Settings', href: '/student/settings', icon: Settings }
    ],
    teacher: [
        { name: 'Dashboard', href: '/teacher/dashboard', icon: LayoutDashboard },
        { name: 'Attendance', href: '/teacher/attendance', icon: CheckSquare },
        { name: 'Leave Requests', href: '/teacher/requests', icon: FileText },
        { name: 'Student Issues', href: '/teacher/issues', icon: AlertCircle }
    ],
    admin: [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Teachers', href: '/admin/teachers', icon: Users },
        { name: 'Students', href: '/admin/students', icon: GraduationCap },
        { name: 'Leave Requests', href: '/admin/requests', icon: FileText },
        { name: 'Settings', href: '/admin/settings', icon: Settings }
    ]
};

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session } = useSession();
    const role = (session?.user as any)?.role || 'student';
    const userName = session?.user?.name || 'User';
    const navigation = navByRole[role] || navByRole.student;

    const roleLabel = role === 'admin' ? 'Admin' : role === 'teacher' ? 'Teacher' : 'Student';
    const RoleIcon = role === 'admin' ? ShieldCheck : role === 'teacher' ? Users : GraduationCap;

    const handleNavigate = (href: string) => {
        router.push(href);
        onClose();
    };

    return (
        <aside
            className={`${isOpen ? 'translate-x-0' : '-translate-x-full'
                } fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-auto`}
        >
            <div className="flex h-full flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <RoleIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-white font-bold text-sm">{roleLabel} Panel</h2>
                            <p className="text-slate-400 text-xs truncate max-w-[120px]">{userName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <button
                                key={item.name}
                                onClick={() => handleNavigate(item.href)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                {item.name}
                            </button>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="p-3 border-t border-slate-800">
                    <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-red-600/80 hover:text-white transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </div>
        </aside>
    );
}
