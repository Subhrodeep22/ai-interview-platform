import express, { Request, Response } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { OrganizationService } from '../../services/organization.service';

const router = express.Router();
const orgService = new OrganizationService();

/**
 * @route POST /api/recruiter/org/create
 */
router.post('/create', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const organization = await orgService.createOrganization(user.id, req.body);
    res.status(201).json({ message: 'Organization created successfully', organization });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

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
 * @route GET /api/recruiter/org/:id/users
 */
router.get('/:id/users', authenticate, async (req: Request, res: Response) => {
  try {
    const users = await orgService.getOrganizationUsers(req.params.id);
    res.status(200).json({ users });
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
 */
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const organization = await orgService.updateOrganization(req.params.id, user.id, user.role, req.body);
    res.status(200).json({ message: 'Organization updated successfully', organization });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route DELETE /api/recruiter/org/:id
 */
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const result = await orgService.deleteOrganization(req.params.id, user.role);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route POST /api/recruiter/org/:orgId/add-user
 */
router.post('/:orgId/add-user', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const newUser = await orgService.addUserToOrganization(req.params.orgId, user.id, req.body);
    res.status(201).json({ message: 'User added successfully', user: newUser });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;