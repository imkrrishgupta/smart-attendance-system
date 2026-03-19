import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { User } from '@/models/User';
import { Session } from '@/models/Session';
import { Attendance } from '@/models/Attendance';

export async function GET() {
    try {
        await dbConnect();

        const [totalTeachers, totalStudents, activeSessions] = await Promise.all([
            User.countDocuments({ role: 'teacher' }),
            User.countDocuments({ role: 'student' }),
            Session.countDocuments({ isActive: true })
        ]);

        // Calculate Average Attendance (overall)
        const allSessions = await Session.find({ isActive: false });
        const totalPresent = await Attendance.countDocuments({ status: 'present' });
        const totalMarked = await Attendance.countDocuments();

        const avgAttendance = totalMarked > 0 ? ((totalPresent / totalMarked) * 100).toFixed(1) : 0;

        return NextResponse.json({
            totalTeachers,
            totalStudents,
            activeSessions,
            avgAttendance: `${avgAttendance}%`
        });
    } catch (error: any) {
        console.error('Error fetching admin stats:', error);
        return NextResponse.json({
            error: 'Server error',
            details: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
