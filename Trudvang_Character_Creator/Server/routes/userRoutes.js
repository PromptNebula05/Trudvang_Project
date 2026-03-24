import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/index.js';
import { signToken } from '../auth.js';

const router = Router();
const SALT_ROUNDS = 12;

// POST /api/users/register
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password)
            return res.status(400).json({ error: 'username and password required' });
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        const user = new User({ username, passwordHash });
        await user.save();

        const token = signToken(user);
        res.status(201).json({ token, username: user.username, role: user.role });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// POST /api/users/login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username: username.toLowerCase() });
        if (!user)
            return res.status(401).json({ error: 'Invalid credentials' });
        const valid = await user.comparePassword(password);
        if (!valid)
            return res.status(401).json({ error: 'Invalid credentials' });
        const token = signToken(user);
        res.json({ token, username: user.username, role: user.role });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/users/:id
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-passwordHash');
        if (!user) return res.status(404).json({ error: 'Not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;