import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { LeaveRequest } from '@/models/LeaveRequest';

export async function GET() {
    try {
        await dbConnect();

        // Fetch pending leave requests with teacher info
        const requests = await LeaveRequest.find({ status: 'pending' })
            .populate('teacherId', 'name email')
            .sort({ createdAt: -1 });

        return NextResponse.json(requests);
    } catch (error) {
        console.error('Error fetching all pending requests:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
