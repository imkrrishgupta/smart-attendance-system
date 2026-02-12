'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Clock, User, Calendar } from 'lucide-react';
import Link from 'next/link';

interface TodayClass {
  id: string;
  subject: string;
  time: string;
  startTime: string;
  endTime: string;
  faculty: string;
  status: 'can-mark' | 'not-started' | 'marked';
}

export default function MarkAttendance() {
  const [todayClasses, setTodayClasses] = useState<TodayClass[]>([]);
  const [markedClasses, setMarkedClasses] = useState<string[]>([]);

  useEffect(() => {
    // Mock data for today's classes
    const classes: TodayClass[] = [
      {
        id: '1',
        subject: 'Data Structures & Algorithms',
        time: '10:00 AM - 11:00 AM',
        startTime: '10:00',
        endTime: '10:15',
        faculty: 'Dr. A. Sharma',
        status: 'can-mark',
      },
      {
        id: '2',
        subject: 'Database Management Systems',
        time: '02:00 PM - 03:00 PM',
        startTime: '14:00',
        endTime: '14:15',
        faculty: 'Prof. R Gupta',
        status: 'not-started',
      },
      {
        id: '3',
        subject: 'Operating Systems',
        time: '09:00 AM - 10:00 AM',
        startTime: '09:00',
        endTime: '09:15',
        faculty: 'Mr. K. Singh',
        status: 'marked',
      },
    ];

    setTodayClasses(classes);
    setMarkedClasses(['3']); // Pre-mark class 3 as an example
  }, []);

  const handleMarkPresent = (classId: string) => {
    setMarkedClasses([...markedClasses, classId]);
    // Here you would typically make an API call to mark attendance
  };

  const getStatusButton = (classItem: TodayClass) => {
    if (markedClasses.includes(classItem.id) || classItem.status === 'marked') {
      return (
        <button
          disabled
          className="px-8 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center gap-2 disabled:opacity-75"
        >
          <CheckCircle className="w-5 h-5" />
          Marked Present
        </button>
      );
    }

    if (classItem.status === 'not-started') {
      return (
        <button
          disabled
          className="px-8 py-3 bg-slate-400 text-white rounded-lg font-semibold cursor-not-allowed disabled:opacity-75"
        >
          Not Yet Started
        </button>
      );
    }

    return (
      <button
        onClick={() => handleMarkPresent(classItem.id)}
        className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
      >
        Mark Present
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Mark Attendance</h1>
              <div className="flex items-center gap-2 text-slate-600 mt-2">
                <Link href="/student/dashboard" className="hover:text-slate-900">
                  Home
                </Link>
                <span className="mx-1">›</span>
                <span>Mark Attendance</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-8">
        {/* Today's Date Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-2xl font-bold text-slate-900">
              Today's Classes - {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </h2>
          </div>
        </div>

        {/* Classes List */}
        <div className="space-y-4">
          {todayClasses.map((classItem) => (
            <div
              key={classItem.id}
              className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  {/* Subject Name */}
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {classItem.subject}
                  </h3>

                  {/* Class Details */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Clock className="w-4 h-4" />
                      <span className="font-semibold">Time:</span>
                      <span>{classItem.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <User className="w-4 h-4" />
                      <span className="font-semibold">Faculty:</span>
                      <span>{classItem.faculty}</span>
                    </div>
                  </div>
                </div>

                {/* Status Button */}
                <div className="shrink-0">
                  {getStatusButton(classItem)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-2">Attendance Window</h3>
          <p className="text-blue-800">
            You can mark your attendance within 15 minutes of the class start time. Marking attendance outside this window is not allowed.
          </p>
        </div>
      </div>
    </div>
  );
}