'use client';

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
  // Attendance trend data
  const attendanceTrendData = [
    { day: 'Mon', rate: 88 },
    { day: 'Tues', rate: 90 },
    { day: 'Wedn', rate: 85 },
    { day: 'Thur', rate: 92 },
    { day: 'Frib', rate: 87 },
    { day: 'Frida', rate: 91 },
  ];

  // Grade-wise comparison data
  const gradeComparisonData = [
    { grade: 'Grade 9', attendance: 85 },
    { grade: '8lade 9', attendance: 75 },
    { grade: '911 10', attendance: 78 },
    { grade: '933 12', attendance: 68 },
    { grade: '933 12', attendance: 88 },
    { grade: '955%', attendance: 95 },
  ];

  // Absence excuse types data
  const excuseTypesData = [
    { name: 'Unexcused', value: 35, color: '#ef4444' },
    { name: 'Sports', value: 20, color: '#fb923c' },
    { name: 'Sick', value: 25, color: '#22c55e' },
    { name: 'Family', value: 20, color: '#ef4444' },
  ];

  // Heatmap data (simplified representation)
  const heatmapData = Array.from({ length: 5 }, (_, row) =>
    Array.from({ length: 7 }, (_, col) => ({
      row,
      col,
      value: Math.random() * 100,
    }))
  ).flat();

  const getHeatmapColor = (value: number) => {
    if (value > 80) return 'bg-red-700';
    if (value > 60) return 'bg-red-500';
    if (value > 40) return 'bg-red-300';
    if (value > 20) return 'bg-red-200';
    return 'bg-red-100';
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Avg Attendance Rate */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
            <h3 className="text-sm font-semibold text-slate-600 mb-2">Avg. Attendance Rate</h3>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-4xl font-bold text-green-600 mb-1">92.4%</div>
                <div className="text-sm text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  +3.5% this month
                </div>
              </div>
              <div className="w-16 h-12">
                <svg viewBox="0 0 100 50" className="w-full h-full">
                  <polyline
                    points="0,40 20,35 40,30 60,25 80,20 100,10"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="3"
                  />
                  <polyline
                    points="0,40 20,35 40,30 60,25 80,20 100,10 100,50 0,50"
                    fill="#22c55e"
                    fillOpacity="0.2"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Chronic Absenteeism */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
            <h3 className="text-sm font-semibold text-slate-600 mb-2">Chronic Absenteeism</h3>
            <div className="text-4xl font-bold text-red-600 mb-1">47 Students</div>
            <div className="text-sm text-slate-500">Missed &gt;10%</div>
          </div>

          {/* Teacher Compliance */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
            <h3 className="text-sm font-semibold text-slate-600 mb-2">Teacher Compliance</h3>
            <div className="text-4xl font-bold text-blue-600 mb-1">98%</div>
            <div className="text-sm text-slate-500">Registers on time</div>
          </div>

          {/* At-Risk Students */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
            <h3 className="text-sm font-semibold text-slate-600 mb-2">At-Risk Students</h3>
            <div className="text-4xl font-bold text-orange-600 mb-1">15 Students</div>
            <div className="text-sm text-slate-500">Attendance drop</div>
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
                  {gradeComparisonData.map((entry, index) => (
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
              {heatmapData.map((cell, idx) => (
                <div
                  key={idx}
                  className={`aspect-square rounded ${getHeatmapColor(cell.value)}`}
                  title={`${Math.round(cell.value)}%`}
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
                  {excuseTypesData.map((entry, index) => (
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
