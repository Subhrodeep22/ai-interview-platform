import { Request, Response } from 'express';
import { ApplicationService } from '../services/application.service';
import { ApplicationStatus, Role } from '@ai-interview/database';

const appService = new ApplicationService();

export class ApplicationController {
  /**
   * @route POST /api/apply/:jobId
   * @desc Candidate applies for a job
   */
  static async applyForJob(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { jobId } = req.params;

      const application = await appService.applyForJob(user.id, jobId);
      res.status(201).json({
        message: 'Application submitted successfully',
        application,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * @route GET /api/apply/me
   * @desc Candidate fetches their own applications
   */
  static async getMyApplications(req: Request, res: Response) {
    try {
      const user = (req as any).user;

      if (user.role !== Role.CANDIDATE) {
        return res
          .status(403)
          .json({ error: 'Only candidates can view their applications.' });
      }

      const applications = await appService.getApplicationsByCandidate(user.id);
      res.status(200).json({ applications });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * @route GET /api/apply/job/:jobId
   * @desc Recruiter fetches applications for a specific job
   */
  static async getApplicationsByJob(req: Request, res: Response) {
    try {
      const user = (req as any).user;

      if (user.role !== Role.RECRUITER) {
        return res
          .status(403)
          .json({ error: 'Only recruiters can view applications.' });
      }

      const { jobId } = req.params;
      const applications = await appService.getApplicationsByJob(user.id, jobId);
      res.status(200).json({ applications });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * @route PATCH /api/apply/:applicationId/status
   * @desc Recruiter updates an application's status
   */
  static async updateApplicationStatus(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { applicationId } = req.params;
      const { status } = req.body;

      if (user.role !== Role.RECRUITER) {
        return res
          .status(403)
          .json({ error: 'Only recruiters can update application status.' });
      }

      if (!Object.values(ApplicationStatus).includes(status)) {
        return res.status(400).json({ error: 'Invalid status value.' });
      }

      const updated = await appService.updateApplicationStatus(
        user.id,
        applicationId,
        status
      );

      res.status(200).json({
        message: 'Status updated successfully',
        application: updated,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * @route GET /api/apply/:applicationId
   * @desc Candidate or Recruiter views a single application
   */
  static async getApplicationById(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { applicationId } = req.params;

      const application = await appService.getApplicationById(
        user.id,
        applicationId,
        user.role
      );

      res.status(200).json({ application });
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
}