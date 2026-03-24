import { cpBreakdown, CP_PER_TRAIT_POINT } from './cpUtils.js';

const TRAITS = ['charisma', 'constitution', 'dexterity', 'intelligence', 'perception', 'psyche', 'strength'];

function traitCpCost(val) { return val * CP_PER_TRAIT_POINT; }

export default function Step3_Traits({ form, update }) {
    const cp = cpBreakdown(form);

    function setTrait(key, val) {
        const v = Math.min(4, Math.max(-4, parseInt(val) || 0));
        update({ traits: { ...form.traits, [key]: v } });
    }

    return (
        <div>
            <h3>Allocate Traits - Creation Points: {cp.budget}</h3>
            <p>
                Each Trait ranges from -4 to +4. Positive traits cost CPs; negative traits refund CPs.
                Cost per point: 15 CPs. (+4=60 spent | +2=30 spent | +1=15 spent | -1=15 back | -2=30 back | -4=60 back)
            </p>
            <p>
                <strong>Traits: {cp.traits} CPs</strong>
                {cp.skills + cp.disciplines + cp.specialties > 0 && (
                    <span> &nbsp;| Skills: {cp.skills} | Disciplines: {cp.disciplines}{cp.specialties > 0 ? ` | Specialties: ${cp.specialties}` : ''}</span>
                )}
                &nbsp;| <strong>Remaining: {cp.remaining} CPs</strong>
            </p>
            {cp.remaining < 0 && <p className="tc-error">Over CP budget by {-cp.remaining} CPs!</p>}
            {TRAITS.map(k => (
                <div key={k} className="char-trait-row">
                    <span className="char-trait-label">{k}</span>
                    <button onClick={() => setTrait(k, (form.traits[k] || 0) - 1)} disabled={(form.traits[k] || 0) <= -4}>-</button>
                    <span className="char-trait-value">{form.traits[k] || 0}</span>
                    <button
                        onClick={() => setTrait(k, (form.traits[k] || 0) + 1)}
                        disabled={(form.traits[k] || 0) >= 4 || cp.remaining < CP_PER_TRAIT_POINT}
                    >+</button>
                    <span>({traitCpCost(form.traits[k] || 0) >= 0 ? '+' : ''}{traitCpCost(form.traits[k] || 0)} CPs)</span>
                </div>
            ))}
        </div>
    );
}