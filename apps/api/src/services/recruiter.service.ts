import bcrypt from 'bcryptjs';
import { prisma, Role, Plan } from '@ai-interview/database';

export class RecruiterService {
  async createOrganization(
    recruiterId: string,
    name: string,
    slug: string,
    plan: Plan = 'FREE',
    settings: any = {}
  ) {
    // ensure unique slug
    const existing = await prisma.organization.findUnique({ where: { slug } });
    if (existing) throw new Error('Organization slug already exists.');

    // create org + link recruiter
    const organization = await prisma.organization.create({
      data: {
        name,
        slug,
        plan,
        settings,
        users: {
          connect: { id: recruiterId },
        },
      },
    });

    // update recruiter orgId
    await prisma.user.update({
      where: { id: recruiterId },
      data: { organizationId: organization.id },
    });

    return organization;
  }

  /**
   * Update organization details (only recruiter or admin)
   */
  async updateOrganization(
    orgId: string,
    updaterRole: Role,
    data: { name?: string; slug?: string; plan?: Plan; settings?: any }
  ) {
    if (updaterRole !== 'RECRUITER' && updaterRole !== 'ADMIN') {
      throw new Error('Unauthorized to update organization.');
    }

    const org = await prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) throw new Error('Organization not found.');

    return prisma.organization.update({
      where: { id: orgId },
      data,
    });
  }

  /**
   * Delete organization (only recruiter or admin)
   */
  async deleteOrganization(orgId: string, role: Role) {
    if (role !== 'RECRUITER' && role !== 'ADMIN') {
      throw new Error('Unauthorized to delete organization.');
    }

    const org = await prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) throw new Error('Organization not found.');

    await prisma.organization.delete({ where: { id: orgId } });
    return { message: 'Organization deleted successfully.' };
  }

  /**
   * Add a new user to an organization (Recruiter only)
   */
  async addUserToOrganization(
    recruiterRole: Role,
    orgId: string,
    userData: {
      email: string;
      password: string;
      firstName?: string;
      lastName?: string;
      role: Role;
    }
  ) {
    if (recruiterRole !== 'RECRUITER') {
      throw new Error('Only recruiters can add users.');
    }

    const organization = await prisma.organization.findUnique({ where: { id: orgId } });
    if (!organization) throw new Error('Organization not found.');

    const existingUser = await prisma.user.findUnique({ where: { email: userData.email } });
    if (existingUser) throw new Error('User with this email already exists.');

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        organizationId: orgId,
        verified: true,
      },
    });

    return user;
  }

  /**
   * Get all users in an organization
   */
  async getOrganizationUsers(orgId: string) {
    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
      include: { users: true },
    });

    if (!organization) throw new Error('Organization not found.');
    return organization.users;
  }
}
