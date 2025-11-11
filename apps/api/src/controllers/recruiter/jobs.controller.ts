import { Request, Response } from 'express';
import { JobsService } from '../../services/recruiter/jobs.service';
import { JobStatus } from '@ai-interview/database';

const jobsService = new JobsService();

export class JobsController {
  /**
   * @route POST /api/recruiter/jobs/create
   * @desc Recruiter creates a new job
   */
  static async createJob(req: Request, res: Response) {
    try {
      const recruiter = (req as any).user;
      const job = await jobsService.createJob(recruiter.id, req.body);
      res.status(201).json({ message: 'Job created successfully', job });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * @route GET /api/recruiter/jobs
   * @desc Get all jobs created by the recruiter
   */
  static async getMyJobs(req: Request, res: Response) {
    try {
      const recruiter = (req as any).user;
      const jobs = await jobsService.getRecruiterJobs(recruiter.id);
      res.status(200).json({ jobs });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * @route GET /api/recruiter/jobs/:id
   * @desc Get a single job by ID
   */
  static async getJobById(req: Request, res: Response) {
    try {
      const job = await jobsService.getJobById(req.params.id);
      res.status(200).json({ job });
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  /**
   * @route PUT /api/recruiter/jobs/:id
   * @desc Update a job by ID (only recruiter who created it)
   */
  static async updateJob(req: Request, res: Response) {
    try {
      const recruiter = (req as any).user;
      const job = await jobsService.updateJob(req.params.id, recruiter.id, req.body);
      res.status(200).json({ message: 'Job updated successfully', job });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * @route PATCH /api/recruiter/jobs/:id/status
   * @desc Change a job's status (Draft → Ongoing → Closed)
   */
  static async changeJobStatus(req: Request, res: Response) {
    try {
      const recruiter = (req as any).user;
      const { status } = req.body;

      if (!Object.values(JobStatus).includes(status)) {
        return res.status(400).json({ error: 'Invalid job status.' });
      }

      const updated = await jobsService.updateJobStatus(req.params.id, recruiter.id, status);
      res.status(200).json({ message: 'Job status updated successfully', job: updated });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * @route DELETE /api/recruiter/jobs/:id
   * @desc Delete a job by ID (only recruiter who created it)
   */
  static async deleteJob(req: Request, res: Response) {
    try {
      const recruiter = (req as any).user;
      const result = await jobsService.deleteJob(req.params.id, recruiter.id);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * @route GET /api/recruiter/jobs/organization/:orgId
   * @desc Get all jobs in an organization (for recruiters/admins)
   */
  static async getJobsByOrganization(req: Request, res: Response) {
    try {
      const jobs = await jobsService.getOrganizationJobs(req.params.orgId);
      res.status(200).json({ jobs });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * @route GET /api/recruiter/jobs/public/list
   * @desc Get all public jobs (for listing / candidates)
   */
  static async getPublicJobs(req: Request, res: Response) {
    try {
      const jobs = await jobsService.getPublicJobs();
      res.status(200).json({ jobs });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
