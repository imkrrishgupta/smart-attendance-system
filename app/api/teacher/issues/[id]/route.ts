import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { AttendanceIssue } from '@/models/AttendanceIssue';

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { status, resolvedBy } = await req.json();

        if (status !== 'resolved' || !resolvedBy) {
            return NextResponse.json({ error: 'Invalid resolution data' }, { status: 400 });
        }

        await dbConnect();

        const issue = await AttendanceIssue.findByIdAndUpdate(
            id,
            { status, resolvedBy },
            { new: true }
        );

        if (!issue) {
            return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
        }

        return NextResponse.json(issue, { status: 200 });
    } catch (error) {
        console.error('Error resolving attendance issue:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
