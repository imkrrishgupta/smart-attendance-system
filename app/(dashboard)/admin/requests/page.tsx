'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';

interface LeaveRequest {
    _id: string;
    teacherId: {
        _id: string;
        name: string;
        email: string;
    };
    date: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
}

export default function AdminLeaveRequestsPage() {
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await fetch('/api/teacher/leave');
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

    const handleAction = async (id: string, status: 'approved' | 'rejected') => {
        try {
            const res = await fetch(`/api/admin/requests/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                fetchRequests();
            }
        } catch (error) {
            console.error(`Failed to ${status} request`, error);
        }
    };

    if (loading) return <div className="p-6">Loading leave requests...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Teacher Leave Requests</h1>
            <div className="grid gap-4">
                {requests.length === 0 ? (
                    <p className="text-gray-500">No leave requests found.</p>
                ) : (
                    requests.map((req) => (
                        <Card key={req._id} className="p-4 flex justify-between items-center bg-white dark:bg-gray-800 rounded-lg shadow">
                            <div>
                                <h3 className="font-semibold text-lg">{req.teacherId.name} ({req.teacherId.email})</h3>
                                <p className="text-sm text-gray-500">Date: {new Date(req.date).toLocaleDateString()}</p>
                                <p className="mt-2 text-gray-700 dark:text-gray-300">Reason: {req.reason}</p>
                                <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${req.status === 'approved' ? 'bg-green-100 text-green-800' :
                                        req.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                                </span>
                            </div>

                            {req.status === 'pending' && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleAction(req._id, 'approved')}
                                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleAction(req._id, 'rejected')}
                                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                                    >
                                        Reject
                                    </button>
                                </div>
                            )}
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
