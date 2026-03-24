import { Router } from 'express';
import { Origin } from '../models/index.js';

const router = Router();

// GET all origins
router.get('/', async (req, res) => {
    try {
        const origins = await Origin.find();
        res.json(origins);
    } catch (err) {
        res.status(500).json({ error: err.message});
    }
});

// GET one origin
router.get('/:id', async (req, res) => {
    try {
        const origin = await Origin.findById(req.params.id);
        if (!origin) return res.status(404).json({ error: 'Not found' });
        res.json(origin);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create
router.post('/', async (req, res) => {
    try {
        const origin = new Origin(req.body);
        await origin.save();
        res.status(201).json(origin);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT update
router.put('/:id', async (req, res) => {
    try {
        const origin = await Origin.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!origin) return res.status(404).json({ error: 'Not found' });
        res.json(origin);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE
router.delete('/:id', async (req, res) => {
    try {
        const origin = await Origin.findByIdAndDelete(req.params.id);
        if (!origin) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message});
    }
});

export default router;