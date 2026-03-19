'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Calendar,
  Filter,
  CheckCircle,
  Loader2,
  XCircle,
  TrendingUp
} from 'lucide-react';

interface AttendanceRecord {
  _id: string;
  sessionId: {
    _id: string;
    subject: string;
    startTime: string;
    endTime: string;
  };
  status: 'present' | 'absent';
  createdAt: string;
}

export default function AttendanceHistory() {
  const { data: session } = useSession();
  const studentId = (session?.user as any)?.id;

  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [selectedSemester, setSelectedSemester] = useState('2024-2025 / Sem 2');
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [currentPage, setCurrentPage] = useState(1);

  const semesters = [
    '2024-2025 / Sem 2',
    '2024-2025 / Sem 1',
    '2023-2024 / Sem 2',
    '2023-2024 / Sem 1'
  ];

  const subjects = [
    'All Subjects',
    ...Array.from(
      new Set(attendanceData.map((r) => r.sessionId?.subject).filter(Boolean))
    )
  ];

  useEffect(() => {
    if (studentId) {
      fetchAttendance();
    }
  }, [studentId]);

  const fetchAttendance = async () => {
    try {
      const res = await fetch(`/api/attendance?studentId=${studentId}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setAttendanceData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = attendanceData.filter((record) => {
    if (
      selectedSubject !== 'All Subjects' &&
      record.sessionId?.subject !== selectedSubject
    )
      return false;
    return true;
  });

  const stats = {
    totalClasses: filteredData.length,
    present: filteredData.filter((r) => r.status === 'present').length,
    absent: filteredData.filter((r) => r.status === 'absent').length,
    get overall() {
      return this.totalClasses > 0
        ? `${Math.round((this.present / this.totalClasses) * 100)}%`
        : '0%';
    }
  };

  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="px-8 py-6">
          <h1 className="text-3xl font-bold text-slate-900">
            Attendance History
          </h1>
          <p className="text-slate-600 mt-1">Your attendance records</p>
        </div>
      </header>

      <div className="p-8 max-w-7xl mx-auto space-y-8">

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">Filters</h2>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Semester */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Academic Period
              </label>

              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              >
                {semesters.map((sem) => (
                  <option key={sem} value={sem}>
                    {sem}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Subject Filter
              </label>

              <select
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              >
                {subjects.map((subj) => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button className="w-full px-6 py-2.5 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2">
                <Filter className="w-4 h-4" />
                Apply
              </button>
            </div>

          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          <div className="bg-white p-6 rounded-xl border">
            <CheckCircle className="text-green-600 mb-2" />
            <div className="text-3xl font-bold">{stats.present}</div>
            <p className="text-sm text-slate-500">Present</p>
          </div>

          <div className="bg-white p-6 rounded-xl border">
            <XCircle className="text-red-600 mb-2" />
            <div className="text-3xl font-bold">{stats.absent}</div>
            <p className="text-sm text-slate-500">Absent</p>
          </div>

          <div className="bg-white p-6 rounded-xl border">
            <Calendar className="text-blue-600 mb-2" />
            <div className="text-3xl font-bold">{stats.totalClasses}</div>
            <p className="text-sm text-slate-500">Total Classes</p>
          </div>

          <div className="bg-white p-6 rounded-xl border">
            <TrendingUp className="text-indigo-600 mb-2" />
            <div className="text-3xl font-bold">{stats.overall}</div>
            <p className="text-sm text-slate-500">Attendance %</p>
          </div>

        </div>

        {/* Records */}
        <div className="bg-white rounded-xl border border-slate-200">

          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">Records</h2>
          </div>

          <div className="p-6">

            {paginatedData.length === 0 ? (
              <p className="text-center text-slate-500">
                No attendance records found
              </p>
            ) : (
              <div className="space-y-3">

                {paginatedData.map((record) => (
                  <div
                    key={record._id}
                    className="p-4 bg-slate-50 border rounded-lg"
                  >

                    <div className="flex justify-between items-center">

                      <h3 className="font-semibold">
                        {record.sessionId?.subject || 'N/A'}
                      </h3>

                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          record.status === 'present'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {record.status}
                      </span>

                    </div>

                    <p className="text-sm text-slate-500 mt-1">
                      {new Date(record.createdAt).toLocaleString()}
                    </p>

                  </div>
                ))}

              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center px-6 py-4 border-t bg-slate-50">

              <p className="text-sm text-slate-600">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredData.length)} of{' '}
                {filteredData.length}
              </p>

              <div className="flex gap-2">

                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="px-4 py-2 border rounded disabled:opacity-40"
                >
                  Previous
                </button>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-40"
                >
                  Next
                </button>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}