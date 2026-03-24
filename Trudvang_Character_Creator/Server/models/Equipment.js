import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const equipmentSchema = new Schema({
    name: { type: String, required: true, unique: true },  // e.g. "Virann"
    category: { type: String, enum: ['Weapon', 'Armor', 'Shield', 'Gear' ] },
    damage:     String,     // e.g. "1d8"
    armor:      Number,
    weight:     Number,
    cost:       Number      // in silver
}, { collection: 'equipment' });

export const Equipment = mongoose.model('Equipment', equipmentSchema);