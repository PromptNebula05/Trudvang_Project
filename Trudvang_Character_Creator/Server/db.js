import mongoose from 'mongoose';
import 'dotenv/config';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/trudvang_db';

export async function connectDB() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log(`Connected to MongoDB: ${mongoose.connection.db.databaseName}`);
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}