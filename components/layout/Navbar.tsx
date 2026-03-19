'use client';

import { useSession, signOut } from 'next-auth/react';
import { Menu, Bell, User, LogOut } from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
    onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
    const { data: session } = useSession();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const userName = session?.user?.name || 'User';
    const userRole = (session?.user as any)?.role || 'student';

    return (
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
            {/* Left: Hamburger on mobile */}
            <button
                onClick={onMenuClick}
                className="lg:hidden text-slate-600 hover:text-slate-900"
            >
                <Menu className="w-6 h-6" />
            </button>

            <div className="hidden lg:block">
                <h1 className="font-bold text-slate-800">Smart Attendance System</h1>
            </div>

            {/* Right: User menu */}
            <div className="flex items-center gap-4">
                <button className="text-slate-400 hover:text-slate-600 relative">
                    <Bell className="w-5 h-5" />
                </button>

                <div className="relative">
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900"
                    >
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="hidden sm:inline font-medium">{userName}</span>
                    </button>

                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                            <div className="px-4 py-2 border-b border-slate-100">
                                <p className="text-sm font-medium text-slate-800">{userName}</p>
                                <p className="text-xs text-slate-500 capitalize">{userRole}</p>
                            </div>
                            <button
                                onClick={() => signOut({ callbackUrl: '/' })}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
