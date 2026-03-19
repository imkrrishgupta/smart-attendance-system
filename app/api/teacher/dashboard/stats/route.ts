import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Session } from '@/models/Session';
import { Attendance } from '@/models/Attendance';
import { AttendanceIssue } from '@/models/AttendanceIssue';

export async function GET(request: Request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const teacherId = searchParams.get('teacherId');

        if (!teacherId) {
            return NextResponse.json({ error: 'Teacher ID required' }, { status: 400 });
        }

        // 1. All sessions by teacher
        const sessions = await Session.find({ teacherId });
        const totalSessions = sessions.length;
        const activeSessions = sessions.filter(s => s.isActive).length;

        // 2. Total present count across all sessions
        const totalPresent = sessions.reduce((sum, s) => sum + (s.presentCount || 0), 0);

        // 3. Pending issues for sessions owned by this teacher
        const sessionIds = sessions.map(s => s._id);
        const pendingIssues = await AttendanceIssue.countDocuments({
            sessionId: { $in: sessionIds },
            status: 'pending'
        });

        return NextResponse.json({
            totalSessions,
            activeSessions,
            totalPresent,
            pendingIssues
        });
    } catch (error) {
        console.error('Error fetching teacher dashboard stats:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
