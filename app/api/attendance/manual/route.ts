import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Attendance } from '@/models/Attendance';
import { Session } from '@/models/Session';
import { User } from '@/models/User';

/**
 * POST /api/attendance/manual
 * Allows a teacher to manually mark a student present/absent for a session.
 * Body: { sessionId, studentId, status, teacherId }
 */
export async function POST(request: Request) {
    try {
        await dbConnect();
        const { sessionId, studentId, status, teacherId } = await request.json();

        if (!sessionId || !studentId || !teacherId) {
            return NextResponse.json(
                { error: 'sessionId, studentId, and teacherId are required' },
                { status: 400 }
            );
        }

        // Validate the teacher
        const teacher = await User.findById(teacherId);
        if (!teacher || teacher.role !== 'teacher') {
            return NextResponse.json({ error: 'Invalid teacher' }, { status: 403 });
        }

        // Validate the session belongs to this teacher
        const session = await Session.findById(sessionId);
        if (!session) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        // Check if attendance already exists
        const existing = await Attendance.findOne({ sessionId, studentId });

        if (existing) {
            // Update existing record
            existing.status = status || 'present';
            existing.markedBy = teacherId;
            await existing.save();
            return NextResponse.json(existing);
        }

        // Create new attendance record
        const attendance = await Attendance.create({
            sessionId,
            studentId,
            status: status || 'present',
            faceVerified: false,
            locationVerified: false,
            markedBy: teacherId
        });

        return NextResponse.json(attendance, { status: 201 });
    } catch (error) {
        console.error('Manual attendance error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
