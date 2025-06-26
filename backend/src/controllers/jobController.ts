import { Request, Response } from 'express';
import { JobService, JobStatus } from '../services/jobService';
import { ApiResponse } from '../types';

export class JobController {
    /**
     * Get all job statuses (admin only)
     */
    static async getAllJobStatuses(req: Request, res: Response): Promise<void> {
        try {
            const userRole = (req as any).user?.role;
            if (userRole !== 'ADMIN') {
                res.status(403).json({
                    success: false,
                    error: { message: 'Access denied. Admin role required.' }
                } as ApiResponse);
                return;
            }

            const jobStatuses = JobService.getAllJobStatuses();

            res.json({
                success: true,
                data: jobStatuses
            } as ApiResponse<JobStatus[]>);
        } catch (error) {
            console.error('Error getting job statuses:', error);
            res.status(500).json({
                success: false,
                error: { message: 'Internal server error' }
            } as ApiResponse);
        }
    }

    /**
     * Get specific job status (admin only)
     */
    static async getJobStatus(req: Request, res: Response): Promise<void> {
        try {
            const userRole = (req as any).user?.role;
            if (userRole !== 'ADMIN') {
                res.status(403).json({
                    success: false,
                    error: { message: 'Access denied. Admin role required.' }
                } as ApiResponse);
                return;
            }

            const jobName = req.params['name'];
            if (!jobName) {
                res.status(400).json({
                    success: false,
                    error: { message: 'Job name is required' }
                } as ApiResponse);
                return;
            }

            const jobStatus = JobService.getJobStatus(jobName);
            if (!jobStatus) {
                res.status(404).json({
                    success: false,
                    error: { message: 'Job not found' }
                } as ApiResponse);
                return;
            }

            res.json({
                success: true,
                data: jobStatus
            } as ApiResponse<JobStatus>);
        } catch (error) {
            console.error('Error getting job status:', error);
            res.status(500).json({
                success: false,
                error: { message: 'Internal server error' }
            } as ApiResponse);
        }
    }

    /**
     * Manually trigger a job (admin only)
     */
    static async triggerJob(req: Request, res: Response): Promise<void> {
        try {
            const userRole = (req as any).user?.role;
            if (userRole !== 'ADMIN') {
                res.status(403).json({
                    success: false,
                    error: { message: 'Access denied. Admin role required.' }
                } as ApiResponse);
                return;
            }

            const jobName = req.params['name'];
            if (!jobName) {
                res.status(400).json({
                    success: false,
                    error: { message: 'Job name is required' }
                } as ApiResponse);
                return;
            }

            await JobService.triggerJob(jobName);

            res.json({
                success: true,
                data: { message: `Job ${jobName} triggered successfully` }
            } as ApiResponse);
        } catch (error) {
            console.error('Error triggering job:', error);
            res.status(500).json({
                success: false,
                error: { message: error instanceof Error ? error.message : 'Internal server error' }
            } as ApiResponse);
        }
    }

    /**
     * Stop a specific job (admin only)
     */
    static async stopJob(req: Request, res: Response): Promise<void> {
        try {
            const userRole = (req as any).user?.role;
            if (userRole !== 'ADMIN') {
                res.status(403).json({
                    success: false,
                    error: { message: 'Access denied. Admin role required.' }
                } as ApiResponse);
                return;
            }

            const jobName = req.params['name'];
            if (!jobName) {
                res.status(400).json({
                    success: false,
                    error: { message: 'Job name is required' }
                } as ApiResponse);
                return;
            }

            JobService.stopJob(jobName);

            res.json({
                success: true,
                data: { message: `Job ${jobName} stopped successfully` }
            } as ApiResponse);
        } catch (error) {
            console.error('Error stopping job:', error);
            res.status(500).json({
                success: false,
                error: { message: 'Internal server error' }
            } as ApiResponse);
        }
    }

    /**
     * Get system health information (admin only)
     */
    static async getSystemHealth(req: Request, res: Response): Promise<void> {
        try {
            const userRole = (req as any).user?.role;
            if (userRole !== 'ADMIN') {
                res.status(403).json({
                    success: false,
                    error: { message: 'Access denied. Admin role required.' }
                } as ApiResponse);
                return;
            }

            const jobStatuses = JobService.getAllJobStatuses();
            const activeJobs = jobStatuses.filter(job => !job.lastError);
            const failedJobs = jobStatuses.filter(job => job.lastError);

            res.json({
                success: true,
                data: {
                    totalJobs: jobStatuses.length,
                    activeJobs: activeJobs.length,
                    failedJobs: failedJobs.length,
                    jobStatuses
                }
            } as ApiResponse);
        } catch (error) {
            console.error('Error getting system health:', error);
            res.status(500).json({
                success: false,
                error: { message: 'Internal server error' }
            } as ApiResponse);
        }
    }
}
