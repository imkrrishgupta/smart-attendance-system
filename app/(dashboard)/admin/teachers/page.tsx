'use client';

import { useState, useEffect } from 'react';
import { Settings, UserPlus, Search, Edit, X, CheckCircle, Clock, Users, UserCheck, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { BRANCHES } from '@/lib/constants';

export default function TeachersManagement() {
  const router = useRouter();

  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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
    branch: '',
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
        branch: formData.branch,
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
        setFormData({ name: '', email: '', password: '', branch: '', employeeId: '' });
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

  const handleAddTeacher = () => {
    setEditingTeacher(null);
    setFormData({ name: '', email: '', password: '', branch: '', employeeId: '' });
    setShowAddModal(true);
  };

  const handleDeleteTeacher = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name}?`)) return;
    try {
      const res = await fetch(`/api/admin/teachers?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchTeachers();
      } else {
        alert('Failed to delete teacher');
      }
    } catch (e) {
      console.error(e);
      alert('An error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Faculty Directory</h1>
            <div className="flex items-center gap-2 text-slate-500 mt-1 text-sm font-medium">
              <Link href="/admin/dashboard" className="hover:text-indigo-600 transition-colors">Portal</Link>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900 font-semibold italic">Teacher Management</span>
            </div>
          </div>
          <button
            onClick={handleAddTeacher}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
          >
            <UserPlus className="w-5 h-5" />
            Register Faculty
          </button>
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto space-y-8 pb-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm group hover:shadow-md transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-slate-50 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
                <div className="flex items-center gap-5 relative z-10">
                  <div className={`w-14 h-14 rounded-xl ${stat.color} border-2 border-white shadow-sm flex items-center justify-center transition-transform group-hover:scale-110`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Search & List */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search faculty by name, email or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-medium"
              />
            </div>
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 border-l border-slate-200">
              <Clock className="w-4 h-4" />
              Real-time Filter
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="p-20 text-center">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accessing Secure Records...</p>
              </div>
            ) : filteredTeachers.length === 0 ? (
              <div className="p-20 text-center opacity-40">
                <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Matching Faculty Identified</p>
              </div>
            ) : (
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTeachers.map((teacher) => (
                  <div key={teacher._id} className="p-6 bg-white border border-slate-100 rounded-2xl hover:border-indigo-600 hover:shadow-xl hover:shadow-indigo-50/50 transition-all group flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-slate-200 group-hover:scale-105 transition-transform">
                          {teacher.name.charAt(0)}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[9px] font-black uppercase tracking-[0.1em] rounded-lg border border-indigo-100">
                            {teacher.branch || 'Academic'}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">ID: {teacher.employeeId}</span>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-1 tracking-tight">
                        {teacher.name}
                      </h3>
                      <div className="flex items-center gap-2 text-slate-500 font-medium text-xs mb-6">
                        <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                        {teacher.email}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
                      <button
                        onClick={() => {
                          setEditingTeacher(teacher);
                          setFormData({
                            name: teacher.name || '',
                            email: teacher.email || '',
                            password: '',
                            branch: teacher.branch || '',
                            employeeId: teacher.employeeId || ''
                          });
                          setShowAddModal(true);
                        }}
                        className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:border-indigo-600 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Modify
                      </button>
                      <button
                        onClick={() => handleDeleteTeacher(teacher._id, teacher.name)}
                        className="w-12 h-10 flex items-center justify-center bg-white border border-slate-100 text-slate-300 rounded-xl hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Register/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden border border-white/20 transform animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between p-8 border-b border-slate-100 bg-white">
              <div>
                <h3 className="font-bold text-2xl text-slate-900 tracking-tight">
                  {editingTeacher ? 'Update Identity' : 'Register Faculty'}
                </h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Authorized Access Control</p>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingTeacher(null);
                  setFormData({ name: '', email: '', password: '', branch: '', employeeId: '' });
                }}
                className="w-10 h-10 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center transition-colors group"
              >
                <X className="w-6 h-6 text-slate-400 group-hover:text-slate-900 transition-colors" />
              </button>
            </div>
            
            <form onSubmit={handleAddOrUpdateTeacher} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Legal Registered Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Dr. Robert Wilson"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-300 placeholder:font-medium"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Institutional Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="teacher@university.edu"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-300 placeholder:font-medium"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Auth Key (Password)</label>
                  <input
                    type="password"
                    required={!editingTeacher}
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingTeacher ? 'Update Key...' : 'Secure Sequence...'}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Employee ID</label>
                  <input
                    type="text"
                    required
                    value={formData.employeeId}
                    placeholder="EMP_NODE_01"
                    onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-300 placeholder:font-medium"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Primary Branch Assignment</label>
                  <select
                    required
                    value={formData.branch}
                    onChange={e => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-no-repeat transition-all"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 1.25rem center', backgroundSize: '1.25rem' }}
                  >
                    <option value="" disabled>Select Department</option>
                    {BRANCHES.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={saving}
                className="w-full py-5 bg-indigo-600 text-white rounded-[20px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50 mt-4 active:scale-95"
              >
                {saving ? (editingTeacher ? 'Syncing...' : 'Registering...') : (editingTeacher ? 'Update Records' : 'Authorize Faculty')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
