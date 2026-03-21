import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Session } from '@/models/Session';
import { Attendance } from '@/models/Attendance';
import { User } from '@/models/User';

export async function GET() {
    try {
        await dbConnect();

        const sessions = await Session.find({ isActive: true })
            .populate('teacherId', 'name email')
            .sort({ createdAt: -1 });

        const sessionsWithStats = await Promise.all(
            sessions.map(async (s) => {
                const presentCount = await Attendance.countDocuments({ sessionId: s._id, status: 'present' });
                const totalMarked = await Attendance.countDocuments({ sessionId: s._id });
                return {
                    _id: s._id,
                    subject: s.subject,
                    teacher: (s.teacherId as any)?.name || 'Unknown',
                    present: presentCount,
                    total: totalMarked,
                    startTime: s.startTime
                };
            })
        );

        return NextResponse.json(sessionsWithStats);
    } catch (error) {
        console.error('Error fetching active admin sessions:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
