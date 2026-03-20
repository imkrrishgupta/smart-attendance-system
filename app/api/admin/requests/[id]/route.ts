import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { LeaveRequest } from '@/models/LeaveRequest';
import { Timetable } from '@/models/Timetable';
import { ScheduleException } from '@/models/ScheduleException';

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

        // If approved, handle class cancellations
        if (status === 'approved') {
            const { teacherId, startDate, endDate } = leaveRequest;
            const start = new Date(startDate);
            const end = new Date(endDate);

            // Find all timetable entries for this teacher
            const teacherTimetable = await Timetable.find({ teacherId });

            const daysMap: Record<number, string> = {
                0: 'Sunday',
                1: 'Monday',
                2: 'Tuesday',
                3: 'Wednesday',
                4: 'Thursday',
                5: 'Friday',
                6: 'Saturday'
            };

            // Loop through each date in the range
            const currentDate = new Date(start);
            while (currentDate <= end) {
                const dayName = daysMap[currentDate.getDay()];
                
                // Find classes that fall on this day name
                const affectedClasses = teacherTimetable.filter(t => t.day === dayName);

                for (const timetableEntry of affectedClasses) {
                    // Create a schedule exception (cancelled) for this specific date
                    await ScheduleException.findOneAndUpdate(
                        { 
                            timetableId: timetableEntry._id, 
                            date: new Date(currentDate) 
                        },
                        { 
                            status: 'cancelled',
                            substituteTeacherId: null 
                        },
                        { upsert: true, new: true }
                    );
                }

                currentDate.setDate(currentDate.getDate() + 1);
            }
        }

        return NextResponse.json(leaveRequest, { status: 200 });
    } catch (error) {
        console.error('Error updating leave request:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
