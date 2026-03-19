'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { BRANCHES, SEMESTERS } from '@/lib/constants';
import { Filter, X } from 'lucide-react';

interface Student {
    _id: string;
    name: string;
    email: string;
    rollNumber?: string;
    enrollmentNo?: string;
    branch?: string;
    semester?: string;
    createdAt: string;
}

export default function AdminStudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBranch, setFilterBranch] = useState('All Branches');
    const [filterSemester, setFilterSemester] = useState('All Semesters');

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

    const handleDeleteStudent = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to remove student ${name}?`)) return;
        try {
            const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchStudents();
            } else {
                alert('Failed to delete student');
            }
        } catch (e) {
            console.error(e);
            alert('An error occurred');
        }
    };

    const filteredStudents = students.filter(student => {
        const matchesSearch = (
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (student.rollNumber && student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        const matchesBranch = filterBranch === 'All Branches' || student.branch === filterBranch;
        const matchesSemester = filterSemester === 'All Semesters' || student.semester === filterSemester;
        
        return matchesSearch && matchesBranch && matchesSemester;
    });

    if (loading) return <div className="p-6">Loading students...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Student Management</h1>
                {/* Typically you'd have an Add Student button here matching the Add Teacher pattern */}
            </div>

            <div className="mb-8 space-y-4">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Search Students</label>
                        <input
                            type="text"
                            placeholder="Name, email, or roll number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                    <div className="w-full md:w-48">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Branch</label>
                        <select
                            value={filterBranch}
                            onChange={(e) => setFilterBranch(e.target.value)}
                            className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        >
                            <option value="All Branches">All Branches</option>
                            {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>
                    <div className="w-full md:w-48">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Semester</label>
                        <select
                            value={filterSemester}
                            onChange={(e) => setFilterSemester(e.target.value)}
                            className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        >
                            <option value="All Semesters">All Semesters</option>
                            {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
                        </select>
                    </div>
                    {(searchTerm || filterBranch !== 'All Branches' || filterSemester !== 'All Semesters') && (
                        <button 
                            onClick={() => {
                                setSearchTerm('');
                                setFilterBranch('All Branches');
                                setFilterSemester('All Semesters');
                            }}
                            className="p-2.5 text-gray-400 hover:text-red-500 transition-colors"
                            title="Clear Filters"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
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
                                <p className="font-medium text-gray-600 dark:text-gray-400">{new Date(student.createdAt).toLocaleDateString()}</p>
                                <p className="text-gray-500">Branch:</p>
                                <p className="font-medium">{student.branch || 'N/A'}</p>
                                <p className="text-gray-500">Semester:</p>
                                <p className="font-medium">{student.semester || 'N/A'}</p>
                            </div>

                            <div className="mt-4 md:mt-0 flex gap-2 justify-end">
                                {/* Actions like Edit, Suspend, View Attendance History */}
                                <button className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-gray-800 dark:text-gray-200 transition">
                                    View Details
                                </button>
                                <button
                                    onClick={() => handleDeleteStudent(student._id, student.name)}
                                    className="px-3 py-1.5 text-sm bg-red-50 hover:bg-red-100 text-red-600 rounded font-medium transition"
                                >
                                    Remove
                                </button>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
