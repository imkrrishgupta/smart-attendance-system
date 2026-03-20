import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Timetable } from '@/models/Timetable';

// DELETE /api/admin/timetable/[id] — remove a timetable entry
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;

        const deletedEntry = await Timetable.findByIdAndDelete(id);

        if (!deletedEntry) {
            return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Timetable entry deleted successfully' });
    } catch (error) {
        console.error('Error deleting timetable entry:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
