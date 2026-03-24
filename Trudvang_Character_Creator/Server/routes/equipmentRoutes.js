import { Router } from 'express';
import { Equipment } from '../models/index.js';

const router = Router();

// GET all equipment
router.get('/', async (req, res) => {
    try {
        const equipment = await Equipment.find();
        res.json(equipment);
    } catch (err) {
        res.status(500).json({ error: err.message});
    }
});

// GET one equipment
router.get('/:id', async (req, res) => {
    try {
        const equipment = await Equipment.findById(req.params.id);
        if (!equipment) return res.status(404).json({ error: 'Not found' });
        res.json(equipment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create
router.post('/', async (req, res) => {
    try {
        const equipment = new Equipment(req.body);
        await equipment.save();
        res.status(201).json(equipment);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT update
router.put('/:id', async (req, res) => {
    try {
        const equipment = await Equipment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!equipment) return res.status(404).json({ error: 'Not found' });
        res.json(equipment);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE
router.delete('/:id', async (req, res) => {
    try {
        const equipment = await Equipment.findByIdAndDelete(req.params.id);
        if (!equipment) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message});
    }
});

export default router;