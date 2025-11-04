import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { Role } from '@ai-interview/database';

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret';
const JWT_EXPIRES_IN = '7d';

export class AuthService {
  async register(data: {
    email: string
    password: string
    firstName?: string
    lastName?: string
    role?: Role
  }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role || Role.CANDIDATE,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    })

    const token = this.generateToken(user.id, user.role);

    return { user, token };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { organization: true },
    })
    if (!user) throw new Error('Invalid credentials');

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error('Invalid credentials');

    const token = this.generateToken(user.id, user.role);

    const { password: _, ...safeUser } = user;

    return { user: safeUser, token };
  }

  private generateToken(userId: string, role: Role): string {
    return jwt.sign({ userId, role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    })
  }

  verifyToken(token: string) {
    try {
      return jwt.verify(token, JWT_SECRET) as { userId: string; role: Role };
    } catch {
      throw new Error('Invalid or expired token');
    }
  }
}