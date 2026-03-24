import { Router } from 'express';
import { Character, Archetype } from '../models/index.js';
import { validateCharacter } from '../middleware/validateCharacter.js';

const router = Router();

// GET all (admin overview)
router.get('/', async (req, res) => {
    try {
        const chars = await Character.find()
            .populate('owner', 'username')
            .populate('archetype', 'name')
            .populate('origin', 'name')
            .populate('skills.skill', 'name category')
            .populate('equipment.item', 'name category');
        res.json(chars);
    } catch (err) {
        res.status(500).json({ error: err.message});
    }
});

// GET one
router.get('/:id', async (req, res) => {
    try {
        const char = await Character.findById(req.params.id)
            .populate('owner', 'username')
            .populate('archetype')
            .populate('origin')
            .populate('skills.skill')
            .populate('equipment.item');
        if (!char) return res.status(404).json({ error: 'Not found' });
        res.json(char);
    } catch (err) {
        res.status(500).json({ error: err.message});
    }
});

// POST create - validateCharacter runs BEFORE the handler
router.post('/', validateCharacter,async (req, res) => {
    try {
        const char = new Character({ ...req.body, updatedAt: Date.now() });
        await char.save();
        res.status(201).json(char);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT update
router.put('/:id', validateCharacter, async (req, res) => {
    try {
        const char = await Character.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true, runValidators: true });
        if (!char) return res.status(404).json({ error: 'Not found' });
        res.json(char);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE
router.delete('/:id', async (req, res) => {
    try {
        const char = await Character.findByIdAndDelete(req.params.id);
        if (!char) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Deleted', id: req.params.id });
    } catch (err) {
        res.status(500).json({ error: err.message});
    }
});

export default router;