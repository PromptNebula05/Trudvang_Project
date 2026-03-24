import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import {User} from './models/index.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/trudvang_db';
const SALT_ROUNDS = 12;

const seedUsers = [
    { username: 'admin', password: 'AdminPass1!', role: 'admin' },
    { username: 'standarduser', password: 'UserPass1!', role: 'user' }
];

async function initUsers() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB', mongoose.connection.db.databaseName);

        await User.deleteMany({username: {$in: seedUsers.map(u => u.username)}});

        for (const seed of seedUsers) {
            const passwordHash = await bcrypt.hash(seed.password, SALT_ROUNDS);
            const user = new User({ username: seed.username, passwordHash, role: seed.role});
            await user.save();
            console.log(`Created user: ${seed.username}  role: ${seed.role}`);
        }
        
        console.log('User seed complete');
    } catch (err) {
        console.error('Seed error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

initUsers();
