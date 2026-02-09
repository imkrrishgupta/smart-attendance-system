'use client';

import { useState } from 'react';
import { Filter, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

interface Session {
  id: string;
  date: string;
  time: string;
  subject: string;
  class: string;
  status: 'scheduled' | 'completed';
}

export default function Sessions() {
  const [dateRange, setDateRange] = useState('01 Oct 2023 - 31 Oct 2023');
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [currentPage, setCurrentPage] = useState(1);

  const subjects = [
    'All Subjects',
    'Data Structures',
    'Algorithms',
    'Database Systems',
    'Operating Systems',
  ];
  const classes = [
    'All Classes',
    'CS-A',
    'CS-B',
    'CS-C',
    'IT-A',
    'IT-B',
  ];

  const sessionsData: Session[] = [
    {
      id: '1',
      date: 'Oct 26, 2023',
      time: '10:00 AM - 11:00 AM',
      subject: 'Data Structures',
      class: 'CS-A',
      status: 'scheduled',
    },
    {
      id: '2',
      date: 'Oct 25, 2023',
      time: '02:00 PM - 03:00 PM',
      subject: 'Algorithms',
      class: 'CS-B',
      status: 'completed',
    },
    {
      id: '3',
      date: 'Oct 25, 2023',
      time: '02:00 PM - 03:00 PM',
      subject: 'Algorithms',
      class: 'CS-B',
      status: 'completed',
    },
    {
      id: '4',
      date: 'Oct 24, 2023',
      time: '10:00 AM - 11:00 AM',
      subject: 'Database Systems',
      class: 'CS-A',
      status: 'completed',
    },
    {
      id: '5',
      date: 'Oct 23, 2023',
      time: '09:00 AM - 10:00 AM',
      subject: 'Operating Systems',
      class: 'IT-B',
      status: 'completed',
    },
    {
      id: '6',
      date: 'Oct 22, 2023',
      time: '01:00 PM - 02:00 PM',
      subject: 'Data Structures',
      class: 'IT-A',
      status: 'completed',
    },
  ];

  const itemsPerPage = 6;
  const totalPages = Math.ceil(sessionsData.length / itemsPerPage);
  const paginatedData = sessionsData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="px-8 py-6">
          <h1 className="text-3xl font-bold text-slate-900">Sessions</h1>
          <div className="flex items-center gap-2 text-slate-600 mt-2">
            <Link href="/teacher/dashboard" className="hover:text-slate-900">
              Home
            </Link>
            <span className="mx-1">›</span>
            <span>Sessions</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-8">
        {/* Filters Section */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Date Range:
              </label>
              <input
                type="text"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="01 Oct 2023 - 31 Oct 2023"
              />
            </div>

            {/* Subject Filter */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Subject:
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {subjects.map((subj) => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                ))}
              </select>
            </div>

            {/* Class/Section Filter */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Class/Section:
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {classes.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Button */}
            <div>
              <button className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                <Filter className="w-5 h-5" />
                Filter
              </button>
            </div>
          </div>
        </div>

        {/* Sessions Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100">
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
                    Class
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 border-b border-slate-200">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 border-b border-slate-200">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((session) => (
                  <tr key={session.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                      {session.date}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {session.time}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {session.subject}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {session.class}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-semibold ${
                          session.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-300 text-slate-700'
                        }`}
                      >
                        {session.status === 'completed'
                          ? 'Completed'
                          : 'Scheduled'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {session.status === 'scheduled' ? (
                        <button className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors border-2 border-green-600">
                          Mark Attendance
                        </button>
                      ) : (
                        <button className="px-6 py-2 bg-white text-slate-700 rounded-lg font-semibold border border-slate-300 hover:bg-slate-50 transition-colors">
                          View Attendance
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 px-6 py-4 border-t border-slate-200">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-2 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ‹‹
            </button>
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-2 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ‹
            </button>

            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-2 rounded-lg transition-colors font-medium ${
                  currentPage === i + 1
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {i + 1}
              </button>
            ))}

            {totalPages > 3 && currentPage > 3 && (
              <>
                <span className="text-slate-400">...</span>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  {totalPages}
                </button>
              </>
            )}

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-2 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ›
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-2 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ››
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}