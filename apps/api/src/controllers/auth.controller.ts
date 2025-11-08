import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

export class AuthController {
  /**
   * @route POST /api/auth/register
   * @desc Register a new user
   */
  static async register(req: Request, res: Response) {
    try {
      const { email, password, firstName, lastName, role } = req.body;

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

  /**
   * @route POST /api/auth/login
   * @desc Log in an existing user
   */
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const result = await authService.login(email, password);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  /**
   * @route GET /api/auth/me
   * @desc Get the authenticated user's profile
   */
  static async me(req: Request, res: Response) {
    const user = (req as any).user;
    res.status(200).json({ user });
  }
}