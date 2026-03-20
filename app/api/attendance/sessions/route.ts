import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Session } from '@/models/Session';
import { Attendance } from '@/models/Attendance';

// GET /api/attendance/sessions — filtered by teacherId if provided
export async function GET(request: Request) {
    try {
        await dbConnect();

        // Automatic Deactivation: Find active sessions that have passed their endTime and deactivate them
        const now = new Date();
        await Session.updateMany(
            { isActive: true, endTime: { $lt: now } },
            { $set: { isActive: false } }
        );

        const { searchParams } = new URL(request.url);
        const teacherId = searchParams.get('teacherId');

        const query: any = {};
        if (teacherId) query.teacherId = teacherId;

        const sessions = await Session.find(query)
            .populate('teacherId', 'name email')
            .sort({ createdAt: -1 });

        // Attach attendance counts
        const sessionsWithCounts = await Promise.all(
            sessions.map(async (s) => {
                const totalPresent = await Attendance.countDocuments({ sessionId: s._id, status: 'present' });
                const totalAbsent = await Attendance.countDocuments({ sessionId: s._id, status: 'absent' });
                return {
                    ...s.toObject(),
                    presentCount: totalPresent,
                    absentCount: totalAbsent,
                    totalMarked: totalPresent + totalAbsent
                };
            })
        );

        return NextResponse.json(sessionsWithCounts);
    } catch (error) {
        console.error('Error fetching sessions:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// POST /api/attendance/sessions — create a new session
export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();
        console.log('[Attendance API] POST Body:', JSON.stringify(body, null, 2));

        const { subject, teacherId, startTime, endTime, lat, lng, radius, branch, semester } = body;

        if (!subject || !teacherId || !startTime) {
            return NextResponse.json(
                { error: 'subject, teacherId, startTime are required' },
                { status: 400 }
            );
        }

        const session = await Session.create({
            subject,
            teacherId,
            startTime: new Date(startTime),
            endTime: endTime ? new Date(endTime) : new Date(new Date(startTime).getTime() + 60 * 60 * 1000),
            isActive: false,
            branch,
            semester,
            geoLocation: {
                lat: lat || 0,
                lng: lng || 0,
                radius: radius || 100
            }
        });

        return NextResponse.json(session, { status: 201 });
    } catch (error) {
        console.error('Error creating session:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
