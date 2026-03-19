import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { LeaveRequest } from '@/models/LeaveRequest';

export async function POST(req: Request) {
    try {
        const { teacherId, date, reason } = await req.json();

        if (!teacherId || !date || !reason) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await dbConnect();

        const leaveRequest = await LeaveRequest.create({
            teacherId,
            date: new Date(date),
            reason,
            status: 'pending' // ensure default is set
        });

        return NextResponse.json(leaveRequest, { status: 201 });
    } catch (error) {
        console.error('Error creating leave request:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const teacherId = searchParams.get('teacherId');

        await dbConnect();

        let query = {};
        if (teacherId) {
            query = { teacherId };
        }

        const leaveRequests = await LeaveRequest.find(query)
            .populate('teacherId', 'name email')
            .sort({ createdAt: -1 });

        return NextResponse.json(leaveRequests, { status: 200 });
    } catch (error) {
        console.error('Error fetching leave requests:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
