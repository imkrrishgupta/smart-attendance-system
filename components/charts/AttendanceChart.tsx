'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';

interface AttendanceData {
    subject: string;
    present: number;
    absent: number;
}

interface AttendanceChartProps {
    data: AttendanceData[];
    title?: string;
}

export default function AttendanceChart({ data, title = 'Attendance Overview' }: AttendanceChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">{title}</h3>
                <p className="text-sm text-slate-400 text-center py-8">No attendance data available.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                        dataKey="subject"
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        tickLine={false}
                        axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <YAxis
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        tickLine={false}
                        axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <Tooltip
                        contentStyle={{
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                        }}
                    />
                    <Legend />
                    <Bar dataKey="present" fill="#22c55e" radius={[4, 4, 0, 0]} name="Present" />
                    <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} name="Absent" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
