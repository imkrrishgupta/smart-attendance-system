'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { BRANCHES, SEMESTERS } from '@/lib/constants';
import { Filter, X, Search, Users, Loader2, UserCheck, Trash2 } from 'lucide-react';
import Link from 'next/link';

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
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Student Directory</h1>
                        <div className="flex items-center gap-2 text-slate-500 mt-1 text-sm font-medium">
                            <Link href="/admin/dashboard" className="hover:text-indigo-600 transition-colors">Portal</Link>
                            <span className="text-slate-300">/</span>
                            <span className="text-slate-900 font-semibold italic">Enrolled Students</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-5 py-2.5 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center gap-3">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">{filteredStudents.length} Records Identified</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="p-8 max-w-7xl mx-auto space-y-8 pb-12">
                {/* Advanced Filters */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />

                    <div className="relative z-10 flex flex-col lg:flex-row items-end gap-6">
                        <div className="flex-1 w-full">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Search className="w-3.5 h-3.5" /> Search Registry
                            </label>
                            <input
                                type="text"
                                placeholder="Find student by Name, Email or Roll ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm placeholder:text-slate-400 placeholder:font-medium"
                            />
                        </div>

                        <div className="w-full lg:w-48">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Filter className="w-3.5 h-3.5" /> Department
                            </label>
                            <select
                                value={filterBranch}
                                onChange={(e) => setFilterBranch(e.target.value)}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm appearance-none bg-no-repeat"
                                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 1.25rem center', backgroundSize: '1.25rem' }}
                            >
                                <option value="All Branches">All Departments</option>
                                {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>

                        <div className="w-full lg:w-48">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Users className="w-3.5 h-3.5" /> Semester
                            </label>
                            <select
                                value={filterSemester}
                                onChange={(e) => setFilterSemester(e.target.value)}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm appearance-none bg-no-repeat"
                                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 1.25rem center', backgroundSize: '1.25rem' }}
                            >
                                <option value="All Semesters">All Terms</option>
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
                                className="p-4 text-slate-400 hover:text-red-500 transition-colors bg-slate-50 border border-slate-200 rounded-2xl active:scale-95"
                                title="Clear Filters"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Student Records Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full py-20 text-center">
                            <Loader2 className="w-12 h-12 border-indigo-600 animate-spin mx-auto mb-4 text-indigo-600" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Querying Student Database...</p>
                        </div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="col-span-full py-20 text-center opacity-40">
                            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Student Records Found</p>
                        </div>
                    ) : (
                        <div className="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredStudents.map((student) => (
                                <div key={student._id} className="bg-white rounded-[32px] p-8 border border-slate-200 hover:border-indigo-600 hover:shadow-xl hover:shadow-indigo-50/50 transition-all group flex flex-col h-full relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-2 h-0 group-hover:h-full bg-indigo-600 transition-all duration-300" />

                                    <div className="flex items-start justify-between mb-8">
                                        <div className="w-16 h-16 rounded-2xl bg-slate-900 border-4 border-white shadow-xl flex items-center justify-center text-white font-black text-2xl group-hover:scale-105 transition-transform">
                                            {student.name.charAt(0)}
                                        </div>
                                        <div className="text-right">
                                            <div className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[9px] font-black uppercase tracking-[0.1em] rounded-lg border border-indigo-100 mb-2 inline-block">
                                                {student.branch || 'N/A'}
                                            </div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Sem {student.semester || '?'}</p>
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-2 tracking-tight line-clamp-1">
                                            {student.name}
                                        </h3>
                                        <div className="flex items-center gap-2 text-slate-500 font-medium text-xs mb-8">
                                            <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                                            {student.email}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-8 p-5 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-indigo-50/30 group-hover:border-indigo-100 transition-colors">
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Roll ID</p>
                                                <p className="text-sm font-bold text-slate-900 tracking-tight">{student.rollNumber || 'UNDEF'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Reg Node</p>
                                                <p className="text-sm font-bold text-slate-900 tracking-tight">{student.enrollmentNo || 'UNDEF'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 pt-6 border-t border-slate-50">
                                        <button className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:border-indigo-600 hover:text-indigo-600 transition-all flex items-center justify-center gap-2 active:scale-95">
                                            View Logs
                                        </button>
                                        <button
                                            onClick={() => handleDeleteStudent(student._id, student.name)}
                                            className="w-12 h-12 flex items-center justify-center bg-white border border-slate-100 text-slate-300 rounded-xl hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-all active:scale-95"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
