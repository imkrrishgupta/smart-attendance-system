'use client';

import { useState, useEffect } from 'react';
import { Settings, Plus, Search, Calendar, MapPin, User, X, Clock } from 'lucide-react';

export default function AdminTimetable() {
  const [timetable, setTimetable] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    subject: '',
    teacherId: '',
    day: 'Monday',
    startTime: '09:00',
    endTime: '10:00',
    room: ''
  });
  const [saving, setSaving] = useState(false);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const fetchData = async () => {
    try {
      const [timetableRes, teachersRes] = await Promise.all([
        fetch('/api/admin/timetable'),
        fetch('/api/admin/teachers')
      ]);
      if (timetableRes.ok) setTimetable(await timetableRes.json());
      if (teachersRes.ok) setTeachers(await teachersRes.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowAddModal(false);
        setFormData({ subject: '', teacherId: '', day: 'Monday', startTime: '09:00', endTime: '10:00', room: '' });
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to add schedule');
      }
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const filteredTimetable = timetable.filter(item =>
    item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.teacherId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Academic Timetable</h1>
              <p className="text-slate-600 mt-1">Manage and schedule classes across the institution.</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Add Schedule
            </button>
          </div>
        </div>
      </header>

      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by subject or teacher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full py-20 text-center text-slate-400">Loading timetable...</div>
          ) : filteredTimetable.length === 0 ? (
            <div className="col-span-full py-20 text-center text-slate-500 italic">No schedules found.</div>
          ) : (
            filteredTimetable.map((item) => (
              <div key={item._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-6 group">
                <div className="flex justify-between items-start mb-4">
                  <div className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg uppercase tracking-wider">
                    {item.day}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-red-50 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{item.subject}</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-600">
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.teacherId?.name || 'Unassigned'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{item.startTime} - {item.endTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{item.room}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b bg-slate-50">
              <h3 className="font-bold text-xl text-slate-900">Add New Schedule</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 transition">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddSchedule} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subject Name</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Advanced Mathematics"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Assign Teacher</label>
                  <select
                    required
                    value={formData.teacherId}
                    onChange={e => setFormData({ ...formData, teacherId: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  >
                    <option value="">Select a Teacher</option>
                    {teachers.map(t => (
                      <option key={t._id} value={t._id}>{t.name} ({t.department})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Day</label>
                  <select
                    required
                    value={formData.day}
                    onChange={e => setFormData({ ...formData, day: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  >
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Room / Hall</label>
                  <input
                    type="text"
                    required
                    value={formData.room}
                    onChange={e => setFormData({ ...formData, room: e.target.value })}
                    placeholder="e.g. Room 302"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={saving || !formData.teacherId}
                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-50 mt-4 shadow-lg shadow-indigo-100"
              >
                {saving ? 'Creating Schedule...' : 'Save Timetable Entry'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Missing icon used in loop
import { Trash2 } from 'lucide-react';