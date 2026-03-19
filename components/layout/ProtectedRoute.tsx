'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'loading') return;

        if (!session) {
            router.replace('/login');
            return;
        }

        if (allowedRoles && allowedRoles.length > 0) {
            const userRole = (session.user as any)?.role;
            if (!allowedRoles.includes(userRole)) {
                // Redirect to their own dashboard
                if (userRole === 'admin') router.replace('/admin/dashboard');
                else if (userRole === 'teacher') router.replace('/teacher/dashboard');
                else router.replace('/student/dashboard');
            }
        }
    }, [session, status, router, allowedRoles]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-500 text-sm">Loading…</p>
                </div>
            </div>
        );
    }

    if (!session) return null;

    return <>{children}</>;
}
