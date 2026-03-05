import mongoose from 'mongoose';

export const connectDatabase = async (): Promise<void> => {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
        console.warn('[DB] MONGO_URI is not defined. Skipping database connection.');
        return;
    }

    try {
        await mongoose.connect(mongoUri);
        console.log('[DB] Connected to MongoDB successfully.');
    } catch (error) {
        console.error('[DB] Error connecting to MongoDB:', error);
        // We throw so the server startup fails if a DB connection was expected but failed
        throw error;
    }
};

mongoose.connection.on('disconnected', () => {
    console.warn('[DB] MongoDB disconnected.');
});

mongoose.connection.on('reconnected', () => {
    console.log('[DB] MongoDB reconnected.');
});
