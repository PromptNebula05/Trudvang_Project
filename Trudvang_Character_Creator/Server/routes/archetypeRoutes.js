import { Router } from 'express';
import { Archetype } from '../models/index.js';

const router = Router();

// GET all archetypes
router.get('/', async (req, res) => {
    try {
        const archetypes = await Archetype.find();
        res.json(archetypes);
    } catch (err) {
        res.status(500).json({ error: err.message});
    }
});

// GET one archetype
router.get('/:id', async (req, res) => {
    try {
        const archetype = await Archetype.findById(req.params.id);
        if (!archetype) return res.status(404).json({ error: 'Not found' });
        res.json(archetype);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create
router.post('/', async (req, res) => {
    try {
        const archetype = new Archetype(req.body);
        await archetype.save();
        res.status(201).json(archetype);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT update
router.put('/:id', async (req, res) => {
    try {
        const archetype = await Archetype.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!archetype) return res.status(404).json({ error: 'Not found' });
        res.json(archetype);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE
router.delete('/:id', async (req, res) => {
    try {
        const archetype = await Archetype.findByIdAndDelete(req.params.id);
        if (!archetype) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message});
    }
});

export default router;