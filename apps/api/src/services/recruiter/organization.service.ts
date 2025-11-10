import { Plan, prisma, Role } from '@ai-interview/database';
import bcrypt from 'bcryptjs';

export class OrganizationService {
  /**
   * Recruiter creates an organization
   */
  async createOrganization(userId: string, data: { name: string; slug: string; plan?: string; settings?: any }) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== Role.RECRUITER) {
      throw new Error('Only recruiters can create organizations.');
    }

    // Create organization and link recruiter as a user
    const organization = await prisma.organization.create({
      data: {
        name: data.name,
        slug: data.slug,
        plan: (data.plan as any) || 'FREE',
        settings: data.settings || {},
        users: {
          connect: { id: user.id },
        },
      },
    });

    // Assign organizationId to recruiter
    await prisma.user.update({
      where: { id: user.id },
      data: { organizationId: organization.id },
    });

    return organization;
  }

  /**
   * Update organization details
   */
  async updateOrganization(
    id: string,
    userId: string,
    role: Role,
    data: { name?: string; slug?: string; plan?: Plan; settings?: any }
  ) {
    const organization = await prisma.organization.findUnique({ where: { id } });
    if (!organization) throw new Error('Organization not found.');

    if (role !== Role.RECRUITER && role !== Role.ADMIN) {
      throw new Error('Unauthorized to edit this organization.');
    }

    const updated = await prisma.organization.update({
      where: { id },
      data,
    });

    return updated;
  }

  /**
   * Delete organization (Recruiter/Admin only)
   */
  async deleteOrganization(id: string, role: Role) {
    if (role !== Role.RECRUITER && role !== Role.ADMIN) {
      throw new Error('Unauthorized to delete this organization.');
    }

    const organization = await prisma.organization.findUnique({ where: { id } });
    if (!organization) throw new Error('Organization not found.');

    await prisma.organization.delete({ where: { id } });
    return { message: 'Organization deleted successfully.' };
  }

  /**
   * Add a new user to an organization
   */
  async addUserToOrganization(
    orgId: string,
    recruiterId: string,
    data: { email: string; firstName?: string; lastName?: string; password: string; role: Role }
  ) {
    const recruiter = await prisma.user.findUnique({ where: { id: recruiterId } });
    if (!recruiter || recruiter.role !== Role.RECRUITER) {
      throw new Error('Only recruiters can add users.');
    }

    const organization = await prisma.organization.findUnique({ where: { id: orgId } });
    if (!organization) throw new Error('Organization not found.');

    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) throw new Error('A user with this email already exists.');

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newUser = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        role: data.role,
        firstName: data.firstName,
        lastName: data.lastName,
        organizationId: orgId,
        verified: true,
      },
    });

    return newUser;
  }

  /**
   * Get organization by ID
   */
  async getOrganizationById(orgId: string) {
    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            jobs: true,
            users: true,
          },
        },
      },
    });

    if (!organization) throw new Error('Organization not found.');

    return organization;
  }

  /**
   * Get all users of an organization
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