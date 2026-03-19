import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { Timetable } from '@/models/Timetable';

export async function GET() {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { branch, semester } = session.user as any;

        if (!branch || !semester) {
             // If student hasn't set branch/sem, return empty or unauthorized
             return NextResponse.json([]);
        }

        // Fetch timetable entries matching student's branch and semester
        const timetable = await Timetable.find({ branch, semester })
            .populate('teacherId', 'name')
            .sort({ day: 1, startTime: 1 });
            
        return NextResponse.json(timetable);
    } catch (error) {
        console.error('Failed to fetch timetable:', error);
        return NextResponse.json({ error: 'Failed to fetch timetable' }, { status: 500 });
    }
}
