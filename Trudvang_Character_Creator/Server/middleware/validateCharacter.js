import { Skill } from '../models/index.js'

const TRAIT_KEYS = ['charisma', 'constitution', 'dexterity', 'intelligence', 'perception', 'psyche', 'strength'];
const TRAIT_MIN = -4;
const TRAIT_MAX = 4;
const CREATION_POINT_BUDGETS = [300, 500, 700];

// Trait Cost:
// Each trait point = 15 CPs. Positive values spend CPs; negative values refund.
const TRAIT_CP_PER_POINT = 15;

function traitCpCost(val) { return val * TRAIT_CP_PER_POINT; }

function totalTraitCpCost(traits = {}) {
    return TRAIT_KEYS.reduce((sum, k) => sum + traitCpCost(traits[k] || 0), 0);
}

// Skill Value Cost:
// Raising SV costs CPs equal to new level reached.
// SV 1->2 = 2 pts | 1->3 = 5 pts | 1->10 = 54 pts
function svCost(sv) {
    let cost = 0;
    for (let i = 2; i <= sv; i++) cost += i;
    return cost;
}

// Discipline / Specialty Cost: 
// Level | SV Requirement | Cost
//   1   |       4        |  7
//   2   |       7        | 14
//   3   |       7        | 21
//   4   |      10        | 28
//   5   |      10        | 35
const DISC_COST = [0, 7, 14, 21, 28, 35];
const DISC_SV_REQ = [0, 4, 7, 7, 10, 10];

export async function validateCharacter(req, res, next) {
    try {
        const { traits, skills, disciplines, specialties, creationPoints } = req.body;

        // 1. Creation Points budget must be 300, 500, or 700
        if (creationPoints && !CREATION_POINT_BUDGETS.includes(Number(creationPoints)))
            return res.status(400).json({ error: 'creationPoints must be 300, 500, or 700.' });

        // 2. Traits: each in [-4, +4]
        if (traits) {
            for (const key of TRAIT_KEYS) {
                const val = traits[key] ?? 0;
                if (val < TRAIT_MIN || val > TRAIT_MAX)
                    return res.status(400).json({ error: `Trait "${key}" must be between ${TRAIT_MIN} and ${TRAIT_MAX}.` });
            }
        }

        // 3. Skill Values: each SV in [1, 10]
        if (skills && skills.length) {
            for (const s of skills) {
                if (s.sv < 1 || s.sv > 10)
                    return res.status(400).json({ error: `Skill SV must be between 1 and 10 (got ${s.sv}).` });
            }
        }

        // 4. Disciplines: level in [1, 5], SV requirement met
        if (disciplines && disciplines.length) {
            for (const d of disciplines) {
                if (d.level < 1 || d.level > 5)
                    return res.status(400).json({ error: `Discipline level must be 1-5.` });
                const charSkill = skills?.find(s => String(s.skill) === String(d.skill));
                const charSV = charSkill?.sv ?? 1;
                if (charSV < DISC_SV_REQ[d.level])
                    return res.status(400).json({ error: `Discipline "${d.name}" level ${d.level} requires SV >= ${DISC_SV_REQ[d.level]} (character has SV ${charSV}).` });
            }
        }

        // 5. Specialties: same level/SV checks; parent discipline must exist
        if (specialties && specialties.length) {
            for (const sp of specialties) {
                if (sp.level < 1 || sp.level > 5)
                    return res.status(400).json({ error: 'Specialty level must be 1-5.' });
                const hasDiscipline = disciplines?.some(d => String(d.skill) === String(sp.skill) && d.name === sp.discipline);
                if (!hasDiscipline)
                    return res.status(400).json({ error: `Specialty "${sp.name}" requires discipline "${sp.discipline}" to be learned first.` });
            }
        }

        next();
    } catch (err) {
        res.status(500).json({ error: 'Validation error: ' + err.message });
    }
}