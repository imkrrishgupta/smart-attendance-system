import { dbConnect } from './lib/db';
import { Session } from './models/Session';

async function diagnoseSessions() {
    await dbConnect();
    const all = await Session.find().sort({ createdAt: -1 }).limit(5);
    console.log('Total sessions:', await Session.countDocuments());
    all.forEach(s => {
        console.log(`- ID: ${s._id}, Subject: ${s.subject}, Branch: "${s.branch}", Sem: "${s.semester}"`);
    });
    process.exit(0);
}

diagnoseSessions();
