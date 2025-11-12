import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { prisma, Role } from "@ai-interview/database";

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

router.post("/", async (req: Request, res: Response) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: "Missing credential" });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(400).json({ error: "Invalid Google token" });
    }

    const { email, given_name, family_name, sub, picture } = payload;

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: email!,
          firstName: given_name,
          lastName: family_name,
          password: sub,
          role: Role.RECRUITER,
          verified: true,
        },
      });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json({ user, token });
  } catch (error) {
    console.error("Google auth error:", error);
    return res.status(500).json({ error: "Google authentication failed" });
  }
});

export default router;