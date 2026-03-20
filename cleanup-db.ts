import { dbConnect } from './lib/db';
import { Timetable } from './models/Timetable';
import { Session } from './models/Session';

async function cleanup() {
    await dbConnect();
    
    console.log('--- Cleaning up Timetable ---');
    const tResult = await Timetable.deleteMany({
        $or: [
            { branch: "undefined" },
            { semester: "undefined" },
            { branch: null },
            { semester: null }
        ]
    });
    console.log(`Deleted ${tResult.deletedCount} corrupted Timetable entries.`);

    console.log('--- Cleaning up Sessions ---');
    const sResult = await Session.deleteMany({
        $or: [
            { branch: "undefined" },
            { semester: "undefined" },
            { branch: null },
            { semester: null }
        ]
    });
    console.log(`Deleted ${sResult.deletedCount} corrupted Session entries.`);

    process.exit(0);
}

cleanup().catch(err => {
    console.error(err);
    process.exit(1);
});
