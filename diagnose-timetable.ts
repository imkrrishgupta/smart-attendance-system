import { dbConnect } from './lib/db';
import { Timetable } from './models/Timetable';
import mongoose from 'mongoose';

async function diagnose() {
    await dbConnect();
    const all = await Timetable.find().limit(10);
    console.log('Total entries:', await Timetable.countDocuments());
    all.forEach(t => {
        console.log(`- Subject: ${t.subject}, Branch: "${t.branch}", Sem: "${t.semester}"`);
    });
    process.exit(0);
}

diagnose();
