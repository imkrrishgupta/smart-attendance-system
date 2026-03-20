import { dbConnect } from './lib/db';
import { User } from './models/User';
import { Timetable } from './models/Timetable';

async function diagnose() {
    await dbConnect();
    const students = await User.find({ role: 'student' });
    console.log('Students in DB:', students.map(s => ({ name: s.name, branch: s.branch, semester: s.semester })));
    
    const timetable = await Timetable.find();
    console.log('Timetable Entries in DB:', timetable.map(t => ({ subject: t.subject, branch: t.branch, semester: t.semester, day: t.day, start: t.startTime })));
    
    process.exit(0);
}

diagnose();
