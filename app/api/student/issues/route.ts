import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { dbConnect } from '@/lib/db';
import { AttendanceIssue } from '@/models/AttendanceIssue';

export async function POST(req: Request) {
    try {
        const { studentId, sessionId, issueType, description } = await req.json();

        if (!studentId || !sessionId || !issueType || !description) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await dbConnect();

        const issue = await AttendanceIssue.create({
            studentId,
            sessionId,
            issueType,
            description,
            status: 'pending'
        });

        return NextResponse.json(issue, { status: 201 });
    } catch (error) {
        console.error('Error creating attendance issue:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get('studentId');
        const sessionId = searchParams.get('sessionId');
        const teacherId = searchParams.get('teacherId');

        await dbConnect();

        let query: any = {};
        if (studentId) query.studentId = studentId;
        if (sessionId) query.sessionId = sessionId;

        // If teacherId is provided, we need to filter issues by sessions belonging to that teacher
        if (teacherId) {
            const Session = mongoose.models.Session || mongoose.model('Session', new mongoose.Schema({}));
            const teacherSessions = await mongoose.models.Session.find({ teacherId }).select('_id');
            const sessionIds = teacherSessions.map((s: any) => s._id);
            query.sessionId = { $in: sessionIds };
        }

        const issues = await AttendanceIssue.find(query)
            .populate('studentId', 'name rollNumber email')
            .populate('sessionId', 'subject startTime')
            .sort({ createdAt: -1 });

        return NextResponse.json(issues, { status: 200 });
    } catch (error) {
        console.error('Error fetching attendance issues:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
