'use client';

import { useState, useEffect } from 'react';
<<<<<<< HEAD
import { Settings, UserPlus, Search, Edit, X, CheckCircle, Clock, Users, UserCheck } from 'lucide-react';
=======
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
>>>>>>> dd94954d28c9d9a240a7a5ae128a8faf522446ee

export default function TeachersManagement() {
  const router = useRouter();

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
<<<<<<< HEAD
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<any | null>(null);

  // Stats
  const [stats, setStats] = useState([
    { label: 'Total Teachers', value: '0', icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'Active Today', value: '0', icon: UserCheck, color: 'bg-green-50 text-green-600' },
    { label: 'Pending Apps', value: '0', icon: Clock, color: 'bg-purple-50 text-purple-600' },
  ]);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    employeeId: ''
  });
  const [saving, setSaving] = useState(false);

  const fetchTeachers = async () => {
    try {
      const res = await fetch('/api/admin/teachers');
      if (res.ok) {
        const data = await res.json();
        setTeachers(data);
        setStats([
          { label: 'Total Teachers', value: data.length.toString(), icon: Users, color: 'bg-blue-50 text-blue-600' },
          { label: 'Active Today', value: data.length.toString(), icon: UserCheck, color: 'bg-green-50 text-green-600' }, // Simplified for now
          { label: 'Pending Apps', value: '0', icon: Clock, color: 'bg-purple-50 text-purple-600' }
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleAddOrUpdateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        department: formData.department,
        employeeId: formData.employeeId
      };

      const method = editingTeacher ? 'PATCH' : 'POST';
      if (editingTeacher) {
        (payload as any).id = editingTeacher._id;
        if (!formData.password) {
          delete (payload as any).password;
        }
      }

      const res = await fetch('/api/admin/teachers', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowAddModal(false);
        setEditingTeacher(null);
        setFormData({ name: '', email: '', password: '', department: '', employeeId: '' });
        fetchTeachers();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save teacher');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred while saving teacher');
    }
    setSaving(false);
  };

  const filteredTeachers = teachers.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
=======

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
>>>>>>> dd94954d28c9d9a240a7a5ae128a8faf522446ee

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
<<<<<<< HEAD
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Teacher's Management</h1>
              <p className="text-slate-600 mt-1">Manage institutional faculty and academic assignments.</p>
            </div>
            <button
              onClick={() => {
                setEditingTeacher(null);
                setFormData({ name: '', email: '', password: '', department: '', employeeId: '' });
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              <UserPlus className="w-5 h-5" />
              Register Teacher
            </button>
=======
        <div className="px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Teacher Management</h1>
            <p className="text-slate-600 mt-1">Manage all registered teachers</p>
>>>>>>> dd94954d28c9d9a240a7a5ae128a8faf522446ee
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

<<<<<<< HEAD
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                    <div className="text-sm font-medium text-slate-500">{stat.label}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-200 bg-slate-50/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
=======
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
>>>>>>> dd94954d28c9d9a240a7a5ae128a8faf522446ee
              />
            </div>
          </div>

<<<<<<< HEAD
          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="p-12 text-center text-slate-400">Loading faculty list...</div>
            ) : filteredTeachers.length === 0 ? (
              <div className="p-12 text-center text-slate-500 italic">No faculty members found.</div>
            ) : (
              filteredTeachers.map((teacher) => (
                <div key={teacher._id} className="p-6 hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                        <Users className="w-7 h-7 text-slate-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-bold text-slate-900">{teacher.name}</h3>
                          <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider rounded-md border border-indigo-100">
                            {teacher.department || 'Academic'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">{teacher.email}</p>
                        <p className="text-xs text-slate-400 mt-0.5">ID: {teacher.employeeId}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setEditingTeacher(teacher);
                        setFormData({
                          name: teacher.name || '',
                          email: teacher.email || '',
                          password: '',
                          department: teacher.department || '',
                          employeeId: teacher.employeeId || ''
                        });
                        setShowAddModal(true);
                      }}
                      className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-100 transition flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
=======
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
>>>>>>> dd94954d28c9d9a240a7a5ae128a8faf522446ee
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b bg-slate-50">
              <h3 className="font-bold text-xl text-slate-900">
                {editingTeacher ? 'Edit Teacher' : 'Register New Teacher'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingTeacher(null);
                  setFormData({ name: '', email: '', password: '', department: '', employeeId: '' });
                }}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddOrUpdateTeacher} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Dr. Robert Wilson"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="teacher@university.edu"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Dept.</label>
                  <input
                    type="text"
                    required
                    value={formData.department}
                    placeholder="CS"
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Emp ID</label>
                  <input
                    type="text"
                    required
                    value={formData.employeeId}
                    placeholder="EMP01"
                    onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-50 mt-4"
              >
                {saving ? (editingTeacher ? 'Updating...' : 'Registering...') : (editingTeacher ? 'Update Teacher' : 'Register Teacher')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
