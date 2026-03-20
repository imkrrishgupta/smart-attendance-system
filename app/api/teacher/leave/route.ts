import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { LeaveRequest } from '@/models/LeaveRequest';

export async function POST(req: Request) {
    try {
        const { teacherId, startDate, endDate, reason } = await req.json();

        if (!teacherId || !startDate || !endDate || !reason) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await dbConnect();

        const leaveRequest = await LeaveRequest.create({
            teacherId,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            reason,
            status: 'pending'
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
