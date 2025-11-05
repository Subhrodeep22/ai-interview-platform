import express, { Request, Response } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { prisma, Role } from '@ai-interview/database';

const router = express.Router();

/**
 * @route POST /api/org/create
 * @desc Recruiter creates an organization
 */
router.post('/create', authenticate, async (req: Request, res: Response) => {
  try {
    const { name, slug, plan, settings } = req.body;
    const user = (req as any).user;

    if (user.role !== 'RECRUITER') {
      return res.status(403).json({ error: 'Only recruiters can create organizations.' });
    }

    const organization = await prisma.organization.create({
      data: {
        name,
        slug,
        plan: plan || 'FREE',
        settings: settings || {},
        users: {
          connect: { id: user.id, role: Role.ADMIN },
        },
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { organizationId: organization.id },
    });

    res.status(201).json({ message: 'Organization created successfully', organization });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route PUT /api/org/:id
 * @desc Edit organization details (recruiter or admin only)
 */
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, slug, plan, settings } = req.body;
    const user = (req as any).user;

    const organization = await prisma.organization.findUnique({ where: { id } });
    if (!organization) return res.status(404).json({ error: 'Organization not found' });

    if (user.role !== 'RECRUITER' && user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to edit this organization.' });
    }

    const updated = await prisma.organization.update({
      where: { id },
      data: { name, slug, plan, settings },
    });

    res.status(200).json({ message: 'Organization updated successfully', organization: updated });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route DELETE /api/org/:id
 * @desc Delete organization (recruiter or admin only)
 */
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    if (user.role !== 'RECRUITER' && user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to delete this organization.' });
    }

    await prisma.organization.delete({ where: { id } });

    res.status(200).json({ message: 'Organization deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route POST /api/org/:orgId/add-user
 * @desc Add user to organization (Recruiter only)
 */
router.post('/:orgId/add-user', authenticate, async (req: Request, res: Response) => {
  try {
    const { orgId } = req.params;
    const { email, firstName, lastName, role, password } = req.body;
    const user = (req as any).user;

    if (user.role !== 'RECRUITER') {
      return res.status(403).json({ error: 'Only recruiters can add users.' });
    }

    const organization = await prisma.organization.findUnique({ where: { id: orgId } });
    if (!organization) return res.status(404).json({ error: 'Organization not found' });

    const newUser = await prisma.user.create({
      data: {
        email,
        password,
        role,
        firstName,
        lastName,
        organizationId: orgId,
        verified: true,
      },
    });

    res.status(201).json({ message: 'User added successfully', user: newUser });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route GET /api/org/:id/users
 * @desc Get all users of an organization
 */
router.get('/:id/users', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const organization = await prisma.organization.findUnique({
      where: { id },
      include: { users: true },
    });

    if (!organization) return res.status(404).json({ error: 'Organization not found' });

    res.status(200).json({ users: organization.users });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
