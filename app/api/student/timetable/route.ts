import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Timetable } from '@/models/Timetable';

export async function GET() {
    try {
        await dbConnect();
        
        // Fetch all timetable entries and populate teacher details
        const timetable = await Timetable.find({})
            .populate('teacherId', 'name')
            .sort({ day: 1, startTime: 1 });
            
        return NextResponse.json(timetable);
    } catch (error) {
        console.error('Failed to fetch timetable:', error);
        return NextResponse.json({ error: 'Failed to fetch timetable' }, { status: 500 });
    }
}
