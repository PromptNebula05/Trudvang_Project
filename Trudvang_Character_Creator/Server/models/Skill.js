import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const disciplineSchema = new Schema({
    name: { type: String, required: true },
    description: String,
    specialties: [{
        name: { type: String, required: true },
        description: String
    }]
}, {_id: false });

const skillSchema = new Schema({
    name: { type: String, required: true, unique: true },  // e.g. "Swords"
    category: {type: String, enum: ['Physical', 'Combat', 'Survival', 'Social', 'Magical', 'Intellectual', 'Stealth', 'Spiritual'] },
    description: String,
    maxSV: { type: Number, default: 10 },
    disciplines: [disciplineSchema]
}, { collection: 'skills' });

export const Skill = mongoose.model('Skill', skillSchema);