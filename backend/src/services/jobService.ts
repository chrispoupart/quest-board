import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface JobConfig {
    enabled: boolean;
    schedule: string;
    timeout: number;
}

export interface JobStatus {
    name: string;
    lastRun: Date | null;
    nextRun: Date | null;
    isRunning: boolean;
    errorCount: number;
    lastError: string | null;
}

export class JobService {
    private static jobs: Map<string, cron.ScheduledTask> = new Map();
    private static jobStatus: Map<string, JobStatus> = new Map();

    /**
     * Initialize all scheduled jobs
     */
    static initializeJobs(): void {
        console.log('Initializing scheduled jobs...');

        // Quest claim expiry job (runs every hour)
        this.scheduleJob('quest-claim-expiry', '0 * * * *', this.handleQuestClaimExpiry);

        // Cleanup old data job (runs daily at 2 AM)
        this.scheduleJob('cleanup-old-data', '0 2 * * *', this.handleCleanupOldData);

        // System health check job (runs every 30 minutes)
        this.scheduleJob('health-check', '*/30 * * * *', this.handleHealthCheck);

        console.log(`Initialized ${this.jobs.size} scheduled jobs`);
    }

    /**
     * Schedule a new job
     */
    private static scheduleJob(name: string, schedule: string, task: () => Promise<void>): void {
        if (this.jobs.has(name)) {
            console.warn(`Job ${name} already exists, stopping previous instance`);
            this.stopJob(name);
        }

        const jobStatus: JobStatus = {
            name,
            lastRun: null,
            nextRun: null,
            isRunning: false,
            errorCount: 0,
            lastError: null,
        };

        this.jobStatus.set(name, jobStatus);

        const scheduledTask = cron.schedule(schedule, async () => {
            await this.executeJob(name, task);
        }, {
            scheduled: true,
            timezone: 'UTC'
        });

        this.jobs.set(name, scheduledTask);

        // Calculate next run time
        const nextRun = this.calculateNextRun(schedule);
        jobStatus.nextRun = nextRun;

        console.log(`Scheduled job: ${name} (${schedule}) - Next run: ${nextRun}`);
    }

    /**
     * Execute a job with error handling and monitoring
     */
    private static async executeJob(name: string, task: () => Promise<void>): Promise<void> {
        const status = this.jobStatus.get(name);
        if (!status) {
            console.error(`Job status not found for: ${name}`);
            return;
        }

        if (status.isRunning) {
            console.warn(`Job ${name} is already running, skipping execution`);
            return;
        }

        status.isRunning = true;
        status.lastRun = new Date();

        try {
            console.log(`Starting job: ${name}`);
            await task();
            console.log(`Completed job: ${name}`);
            status.errorCount = 0;
            status.lastError = null;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error(`Job ${name} failed:`, errorMessage);
            status.errorCount++;
            status.lastError = errorMessage;
        } finally {
            status.isRunning = false;
            // Update next run time
            const job = this.jobs.get(name);
            if (job) {
                status.nextRun = this.calculateNextRunFromJob(job);
            }
        }
    }

    /**
     * Handle quest claim expiry (48-hour timeout)
     */
    private static async handleQuestClaimExpiry(): Promise<void> {
        console.log('Processing quest claim expiry...');

        const expiryHours = 48;
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() - expiryHours);

        try {
            // Find quests that have been claimed for more than 48 hours
            const expiredQuests = await prisma.quest.findMany({
                where: {
                    status: 'CLAIMED',
                    claimedAt: {
                        lt: expiryDate
                    }
                }
            });

            console.log(`Found ${expiredQuests.length} expired quest claims`);

            // Reset expired quests to available status
            for (const quest of expiredQuests) {
                await prisma.quest.update({
                    where: { id: quest.id },
                    data: {
                        status: 'AVAILABLE',
                        claimedBy: null,
                        claimedAt: null
                    }
                });

                console.log(`Reset quest ${quest.id} (${quest.title}) to available status`);
            }

            console.log(`Successfully processed ${expiredQuests.length} expired quest claims`);
        } catch (error) {
            console.error('Error processing quest claim expiry:', error);
            throw error;
        }
    }

    /**
     * Handle cleanup of old data
     */
    private static async handleCleanupOldData(): Promise<void> {
        console.log('Processing cleanup of old data...');

        try {
            // Clean up old approvals (older than 90 days)
            const approvalCutoff = new Date();
            approvalCutoff.setDate(approvalCutoff.getDate() - 90);

            const deletedApprovals = await prisma.approval.deleteMany({
                where: {
                    createdAt: {
                        lt: approvalCutoff
                    }
                }
            });

            console.log(`Deleted ${deletedApprovals.count} old approvals`);

            // Clean up old completed quests (older than 1 year)
            const questCutoff = new Date();
            questCutoff.setFullYear(questCutoff.getFullYear() - 1);

            const deletedQuests = await prisma.quest.deleteMany({
                where: {
                    status: { in: ['APPROVED', 'REJECTED'] },
                    updatedAt: {
                        lt: questCutoff
                    }
                }
            });

            console.log(`Deleted ${deletedQuests.count} old quests`);

            console.log('Cleanup completed successfully');
        } catch (error) {
            console.error('Error during cleanup:', error);
            throw error;
        }
    }

    /**
     * Handle system health check
     */
    private static async handleHealthCheck(): Promise<void> {
        console.log('Performing system health check...');

        try {
            // Check database connectivity
            await prisma.$queryRaw`SELECT 1`;

            // Check for stuck quests (claimed but no activity for 7 days)
            const stuckCutoff = new Date();
            stuckCutoff.setDate(stuckCutoff.getDate() - 7);

            const stuckQuests = await prisma.quest.count({
                where: {
                    status: 'CLAIMED',
                    claimedAt: {
                        lt: stuckCutoff
                    }
                }
            });

            if (stuckQuests > 0) {
                console.warn(`Found ${stuckQuests} quests that may be stuck`);
            }

            // Check for users with high error rates
            const usersWithErrors = await prisma.user.count({
                where: {
                    bountyBalance: {
                        lt: 0
                    }
                }
            });

            if (usersWithErrors > 0) {
                console.warn(`Found ${usersWithErrors} users with negative bounty balance`);
            }

            console.log('Health check completed successfully');
        } catch (error) {
            console.error('Health check failed:', error);
            throw error;
        }
    }

    /**
     * Stop a specific job
     */
    static stopJob(name: string): void {
        const job = this.jobs.get(name);
        if (job) {
            job.stop();
            this.jobs.delete(name);
            console.log(`Stopped job: ${name}`);
        }
    }

    /**
     * Stop all jobs
     */
    static stopAllJobs(): void {
        console.log('Stopping all scheduled jobs...');
        for (const [name, job] of this.jobs) {
            job.stop();
            console.log(`Stopped job: ${name}`);
        }
        this.jobs.clear();
        this.jobStatus.clear();
    }

    /**
     * Get job status
     */
    static getJobStatus(name: string): JobStatus | null {
        return this.jobStatus.get(name) || null;
    }

    /**
     * Get all job statuses
     */
    static getAllJobStatuses(): JobStatus[] {
        return Array.from(this.jobStatus.values());
    }

    /**
     * Calculate next run time from cron expression
     */
    private static calculateNextRun(cronExpression: string): Date {
        // For now, return a default time (1 hour from now)
        // In a production environment, you might want to use a more sophisticated cron parser
        const nextRun = new Date();
        nextRun.setHours(nextRun.getHours() + 1);
        return nextRun;
    }

    /**
     * Calculate next run time from scheduled task
     */
    private static calculateNextRunFromJob(job: cron.ScheduledTask): Date {
        // This is a simplified approach - in a real implementation,
        // you might want to store the cron expression and recalculate
        return new Date(Date.now() + 24 * 60 * 60 * 1000); // Default to 24 hours
    }

    /**
     * Manually trigger a job
     */
    static async triggerJob(name: string): Promise<void> {
        const job = this.jobs.get(name);
        if (!job) {
            throw new Error(`Job ${name} not found`);
        }

        // Get the task function (this is a simplified approach)
        switch (name) {
            case 'quest-claim-expiry':
                await this.handleQuestClaimExpiry();
                break;
            case 'cleanup-old-data':
                await this.handleCleanupOldData();
                break;
            case 'health-check':
                await this.handleHealthCheck();
                break;
            default:
                throw new Error(`Unknown job: ${name}`);
        }
    }
}
