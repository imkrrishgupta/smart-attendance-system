'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/Card';

interface LeaveRequest {
  _id: string;
  date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function TeacherLeaveRequestsPage() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const teacherId = (session?.user as any)?.id;

  useEffect(() => {
    if (teacherId) {
      fetchRequests();
    }
  }, [teacherId])

  const fetchRequests = async () => {
    try {
      const res = await fetch(`/api/teacher/leave?teacherId=${teacherId}`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (error) {
      console.error('Failed to fetch requests', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherId || !date || !reason) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/teacher/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherId, date, reason })
      });

      if (res.ok) {
        setDate('');
        setReason('');
        fetchRequests();
      }
    } catch (error) {
      console.error('Failed to submit request', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Loading leave requests...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">My Leave Requests</h1>

      <Card className="p-6 mb-8 bg-white dark:bg-gray-800 rounded-lg shadow max-w-xl">
        <h2 className="text-xl font-semibold mb-4">Submit New Request</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason</label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Please provide a detailed reason..."
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition duration-200 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Leave Request'}
          </button>
        </form>
      </Card>

      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Past Requests</h2>
      <div className="grid gap-4 max-w-3xl">
        {requests.length === 0 ? (
          <p className="text-gray-500">No leave requests found.</p>
        ) : (
          requests.map((req: LeaveRequest) => (
            <Card key={req._id} className="p-4 flex justify-between items-center bg-white dark:bg-gray-800 rounded-lg shadow">
              <div>
                <p className="font-medium">Date: {new Date(req.date).toLocaleDateString()}</p>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{req.reason}</p>
              </div>
              <div>
                <span className={`inline-block px-3 py-1 text-sm rounded-full font-medium ${req.status === 'approved' ? 'bg-green-100 text-green-800' :
                  req.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                  {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                </span>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}