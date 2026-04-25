/**
 * BlackRoad OS - Job Queue
 *
 * In-memory job queue for background tasks.
 * Supports job creation, status tracking, and cancellation.
 *
 * @version 2.0
 * @author Atlas (Infrastructure Architect)
 */

import { Job, JobStatus } from './types';
import { logger } from './logger';

type JobHandler = (params: any) => Promise<any>;

/**
 * Job Queue Manager
 */
export class JobQueue {
  private jobs: Map<string, Job>;
  private handlers: Map<string, JobHandler>;
  private running: Map<string, AbortController>;

  constructor() {
    this.jobs = new Map();
    this.handlers = new Map();
    this.running = new Map();
  }

  /**
   * Register a job handler
   */
  registerHandler(name: string, handler: JobHandler): void {
    this.handlers.set(name, handler);
    logger.debug(`[Jobs] Registered handler: ${name}`);
  }

  /**
   * Create and queue a job
   */
  async createJob(
    name: string,
    params?: Record<string, any>,
    schedule?: string
  ): Promise<Job> {
    const handler = this.handlers.get(name);
    if (!handler) {
      throw new Error(`No handler registered for job: ${name}`);
    }

    const job: Job = {
      id: this.generateJobId(),
      name,
      params,
      schedule,
      status: 'queued',
      createdAt: new Date().toISOString(),
    };

    this.jobs.set(job.id, job);
    logger.info(`[Jobs] Job created: ${name} (${job.id})`);

    // Execute immediately (no schedule support yet)
    if (!schedule) {
      await this.executeJob(job.id);
    }

    return job;
  }

  /**
   * Execute a job
   */
  private async executeJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    const handler = this.handlers.get(job.name);
    if (!handler) {
      throw new Error(`No handler for job: ${job.name}`);
    }

    job.status = 'running';
    job.startedAt = new Date().toISOString();
    logger.info(`[Jobs] Job started: ${job.name} (${job.id})`);

    const abortController = new AbortController();
    this.running.set(jobId, abortController);

    try {
      const result = await handler(job.params);

      job.status = 'completed';
      job.completedAt = new Date().toISOString();
      job.result = result;
      logger.info(`[Jobs] Job completed: ${job.name} (${job.id})`);
    } catch (error) {
      job.status = 'failed';
      job.completedAt = new Date().toISOString();
      job.error = {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      };
      logger.error(`[Jobs] Job failed: ${job.name} (${job.id})`, {
        error: job.error.message,
      });
    } finally {
      this.running.delete(jobId);
    }
  }

  /**
   * Get job status
   */
  getJob(jobId: string): Job | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Get all jobs
   */
  getAllJobs(): Job[] {
    return Array.from(this.jobs.values());
  }

  /**
   * Get jobs by status
   */
  getJobsByStatus(status: JobStatus): Job[] {
    return Array.from(this.jobs.values()).filter((job) => job.status === status);
  }

  /**
   * Cancel a job
   */
  async cancelJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    if (job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') {
      throw new Error(`Cannot cancel job in status: ${job.status}`);
    }

    const abortController = this.running.get(jobId);
    if (abortController) {
      abortController.abort();
    }

    job.status = 'cancelled';
    job.completedAt = new Date().toISOString();
    logger.info(`[Jobs] Job cancelled: ${job.name} (${job.id})`);
  }

  /**
   * Clear completed jobs
   */
  clearCompleted(): void {
    for (const [id, job] of this.jobs.entries()) {
      if (job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') {
        this.jobs.delete(id);
      }
    }
  }

  /**
   * Generate unique job ID
   */
  private generateJobId(): string {
    return `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Global job queue instance
 */
export const jobQueue = new JobQueue();

export default jobQueue;
