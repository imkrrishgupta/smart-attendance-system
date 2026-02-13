'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Settings,
  UserPlus,
  Search,
  Edit,
  X,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  UserCheck
} from 'lucide-react';

interface Teacher {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function TeachersManagement() {
  const router = useRouter();

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTeachers = async () => {
      const res = await fetch('/api/teachers');
      const data = await res.json();
      setTeachers(data);
      setLoading(false);
    };

    fetchTeachers();
  }, []);

  const filteredTeachers = teachers.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddTeacher = () => {
    router.push('/admin/teachers/new');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Teacher Management</h1>
            <p className="text-slate-600 mt-1">Manage all registered teachers</p>
          </div>

          <button
            onClick={handleAddTeacher}
            className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
          >
            <UserPlus className="w-5 h-5" />
            Add Teacher
          </button>
        </div>
      </header>

      <div className="p-8">
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-6 border-b border-slate-200 flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search teachers"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading teachers...</div>
          ) : filteredTeachers.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No teachers found</div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredTeachers.map(t => (
                <div key={t._id} className="p-6 flex items-center justify-between hover:bg-slate-50">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center">
                      <Users className="w-7 h-7 text-slate-500" />
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900">{t.name}</h3>
                      <p className="text-sm text-slate-600">{t.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex gap-2 items-center">
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>

                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg flex gap-2 items-center">
                      <X className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
