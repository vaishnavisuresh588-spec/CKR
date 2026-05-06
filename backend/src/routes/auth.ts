import express from 'express';
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

function makeToken(userId: string) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

/* ── POST /api/auth/signup ── */
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: 'All fields are required.' });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters.' });
      return;
    }

    const existing = await User.findOne({ email });
    if (existing) {
      res.status(409).json({ message: 'An account with this email already exists.' });
      return;
    }

    const user = await User.create({ name, email, password });
    const token = makeToken(String(user._id));

    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar || '' },
    });
  } catch (err: any) {
    console.error('[signup error]', err?.message || err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

/* ── POST /api/auth/login ── */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required.' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    const token = makeToken(String(user._id));

    res.status(200).json({
      message: 'Signed in successfully.',
      token,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar || '' },
    });
  } catch (err: any) {
    console.error('[login error]', err?.message || err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

/* ── GET /api/auth/me ── */
router.get('/me', async (req: Request, res: Response) => {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) { res.status(401).json({ message: 'No token.' }); return; }
    const token = auth.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) { res.status(404).json({ message: 'User not found.' }); return; }
    res.json({ user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar } });
  } catch {
    res.status(401).json({ message: 'Invalid token.' });
  }
});

/* ── PUT /api/auth/profile — save name, email, avatar ── */
router.put('/profile', async (req: Request, res: Response) => {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) { res.status(401).json({ message: 'No token.' }); return; }

    const token = auth.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const { name, email, avatar } = req.body;
    if (!name?.trim()) { res.status(400).json({ message: 'Name is required.' }); return; }

    // Check email uniqueness if changed
    if (email) {
      const conflict = await User.findOne({ email: email.toLowerCase(), _id: { $ne: decoded.userId } });
      if (conflict) { res.status(409).json({ message: 'Email already in use by another account.' }); return; }
    }

    const user = await User.findByIdAndUpdate(
      decoded.userId,
      { name: name.trim(), ...(email && { email: email.toLowerCase().trim() }), ...(avatar !== undefined && { avatar }) },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) { res.status(404).json({ message: 'User not found.' }); return; }

    res.json({
      message: 'Profile updated.',
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
    });
  } catch (err: any) {
    console.error('[profile error]', err?.message);
    res.status(500).json({ message: 'Server error.' });
  }
});

export default router;
