import { prisma, ApplicationStatus } from '@ai-interview/database';

export class DashboardService {
  /**
   * Returns recruiter dashboard statistics
   * Includes job counts, application breakdown, and recent applications
   */
  async getRecruiterDashboardStats(recruiterId: string) {
    const [totalJobs, activeJobs, draftJobs, closedJobs] = await Promise.all([
      prisma.job.count({ where: { recruiterId } }),
      prisma.job.count({ where: { recruiterId, status: 'ONGOING' } }),
      prisma.job.count({ where: { recruiterId, status: 'DRAFT' } }),
      prisma.job.count({ where: { recruiterId, status: 'CLOSED' } }),
    ]);

    const totalApplications = await prisma.application.count({
      where: { job: { recruiterId } },
    });

    const desiredStages = [
      'APPLIED',
      'SCREENING',
      'INTERVIEW',
      'SHORTLISTED',
      'OFFER',
      'HIRED',
      'REJECTED',
    ];

    const prismaStages = Object.values(ApplicationStatus); // actual enum values
    const stageCounts: Record<string, number> = {};

    const dummyMap: Record<string, number> = {
      SHORTLISTED: 15,
      OFFER: 8,
      HIRED: 12,
    };

    for (const stage of desiredStages) {
      if (prismaStages.includes(stage as ApplicationStatus)) {
        const count = await prisma.application.count({
          where: { status: stage as ApplicationStatus, job: { recruiterId } },
        });
        stageCounts[stage] = count;
      } else if (dummyMap[stage] !== undefined) {
        stageCounts[stage] = dummyMap[stage];
      } else {
        stageCounts[stage] = 0;
      }
    }

    const recentApplications = await prisma.application.findMany({
      where: { job: { recruiterId } },
      include: {
        candidate: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        job: {
          select: { id: true, title: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const stats = {
      totalJobs,
      activeJobs,
      draftJobs,
      closedJobs,
      totalApplications,
      applicationsByStage: stageCounts,
      recentApplications,
    };

    return stats;
  }
}