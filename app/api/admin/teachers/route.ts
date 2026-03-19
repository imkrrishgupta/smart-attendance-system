import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbConnect } from '@/lib/db';
import { User } from '@/models/User';

// GET: List all teachers
export async function GET() {
  try {
    await dbConnect();
    const teachers = await User.find({ role: 'teacher' }).select('-password').sort({ createdAt: -1 });
    return NextResponse.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

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

  const hashedPassword = await bcrypt.hash(password, 10);

  const teacher = await User.create({
    name,
    email,
    password: hashedPassword,
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

export async function PATCH(request: Request) {
  await dbConnect();

  const body = await request.json();
  const { id, name, email, department, employeeId, password, isActive } = body;

  if (!id || !name || !email || !department || !employeeId) {
    return NextResponse.json({ error: 'id, name, email, department and employeeId are required' }, { status: 400 });
  }

  const teacher = await User.findById(id);
  if (!teacher || teacher.role !== 'teacher') {
    return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
  }

  if (email !== teacher.email) {
    const emailConflict = await User.findOne({ email });
    if (emailConflict) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }
  }

  teacher.name = name;
  teacher.email = email;
  teacher.department = department;
  teacher.employeeId = employeeId;
  if (typeof isActive === 'boolean') {
    teacher.isActive = isActive;
  }

  if (password && password.trim()) {
    teacher.password = await bcrypt.hash(password, 10);
  }

  await teacher.save();

  return NextResponse.json({ message: 'Teacher updated successfully' });
}
