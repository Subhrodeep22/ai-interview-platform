import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { email, password, firstName, lastName, role } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const result = await authService.register({
        email,
        password,
        firstName,
        lastName,
        role,
      });

      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const result = await authService.login(email, password);

      res.json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  async me(req: Request, res: Response) {
    try {
      // req.user is set by auth middleware
      res.json({ user: (req as any).user });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
