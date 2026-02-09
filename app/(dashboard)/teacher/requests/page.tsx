'use client';

import { useState } from 'react';
import { Filter, CheckCircle, X, Clock, AlertCircle, Calendar, User, FileText } from 'lucide-react';
import Link from 'next/link';

interface Request {
  id: string;
  studentName: string;
  studentId: string;
  requestType: 'attendance-correction' | 'leave-request' | 'grade-appeal';
  subject: string;
  date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedOn: string;
  attachments?: string;
}

export default function Requests() {
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All Types');
  const [currentPage, setCurrentPage] = useState(1);

  const statusOptions = ['All', 'Pending', 'Approved', 'Rejected'];
  const typeOptions = ['All Types', 'Attendance Correction', 'Leave Request', 'Grade Appeal'];

  const requestsData: Request[] = [
    {
      id: '1',
      studentName: 'John Smith',
      studentId: '2024UGCS062',
      requestType: 'attendance-correction',
      subject: 'Data Structures & Algorithms',
      date: 'Oct 25, 2023',
      reason: 'System error - attendance not marked despite being present',
      status: 'pending',
      submittedOn: 'Oct 26, 2023 10:30 AM',
      attachments: 'photo_proof.jpg',
    },
    {
      id: '2',
      studentName: 'Sarah Johnson',
      studentId: '2024UGCS045',
      requestType: 'leave-request',
      subject: 'Database Management Systems',
      date: 'Oct 27, 2023',
      reason: 'Medical emergency - Doctor appointment',
      status: 'pending',
      submittedOn: 'Oct 26, 2023 02:15 PM',
      attachments: 'medical_certificate.pdf',
    },
    {
      id: '3',
      studentName: 'Michael Chen',
      studentId: '2024UGCS078',
      requestType: 'attendance-correction',
      subject: 'Operating Systems',
      date: 'Oct 24, 2023',
      reason: 'Late entry - arrived during attendance window',
      status: 'approved',
      submittedOn: 'Oct 24, 2023 04:20 PM',
    },
    {
      id: '4',
      studentName: 'Emily Carter',
      studentId: '2024UGCS091',
      requestType: 'leave-request',
      subject: 'Web Development',
      date: 'Oct 28, 2023',
      reason: 'Family emergency',
      status: 'rejected',
      submittedOn: 'Oct 27, 2023 09:45 AM',
    },
    {
      id: '5',
      studentName: 'David Williams',
      studentId: '2024UGCS033',
      requestType: 'attendance-correction',
      subject: 'Machine Learning',
      date: 'Oct 23, 2023',
      reason: 'Network issues during face verification',
      status: 'pending',
      submittedOn: 'Oct 23, 2023 11:30 AM',
    },
  ];

  const stats = {
    total: requestsData.length,
    pending: requestsData.filter((r) => r.status === 'pending').length,
    approved: requestsData.filter((r) => r.status === 'approved').length,
    rejected: requestsData.filter((r) => r.status === 'rejected').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'attendance-correction':
        return 'Attendance Correction';
      case 'leave-request':
        return 'Leave Request';
      case 'grade-appeal':
        return 'Grade Appeal';
      default:
        return type;
    }
  };

  const handleApprove = (requestId: string) => {
    // Handle approve logic
    console.log('Approved request:', requestId);
  };

  const handleReject = (requestId: string) => {
    // Handle reject logic
    console.log('Rejected request:', requestId);
  };

  const itemsPerPage = 5;
  const totalPages = Math.ceil(requestsData.length / itemsPerPage);
  const paginatedData = requestsData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="px-8 py-6">
          <h1 className="text-3xl font-bold text-slate-900">Student Requests</h1>
          <div className="flex items-center gap-2 text-slate-600 mt-2">
            <Link href="/teacher/dashboard" className="hover:text-slate-900">
              Home
            </Link>
            <span className="mx-1">›</span>
            <span>Requests</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-slate-600 font-medium mb-1">Total Requests</p>
                <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-slate-600 font-medium mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-slate-600 font-medium mb-1">Approved</p>
                <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                <X className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-slate-600 font-medium mb-1">Rejected</p>
                <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Filter by Status:
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Filter by Type:
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {typeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <button className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                <Filter className="w-5 h-5" />
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-200">
            {paginatedData.map((request) => (
              <div key={request.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                        <User className="w-6 h-6 text-slate-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-slate-900">{request.studentName}</h3>
                          <span className="text-sm text-slate-500">{request.studentId}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <AlertCircle className="w-4 h-4" />
                            <span className="font-semibold">Type:</span>
                            <span>{getTypeLabel(request.requestType)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <FileText className="w-4 h-4" />
                            <span className="font-semibold">Subject:</span>
                            <span>{request.subject}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Calendar className="w-4 h-4" />
                            <span className="font-semibold">Date:</span>
                            <span>{request.date}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Clock className="w-4 h-4" />
                            <span className="font-semibold">Submitted:</span>
                            <span>{request.submittedOn}</span>
                          </div>
                        </div>

                        <div className="bg-slate-100 rounded-lg p-3 mb-3">
                          <p className="text-sm font-semibold text-slate-900 mb-1">Reason:</p>
                          <p className="text-sm text-slate-700">{request.reason}</p>
                        </div>

                        {request.attachments && (
                          <div className="flex items-center gap-2 text-sm text-blue-600">
                            <FileText className="w-4 h-4" />
                            <a href="#" className="hover:underline font-medium">
                              {request.attachments}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {request.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(request.id)}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  )}

                  {request.status !== 'pending' && (
                    <div className="text-sm text-slate-500 italic">
                      {request.status === 'approved' ? 'Request approved' : 'Request rejected'}
                    </div>
                  )}
                </div>
              </div>
            ))}
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
                    ? 'bg-green-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {i + 1}
              </button>
            ))}

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