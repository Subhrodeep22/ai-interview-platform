import express, { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();
const authService = new AuthService();

router.post('/register', async (req: Request, res: Response) => {
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
})

router.post('/login', async (req: Request, res: Response) => {
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
});

router.get('/me', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  res.status(200).json({ user });
});

export default router;