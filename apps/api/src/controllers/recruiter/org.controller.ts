import { Request, Response } from 'express';
import { OrganizationService } from '../../services/recruiter/organization.service';

const orgService = new OrganizationService();

export class OrganizationController {
  /**
   * @desc Recruiter creates an organization
   * @route POST /api/recruiter/org/create
   */
  static async createOrganization(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const organization = await orgService.createOrganization(user.id, req.body);
      res.status(201).json({
        message: 'Organization created successfully',
        organization,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * @desc Update organization details
   * @route PUT /api/recruiter/org/:id
   */
  static async updateOrganization(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const organization = await orgService.updateOrganization(
        req.params.id,
        user.id,
        user.role,
        req.body
      );
      res.status(200).json({
        message: 'Organization updated successfully',
        organization,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * @desc Delete organization
   * @route DELETE /api/recruiter/org/:id
   */
  static async deleteOrganization(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const result = await orgService.deleteOrganization(req.params.id, user.role);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * @desc Add a new user to the organization
   * @route POST /api/recruiter/org/:orgId/add-user
   */
  static async addUserToOrganization(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const newUser = await orgService.addUserToOrganization(
        req.params.orgId,
        user.id,
        req.body
      );
      res.status(201).json({
        message: 'User added successfully',
        user: newUser,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * @desc Get all users in an organization
   * @route GET /api/recruiter/org/:id/users
   */
  static async getOrganizationUsers(req: Request, res: Response) {
    try {
      const users = await orgService.getOrganizationUsers(req.params.id);
      res.status(200).json({ users });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}