'use client';

import { Download, Home } from 'lucide-react';
import Link from 'next/link';

interface Class {
  subject: string;
  teacher: string;
  room: string;
}

interface TimeSlot {
  time: string;
  monday?: Class;
  tuesday?: Class;
  wednesday?: Class;
  thursday?: Class;
  friday?: Class;
}

const colorCodes: Record<string, string> = {
  'Data Structures & Algorithms': 'bg-blue-500',
  'DBMS': 'bg-green-500',
  'Lauser': 'bg-red-500',
  'Lesser': 'bg-red-500',
  'Computer Organization': 'bg-purple-500',
  'Computo Informatic': 'bg-purple-500',
  'OS': 'bg-purple-600',
  'Ganpati morphology': 'bg-teal-500',
  'Methodology': 'bg-slate-600',
};

export default function StudentTimetable() {
  const timetable: TimeSlot[] = [
    {
      time: '09:00 AM - 10:00 AM',
      monday: { subject: 'Data Structures & Algo', teacher: 'Dr A. Sharma', room: 'Room 301' },
      wednesday: { subject: 'Lesser', teacher: 'Mr K. Singh', room: 'Room 302' },
      thursday: { subject: 'Ganpati morphology', teacher: 'Mr K. Singh', room: 'Room 302' },
      friday: { subject: 'Methodology', teacher: 'Dr R. Sharma', room: 'Room 301' },
    },
    {
      time: '10:00 AM - 11:00 AM',
      monday: { subject: 'Data Structures & Algo', teacher: 'Dr A. Sharma', room: 'Room 301' },
      tuesday: { subject: 'DBMS', teacher: 'Prof R. Gupta', room: 'Lab 2' },
      wednesday: { subject: 'Computo Informatic', teacher: 'Mr K. Sharm', room: 'Room 302' },
      thursday: { subject: 'DBMS', teacher: 'Prof R. Gupta', room: 'Room 301' },
      friday: { subject: 'Lauser', teacher: 'Mr K. Singh', room: 'Room 302' },
    },
    {
      time: '11:00 AM - 12:00 PM',
      wednesday: { subject: 'Lauser', teacher: 'Mr K. Singh', room: 'Room 302' },
      thursday: { subject: 'DBMS', teacher: 'Prof R. Gupta', room: 'Room 301' },
    },
    {
      time: '12:00 PM - 01:00 PM (Lunch)',
    },
    {
      time: '01:00 PM - 02:00 PM',
      monday: { subject: 'Data Structures & Algo', teacher: 'Dr A. Sharma', room: 'Room 301' },
      tuesday: { subject: 'OS', teacher: 'Mr K. Singh', room: 'Room 302' },
      thursday: { subject: 'DBMS', teacher: 'Prof R. Gupta', room: 'Lab 2' },
      friday: { subject: 'Lauser', teacher: 'Mr K. Singh', room: 'Room 302' },
    },
    {
      time: '02:00 PM - 03:00 PM',
      wednesday: { subject: 'OS', teacher: 'Mr K. Singh', room: 'Room 302' },
    },
    {
      time: '03:00 PM - 04:00 PM',
      tuesday: { subject: 'DBMS', teacher: 'Mr K. Singh', room: 'Room 301' },
    },
  ];

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  const getClassColor = (subject: string): string => {
    for (const [key, color] of Object.entries(colorCodes)) {
      if (subject.toLowerCase().includes(key.toLowerCase())) {
        return color;
      }
    }
    return 'bg-indigo-500';
  };

  const downloadPDF = () => {
    // Create a simple text representation for PDF
    const pdfContent = generatePDFContent();
    const element = document.createElement('a');
    const file = new Blob([pdfContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `timetable-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const generatePDFContent = (): string => {
    let content = 'STUDENT TIMETABLE\n';
    content += '================\n\n';
    
    timetable.forEach(slot => {
      content += `${slot.time}\n`;
      days.forEach((day, idx) => {
        const classData = slot[day as keyof TimeSlot] as Class | undefined;
        if (classData) {
          content += `  ${dayLabels[idx]}: ${classData.subject} - ${classData.teacher} (${classData.room})\n`;
        }
      });
      content += '\n';
    });
    
    return content;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/student"
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Home className="w-5 h-5 text-slate-600" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Timetable</h1>
                <p className="text-slate-600 mt-1">
                  <span className="hover:text-slate-900">Home</span>
                  <span className="mx-2">›</span>
                  <span>Timetable</span>
                </p>
              </div>
            </div>
            <button
              onClick={downloadPDF}
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
            >
              <Download className="w-5 h-5" />
              Download PDF
            </button>
          </div>
        </div>
      </header>

      <div className="p-8">
        <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
          <div className="inline-block min-w-full">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="w-40 px-6 py-4 text-left text-sm font-semibold text-slate-900 bg-slate-50 border-b border-r border-slate-200">
                    Time
                  </th>
                  {dayLabels.map((day) => (
                    <th
                      key={day}
                      className="w-48 px-6 py-4 text-left text-sm font-semibold text-slate-900 bg-slate-50 border-b border-r border-slate-200"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timetable.map((slot, slotIdx) => (
                  <tr key={slotIdx} className="border-b border-slate-200">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900 bg-slate-50 border-r border-slate-200 align-top">
                      {slot.time}
                    </td>
                    {days.map((day, dayIdx) => {
                      const classData = slot[day as keyof TimeSlot] as Class | undefined;
                      return (
                        <td
                          key={`${slotIdx}-${dayIdx}`}
                          className="px-4 py-4 border-r border-slate-200 align-top"
                        >
                          {classData && (
                            <div
                              className={`${getClassColor(
                                classData.subject
                              )} text-white rounded-lg p-4 text-center shadow-md hover:shadow-lg transition-shadow`}
                            >
                              <div className="font-bold text-sm mb-2">
                                {classData.subject}
                              </div>
                              <div className="text-xs opacity-90 mb-1">
                                {classData.teacher}
                              </div>
                              <div className="text-xs opacity-90">
                                {classData.room}
                              </div>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Legend</h3>
            <div className="space-y-3">
              {Object.entries(colorCodes).slice(0, 6).map(([subject, color]) => (
                <div key={subject} className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded ${color}`}></div>
                  <span className="text-sm text-slate-700">{subject}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Today's Classes</h3>
            <div className="space-y-2">
              <p className="text-sm text-slate-600">
                You have 3 classes scheduled today.
              </p>
              <ul className="text-sm space-y-2 mt-3">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span className="text-slate-700">10:00 AM - Data Structures</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span className="text-slate-700">01:00 PM - OS</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-slate-700">02:00 PM - DBMS</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Info</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-600 mb-1">Total Classes/Week</p>
                <p className="text-2xl font-bold text-slate-900">15</p>
              </div>
              <div>
                <p className="text-xs text-slate-600 mb-1">Classes Today</p>
                <p className="text-2xl font-bold text-slate-900">3</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
