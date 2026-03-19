import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbConnect } from '@/lib/db';
import { User } from '@/models/User';

export async function POST(req: Request) {
  try {
    const { name, email, password, role, rollNumber, enrollmentNo, branch, semester } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Additional validation for students
    if (role === 'student' && (!rollNumber || !enrollmentNo || !branch || !semester)) {
      return NextResponse.json({ error: 'Roll number, Enrollment number, Branch, and Semester are required for students' }, { status: 400 });
    }

    await dbConnect();

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    if (role === 'student') {
      const existingRollNo = await User.findOne({ rollNumber });
      if (existingRollNo) {
        return NextResponse.json({ error: 'Roll number already exists' }, { status: 400 });
      }
    }

    const userData: any = {
      name,
      email,
      password,
      role,
      branch,
      semester
    };

    if (role === 'student') {
      userData.rollNumber = rollNumber;
      userData.enrollmentNo = enrollmentNo;
    }

    const user = await User.create(userData);

    return NextResponse.json(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        branch: user.branch,
        semester: user.semester,
        ...(role === 'student' && { rollNumber: user.rollNumber, enrollmentNo: user.enrollmentNo })
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
