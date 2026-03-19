'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';

interface Student {
    _id: string;
    name: string;
    email: string;
    rollNumber?: string;
    enrollmentNo?: string;
    createdAt: string;
}

export default function AdminStudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const res = await fetch('/api/admin/users?role=student');
            if (res.ok) {
                const data = await res.json();
                setStudents(data);
            }
        } catch (error) {
            console.error('Failed to fetch students', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.rollNumber && student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <div className="p-6">Loading students...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Student Management</h1>
                {/* Typically you'd have an Add Student button here matching the Add Teacher pattern */}
            </div>

            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search students by name, email, or roll number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full max-w-md p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            <div className="grid gap-4">
                {filteredStudents.length === 0 ? (
                    <p className="text-gray-500">No students found.</p>
                ) : (
                    filteredStudents.map((student) => (
                        <Card key={student._id} className="p-4 flex flex-col md:flex-row justify-between md:items-center bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                                    {student.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">{student.name}</h3>
                                    <p className="text-sm text-gray-500">{student.email}</p>
                                </div>
                            </div>

                            <div className="mt-4 md:mt-0 grid grid-cols-2 gap-x-8 gap-y-1 text-sm bg-gray-50 dark:bg-gray-700/50 p-3 rounded">
                                <p className="text-gray-500">Roll No:</p>
                                <p className="font-medium">{student.rollNumber || 'N/A'}</p>
                                <p className="text-gray-500">Enrollment:</p>
                                <p className="font-medium">{student.enrollmentNo || 'N/A'}</p>
                                <p className="text-gray-500">Joined:</p>
                                <p className="font-medium text-gray-600 dark:text-gray-400">{new Date(student.createdAt).toLocaleDateString()}</p>
                            </div>

                            <div className="mt-4 md:mt-0 flex gap-2 justify-end">
                                {/* Actions like Edit, Suspend, View Attendance History */}
                                <button className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-gray-800 dark:text-gray-200 transition">
                                    View Details
                                </button>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
