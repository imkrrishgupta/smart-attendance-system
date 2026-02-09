'use client';

import { useState } from 'react';
import { Calendar, Filter, Users, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface AttendanceRecord {
  id: string;
  date: string;
  time: string;
  subject: string;
  status: 'present' | 'absent';
  remarks: string;
}

export default function AttendanceHistory() {
  const [selectedSemester, setSelectedSemester] = useState('2024-2025 / Sem 1');
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [dateRange, setDateRange] = useState('01 Oct 2023 - 31 Oct 2023');
  const [currentPage, setCurrentPage] = useState(1);

  const semesters = ['2024-2025 / Sem 1', '2024-2025 / Sem 2', '2023-2024 / Sem 1', '2023-2024 / Sem 2'];
  const subjects = [
    'All Subjects',
    'Data Structures',
    'Algorithms',
    'Database Systems',
    'Operating Systems',
    'Web Development',
  ];

  const attendanceData: AttendanceRecord[] = [
    {
      id: '1',
      date: 'Oct 24, 2023',
      time: '10:00 AM - 11:00 AM',
      subject: 'Data Structures',
      status: 'present',
      remarks: '-',
    },
    {
      id: '2',
      date: 'Oct 23, 2023',
      time: '02:00 PM - 03:00 PM',
      subject: 'Algorithms',
      status: 'absent',
      remarks: 'Medical Leave',
    },
    {
      id: '3',
      date: 'Oct 22, 2023',
      time: '09:00 AM - 10:00 AM',
      subject: 'Database Systems',
      status: 'present',
      remarks: '-',
    },
    {
      id: '4',
      date: 'Oct 21, 2023',
      time: '10:00 AM - 11:00 AM',
      subject: 'Data Structures',
      status: 'present',
      remarks: '-',
    },
    {
      id: '5',
      date: 'Oct 20, 2023',
      time: '02:00 PM - 03:00 PM',
      subject: 'Algorithms',
      status: 'present',
      remarks: '-',
    },
    {
      id: '6',
      date: 'Oct 27, 2023',
      time: '09:00 AM - 10:00 AM',
      subject: 'Database Systems',
      status: 'present',
      remarks: '-',
    },
  ];

  const stats = {
    overall: '85%',
    totalClasses: '60',
    presentAbsent: '51 / 9',
  };

  const itemsPerPage = 6;
  const totalPages = Math.ceil(attendanceData.length / itemsPerPage);
  const paginatedData = attendanceData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="px-8 py-6">
          <h1 className="text-3xl font-bold text-slate-900">Attendance History</h1>
          <div className="flex items-center gap-2 text-slate-600 mt-2">
            <Link href="/student/dashboard" className="hover:text-slate-900">
              Home
            </Link>
            <span className="mx-1">›</span>
            <span>Attendance History</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-8">
        {/* Filters Section */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {/* Semester Filter */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Academic Year/Semester:
              </label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {semesters.map((sem) => (
                  <option key={sem} value={sem}>
                    {sem}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Filter */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Subject:
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {subjects.map((subj) => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Date:
              </label>
              <input
                type="text"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="01 Oct 2023 - 31 Oct 2023"
              />
            </div>

            {/* Filter Button */}
            <div>
              <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                <Filter className="w-5 h-5" />
                Filter
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Overall Attendance */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-slate-600 font-medium mb-1">Overall Attendance:</p>
                <p className="text-3xl font-bold text-slate-900">{stats.overall}</p>
              </div>
            </div>
          </div>

          {/* Total Classes */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-slate-600 font-medium mb-1">Total Classes:</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalClasses}</p>
              </div>
            </div>
          </div>

          {/* Present/Absent */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-slate-600 font-medium mb-1">Present/Absent:</p>
                <p className="text-3xl font-bold text-slate-900">
                  <span className="text-green-600">{stats.presentAbsent.split(' / ')[0]}</span>
                  <span className="text-slate-400 mx-2">/</span>
                  <span className="text-red-600">{stats.presentAbsent.split(' / ')[1]}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 border-b border-slate-200">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 border-b border-slate-200">
                    Time
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 border-b border-slate-200">
                    Subject
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 border-b border-slate-200">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 border-b border-slate-200">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((record) => (
                  <tr key={record.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-900 font-medium">{record.date}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{record.time}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{record.subject}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-semibold ${
                          record.status === 'present'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {record.status === 'present' ? 'Present' : 'Absent'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{record.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 px-6 py-4 border-t border-slate-200">
            <button
              onClick={() => setCurrentPage(1)}
              className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              «
            </button>
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              ‹
            </button>

            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  currentPage === i + 1
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {i + 1}
              </button>
            ))}

            {totalPages > 3 && (
              <>
                <span className="text-slate-400">...</span>
                {currentPage > 3 && (
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    {totalPages}
                  </button>
                )}
              </>
            )}

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              ›
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              »
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}