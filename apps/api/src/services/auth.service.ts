import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma, Role } from '@ai-interview/database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export class AuthService {
  
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
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
    });

    // Generate token
    const token = this.generateToken(user.id, user.role);

    return { user, token };
  }

      where: { email },
      include: {
        organization: true,
      },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = this.generateToken(user.id, user.role);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

    }
  }
}
