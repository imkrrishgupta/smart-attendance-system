'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Clock, MapPin, Calendar, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface TimetableEntry {
    _id: string;
    subject: string;
    day: string;
    startTime: string;
    endTime: string;
    room: string;
}

export default function TeacherTimetablePage() {
    const { data: session } = useSession();
    const teacherId = (session?.user as any)?.id;
    const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (teacherId) {
            fetchTimetable();
        }
    }, [teacherId]);

    const fetchTimetable = async () => {
        try {
            const res = await fetch(`/api/teacher/timetable?teacherId=${teacherId}`);
            if (res.ok) {
                const data = await res.json();
                setTimetable(data);
            }
        } catch (error) {
            console.error('Failed to fetch timetable', error);
        } finally {
            setLoading(false);
        }
    };

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const getEntriesForDay = (day: string) => {
        return timetable.filter(entry => entry.day === day);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <header className="bg-white border-b border-slate-200">
                <div className="px-8 py-10">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Academic Schedule</h1>
                        <div className="flex items-center gap-2 text-slate-500 mt-2 font-medium">
                            <Link href="/teacher/dashboard" className="hover:text-indigo-600 transition-colors">Dashboard</Link>
                            <span className="text-slate-300">/</span>
                            <span className="text-slate-900 font-bold">My Timetable</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="p-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {days.map((day) => {
                        const dayEntries = getEntriesForDay(day);
                        return (
                            <div key={day} className="space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">{day}</h2>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-lg border border-slate-200">
                                        {dayEntries.length} Classes
                                    </span>
                                </div>
                                
                                <div className="space-y-4">
                                    {dayEntries.length === 0 ? (
                                        <div className="bg-slate-100/50 rounded-2xl p-6 border border-slate-200 border-dashed text-center">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No Classes Assigned</p>
                                        </div>
                                    ) : (
                                        dayEntries.map((entry) => (
                                            <div key={entry._id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-indigo-500 transition-all group overflow-hidden relative">
                                                <div className="relative z-10">
                                                    <h3 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase leading-none mb-4">
                                                        {entry.subject}
                                                    </h3>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-tight">
                                                            <Clock className="w-3.5 h-3.5 text-indigo-500" />
                                                            {entry.startTime} - {entry.endTime}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-tight">
                                                            <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                                                            {entry.room}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-600/5 blur-2xl group-hover:bg-indigo-600/10 transition-colors -mr-8 -mt-8"></div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
