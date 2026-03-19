import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Session } from '@/models/Session';
import { Attendance } from '@/models/Attendance';
import { User } from '@/models/User';

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

        // Fetch all students for this session's branch and semester
        const allStudents = await User.find({
            role: 'student',
            branch: session.branch,
            semester: session.semester
        }).select('name email rollNumber');

        // Fetch existing attendance records
        const attendanceRecords = await Attendance.find({ sessionId: id })
            .populate('studentId', 'name email rollNumber')
            .populate('markedBy', 'name');

        // Merge: ensure every student in the class has a record (real or virtual)
        const finalAttendance = allStudents.map((student: any) => {
            const record = attendanceRecords.find((r: any) => r.studentId?._id.toString() === student._id.toString());
            if (record) return record;

            // Virtual absent record if none exists
            return {
                _id: `virtual-${student._id}`,
                studentId: student,
                status: 'absent',
                faceVerified: false,
                locationVerified: false,
                createdAt: session.startTime // Default to session start
            };
        });

        const presentCount = finalAttendance.filter((a: any) => a.status === 'present').length;
        const absentCount = finalAttendance.filter((a: any) => a.status === 'absent').length;

        return NextResponse.json({
            session: session.toObject(),
            attendance: finalAttendance,
            stats: { presentCount, absentCount, total: finalAttendance.length }
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
