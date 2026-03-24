import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const characterSchema = new Schema({
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },    // 1-many
    archetype: { type: Schema.Types.ObjectId, ref: 'Archetype', required: true },
    origin: {type: Schema.Types.ObjectId, ref: 'Origin', required: true },

    name: { type: String, required: true },
    age: Number,
    height: Number,
    weight: Number,
    weaponHand: { type: String, enum: ['Right', 'Left', 'Both'] },
    // Creation Points budget: 300 = Beginner, 500 = Practiced, 700 = Experienced
    creationPoints: { type: Number, enum: [300, 500, 700], default: 300 },
    bodyPoints: Number,
    maxMovement: Number,
    // Traits: bought with CPs, range -4 to +4
    traits: { 
        charisma:   {type: Number, default: 0 },
        constitution:    {type: Number, default: 0},
        dexterity:       {type: Number, default: 0},
        intelligence:    {type: Number, default: 0},
        perception:    {type: Number, default: 0},
        psyche:    {type: Number, default: 0},
        strength:    {type: Number, default: 0}
    },

    // Skill Values: SV 1-10, all begin at 1; raising SV costs new level in CPs
    skills: [{
        skill: {type: Schema.Types.ObjectId, ref: 'Skill' },
        sv: { type: Number, min: 1, max: 10, default: 1 } // Skill Value
    }],

    // Disciplines: +1 per level to SV in scope; up to 5 levels
    // Cost per level: L1=7, L2=14, L3=21, L4=28, L5=35 CPs
    disciplines: [{
        skill: { type: Schema.Types.ObjectId, ref: 'Skill' },
        name: String,
        level: { type: Number, min: 1, max: 5 }
    }],

    // Specialties: +2 per level; requires parent discipline
    specialties: [{
        skill: { type: Schema.Types.ObjectId, ref: 'Skill' },
        discipline: String,
        name: String,
        level: { type: Number, min: 1, max: 5 }
    }],

    // Equipment
    equipment: [{
        item: { type: Schema.Types.ObjectId, ref: 'Equipment' },
        quantity: { type: Number, default: 1 }
    }],

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { collection: 'characters' });

export const Character = mongoose.model('Character', characterSchema);