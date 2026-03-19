'use client';

import { useState, useEffect } from 'react';
import { Settings, TrendingUp, AlertTriangle, CheckCircle, Users } from 'lucide-react';
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

    // Initialize Heatmap Data
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
    { day: 'Mon', rate: 0 },
    { day: 'Tue', rate: 0 },
    { day: 'Wed', rate: 0 },
    { day: 'Thu', rate: 0 },
    { day: 'Fri', rate: 0 },
  ];

  const gradeComparisonData = data?.subjectStats?.map((s: any) => ({
    grade: s.subject,
    attendance: s.count
  })) || [
      { grade: 'No Data', attendance: 0 }
    ];

  const excuseTypesData = data?.excuseTypes || [
    { name: 'Loading...', value: 100, color: '#e2e8f0' },
  ];

  const getHeatmapColor = (value: number) => {
    if (value > 80) return 'bg-green-600';
    if (value > 60) return 'bg-green-400';
    if (value > 40) return 'bg-amber-400';
    if (value > 20) return 'bg-orange-400';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
              <p className="text-slate-600 mt-1">Welcome back, Administrator</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors">
                <Settings className="w-5 h-5" />
                Settings
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-8">
        {loading && (
          <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-600 font-medium italic">Generating analytics report...</p>
            </div>
          </div>
        )}
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Avg Attendance Rate */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
            <h3 className="text-sm font-semibold text-slate-600 mb-2">Avg. Attendance Rate</h3>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-4xl font-bold text-green-600 mb-1">{data?.stats?.avgAttendanceRate || '0.0'}%</div>
                <div className="text-sm text-slate-500 italic">This current month</div>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Chronic Absenteeism */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
            <h3 className="text-sm font-semibold text-slate-600 mb-2">Chronic Absenteeism</h3>
            <div className="text-4xl font-bold text-red-600 mb-1">{data?.stats?.chronicCount || 0} Students</div>
            <div className="text-sm text-slate-500">Attendance &lt; 50%</div>
          </div>

          {/* Teacher Compliance */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
            <h3 className="text-sm font-semibold text-slate-600 mb-2">Teacher Compliance</h3>
            <div className="text-4xl font-bold text-blue-600 mb-1">{data?.stats?.compliance || 0}%</div>
            <div className="text-sm text-slate-500">On-time registry</div>
          </div>

          {/* At-Risk Students */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
            <h3 className="text-sm font-semibold text-slate-600 mb-2">At-Risk Students</h3>
            <div className="text-4xl font-bold text-orange-600 mb-1">{data?.stats?.atRiskCount || 0} Students</div>
            <div className="text-sm text-slate-500">Attendance &lt; 75%</div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Attendance Trend */}
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Attendance Trend (Last 30 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={attendanceTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fill="#3b82f6"
                  fillOpacity={0.1}
                  dot={{ fill: '#3b82f6', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Grade-wise Comparison */}
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Grade-wise Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gradeComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="grade" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="attendance" radius={[8, 8, 0, 0]}>
                  {gradeComparisonData.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.grade === '933 12' ? '#ef4444' : '#3b82f6'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Peak Absence Heatmap */}
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Peak Absence Heatmap</h3>
            <div className="grid grid-cols-7 gap-1">
              {(data?.heatmap || heatmapData).map((cell: any, idx: number) => (
                <div
                  key={idx}
                  className={`aspect-square rounded ${getHeatmapColor(cell.value)} shadow-inner hover:brightness-90 transition-all`}
                  title={`${Math.round(cell.value)}% attendance`}
                />
              ))}
            </div>
          </div>

          {/* Absence Excuse Types */}
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Absence Excuse Types</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={excuseTypesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {excuseTypesData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
