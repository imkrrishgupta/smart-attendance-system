import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbConnect } from '@/lib/db';
import { User } from '@/models/User';

export async function GET() {
  await dbConnect();

  const teachers = await User.find({ role: 'teacher' })
    .select('-password')
    .sort({ createdAt: -1 });

  return NextResponse.json(teachers);
}

export async function POST(req: Request) {
  await dbConnect();

  const { name, email, password } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
  }

  const existing = await User.findOne({ email });

  if (existing) {
    return NextResponse.json({ message: 'Email already exists' }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 10);

  const teacher = await User.create({
    name,
    email,
    password: hashed,
    role: 'teacher'
  });

  return NextResponse.json(
    {
      message: 'Teacher created successfully',
      teacher: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email
      }
    },
    { status: 201 }
  );
}
