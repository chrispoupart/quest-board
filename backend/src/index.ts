import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { JobService } from './services/jobService';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import questRoutes from './routes/quests';
import dashboardRoutes from './routes/dashboard';
import jobRoutes from './routes/jobs';
import storeRoutes from './routes/store';
import skillRoutes from './routes/skills';
import rewardsRoutes from './routes/rewards';
import { prisma } from './db';
import './config'; // This will load and validate environment variables
import cron from 'node-cron';
import { backupDatabase } from './utils/backupDb';

// Load environment variables only if not in test environment
if (process.env['NODE_ENV'] !== 'test') {
  dotenv.config();
}

const app = express();
const PORT = process.env['PORT'] || 8000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env['ALLOWED_ORIGINS']?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/quests', questRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/jobs', jobRoutes);
app.use('/store', storeRoutes);
app.use('/skills', skillRoutes);
app.use('/rewards', rewardsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Initialize scheduled jobs (only if not in test environment)
if (process.env['NODE_ENV'] !== 'test') {
  JobService.initializeJobs();
  // Schedule daily SQLite backup at 2:00 AM
  cron.schedule('0 2 * * *', () => {
    console.log('Starting scheduled SQLite backup...');
    backupDatabase();
  });
}

export { app };

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  JobService.stopAllJobs();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  JobService.stopAllJobs();
  process.exit(0);
});

// Start server (only if not in test environment)
if (process.env['NODE_ENV'] !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/docs`);
  });
}
