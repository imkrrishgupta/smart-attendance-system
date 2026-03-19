import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Session } from '@/models/Session';
import { Attendance } from '@/models/Attendance';

// GET /api/attendance/sessions/[id] — session details + attendance list
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;

        const session = await Session.findById(id).populate('teacherId', 'name email');
        if (!session) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        const attendanceRecords = await Attendance.find({ sessionId: id })
            .populate('studentId', 'name email rollNumber')
            .populate('markedBy', 'name');

        const presentCount = attendanceRecords.filter(a => a.status === 'present').length;
        const absentCount = attendanceRecords.filter(a => a.status === 'absent').length;

        return NextResponse.json({
            session: session.toObject(),
            attendance: attendanceRecords,
            stats: { presentCount, absentCount, total: attendanceRecords.length }
        });
    } catch (error) {
        console.error('Error fetching session:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// PUT /api/attendance/sessions/[id] — start/stop session
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();

        const session = await Session.findById(id);
        if (!session) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        // Toggle active state or set explicitly
        if (body.isActive !== undefined) {
            session.isActive = body.isActive;
            if (!body.isActive) {
                session.endTime = new Date(); // auto-set end time when stopping
            }
        }

        if (body.endTime) {
            session.endTime = new Date(body.endTime);
        }

        await session.save();
        return NextResponse.json(session);
    } catch (error) {
        console.error('Error updating session:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// DELETE /api/attendance/sessions/[id]
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;

        await Session.findByIdAndDelete(id);
        await Attendance.deleteMany({ sessionId: id });

        return NextResponse.json({ message: 'Session deleted' });
    } catch (error) {
        console.error('Error deleting session:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
