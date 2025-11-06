import express, { Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { ApplicationService } from '../services/application.service';
import { ApplicationStatus, Role } from '@ai-interview/database';

const router = express.Router();
const appService = new ApplicationService();

/**
 * @route POST /api/apply/:jobId
 * @desc Candidate applies for a job
 */
router.post('/:jobId', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { jobId } = req.params;
    const app = await appService.applyForJob(user.id, jobId);
    res.status(201).json({ message: 'Application submitted successfully', application: app });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route GET /api/apply/me
 * @desc Candidate fetches their applications
 */
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (user.role !== Role.CANDIDATE)
      return res.status(403).json({ error: 'Only candidates can view their applications.' });

    const apps = await appService.getApplicationsByCandidate(user.id);
    res.status(200).json({ applications: apps });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route GET /api/apply/job/:jobId
 * @desc Recruiter fetches applications for a job
 */
router.get('/job/:jobId', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (user.role !== Role.RECRUITER)
      return res.status(403).json({ error: 'Only recruiters can view applications.' });

    const apps = await appService.getApplicationsByJob(user.id, req.params.jobId);
    res.status(200).json({ applications: apps });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route PATCH /api/apply/:applicationId/status
 * @desc Recruiter updates application status
 */
router.patch('/:applicationId/status', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { status } = req.body;
    const { applicationId } = req.params;

    if (user.role !== Role.RECRUITER)
      return res.status(403).json({ error: 'Only recruiters can update application status.' });

    if (!Object.values(ApplicationStatus).includes(status))
      return res.status(400).json({ error: 'Invalid status value.' });

    const updated = await appService.updateApplicationStatus(user.id, applicationId, status);
    res.status(200).json({ message: 'Status updated successfully', application: updated });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route GET /api/apply/:applicationId
 * @desc Candidate or Recruiter views a single application
 */
router.get('/:applicationId', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const app = await appService.getApplicationById(user.id, req.params.applicationId, user.role);
    res.status(200).json({ application: app });
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

export default router;