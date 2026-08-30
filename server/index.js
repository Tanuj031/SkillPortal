import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import courseRoutes from './routes/courses.js';
import adminRoutes from './routes/admin.js';
import authRoutes from './routes/auth.js';
import analyticsRoutes from './routes/analytics.js';
import userRoutes from './routes/users.js';
import competencyRoutes from './routes/competency.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/competency', competencyRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
const start = async () => {
  await connectDB();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀  MoSPI API server running → http://0.0.0.0:${PORT}`);
    console.log(`📚  Courses API      → http://localhost:${PORT}/api/courses`);
    console.log(`🛠️  Admin API        → http://localhost:${PORT}/api/admin/courses/import-igot`);
    console.log(`💓  Health check      → http://localhost:${PORT}/api/health`);
  });
};

// Start server if executed directly
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  start();
}

export default app;
