import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Timetable } from '@/models/Timetable';
import { ScheduleException } from '@/models/ScheduleException';

export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const teacherId = searchParams.get('teacherId');

        if (!teacherId) {
            return NextResponse.json({ error: 'Teacher ID is required' }, { status: 400 });
        }

        const today = new Date();
        const startOfDay = new Date(today.setHours(0,0,0,0));
        const endOfWeek = new Date(new Date().setDate(today.getDate() + 7));

        // Fetch primary weekly timetable for the teacher
        const primaryTimetable = await Timetable.find({ 
            $or: [
                { teacherId: teacherId },
                { teacherId: teacherId.toString() }
            ]
        })
            .populate('teacherId', 'name')
            .sort({ day: 1, startTime: 1 });
            
        console.log(`[Teacher Timetable API] TeacherId=${teacherId}, Found=${primaryTimetable.length} primary entries.`);
        if (primaryTimetable.length > 0) {
            console.log(`[Teacher Timetable API] Entry IDs: ${primaryTimetable.map(t => t._id).join(', ')}`);
        }
            
        // Fetch all exceptions (cancellations OR substitutions) involving this teacher or their classes
        const exceptions = await ScheduleException.find({
            $or: [
                { timetableId: { $in: primaryTimetable.map(t => t._id) } },
                { substituteTeacherId: teacherId }
            ],
            date: { $gte: startOfDay, $lte: endOfWeek }
        }).populate({
            path: 'timetableId',
            populate: { path: 'teacherId', select: 'name' }
        });

        // Map primary timetable with exception info (e.g. if it's cancelled today/this week)
        const enrichedPrimary = primaryTimetable.map(t => {
            const tObj = t.toObject();
            const exception = exceptions.find(ex => ex.timetableId?._id?.toString() === t._id.toString() && ex.status === 'cancelled');
            return {
                ...tObj,
                isCancelled: !!exception,
                exceptionInfo: exception ? { status: 'cancelled' } : null
            };
        });

        // Add substituted classes (not owned by this teacher)
        const substitutions = exceptions
            .filter(ex => ex.substituteTeacherId?.toString() === teacherId && ex.status === 'substituted')
            .map(ex => {
                const t = ex.timetableId as any;
                if (!t) return null;
                return {
                    ...t.toObject(),
                    isSubstitution: true,
                    originalTeacher: t.teacherId?.name,
                    exceptionInfo: { status: 'substituted' }
                };
            }).filter(Boolean);

        return NextResponse.json([...enrichedPrimary, ...substitutions]);
    } catch (error) {
        console.error('Failed to fetch teacher timetable:', error);
        return NextResponse.json({ error: 'Failed to fetch timetable' }, { status: 500 });
    }
}
