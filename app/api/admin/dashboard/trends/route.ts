import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Attendance } from '@/models/Attendance';
import { Session } from '@/models/Session';

export async function GET() {
    try {
        await dbConnect();

        const trends = [];
        const now = new Date();

        // Fetch last 5 active days of data
        for (let i = 4; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const nextDate = new Date(date);
            nextDate.setDate(date.getDate() + 1);

            // Find all sessions on this day
            const sessions = await Session.find({
                createdAt: { $gte: date, $lt: nextDate }
            });

            const sessionIds = sessions.map(s => s._id);

            if (sessionIds.length === 0) {
                trends.push({
                    day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                    percentage: 0
                });
                continue;
            }

            const present = await Attendance.countDocuments({
                sessionId: { $in: sessionIds },
                status: 'present'
            });

            const total = await Attendance.countDocuments({
                sessionId: { $in: sessionIds }
            });

            const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

            trends.push({
                day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                percentage
            });
        }

        return NextResponse.json(trends);
    } catch (error) {
        console.error('Error fetching admin trends:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
