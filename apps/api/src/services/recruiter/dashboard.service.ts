import { prisma, JobStatus, JobVisibility, Role } from '@ai-interview/database';

export class JobsService {
  /**
   * Create a new job under a recruiter's organization
   */
  async createJob(
    recruiterId: string,
    data: {
      title: string;
      description: string;
      location?: string;
      salaryRange?: string;
      requirements?: string[];
      visibility?: JobVisibility;
    }
  ) {
    const recruiter = await prisma.user.findUnique({
      where: { id: recruiterId },
    });

    if (!recruiter || recruiter.role !== Role.RECRUITER) {
      throw new Error('Only recruiters can create jobs.');
    }

    if (!recruiter.organizationId) {
      throw new Error('Recruiter must belong to an organization.');
    }

    const job = await prisma.job.create({
      data: {
        title: data.title,
        description: data.description,
        location: data.location,
        salaryRange: data.salaryRange,
        requirements: data.requirements || [],
        visibility: data.visibility || JobVisibility.PUBLIC,
        recruiterId: recruiter.id,
        organizationId: recruiter.organizationId,
        status: JobStatus.DRAFT,
      },
    });

    return job;
  }

  /**
   * Get all jobs created by the recruiter
   */
  async getRecruiterJobs(recruiterId: string) {
    const recruiter = await prisma.user.findUnique({
      where: { id: recruiterId },
    });

    if (!recruiter || recruiter.role !== Role.RECRUITER) {
      throw new Error('Only recruiters can view their jobs.');
    }

    return prisma.job.findMany({
      where: { recruiterId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get all jobs in a recruiter's organization
   */
  async getOrganizationJobs(orgId: string) {
    return prisma.job.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get job by ID (with recruiter and organization details)
   */
  async getJobById(jobId: string) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        recruiter: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        organization: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    if (!job) throw new Error('Job not found.');
    return job;
  }

  /**
   * Update a job — only allowed for the recruiter who created it
   */
  async updateJob(
    recruiterId: string,
    jobId: string,
    data: Partial<{
      title: string;
      description: string;
      location: string;
      salaryRange: string;
      requirements: string[];
      status: JobStatus;
      visibility: JobVisibility;
    }>
  ) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new Error('Job not found.');

    if (job.recruiterId !== recruiterId) {
      throw new Error('Unauthorized to update this job.');
    }

    const updated = await prisma.job.update({
      where: { id: jobId },
      data,
    });

    return updated;
  }

  /**
   * Delete a job — only recruiter who created it can delete
   */
  async deleteJob(recruiterId: string, jobId: string) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new Error('Job not found.');

    if (job.recruiterId !== recruiterId) {
      throw new Error('Unauthorized to delete this job.');
    }

    await prisma.job.delete({ where: { id: jobId } });
    return { message: 'Job deleted successfully' };
  }

  /**
   * Change job status (e.g., DRAFT -> ONGOING -> CLOSED)
   */
  async updateJobStatus(recruiterId: string, jobId: string, newStatus: JobStatus) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new Error('Job not found.');

    if (job.recruiterId !== recruiterId) {
      throw new Error('Unauthorized to change job status.');
    }

    const updated = await prisma.job.update({
      where: { id: jobId },
      data: { status: newStatus },
    });

    return updated;
  }

  /**
   * Get all public & active jobs for candidates
   */
  async getPublicJobs() {
    return prisma.job.findMany({
      where: { visibility: JobVisibility.PUBLIC, status: JobStatus.ONGOING },
      orderBy: { createdAt: 'desc' },
      include: {
        organization: { select: { name: true, slug: true } },
      },
    });
  }
}