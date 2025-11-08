import express from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { JobsController } from '../../controllers/recruiter/jobs.controller';

const router = express.Router();

/**
 * @route POST /api/recruiter/jobs/create
 * @desc Recruiter creates a new job
 */
router.post('/create', authenticate, JobsController.createJob);

/**
 * @route GET /api/recruiter/jobs
 * @desc Get all jobs created by the recruiter
 */
router.get('/', authenticate, JobsController.getMyJobs);

/**
 * @route GET /api/recruiter/jobs/:id
 * @desc Get a single job by ID
 */
router.get('/:id', authenticate, JobsController.getJobById);

/**
 * @route PUT /api/recruiter/jobs/:id
 * @desc Update a job by ID (only recruiter who created it)
 */
router.put('/:id', authenticate, JobsController.updateJob);

/**
 * @route PATCH /api/recruiter/jobs/:id/status
 * @desc Change a job's status (Draft → Ongoing → Closed)
 */
router.patch('/:id/status', authenticate, JobsController.changeJobStatus);

/**
 * @route DELETE /api/recruiter/jobs/:id
 * @desc Delete a job by ID (only recruiter who created it)
 */
router.delete('/:id', authenticate, JobsController.deleteJob);

/**
 * @route GET /api/recruiter/jobs/organization/:orgId
 * @desc Get all jobs in an organization (for recruiters/admins)
 */
router.get('/organization/:orgId', authenticate, JobsController.getJobsByOrganization);

/**
 * @route GET /api/recruiter/jobs/public/list
 * @desc Get all public jobs (for listing / candidates)
 */
router.get('/public/list', JobsController.getPublicJobs);

export default router;