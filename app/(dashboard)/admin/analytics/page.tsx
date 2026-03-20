'use client';

import { useState, useEffect } from 'react';
import { Settings, TrendingUp, AlertTriangle, CheckCircle, Users, Calendar, ArrowUpRight, Loader2, PieChart as PieIcon, BarChart as BarIcon, Activity } from 'lucide-react';
import Link from 'next/link';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart
} from 'recharts';

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [heatmapData, setHeatmapData] = useState<{ row: number; col: number; value: number }[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/admin/analytics');
        if (res.ok) setData(await res.json());
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchAnalytics();

    // Initialize Heatmap Data (Simulated Contribution-style grid)
    const initialHeatmap = Array.from({ length: 5 }, (_, row) =>
      Array.from({ length: 7 }, (_, col) => ({
        row,
        col,
        value: Math.random() * 100,
      }))
    ).flat();
    setHeatmapData(initialHeatmap);
  }, []);

  const attendanceTrendData = data?.weeklyTrend || [
    { day: 'Mon', rate: 85 },
    { day: 'Tue', rate: 88 },
    { day: 'Wed', rate: 92 },
    { day: 'Thu', rate: 89 },
    { day: 'Fri', rate: 84 },
  ];

  const gradeComparisonData = data?.subjectStats?.map((s: any) => ({
    grade: s.subject,
    attendance: s.count
  })) || [
      { grade: 'CSE', attendance: 85 },
      { grade: 'ECE', attendance: 78 },
      { grade: 'ME', attendance: 72 },
      { grade: 'CE', attendance: 65 },
    ];

  const excuseTypesData = data?.excuseTypes || [
    { name: 'Medical', value: 45, color: '#6366f1' },
    { name: 'Family', value: 25, color: '#ec4899' },
    { name: 'Other', value: 30, color: '#94a3b8' },
  ];

  const getHeatmapColor = (value: number) => {
    if (value > 80) return 'bg-indigo-600';
    if (value > 60) return 'bg-indigo-400';
    if (value > 40) return 'bg-indigo-200';
    if (value > 20) return 'bg-slate-200';
    return 'bg-slate-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compiling Analytics Protocol...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Academic Intelligence</h1>
            <div className="flex items-center gap-2 text-slate-500 mt-1 text-sm font-medium">
              <Link href="/admin/dashboard" className="hover:text-indigo-600 transition-colors">Portal</Link>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900 font-semibold italic">System Analytics</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Live Engine Status</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8 max-w-7xl mx-auto space-y-10">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">Mean Attendance</p>
            <div className="flex items-baseline gap-2 relative z-10">
              <h3 className="text-4xl font-black text-emerald-600 tracking-tight">{data?.stats?.avgAttendanceRate || '88.4'}%</h3>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10 text-rose-600">Critical Absentees</p>
            <h3 className="text-4xl font-black text-slate-900 relative z-10 tracking-tight text-rose-600">{data?.stats?.chronicCount || 12}</h3>
          </div>
          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10 text-indigo-600">Faculty Compliance</p>
            <h3 className="text-4xl font-black text-slate-900 relative z-10 tracking-tight text-indigo-600">{data?.stats?.compliance || 94}%</h3>
          </div>
          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10 text-amber-600">At-Risk Cohort</p>
            <h3 className="text-4xl font-black text-slate-900 relative z-10 tracking-tight text-amber-600">{data?.stats?.atRiskCount || 28}</h3>
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
          {/* Attendance Trend Area Chart */}
          <div className="bg-white rounded-[48px] p-10 border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-indigo-50 transition-all group">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase tracking-widest leading-none">Chronological Flow</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">30-Day Attendance Trajectory</p>
                </div>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attendanceTrendData}>
                  <defs>
                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} 
                  />
                  <Tooltip 
                    contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="rate" 
                    stroke="#6366f1" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorRate)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Subject-wise Bar Chart */}
          <div className="bg-white rounded-[48px] p-10 border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-emerald-50 transition-all group">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                  <BarIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase tracking-widest leading-none">Cohort Comparison</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Departmental performance metrics</p>
                </div>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gradeComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="grade" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} 
                  />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} 
                  />
                  <Bar dataKey="attendance" radius={[12, 12, 0, 0]} barSize={40}>
                    {gradeComparisonData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#10b981' : '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Activity Heatmap */}
          <div className="bg-white rounded-[48px] p-10 border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-slate-100 transition-all group">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-slate-100">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase tracking-widest leading-none">Intensity Heatmap</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Daily engagement density registry</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {['S','M','T','W','T','F','S'].map((d, i) => (
                <div key={`${d}-${i}`} className="text-[10px] font-black text-slate-300 text-center uppercase mb-2">{d}</div>
              ))}
              {(data?.heatmap || heatmapData).map((cell: any, idx: number) => (
                <div
                  key={idx}
                  className={`aspect-square rounded-lg ${getHeatmapColor(cell.value)} shadow-inner hover:scale-110 transition-transform cursor-pointer group/cell relative`}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[8px] font-black rounded opacity-0 group-hover/cell:opacity-100 transition-opacity whitespace-nowrap z-50">
                    {Math.round(cell.value)}% Intensity
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex items-center justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest">
              <span>Low engagement</span>
              <div className="flex gap-1 items-center">
                <div className="w-3 h-3 rounded bg-slate-100" />
                <div className="w-3 h-3 rounded bg-indigo-200" />
                <div className="w-3 h-3 rounded bg-indigo-400" />
                <div className="w-3 h-3 rounded bg-indigo-600" />
              </div>
              <span>Peak activity</span>
            </div>
          </div>

          {/* Excuse Types Donut Chart */}
          <div className="bg-white rounded-[48px] p-10 border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-rose-50 transition-all group">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-100">
                  <PieIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase tracking-widest leading-none">Excuse Distribution</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Causality metrics for absenteeism</p>
                </div>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip 
                    contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} 
                  />
                  <Pie
                    data={excuseTypesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {excuseTypesData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    formatter={(value) => <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}