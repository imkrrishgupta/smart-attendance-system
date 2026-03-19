import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Timetable } from '@/models/Timetable';

export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const teacherId = searchParams.get('teacherId');

        if (!teacherId) {
            return NextResponse.json({ error: 'Teacher ID is required' }, { status: 400 });
        }

        const timetable = await Timetable.find({ teacherId })
            .populate('teacherId', 'name')
            .sort({ day: 1, startTime: 1 });
            
        return NextResponse.json(timetable);
    } catch (error) {
        console.error('Failed to fetch teacher timetable:', error);
        return NextResponse.json({ error: 'Failed to fetch timetable' }, { status: 500 });
    }
}
