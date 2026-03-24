import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const originSchema = new Schema({
    race: { type: String, required: true, enum: ['Human', 'Elf', 'Dwarf'] },
    culture: { type: String, required: true, unique: true },  // e.g. "Viraans"
    description: String,
    bodyPoints: { type: Number, required: true },  // Human 32 | Elf 30 | Buratja 28 | Borjornikkas 30
    maxMovement: { type: Number, required: true }  // Human 10 | Elf 12 | Dwarf 8
}, { collection: 'origins' });

export const Origin = mongoose.model('Origin', originSchema);