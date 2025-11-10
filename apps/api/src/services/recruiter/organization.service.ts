import { Plan, prisma, Role } from '@ai-interview/database';

export class OrganizationService {
  /**
   * Recruiter creates an organization
   */
  async createOrganization(
    userId: string,
    data: { name: string; slug: string; plan?: string; settings?: any }
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== Role.RECRUITER) {
      throw new Error('Only recruiters can create organizations.');
    }

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
    role: Role,
    data: { name?: string; slug?: string; plan?: Plan; settings?: any }
  ) {
    const organization = await prisma.organization.findUnique({ where: { id } });
    if (!organization) throw new Error('Organization not found.');

    if (role !== Role.RECRUITER && role !== Role.ADMIN) {
      throw new Error('Unauthorized to edit this organization.');
    }

    return prisma.organization.update({
      where: { id },
      data,
    });
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
   * Add an existing user to an organization (only if signed up)
   */
  async addUserToOrganization(
    orgId: string,
    recruiterId: string,
    data: { email: string; role: Role }
  ) {
    const recruiter = await prisma.user.findUnique({ where: { id: recruiterId } });
    if (!recruiter || recruiter.role !== Role.RECRUITER) {
      throw new Error('Only recruiters can add users.');
    }

    const organization = await prisma.organization.findUnique({ where: { id: orgId } });
    if (!organization) throw new Error('Organization not found.');

    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });

    if (!existingUser) {
      // Not signed up yet — invitation workflow could go here later
      return { message: `User ${data.email} has not signed up yet. Send Invitation mail.` };
    }

    if (existingUser.organizationId) {
      if (existingUser.organizationId === orgId) {
        throw new Error('User is already part of this organization.');
      } else {
        throw new Error('User belongs to another organization.');
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        organizationId: orgId,
        role: data.role,
      },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        organizationId: true,
      },
    });

    return {
      message: 'User added to organization successfully.',
      user: updatedUser,
    };
  }

  /**
   * Update a user's role or details within the organization
   */
  async updateUserInOrganization(
    orgId: string,
    recruiterId: string,
    userId: string,
    data: { role?: Role; firstName?: string; lastName?: string }
  ) {
    const recruiter = await prisma.user.findUnique({ where: { id: recruiterId } });
    if (!recruiter || recruiter.role !== Role.RECRUITER) {
      throw new Error('Only recruiters can update users.');
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.organizationId !== orgId) {
      throw new Error('User does not belong to this organization.');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: data.role || user.role,
        firstName: data.firstName ?? user.firstName,
        lastName: data.lastName ?? user.lastName,
      },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        organizationId: true,
      },
    });

    return { message: 'User updated successfully.', user: updatedUser };
  }

  /**
   * Remove user from organization (non-destructive)
   */
  async removeUserFromOrganization(orgId: string, recruiterId: string, userId: string) {
    const recruiter = await prisma.user.findUnique({ where: { id: recruiterId } });
    if (!recruiter || recruiter.role !== Role.RECRUITER) {
      throw new Error('Only recruiters can remove users.');
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found.');
    if (user.organizationId !== orgId) {
      throw new Error('User does not belong to this organization.');
    }

    const removedUser = await prisma.user.update({
      where: { id: userId },
      data: { organizationId: null },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        organizationId: true,
      },
    });

    return { message: 'User removed from organization successfully.', user: removedUser };
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