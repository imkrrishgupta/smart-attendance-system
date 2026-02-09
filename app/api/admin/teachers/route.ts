import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { User } from '@/models/User';

/**
 * POST: Admin adds a new teacher
 * Body:
 *  - name
 *  - email
 *  - password
 *  - department
 *  - employeeId
 */
export async function POST(request: Request) {
  await dbConnect();

  const body = await request.json();
  const { name, email, password, department, employeeId } = body;

  if (!name || !email || !password || !department || !employeeId) {
    return NextResponse.json(
      { error: 'All fields are required' },
      { status: 400 }
    );
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return NextResponse.json(
      { error: 'Teacher already exists' },
      { status: 409 }
    );
  }

  const teacher = await User.create({
    name,
    email,
    password,
    role: 'teacher',
    department,
    employeeId,
    isActive: true
  });

  return NextResponse.json(
    {
      id: teacher._id,
      name: teacher.name,
      email: teacher.email,
      role: teacher.role,
      department: teacher.department,
      employeeId: teacher.employeeId
    },
    { status: 201 }
  );
}
