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
import { PrismaClient } from '@prisma/client';

// Load environment variables
dotenv.config();

export const prisma = new PrismaClient();

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

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Initialize scheduled jobs
JobService.initializeJobs();

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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/docs`);
});
