'use client';

import { useState, useEffect } from 'react';
import { Download, Home, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import Link from 'next/link';

interface ClassData {
  _id: string;
  subject: string;
  teacherId: { name: string };
  room: string;
  startTime: string;
  endTime: string;
  day: string;
}

interface TimeSlotGrid {
  timeLabel: string;
  days: {
    [key: string]: ClassData | null;
  };
}

const dayKeys = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const colorCodes: Record<string, string> = {
  'Data Structures': 'bg-blue-600',
  'Algorithms': 'bg-indigo-600',
  'DBMS': 'bg-green-600',
  'Database': 'bg-green-600',
  'Operating Systems': 'bg-purple-600',
  'OS': 'bg-purple-600',
  'Web': 'bg-orange-600',
  'Mathematics': 'bg-red-600',
  'Physics': 'bg-blue-800',
  'Computer': 'bg-slate-700',
};

export default function StudentTimetable() {
  const [loading, setLoading] = useState(true);
  const [timetableGrid, setTimetableGrid] = useState<TimeSlotGrid[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      const res = await fetch('/api/student/timetable');
      if (!res.ok) throw new Error('Failed to fetch');
      const data: ClassData[] = await res.json();

      // Transform data into grid
      // 1. Get unique time slots
      const timeSlotsSet = new Set<string>();
      data.forEach(item => {
        timeSlotsSet.add(`${item.startTime} - ${item.endTime}`);
      });

      const sortedTimeSlots = Array.from(timeSlotsSet).sort((a, b) => {
        const timeA = a.split(' - ')[0];
        const timeB = b.split(' - ')[0];
        return timeA.localeCompare(timeB);
      });

      // 2. Build grid
      const grid: TimeSlotGrid[] = sortedTimeSlots.map(slot => {
        const [start, end] = slot.split(' - ');
        const dayMap: { [key: string]: ClassData | null } = {};
        dayKeys.forEach(day => {
          const classFound = data.find(c => 
            c.day.toLowerCase() === day.toLowerCase() && 
            c.startTime === start && 
            c.endTime === end
          );
          dayMap[day] = classFound || null;
        });
        return { timeLabel: slot, days: dayMap };
      });

      setTimetableGrid(grid);
    } catch (err) {
      console.error(err);
      setError('Could not load timetable data.');
    } finally {
      setLoading(false);
    }
  };

  const getClassColor = (subject: string): string => {
    for (const [key, color] of Object.entries(colorCodes)) {
      if (subject.toLowerCase().includes(key.toLowerCase())) {
        return color;
      }
    }
    return 'bg-indigo-500';
  };

  const downloadPDF = () => {
    let content = 'STUDENT TIMETABLE\n';
    content += '================\n\n';
    
    timetableGrid.forEach(slot => {
      content += `${slot.timeLabel}\n`;
      dayKeys.forEach((day, idx) => {
        const classData = slot.days[day];
        if (classData) {
          content += `  ${dayLabels[idx]}: ${classData.subject} - ${classData.teacherId?.name} (${classData.room})\n`;
        }
      });
      content += '\n';
    });

    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `timetable-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Synchronizing Schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/student/dashboard"
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
              >
                <Home className="w-5 h-5 text-slate-600" />
              </Link>
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Academic Timetable</h1>
                <p className="text-slate-500 text-sm font-medium">Session 2024-25 • Semester 2</p>
              </div>
            </div>
            <button
              onClick={downloadPDF}
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-xl shadow-slate-900/10 active:scale-95"
            >
              <Download className="w-5 h-5" />
              Export Schedule
            </button>
          </div>
        </div>
      </header>

      <div className="p-8">
        {timetableGrid.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CalendarIcon className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Schedule Found</h3>
            <p className="text-slate-500 max-w-sm mx-auto">The academic timetable for this semester has not been published yet. Please check back later.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="w-40 px-6 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest border-b border-r border-slate-100">
                      Time Slot
                    </th>
                    {dayLabels.map((day) => (
                      <th
                        key={day}
                        className="w-48 px-6 py-5 text-left text-xs font-black text-slate-900 uppercase tracking-widest border-b border-r border-slate-100"
                      >
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timetableGrid.map((slot, slotIdx) => (
                    <tr key={slotIdx} className="group hover:bg-slate-50/30 transition-colors">
                      <td className="px-6 py-8 text-sm font-bold text-slate-900 bg-slate-50/30 border-r border-slate-100 align-top">
                        <div className="flex flex-col">
                          <span className="text-blue-600 text-xs font-black mb-1">SESSION</span>
                          {slot.timeLabel}
                        </div>
                      </td>
                      {dayKeys.map((day, dayIdx) => {
                        const classData = slot.days[day];
                        return (
                          <td
                            key={`${slotIdx}-${dayIdx}`}
                            className="px-4 py-4 border-r border-slate-100 align-top min-w-[180px]"
                          >
                            {classData && (
                              <div
                                className={`${getClassColor(
                                  classData.subject
                                )} text-white rounded-2xl p-5 shadow-lg shadow-indigo-900/10 hover:-translate-y-1 transition-all duration-300 cursor-help relative group/card`}
                              >
                                <div className="absolute top-4 right-4 text-[10px] font-black opacity-20 group-hover/card:opacity-40 transition-opacity">
                                  {classData.room}
                                </div>
                                <div className="font-black text-sm mb-1 uppercase tracking-tight">
                                  {classData.subject}
                                </div>
                                <div className="text-[11px] font-bold opacity-80 mb-3 flex items-center gap-1.5">
                                  <div className="w-1 h-1 rounded-full bg-white opacity-50" />
                                  {classData.teacherId?.name}
                                </div>
                                <div className="bg-white/10 rounded-lg px-2 py-1 text-[10px] font-black inline-block uppercase tracking-wider">
                                  {classData.room}
                                </div>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Legend & Stats */}
        <div className="mt-8 grid lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-6 uppercase tracking-tight border-b border-slate-50 pb-4 flex items-center gap-3">
              <div className="w-2 h-6 bg-blue-600 rounded-full" />
              Course Index
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {Object.entries(colorCodes).slice(0, 8).map(([subject, color]) => (
                <div key={subject} className="flex items-center gap-4 group">
                  <div className={`w-8 h-8 rounded-xl ${color} shadow-lg shadow-slate-200 flex items-center justify-center text-[10px] text-white font-black`}>
                    {subject[0]}
                  </div>
                  <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{subject}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-white">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <CalendarIcon className="w-32 h-32" />
             </div>
             <div className="relative z-10">
               <h3 className="text-lg font-black mb-8 uppercase tracking-[0.2em] text-blue-400">Schedule Digest</h3>
               <div className="space-y-6">
                 <div>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Academic Load</p>
                   <p className="text-4xl font-black">{timetableGrid.reduce((acc, slot) => acc + Object.values(slot.days).filter(Boolean).length, 0)} <span className="text-sm font-bold text-slate-400">Lectures / Week</span></p>
                 </div>
                 
                 <div className="pt-6 border-t border-white/5">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Daily Distribution</p>
                   <div className="flex gap-2">
                      {dayLabels.map(day => {
                        const count = timetableGrid.reduce((acc, slot) => acc + (slot.days[dayKeys[dayLabels.indexOf(day)]] ? 1 : 0), 0);
                        return (
                          <div key={day} className="flex-1 flex flex-col items-center gap-1">
                             <div className="w-full bg-white/5 rounded-t-lg relative h-16">
                                <div 
                                  className="absolute bottom-0 inset-x-0 bg-blue-500 rounded-t-lg transition-all duration-1000" 
                                  style={{ height: `${(count / 6) * 100}%` }}
                                />
                             </div>
                             <span className="text-[10px] font-black text-slate-500 uppercase">{day}</span>
                          </div>
                        );
                      })}
                   </div>
                 </div>
               </div>
             </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm flex flex-col justify-center">
             <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                   <Download className="w-10 h-10 text-blue-600" />
                </div>
                <h4 className="text-xl font-black text-slate-900 uppercase">Offline Access</h4>
                <p className="text-sm text-slate-500 leading-relaxed max-w-[200px] mx-auto font-medium">Download your personalized timetable for offline reference and device sync.</p>
                <button 
                  onClick={downloadPDF}
                  className="w-full mt-4 py-4 bg-slate-50 hover:bg-slate-100 text-slate-900 rounded-2xl font-bold transition-all border border-slate-200"
                >
                  Download .TXT
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
