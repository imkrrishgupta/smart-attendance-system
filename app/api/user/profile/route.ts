import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const user = await User.findById((session.user as any).id).select('-password');

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const isFaceEnrolled = !!(user.faceEmbeddings && user.faceEmbeddings.length > 0);

        return NextResponse.json({
            ...user.toObject(),
            isFaceEnrolled
        });
    } catch (error) {
        console.error('Profile GET error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, password } = await request.json();
        await dbConnect();

        const user = await User.findById((session.user as any).id);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (name) user.name = name;
        if (password) {
            user.password = password;
        }

        await user.save();
        return NextResponse.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Profile PUT error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function DELETE() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const user = await User.findById((session.user as any).id);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        user.faceEmbeddings = [];
        await user.save();

        return NextResponse.json({ message: 'Face data reset successfully' });
    } catch (error) {
        console.error('Profile DELETE error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
