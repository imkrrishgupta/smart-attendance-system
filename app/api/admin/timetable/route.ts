import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Timetable } from '@/models/Timetable';
import { LeaveRequest } from '@/models/LeaveRequest';

// Helper to check if two time ranges overlap
function isOverlapping(s1: string, e1: string, s2: string, e2: string) {
    return s1 < e2 && s2 < e1;
}

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

        // 1. Collision Detection: Student Level
        // Check if there's already a class for this branch/semester at the same time
        const sameStudentGroup = await Timetable.find({ branch, semester, day });
        const studentConflict = sameStudentGroup.some(t => isOverlapping(t.startTime, t.endTime, startTime, endTime));
        
        if (studentConflict) {
            return NextResponse.json({ error: `Clash detected! Students of ${branch} Sem ${semester} already have a class during this time period.` }, { status: 400 });
        }

        // 2. Collision Detection: Teacher Level (Another Class)
        // Check if the teacher is already taking another class at the same time
        const teacherSchedule = await Timetable.find({ teacherId, day });
        const teacherConflict = teacherSchedule.some(t => isOverlapping(t.startTime, t.endTime, startTime, endTime));

        if (teacherConflict) {
            return NextResponse.json({ error: 'Clash detected! This teacher is already assigned another class during this time period.' }, { status: 400 });
        }

        // 3. Collision Detection: Teacher Level (Leave Request)
        // Check if teacher has an approved leave request for the day we are adding
        // Since timetable is weekly, we'll check if any CURRENT or FUTURE approved leaves cover this day name.
        // Actually, the user says "assign... during his leave periods". 
        // We'll check if the teacher has any approved leave that covers ANY upcoming instance of this day.
        const leaves = await LeaveRequest.find({
            teacherId,
            status: 'approved',
            endDate: { $gte: new Date() } // active or future leaves
        });

        const dayToNumber: Record<string, number> = {
            'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6
        };
        const targetDayNum = dayToNumber[day];

        const onLeave = leaves.some(leave => {
            let temp = new Date(leave.startDate);
            while (temp <= leave.endDate) {
                if (temp.getDay() === targetDayNum) return true;
                temp.setDate(temp.getDate() + 1);
            }
            return false;
        });

        if (onLeave) {
            return NextResponse.json({ error: 'Restricted! This teacher has an approved leave period covering this weekly slot. Please choose another observer or reschedule.' }, { status: 400 });
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
