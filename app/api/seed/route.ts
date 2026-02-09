import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbConnect } from '@/lib/db';
import { User } from '@/models/User';

export async function POST() {
  await dbConnect();

  const existing = await User.findOne({ role: 'admin' });

  if (existing) {
    return NextResponse.json({ message: 'Admin already exists' }, { status: 200 });
  }

  const hashed = await bcrypt.hash('admin123', 10);

  const admin = await User.create({
    name: 'Super Admin',
    email: 'admin@smart.com',
    password: hashed,
    role: 'admin'
  });

  return NextResponse.json(
    {
      message: 'Admin created successfully',
      admin: {
        id: admin._id,
        email: admin.email,
        role: admin.role
      }
    },
    { status: 201 }
  );
}
