export const CP_PER_TRAIT_POINT = 15;
export const DISC_CP_COST = [0, 7, 14, 21, 28, 35];
export const SPEC_CP_COST = [0, 5, 10, 15, 20, 25];

export function svCost(sv) {
    let c = 0;
    for (let i = 2; i <= sv; i++) c += i;
    return c;
}

export function traitCpSpend(traits = {}) {
    return Object.values(traits).reduce((sum, v) => sum + (v * CP_PER_TRAIT_POINT), 0);
}

export function skillCpSpend(skills = []) {
    return skills.reduce((sum, sk) => sum + svCost(sk.sv), 0);
}

export function disciplineCpSpend(disciplines = []) {
    return disciplines.reduce((sum, d) => sum + (DISC_CP_COST[d.level] ?? 0), 0);
}

export function specialtyCpSpend(specialties = []) {
    return specialties.reduce((sum, sp) => sum + (SPEC_CP_COST[sp.level] ?? 0), 0);
}

/**
 * Returns a breakdown of all CP spending across every category.
 * @param {object} form - the wizard form state
 * @returns {{ traits, skills, disciplines, specialties, total, budget, remaining }}
 */
export function cpBreakdown(form) {
    const traits = traitCpSpend(form.traits);
    const skills = skillCpSpend(form.skills);
    const disciplines = disciplineCpSpend(form.disciplines);
    const specialties = specialtyCpSpend(form.specialties);
    const total = traits + skills + disciplines + specialties;
    const budget = form.creationPoints || 300;
    return { traits, skills, disciplines, specialties, total, budget, remaining: budget - total };
}