import express, { Request, Response } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { JobsService } from '../../services/jobs.service';
import { JobStatus } from '@ai-interview/database';

const router = express.Router();
const jobsService = new JobsService();

/**
 * @route POST /api/recruiter/jobs/create
 * @desc Recruiter creates a new job
 */
router.post('/create', authenticate, async (req: Request, res: Response) => {
  try {
    const recruiter = (req as any).user;
    const job = await jobsService.createJob(recruiter.id, req.body);
    res.status(201).json({ message: 'Job created successfully', job });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route GET /api/recruiter/jobs
 * @desc Get all jobs created by the recruiter
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const recruiter = (req as any).user;
    const jobs = await jobsService.getJobsByRecruiter(recruiter.id);
    res.status(200).json({ jobs });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route GET /api/recruiter/jobs/:id
 * @desc Get a single job by ID
 */
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const job = await jobsService.getJobById(req.params.id);
    res.status(200).json({ job });
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

/**
 * @route PUT /api/recruiter/jobs/:id
 * @desc Update a job by ID (only recruiter who created it)
 */
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const recruiter = (req as any).user;
    const job = await jobsService.updateJob(req.params.id, recruiter.id, req.body);
    res.status(200).json({ message: 'Job updated successfully', job });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route PATCH /api/recruiter/jobs/:id/status
 * @desc Change a job's status (Draft -> Ongoing -> Closed)
 */
router.patch('/:id/status', authenticate, async (req: Request, res: Response) => {
  try {
    const recruiter = (req as any).user;
    const { status } = req.body;

    if (!Object.values(JobStatus).includes(status)) {
      return res.status(400).json({ error: 'Invalid job status.' });
    }

    const updated = await jobsService.changeJobStatus(req.params.id, recruiter.id, status);
    res.status(200).json({ message: 'Job status updated successfully', job: updated });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route DELETE /api/recruiter/jobs/:id
 * @desc Delete a job by ID (only recruiter who created it)
 */
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const recruiter = (req as any).user;
    const result = await jobsService.deleteJob(req.params.id, recruiter.id);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route GET /api/recruiter/jobs/organization/:orgId
 * @desc Get all jobs in an organization (for recruiters/admins)
 */
router.get('/organization/:orgId', authenticate, async (req: Request, res: Response) => {
  try {
    const jobs = await jobsService.getJobsByOrganization(req.params.orgId);
    res.status(200).json({ jobs });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route GET /api/recruiter/jobs/public
 * @desc Get all public jobs (for listing / candidates)
 */
router.get('/public/list', async (req: Request, res: Response) => {
  try {
    const jobs = await jobsService.getPublicJobs();
    res.status(200).json({ jobs });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;