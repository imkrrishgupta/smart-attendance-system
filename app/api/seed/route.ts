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

  const admin = await User.create({
    name: process.env.SEEDER_ADMIN_NAME,
    email: process.env.SEEDER_ADMIN_EMAIL,
    password: process.env.SEEDER_ADMIN_PASS,
    role: process.env.SEEDER_ADMIN_ROLE as any
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
