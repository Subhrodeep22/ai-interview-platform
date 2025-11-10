import { prisma, Role, ApplicationStatus } from '@ai-interview/database';

export class ApplicationService {
  /**
   * Candidate applies for a job
   */
  async applyForJob(candidateId: string, jobId: string) {
    const candidate = await prisma.user.findUnique({ where: { id: candidateId } });

    if (!candidate || candidate.role !== Role.CANDIDATE) {
      throw new Error('Only candidates can apply for jobs.');
    }

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new Error('Job not found.');
    if (job.status !== 'ONGOING') throw new Error('Job is not open for applications.');

    // Prevent duplicate applications
    const existing = await prisma.application.findFirst({
      where: { jobId, candidateId },
    });
    if (existing) throw new Error('You have already applied for this job.');

    // Create new application
    const application = await prisma.application.create({
      data: {
        jobId,
        candidateId,
        status: ApplicationStatus.APPLIED,
      },
    });

    return application;
  }

  /**
   * Recruiter fetches all applications for a specific job
   */
  async getApplicationsForJob(recruiterId: string, jobId: string) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { recruiter: true },
    });

    if (!job) throw new Error('Job not found.');
    if (job.recruiterId !== recruiterId) {
      throw new Error('Unauthorized to view applications for this job.');
    }

    const applications = await prisma.application.findMany({
      where: { jobId },
      include: {
        candidate: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return applications;
  }

  /**
   * Candidate views their own applications
   */
  async getCandidateApplications(candidateId: string) {
    const applications = await prisma.application.findMany({
      where: { candidateId },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            organization: { select: { name: true, slug: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return applications;
  }

  /**
   * Recruiter updates the status of a candidate's application
   */
  async updateApplicationStatus(
    recruiterId: string,
    applicationId: string,
    newStatus: ApplicationStatus
  ) {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true },
    });

    if (!app) throw new Error('Application not found.');
    if (app.job.recruiterId !== recruiterId) {
      throw new Error('Unauthorized to update this application.');
    }

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: { status: newStatus },
    });

    return updated;
  }

  /**
   * Get single application details (for recruiter or candidate)
   */
  async getApplicationById(
    userId: string,
    role: Role,
    applicationId: string
  ) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: { include: { organization: true, recruiter: true } },
        candidate: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    if (!application) throw new Error('Application not found.');

    // Authorization check
    const isRecruiterAccess =
      role === Role.RECRUITER && application.job.recruiterId === userId;
    const isCandidateAccess =
      role === Role.CANDIDATE && application.candidateId === userId;

    if (!isRecruiterAccess && !isCandidateAccess) {
      throw new Error('Unauthorized to view this application.');
    }

    return application;
  }
}