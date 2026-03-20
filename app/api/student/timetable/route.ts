import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { Timetable } from '@/models/Timetable';
import { ScheduleException } from '@/models/ScheduleException';

export async function GET() {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const branch = (session.user as any).branch;
        const semester = (session.user as any).semester;

        const cleanBranch = (branch as string || '').trim();
        const cleanSemester = (semester as string || '').trim();
        console.log(`[Student Timetable API] Cleaned Info: Branch=${cleanBranch}, Semester=${cleanSemester}`);

        if (!cleanBranch || !cleanSemester) {
             console.log('[Student Timetable API] Missing branch/semester, returning empty.');
             return NextResponse.json([]);
        }

        // DIAGNOSTIC: Log all existing entries to find mismatches
        const allEntries = await Timetable.find().limit(5);
        console.log('[Student Timetable API] DEBUG - Samples in DB:', allEntries.map(e => `Branch="${e.branch}", Sem="${e.semester}"`).join(' | '));

        // Fetch weekly timetable entries
        const timetable = await Timetable.find({ 
            branch: { $regex: new RegExp(`^${cleanBranch}$`, 'i') }, 
            semester: { $regex: new RegExp(`^${cleanSemester}$`, 'i') } 
        })
            .populate('teacherId', 'name')
            .sort({ day: 1, startTime: 1 });
            
        console.log(`[Student Timetable API] Found ${timetable.length} entries matching ${branch}/${semester}`);
            
        // Fetch exceptions for the current week
        // We'll return exceptions found for these timetable entries
        const exceptions = await ScheduleException.find({
            timetableId: { $in: timetable.map(t => t._id) },
            date: {
                $gte: new Date(new Date().setHours(0,0,0,0)), // From today onwards
                $lte: new Date(new Date().setDate(new Date().getDate() + 7)) // For next 7 days
            }
        }).populate('substituteTeacherId', 'name');

        // Merge exceptions into timetable data
        const enrichedTimetable = timetable.map(t => {
            const tObj = t.toObject();
            // Find if there's an exception for this class in the next 7 days
            // Note: Since timetable is weekly, we might have multiple dates, 
            // but for simplicity we'll just check if it's currently cancelled.
            const exception = exceptions.find(e => 
                e.timetableId.toString() === t._id.toString()
            );
            
            return {
                ...tObj,
                exception: exception ? {
                    status: exception.status,
                    substituteTeacher: exception.substituteTeacherId?.name || null
                } : null
            };
        });

        return NextResponse.json(enrichedTimetable);
    } catch (error) {
        console.error('Failed to fetch timetable:', error);
        return NextResponse.json({ error: 'Failed to fetch timetable' }, { status: 500 });
    }
}
