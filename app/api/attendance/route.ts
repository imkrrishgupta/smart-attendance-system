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

  const query: any = {};
  if (sessionId) query.sessionId = sessionId;
  if (studentId) query.studentId = studentId;

  const attendance = await Attendance.find(query)
    .populate('studentId', 'name email')
    .populate('sessionId', 'subject startTime endTime');

  return NextResponse.json(attendance);
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
