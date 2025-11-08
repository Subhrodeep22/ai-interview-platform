import express from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { OrganizationController } from '../../controllers/recruiter/org.controller';

const router = express.Router();

/**
 * @route POST /api/recruiter/org/create
 * @desc Recruiter creates a new organization
 */
router.post('/create', authenticate, OrganizationController.createOrganization);

/**
 * @route PUT /api/recruiter/org/:id
 * @desc Update organization details
 */
router.put('/:id', authenticate, OrganizationController.updateOrganization);

/**
 * @route DELETE /api/recruiter/org/:id
 * @desc Delete an organization (Recruiter/Admin only)
 */
router.delete('/:id', authenticate, OrganizationController.deleteOrganization);

/**
 * @route POST /api/recruiter/org/:orgId/add-user
 * @desc Add a new user to an organization
 */
router.post('/:orgId/add-user', authenticate, OrganizationController.addUserToOrganization);

/**
 * @route GET /api/recruiter/org/:id/users
 * @desc Get all users in an organization
 */
router.get('/:id/users', authenticate, OrganizationController.getOrganizationUsers);

export default router;
