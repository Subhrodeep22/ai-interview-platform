import express from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { ApplicationController } from '../controllers/application.controller';

const router = express.Router();

/**
 * @route POST /api/apply/:jobId
 * @desc Candidate applies for a job
 */
router.post('/:jobId', authenticate, ApplicationController.applyForJob);

/**
 * @route GET /api/apply/me
 * @desc Candidate fetches their own applications
 */
router.get('/me', authenticate, ApplicationController.getMyApplications);

/**
 * @route GET /api/apply/job/:jobId
 * @desc Recruiter fetches applications for a job
 */
router.get('/job/:jobId', authenticate, ApplicationController.getApplicationsByJob);

/**
 * @route PATCH /api/apply/:applicationId/status
 * @desc Recruiter updates application status
 */
router.patch('/:applicationId/status', authenticate, ApplicationController.updateApplicationStatus);

/**
 * @route GET /api/apply/:applicationId
 * @desc Candidate or Recruiter views a single application
 */
router.get('/:applicationId', authenticate, ApplicationController.getApplicationById);

export default router;
