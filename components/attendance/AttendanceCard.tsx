'use client';

import { CheckCircle, XCircle, Clock, User } from 'lucide-react';

interface AttendanceCardProps {
    sessionId: string;
    subject: string;
    startTime: string;
    teacherName: string;
    isActive: boolean;
    isMarked: boolean;
    onMarkAttendance: () => void;
}

export default function AttendanceCard({
    subject,
    startTime,
    teacherName,
    isActive,
    isMarked,
    onMarkAttendance
}: AttendanceCardProps) {
    return (
        <div className={`bg-white rounded-xl border-2 p-5 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isMarked ? 'border-green-200 bg-green-50/30' : isActive ? 'border-blue-200' : 'border-slate-200'
            }`}>
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    {isActive && (
                        <>
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Live</span>
                        </>
                    )}
                </div>

                <h3 className="text-lg font-bold text-slate-800 mb-2">{subject}</h3>

                <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <User className="w-4 h-4 text-slate-400" />
                        {teacherName}
                    </span>
                </div>
            </div>

            <div className="flex-shrink-0">
                {isMarked ? (
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold text-sm">
                        <CheckCircle className="w-4 h-4" /> Attendance Marked
                    </span>
                ) : !isActive ? (
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-500 rounded-lg font-semibold text-sm cursor-not-allowed">
                        <XCircle className="w-4 h-4" /> Not Active
                    </span>
                ) : (
                    <button
                        onClick={onMarkAttendance}
                        className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition shadow-sm"
                    >
                        Mark Attendance
                    </button>
                )}
            </div>
        </div>
    );
}
