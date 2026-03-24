import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const archetypeSchema = new Schema({
    name: { type: String, required: true, unique: true },  // e.g. "Warrior"
    description: String,
    coreSkillNames: [String],  // the skills that receive bonus CPs
    equipmentRestrictions: [String]
}, { collection: 'archetypes' });

export const Archetype = mongoose.model('Archetype', archetypeSchema);