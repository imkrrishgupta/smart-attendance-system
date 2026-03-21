import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { User } from '@/models/User';

export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const studentId = searchParams.get('studentId');

        if (!studentId) {
            return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
        }

        const student = await User.findById(studentId).select('faceEmbeddings');
        if (!student) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }

        const isRegistered = !!(student.faceEmbeddings && student.faceEmbeddings.length > 0);
        return NextResponse.json({ isRegistered });
    } catch (error) {
        console.error('Failed to check registration status:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
