'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Clock, MapPin, Calendar, Loader2, User } from 'lucide-react';
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
            console.log('TeacherTimetable: Fetching for teacherId:', teacherId);
            fetchTimetable();
        }
    }, [teacherId]);

    const fetchTimetable = async () => {
        try {
            const res = await fetch(`/api/teacher/timetable?teacherId=${teacherId}`);
            if (res.ok) {
                const data = await res.json();
                console.log('TeacherTimetable: Data fetched:', data);
                setTimetable(data);
            } else {
                console.error('TeacherTimetable: API error:', res.status);
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
                <div className="px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Academic Schedule</h1>
                        <div className="flex items-center gap-2 text-slate-500 mt-1 text-sm font-medium">
                            <Link href="/teacher/dashboard" className="hover:text-indigo-600 transition-colors">Dashboard</Link>
                            <span className="text-slate-300">/</span>
                            <span className="text-slate-900 font-semibold">My Timetable</span>
                        </div>
                    </div>
                    {/* Personnel Badge for Debugging */}
                    <div className="bg-white px-6 py-4 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                            <User className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Observer Profile</p>
                            <h3 className="text-sm font-black text-slate-900 tracking-tight">{session?.user?.name || 'Loading...'}</h3>
                            <p className="text-[9px] font-bold text-slate-400 font-mono italic mt-0.5">ID: {teacherId || 'N/A'}</p>
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
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">{day}</h2>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-lg border border-slate-200">
                                        {dayEntries.length} Classes
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    {dayEntries.length === 0 ? (
                                        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 border-dashed text-center">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No Classes Assigned</p>
                                        </div>
                                    ) : (
                                        dayEntries.map((entry: any) => (
                                            <div key={entry._id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-indigo-300 hover:shadow-xl transition-all flex flex-col justify-between group shadow-sm relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 rounded-full -mr-8 -mt-8 group-hover:scale-110 transition-transform" />
                                                <div className="relative z-10">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <span className="px-3 py-1 bg-slate-900 text-white text-[9px] font-black rounded-lg uppercase tracking-widest">
                                                            {entry.startTime}
                                                        </span>
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                                            <MapPin className="w-3 h-3 text-indigo-400" /> {entry.room}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-sm font-black text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors uppercase tracking-tight truncate">
                                                        {entry.subject}
                                                    </h3>
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-2 text-slate-500 font-bold text-[9px] uppercase tracking-widest">
                                                            <Clock className="w-3.5 h-3.5 text-indigo-400" />
                                                            {entry.startTime} - {entry.endTime}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                                {entry.branch} • SEM {entry.semester}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
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
