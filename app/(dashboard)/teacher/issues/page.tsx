'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/Card';

interface Issue {
    _id: string;
    studentId: {
        name: string;
        rollNumber: string;
        email: string;
    };
    sessionId: {
        subject: string;
        startTime: string;
    };
    issueType: string;
    description: string;
    status: 'pending' | 'resolved';
    createdAt: string;
}

export default function TeacherIssuesPage() {
    const { data: session } = useSession();
    const [issues, setIssues] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(true);
    const teacherId = (session?.user as any)?.id;

    useEffect(() => {
        if (teacherId) {
            fetchIssues();
        }
    }, [teacherId]);

    const fetchIssues = async () => {
        if (!teacherId) return;
        try {
            const res = await fetch(`/api/student/issues?teacherId=${teacherId}`);
            if (res.ok) {
                const data = await res.json();
                setIssues(data);
            }
        } catch (error) {
            console.error('Failed to fetch issues', error);
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (issueId: string) => {
        try {
            const res = await fetch(`/api/teacher/issues/${issueId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'resolved', resolvedBy: teacherId })
            });
            if (res.ok) {
                fetchIssues(); // Refresh the list
            }
        } catch (error) {
            console.error('Failed to resolve issue', error);
        }
    };

    const getIssueTypeLabel = (type: string) => {
        const types: Record<string, string> = {
            face_mismatch: 'Face Mismatch',
            location_fail: 'Location Verification Failed',
            session_inactive: 'Session Inactive',
            other: 'Other'
        };
        return types[type] || type;
    }

    if (loading) return <div className="p-6">Loading student issues...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Student Attendance Issues</h1>

            <div className="grid gap-4 max-w-4xl">
                {issues.length === 0 ? (
                    <p className="text-gray-500">No attendance issues reported.</p>
                ) : (
                    issues.map((issue: Issue) => (
                        <Card key={issue._id} className="p-4 flex flex-col md:flex-row justify-between md:items-start bg-white dark:bg-gray-800 rounded-lg shadow gap-4 border-l-4 border-blue-500">
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">
                                        {issue.studentId?.name} <span className="text-sm font-normal text-gray-500 ml-2">({issue.studentId?.rollNumber || issue.studentId?.email})</span>
                                    </h3>
                                    <span className={`inline-block px-3 py-1 text-xs rounded-full font-medium ${issue.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {issue.status.toUpperCase()}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                                    <p><span className="font-medium">Session:</span> {issue.sessionId?.subject}</p>
                                    <p><span className="font-medium">Date:</span> {issue.sessionId ? new Date(issue.sessionId.startTime).toLocaleDateString() : 'N/A'}</p>
                                    <p className="col-span-2"><span className="font-medium">Issue Type:</span> <span className="text-red-500 dark:text-red-400 font-semibold">{getIssueTypeLabel(issue.issueType)}</span></p>
                                </div>

                                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-100 dark:border-blue-800">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">"{issue.description}"</p>
                                </div>

                                <p className="text-xs text-gray-400 mt-3 text-right">Reported: {new Date(issue.createdAt).toLocaleString()}</p>
                            </div>

                            <div className="flex flex-col justify-end mt-4 md:mt-0 md:ml-4 border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-700 pt-4 md:pt-0 md:pl-4">
                                {issue.status === 'pending' && (
                                    <button
                                        onClick={() => handleResolve(issue._id)}
                                        className="w-full md:w-auto px-6 py-2 bg-green-500 text-white text-sm font-medium rounded hover:bg-green-600 transition shadow-sm"
                                    >
                                        Mark Resolved
                                    </button>
                                )}
                                {/* Note: In a full app, you might also have a button here to 'Manually Mark Present' based on the issue */}
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
