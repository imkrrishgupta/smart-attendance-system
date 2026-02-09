'use client';

import { useState } from 'react';
import { Settings, UserPlus, Search, Edit, X, CheckCircle, Clock, TrendingUp, Users, UserCheck } from 'lucide-react';
import Image from 'next/image';

interface Teacher {
  id: string;
  name: string;
  title: string;
  subject: string;
  status: 'live' | 'completed' | 'active';
  sessionsCompleted?: number;
  attendance?: string;
  avatar?: string;
}

interface Application {
  id: string;
  name: string;
  status: string;
  avatar?: string;
}

interface Activity {
  id: string;
  teacher: string;
  action: string;
  time?: string;
  avatar?: string;
}

export default function TeachersManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('All Subjects');

  const stats = [
    {
      label: 'Total Teachers',
      value: '48',
      change: '+3 this month',
      icon: Users,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Active Today',
      value: '32',
      change: '+5/0 month',
      icon: UserCheck,
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'New This Month',
      value: '5',
      change: '100% Present',
      icon: TrendingUp,
      color: 'bg-purple-50 text-purple-600',
    },
  ];

  const teachers: Teacher[] = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      title: 'Dr. Sarah Johnson',
      subject: 'Machine Learning',
      status: 'active',
    },
    {
      id: '2',
      name: 'Prof. Michael Chen',
      title: 'Ms. Emily Carter',
      subject: 'Data Structures',
      status: 'live',
    },
    {
      id: '3',
      name: 'Ms. Emily Carter',
      title: 'Web Development',
      subject: 'Web Development',
      status: 'completed',
      sessionsCompleted: 347,
      attendance: '100% Present',
    },
  ];

  const applications: Application[] = [
    {
      id: '1',
      name: 'John Smith',
      status: 'New application',
    },
    {
      id: '2',
      name: 'Jane Doe',
      status: 'New application',
    },
  ];

  const activities: Activity[] = [
    {
      id: '1',
      teacher: 'John Smith',
      action: 'New application',
    },
    {
      id: '2',
      teacher: 'Dr. Johnson',
      action: "updated 'Machaning' course course",
    },
    {
      id: '3',
      teacher: 'Dr. Johnson',
      action: 'added new assignment ned assignment',
    },
    {
      id: '4',
      teacher: 'Dr. Manson Jomtinerr',
      action: '',
      time: '12:30M',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Teacher's Management</h1>
              <p className="text-slate-600 mt-1">Welcome back, Administrator</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors">
                <Settings className="w-5 h-5" />
                Settings
              </button>
              <button className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                <UserPlus className="w-5 h-5" />
                Add Teacher
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-slate-900 mb-1">{stat.value}</div>
                <div className="text-slate-700 font-medium mb-2">{stat.label}</div>
                <div className="text-sm text-slate-500">{stat.change}</div>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Section - Teacher List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Teacher List"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <select
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                    className="px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option>Filter by Subject</option>
                    <option>All Subjects</option>
                    <option>Machine Learning</option>
                    <option>Data Structures</option>
                    <option>Web Development</option>
                  </select>
                </div>
              </div>

              <div className="divide-y divide-slate-200">
                {teachers.map((teacher) => (
                  <div key={teacher.id} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center">
                          <Users className="w-8 h-8 text-slate-500" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-slate-900">{teacher.name}</h3>
                            {teacher.status === 'live' && (
                              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                Live
                              </span>
                            )}
                            {teacher.status === 'completed' && (
                              <span className="px-3 py-1 bg-slate-200 text-slate-700 text-xs font-semibold rounded-full">
                                Completed
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 mt-1">{teacher.title}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {teacher.sessionsCompleted && (
                          <div className="text-right mr-4">
                            <div className="text-3xl font-bold text-slate-900">{teacher.sessionsCompleted}</div>
                            <div className="text-sm text-slate-600">{teacher.attendance}</div>
                          </div>
                        )}
                        <button className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2">
                          <Edit className="w-4 h-4" />
                          Edit Profile
                        </button>
                        <button className="px-5 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2">
                          <X className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Section - Applications & Activity */}
          <div className="space-y-6">
            {/* Teacher Applications */}
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-900">
                  Teacher Applications ({applications.length})
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {applications.slice(0, 1).map((app) => (
                  <div key={app.id} className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{app.name}</h3>
                        <p className="text-sm text-slate-600">{app.status}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                        <X className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-900">
                  Teacher Applications ({applications.length})
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center">
                      <Users className="w-5 h-5 text-slate-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-900">
                        <span className="font-semibold">{activity.teacher}</span>
                        {activity.action && (
                          <>
                            {' '}
                            <span className="text-slate-600">{activity.action}</span>
                          </>
                        )}
                      </p>
                      {activity.time && (
                        <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                      )}
                    </div>
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