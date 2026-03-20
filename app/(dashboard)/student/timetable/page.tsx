'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
    Download, 
    Loader2,
    Calendar, 
    Clock, 
    BookOpen, 
    Users, 
    MapPin, 
    ChevronRight, 
    Target, 
    Layers, 
    Activity,
    PieChart,
    ArrowRight,
    CheckCircle
} from 'lucide-react';
import Link from 'next/link';

interface ClassData {
  _id: string;
  subject: string;
  teacherId: { name: string };
  day: string;
  startTime: string;
  endTime: string;
  room: string;
  branch: string;
  semester: string;
  exception?: {
    status: string;
    substituteTeacher: string | null;
  } | null;
}

interface TimeSlotGrid {
  timeLabel: string;
  days: { [key: string]: ClassData | null };
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
  const { data: session } = useSession();
  const [timetable, setTimetable] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTimetable = async () => {
    try {
      const res = await fetch('/api/student/timetable');
      if (res.ok) {
        const data = await res.json();
        console.log(`StudentTimetable: Fetched ${data.length} entries.`, data);
        setTimetable(data);
      } else {
        console.error('StudentTimetable: API response not OK:', res.status);
      }
    } catch (error) {
      console.error('Error fetching timetable:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, []);

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', 
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'
  ];

  const isSlotMatch = (storedTime: string, slotLabel: string) => {
    if (!storedTime || !slotLabel) return false;
    
    try {
        const [slotTimeStr, slotPeriod] = slotLabel.split(' ');
        let [slotHour] = slotTimeStr.split(':').map(Number);
        if (slotPeriod === 'PM' && slotHour < 12) slotHour += 12;
        if (slotPeriod === 'AM' && slotHour === 12) slotHour = 0;

        let storedHour: number;
        // Handle AM/PM format (e.g. "09:00 AM" or "9:00 AM")
        if (storedTime.toUpperCase().includes('AM') || storedTime.toUpperCase().includes('PM')) {
            const parts = storedTime.trim().split(/\s+/);
            const tStr = parts[0];
            const period = parts[1]?.toUpperCase();
            storedHour = parseInt(tStr.split(':')[0]);
            if (period === 'PM' && storedHour < 12) storedHour += 12;
            if (period === 'AM' && storedHour === 12) storedHour = 0;
        } else {
            // Handle 24h format (e.g. "09:00" or "9:00" or "13:00")
            storedHour = parseInt(storedTime.split(':')[0]);
        }

        return slotHour === storedHour;
    } catch (e) {
        return false;
    }
  };

  const grid: TimeSlotGrid[] = timeSlots.map(time => {
    const slot: TimeSlotGrid = { timeLabel: time, days: {} };
    dayKeys.forEach(day => {
      const matched = timetable.find(c => c.day === day && isSlotMatch(c.startTime, time));
      slot.days[day] = matched || null;
    });
    return slot;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Calibrating Temporal Matrix...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight leading-none">Sequence Matrix</h1>
            <div className="flex items-center gap-2 text-slate-500 mt-2 text-[11px] font-bold uppercase tracking-widest">
              <Link href="/student/dashboard" className="hover:text-indigo-600 transition-colors">Workspace</Link>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900 italic">Temporal Grid</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <button className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-3 shadow-xl active:scale-95 group">
                <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                Export Matrix
             </button>
          </div>
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto space-y-12">
        {/* Status Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { label: 'Cluster Load', value: `${timetable.length} Modules`, icon: Layers, color: 'indigo' },
             { label: 'Academic Profile', value: session?.user ? `${(session.user as any).branch || 'N/A'} - Sem ${(session.user as any).semester || 'N/A'}` : 'Analyzing...', icon: Activity, color: 'emerald' },
             { label: 'Temporal Efficiency', value: '94.2%', icon: PieChart, color: 'indigo' }
           ].map((stat, i) => (
             <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500">
                <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform`} />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">{stat.label}</p>
                <div className="flex items-center gap-4 relative z-10">
                   <div className={`w-12 h-12 bg-${stat.color}-600 rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                      <stat.icon className="w-6 h-6" />
                   </div>
                   <h3 className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
                </div>
             </div>
           ))}
        </div>

        {/* Timetable Grid */}
        <section className="bg-white rounded-[48px] border border-slate-200 shadow-sm overflow-hidden group hover:shadow-2xl transition-all duration-1000">
           <div className="overflow-x-auto">
             <table className="w-full border-collapse">
               <thead>
                 <tr className="bg-slate-50/50">
                   <th className="p-8 text-left border-b border-slate-100 min-w-[120px]">
                      <div className="flex flex-col">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Interval</span>
                         <div className="flex items-center gap-2 text-indigo-600">
                            <Clock className="w-4 h-4" />
                            <span className="text-xs font-black uppercase">Standard</span>
                         </div>
                      </div>
                   </th>
                   {dayLabels.map((day, i) => (
                     <th key={i} className="p-8 text-center border-b border-slate-100 min-w-[200px]">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Vector {i+1}</span>
                       <span className="text-xl font-black text-slate-900 tracking-tighter uppercase">{day}</span>
                     </th>
                   ))}
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {grid.map((slot, i) => (
                   <tr key={i} className="group/row hover:bg-slate-50/30 transition-colors">
                     <td className="p-8 font-mono text-[11px] font-black text-slate-400 bg-slate-50/20 border-r border-slate-100">
                        {slot.timeLabel}
                     </td>
                     {dayKeys.map((day) => {
                       const module = slot.days[day];
                       const colorClass = module ? (colorCodes[module.subject] || 'bg-slate-800') : '';

                       return (
                         <td key={day} className="p-4 border-r border-slate-100 last:border-0 relative align-top">
                           {module ? (
                             <div className={`${module.exception?.status === 'cancelled' ? 'bg-slate-200 border-2 border-slate-300' : colorClass} p-6 rounded-[28px] ${module.exception?.status === 'cancelled' ? 'text-slate-500' : 'text-white'} shadow-xl hover:scale-[1.03] transition-all cursor-pointer relative group/module min-h-[140px] flex flex-col justify-between overflow-hidden`}>
                               <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8 group-hover/module:scale-150 transition-transform duration-700" />

                               <div className="relative z-10">
                                 <div className="flex items-center gap-2 mb-3">
                                   <div className={`w-1.5 h-1.5 ${module.exception?.status === 'cancelled' ? 'bg-red-500' : 'bg-white/40'} rounded-full animate-pulse`} />
                                   <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60">
                                     {module.exception?.status === 'cancelled' ? 'CANCELLED SESSION' :
                                      module.exception?.status === 'substituted' ? 'SUBSTITUTED SESSION' : 'Active Module'}
                                   </span>
                                 </div>
                                 <h4 className={`text-lg font-black tracking-tight leading-none mb-1 group-hover/module:translate-x-1 transition-transform ${module.exception?.status === 'cancelled' ? 'line-through opacity-50' : ''}`}>
                                   {module.subject}
                                 </h4>
                                 <div className={`flex items-center gap-2 ${module.exception?.status === 'cancelled' ? 'text-slate-400' : 'text-white/60'}`}>
                                   <Users className="w-3 h-3" />
                                   <p className="text-[9px] font-bold uppercase tracking-widest leading-none">
                                     {module.exception?.status === 'substituted' ? module.exception.substituteTeacher : module.teacherId?.name}
                                   </p>
                                 </div>
                               </div>

                               <div className="mt-6 flex items-center justify-between relative z-10">
                                 <div className={`flex items-center gap-2 ${module.exception?.status === 'cancelled' ? 'bg-slate-300/30' : 'bg-black/10'} px-3 py-1.5 rounded-full backdrop-blur-md`}>
                                    <MapPin className={`w-3 h-3 ${module.exception?.status === 'cancelled' ? 'text-slate-400' : 'text-white/60'}`} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">{module.exception?.status === 'cancelled' ? '---' : module.room}</span>
                                 </div>
                                 <div className={`w-8 h-8 rounded-full ${module.exception?.status === 'cancelled' ? 'bg-slate-300/30' : 'bg-white/20'} flex items-center justify-center opacity-0 group-hover/module:opacity-100 transition-opacity`}>
                                    <ChevronRight className="w-4 h-4" />
                                 </div>
                               </div>
                             </div>
                           ) : (
                             <div className="h-[140px] border-2 border-dashed border-slate-100 rounded-[28px] flex items-center justify-center group-hover/row:border-slate-200 transition-colors">
                                <div className="w-2 h-2 rounded-full bg-slate-100 group-hover/row:scale-150 transition-transform" />
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
        </section>

        {/* Lower Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-1 bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 rounded-full -mr-32 -mt-32 blur-3xl opacity-20 group-hover:scale-150 transition-transform duration-1000" />
              <div className="relative z-10 flex flex-col items-start gap-6">
                 <div className="w-16 h-16 bg-white/10 rounded-[24px] flex items-center justify-center backdrop-blur-md border border-white/10 shrink-0">
                    <Target className="w-8 h-8 text-indigo-400" />
                 </div>
                 <div>
                    <h3 className="text-xl font-black mb-2 tracking-tighter uppercase tracking-widest">Protocol Alignment</h3>
                    <p className="text-slate-400 text-[10px] font-bold leading-relaxed uppercase tracking-widest opacity-80 italic">
                       Verify your temporal map with institutional records.
                    </p>
                 </div>
              </div>
           </div>

           <div className="lg:col-span-2 bg-white rounded-[40px] border border-slate-200 overflow-hidden shadow-sm flex flex-col">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                 <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase tracking-widest flex items-center gap-3">
                    <Activity className="w-5 h-5 text-indigo-600" /> Registry Audit
                 </h2>
                 <span className="px-4 py-1.5 bg-white border border-slate-200 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest shadow-sm">
                    API Stream: {timetable.length} Records
                 </span>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full">
                    <thead className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-left bg-slate-50/10">
                       <tr>
                          <th className="px-8 py-4">Academic Module</th>
                          <th className="px-8 py-4">Observer</th>
                          <th className="px-8 py-4">Temporal Window</th>
                          <th className="px-8 py-4 text-right">Status</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {timetable.length === 0 ? (
                          <tr>
                             <td colSpan={4} className="px-8 py-16 text-center text-slate-300 font-mono text-[10px] uppercase tracking-widest">
                                No matching records detected for your profile.
                             </td>
                          </tr>
                       ) : (
                          timetable.map(e => (
                             <tr key={e._id} className="hover:bg-slate-50/50 transition-colors group/row">
                                <td className="px-8 py-6">
                                   <div className="font-black text-slate-900 text-sm uppercase tracking-tight">{e.subject}</div>
                                   <div className="text-[9px] font-bold text-slate-400 font-mono mt-1 opacity-60 italic">{e._id.slice(-8)}</div>
                                </td>
                                <td className="px-8 py-6 text-[10px] font-black text-slate-600 uppercase tracking-tight">{e.teacherId?.name}</td>
                                <td className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-tight">{e.day} // {e.startTime}</td>
                                <td className="px-8 py-6 text-right">
                                   <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm">Verified Synapse</span>
                                </td>
                             </tr>
                          ))
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}