import express, { Request, Response } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { OrganizationController } from '../../controllers/recruiter/org.controller';
import { OrganizationService } from '../../services/recruiter/organization.service';

const orgService = new OrganizationService();

const router = express.Router();

/**
 * @route POST /api/recruiter/org/create
 * @desc Recruiter creates a new organization
 */
router.post('/create', authenticate, OrganizationController.createOrganization);

/**
 * @route GET /api/recruiter/org/me
 * @desc Get current user's organization
 * NOTE: This must come before /:id route
 */
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user.organizationId) {
      return res.status(200).json({ organization: null });
    }

    const organization = await orgService.getOrganizationById(user.organizationId);
    res.status(200).json({ organization });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route GET /api/recruiter/org/:id
 * @desc Get organization by ID
 */
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const organization = await orgService.getOrganizationById(req.params.id);
    res.status(200).json({ organization });
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

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
