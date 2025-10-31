import express from 'express';
import { AuthService } from '../services/auth.service';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();
const authService = new AuthService();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;
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
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

// Current user
router.get('/me', authenticate, (req, res) => {
  res.status(200).json({ user: (req as any).user });
});

export default router;