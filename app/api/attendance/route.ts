import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Attendance } from '@/models/Attendance';
import { Session } from '@/models/Session';
import { User } from '@/models/User';

/**
 * GET: Fetch attendance records
 * Query params:
 *  - sessionId
 *  - studentId
 */
export async function GET(request: Request) {
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');
  const studentId = searchParams.get('studentId');

  if (sessionId) {
    const attendance = await Attendance.find({ sessionId })
      .populate('studentId', 'name email rollNumber')
      .populate('sessionId', 'subject startTime endTime');
    return NextResponse.json(attendance);
  }

  if (studentId) {
    const student = await User.findById(studentId);
    if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

    const [attendanceRecords, allSessions] = await Promise.all([
      Attendance.find({ studentId }).populate('sessionId', 'subject startTime endTime'),
      Session.find({
        $or: [
          { branch: student.branch, semester: student.semester },
          { branch: { $exists: false } } // Fallback for old sessions
        ]
      })
    ]);

    // Create a synthesized list of all sessions that should have been attended
    const fullHistory = allSessions.map(session => {
      const record = attendanceRecords.find(r => r.sessionId?._id.toString() === session._id.toString());
      if (record) return record;

      // If no record exists and session has ended, mark as absent
      if (new Date(session.endTime) < new Date()) {
        return {
          _id: `absent-${session._id}`,
          sessionId: session,
          status: 'absent',
          createdAt: session.startTime
        };
      }
      return null;
    }).filter(Boolean);

    return NextResponse.json(fullHistory);
  }

  return NextResponse.json({ error: 'sessionId or studentId required' }, { status: 400 });
}

/**
 * POST: Mark attendance
 * Body:
 *  - sessionId
 *  - studentId
 *  - faceVerified
 *  - locationVerified
 */
export async function POST(request: Request) {
  await dbConnect();

  const body = await request.json();
  const { sessionId, studentId, faceVerified, locationVerified } = body;

  if (!sessionId || !studentId) {
    return NextResponse.json(
      { error: 'sessionId and studentId are required' },
      { status: 400 }
    );
  }

  const session = await Session.findById(sessionId);
  if (!session || !session.isActive) {
    return NextResponse.json(
      { error: 'Session is not active' },
      { status: 400 }
    );
  }

  // Strict Expiry Check: Even if session.isActive is true, reject if past endTime
  if (session.endTime && new Date() > new Date(session.endTime)) {
    return NextResponse.json(
      { error: 'Session has expired' },
      { status: 400 }
    );
  }

  const student = await User.findById(studentId);
  if (!student || student.role !== 'student') {
    return NextResponse.json(
      { error: 'Invalid student' },
      { status: 400 }
    );
  }

  const existingAttendance = await Attendance.findOne({
    sessionId,
    studentId
  });

  if (existingAttendance) {
    return NextResponse.json(
      { error: 'Attendance already marked' },
      { status: 409 }
    );
  }

  const status =
    faceVerified && locationVerified ? 'present' : 'absent';

  const attendance = await Attendance.create({
    sessionId,
    studentId,
    status,
    faceVerified,
    locationVerified
  });

  return NextResponse.json(attendance, { status: 201 });
}
