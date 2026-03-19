import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { User } from '@/models/User';

// GET: List users by role
export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    const query: any = {};
    if (role) query.role = role;

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PATCH: Update user details (admin)
export async function PATCH(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { id, name, email, role, branch, semester, rollNumber, enrollmentNo, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (email) user.email = email;
    if (branch !== undefined) user.branch = branch;
    if (semester !== undefined) user.semester = semester;
    if (rollNumber) user.rollNumber = rollNumber;
    if (enrollmentNo) user.enrollmentNo = enrollmentNo;
    if (typeof isActive === 'boolean') user.isActive = isActive;

    await user.save();
    return NextResponse.json({ message: 'User updated successfully', user });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

// DELETE: Remove a user
export async function DELETE(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await User.findByIdAndDelete(id);
    return NextResponse.json({ message: 'User removed successfully' });
  } catch (error) {
    console.error('Error removing user:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
