import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Timetable } from '@/models/Timetable';

// GET all timetable entries
export async function GET() {
    try {
        await dbConnect();
        const timetable = await Timetable.find().populate('teacherId', 'name email').sort({ day: 1, startTime: 1 });
        return NextResponse.json(timetable);
    } catch (error) {
        console.error('Error fetching timetable:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// POST create new timetable entry
export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { subject, teacherId, day, startTime, endTime, room, branch, semester } = body;

        if (!subject || !teacherId || !day || !startTime || !endTime || !room || !branch || !semester) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const entry = await Timetable.create({
            subject,
            teacherId,
            day,
            startTime,
            endTime,
            room,
            branch,
            semester
        });

        return NextResponse.json(entry, { status: 201 });
    } catch (error) {
        console.error('Error creating timetable entry:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
