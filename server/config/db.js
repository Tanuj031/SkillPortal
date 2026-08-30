import 'dotenv/config';
import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mospi_skill_platform';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`✅  MongoDB connected → ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.error('❌  MongoDB connection error:', err.message);
    process.exit(1);
  }
};

export default connectDB;
