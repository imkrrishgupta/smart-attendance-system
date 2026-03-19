import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { LeaveRequest } from '@/models/LeaveRequest';

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { status } = await req.json();

        if (!['approved', 'rejected'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        await dbConnect();

        const leaveRequest = await LeaveRequest.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!leaveRequest) {
            return NextResponse.json({ error: 'Leave request not found' }, { status: 404 });
        }

        return NextResponse.json(leaveRequest, { status: 200 });
    } catch (error) {
        console.error('Error updating leave request:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
