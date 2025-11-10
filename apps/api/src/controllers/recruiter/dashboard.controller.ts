import { Request, Response } from 'express';
import { DashboardService } from '../../services/recruiter/dashboard.service';

const dashboardService = new DashboardService();

export const getRecruiterStats = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    if (user.role !== 'RECRUITER' && user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const stats = await dashboardService.getRecruiterStats(user.id);

    return res.status(200).json(stats);
  } catch (err: any) {
    console.error('DashboardController.getRecruiterStats error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
};
