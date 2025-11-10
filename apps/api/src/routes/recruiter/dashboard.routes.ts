import express from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { getRecruiterStats } from '../../controllers/recruiter/dashboard.controller';

const router = express.Router();

/**
 * GET /api/recruiter/dashboard/stats
 * Returns aggregated stats for recruiter dashboard.
 */
router.get('/stats', authenticate, getRecruiterStats);

export default router;
