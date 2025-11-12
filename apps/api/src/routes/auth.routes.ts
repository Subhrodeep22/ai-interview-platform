import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { prisma, Role } from '@ai-interview/database';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 */
router.post('/register', AuthController.register);

/**
 * @route POST /api/auth/login
 * @desc Log in an existing user
 */
router.post('/login', AuthController.login);

/**
 * @route GET /api/auth/me
 * @desc Get the authenticated user's profile
 */
router.get('/me', authenticate, AuthController.me);

export default router;