'use client';

import { useState } from 'react';
import { Settings, Plus, Search, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

interface ScheduleEvent {
  id: string;
  title: string;
  location: string;
  color: string;
  row: number;
  col: number;
  rowSpan: number;
  colSpan: number;
}

export default function AdminTimetable() {
  const [selectedBranch, setSelectedBranch] = useState('Fall 2024');
  const [selectedCampus, setSelectedCampus] = useState('North Campus, Aud-B');
  const [selectedSemester, setSelectedSemester] = useState('Spring gone time');
  const [searchTerm, setSearchTerm] = useState('');

  const branches = ['Fall 2024', 'Spring 2024', 'Fall 2023'];
  const campuses = ['North Campus, Aud-B', 'Main Campus', 'South Campus'];
  const semesters = ['Spring gone time', 'Fall 2024', 'Spring 2025'];

  // Calendar grid events
  const events: ScheduleEvent[] = [
    {
      id: '1',
      title: 'Math 101',
      location: 'Main Campus',
      color: 'bg-blue-500',
      row: 1,
      col: 0,
      rowSpan: 2,
      colSpan: 1,
    },
    {
      id: '2',
      title: 'History of Art',
      location: 'North Campus',
      color: 'bg-green-500',
      row: 1,
      col: 3,
      rowSpan: 1,
      colSpan: 1,
    },
    {
      id: '3',
      title: 'Spring 2024',
      location: '',
      color: 'bg-orange-500',
      row: 2,
      col: 3,
      rowSpan: 2,
      colSpan: 1,
    },
    {
      id: '4',
      title: 'Web Dev II',
      location: 'Online',
      color: 'bg-orange-500',
      row: 2,
      col: 6,
      rowSpan: 2,
      colSpan: 1,
    },
    {
      id: '5',
      title: 'Math 101',
      location: 'Main Campus',
      color: 'bg-green-500',
      row: 1,
      col: 8,
      rowSpan: 1,
      colSpan: 1,
    },
    {
      id: '6',
      title: 'Spring 2024',
      location: '',
      color: 'bg-red-500',
      row: 0,
      col: 10,
      rowSpan: 1,
      colSpan: 2,
    },
    {
      id: '7',
      title: 'Web Dev II',
      location: 'Online',
      color: 'bg-orange-500',
      row: 4,
      col: 3,
      rowSpan: 2,
      colSpan: 2,
    },
    {
      id: '8',
      title: 'Chemistry Lab',
      location: 'Main Campus, Lab-A',
      color: 'bg-red-500',
      row: 5,
      col: 3,
      rowSpan: 1,
      colSpan: 2,
    },
    {
      id: '9',
      title: 'Math 101',
      location: 'Main Campus',
      color: 'bg-red-500',
      row: 7,
      col: 1,
      rowSpan: 1,
      colSpan: 2,
    },
    {
      id: '10',
      title: 'History of Art',
      location: 'North Campus, Aud-B',
      color: 'bg-red-500',
      row: 2,
      col: 10,
      rowSpan: 2,
      colSpan: 2,
    },
    {
      id: '11',
      title: 'Chemistry Lab',
      location: 'Main Campus, Lab-A',
      color: 'bg-red-500',
      row: 4,
      col: 10,
      rowSpan: 1,
      colSpan: 2,
    },
  ];

  const days = ['Monday', 'Monday', 'Tuen', 'Tued', 'Tued', 'Tuesday', 'Thusday', 'Frib', 'Sutu', 'Fridi', 'Frib', 'Frida'];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">University Timetables</h1>
              <p className="text-slate-600 mt-1">Manage schedules across all branches</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors">
                <Settings className="w-5 h-5" />
                Settings
              </button>
              <button className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                <Plus className="w-5 h-5" />
                Add Nschedule
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-8">
        {/* Filters Section */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Filters</h3>
          
          {/* Top Row Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Select Branch:
              </label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {branches.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Norin Campus
              </label>
              <select
                value={selectedCampus}
                onChange={(e) => setSelectedCampus(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {campuses.map((campus) => (
                  <option key={campus} value={campus}>
                    {campus}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Select Semeter
              </label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {semesters.map((semester) => (
                  <option key={semester} value={semester}>
                    {semester}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bottom Row - Search and Navigation */}
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Select Branch:
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by Teacher or Teacher"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <span className="px-4 py-3 text-sm font-medium text-slate-700">Previous Week</span>
              <button className="p-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
              <button className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[1200px]">
              {/* Calendar Header */}
              <div className="grid grid-cols-12 border-b border-slate-200">
                {days.map((day, idx) => (
                  <div key={idx} className="p-4 text-center text-sm font-semibold text-slate-900 border-r border-slate-200 last:border-r-0">
                    <div>{day}</div>
                    <div className="text-2xl font-bold text-slate-400 mt-1">
                      {[1, 2, 1, 2, 3, 4, 5, 4, 5, 5, '', 6][idx]}
                    </div>
                  </div>
                ))}
              </div>

              {/* Calendar Grid Body */}
              <div className="relative" style={{ height: '800px' }}>
                {/* Grid Lines */}
                <div className="absolute inset-0 grid grid-cols-12">
                  {Array.from({ length: 12 }).map((_, colIdx) => (
                    <div key={colIdx} className="border-r border-slate-200 last:border-r-0">
                      {Array.from({ length: 8 }).map((_, rowIdx) => (
                        <div
                          key={rowIdx}
                          className="h-24 border-b border-slate-200 p-2 text-xs text-slate-400"
                        >
                          {/* Time slot numbers */}
                          {colIdx === 0 && (
                            <span className="font-semibold">
                              {[7, 15, 21, 23, 27, 29, 1, ''][rowIdx]}
                            </span>
                          )}
                          {colIdx === 1 && rowIdx === 0 && <span className="font-semibold">8</span>}
                          {colIdx === 1 && rowIdx === 1 && <span className="font-semibold">15</span>}
                          {colIdx === 1 && rowIdx === 2 && <span className="font-semibold">22</span>}
                          {colIdx === 1 && rowIdx === 3 && <span className="font-semibold">28</span>}
                          {colIdx === 2 && rowIdx === 0 && <span className="font-semibold">10</span>}
                          {colIdx === 2 && rowIdx === 1 && <span className="font-semibold">17</span>}
                          {colIdx === 2 && rowIdx === 2 && <span className="font-semibold">24</span>}
                          {colIdx === 2 && rowIdx === 3 && <span className="font-semibold">37</span>}
                          {colIdx === 3 && rowIdx === 0 && <span className="font-semibold">9</span>}
                          {colIdx === 3 && rowIdx === 1 && <span className="font-semibold">18</span>}
                          {colIdx === 3 && rowIdx === 2 && <span className="font-semibold">23</span>}
                          {colIdx === 3 && rowIdx === 3 && <span className="font-semibold">30</span>}
                          {colIdx === 4 && rowIdx === 0 && <span className="font-semibold">15</span>}
                          {colIdx === 4 && rowIdx === 1 && <span className="font-semibold">19</span>}
                          {colIdx === 4 && rowIdx === 2 && <span className="font-semibold">27</span>}
                          {colIdx === 5 && rowIdx === 0 && <span className="font-semibold">13</span>}
                          {colIdx === 5 && rowIdx === 1 && <span className="font-semibold">20</span>}
                          {colIdx === 6 && rowIdx === 0 && <span className="font-semibold">7</span>}
                          {colIdx === 6 && rowIdx === 1 && <span className="font-semibold">29</span>}
                          {colIdx === 6 && rowIdx === 2 && <span className="font-semibold">24</span>}
                          {colIdx === 7 && rowIdx === 0 && <span className="font-semibold">8</span>}
                          {colIdx === 8 && rowIdx === 0 && <span className="font-semibold">15</span>}
                          {colIdx === 8 && rowIdx === 1 && <span className="font-semibold">21</span>}
                          {colIdx === 8 && rowIdx === 2 && <span className="font-semibold">25</span>}
                          {colIdx === 9 && rowIdx === 0 && <span className="font-semibold">16</span>}
                          {colIdx === 9 && rowIdx === 1 && <span className="font-semibold">22</span>}
                          {colIdx === 9 && rowIdx === 2 && <span className="font-semibold">26</span>}
                          {colIdx === 10 && rowIdx === 1 && <span className="font-semibold">23</span>}
                          {colIdx === 10 && rowIdx === 2 && <span className="font-semibold">30</span>}
                          {colIdx === 11 && rowIdx === 1 && <span className="font-semibold">24</span>}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Event Blocks */}
                {events.map((event) => (
                  <div
                    key={event.id}
                    className={`absolute ${event.color} text-white rounded-lg p-3 shadow-lg`}
                    style={{
                      left: `${(event.col / 12) * 100}%`,
                      top: `${event.row * 96}px`,
                      width: `${(event.colSpan / 12) * 100}%`,
                      height: `${event.rowSpan * 96}px`,
                    }}
                  >
                    <div className="font-bold text-sm">{event.title}</div>
                    {event.location && (
                      <div className="text-xs mt-1 opacity-90">{event.location}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}