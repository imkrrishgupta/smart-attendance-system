import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbConnect } from '@/lib/db';
import { User } from '@/models/User';

/**
 * POST: Admin adds a new teacher
 * Body:
 *  - name
 *  - email
 *  - password
 */
export async function POST(request: Request) {
  await dbConnect();

  const body = await request.json();
  const { name, email, password } = body;

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: 'name, email and password are required' },
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
    role: 'teacher'
  });

  return NextResponse.json(
    {
      id: teacher._id,
      name: teacher.name,
      email: teacher.email,
      role: teacher.role
    },
    { status: 201 }
  );
}
