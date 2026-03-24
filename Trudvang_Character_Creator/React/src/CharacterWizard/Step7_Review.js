import { useQuery } from '@apollo/client';
import { GET_ORIGINS, GET_ARCHETYPES, GET_SKILLS, GET_EQUIPMENT } from '../queries.js';

export default function Step6_Review({ form, onSubmit, loading, error }) {
    const { data: originsData }    = useQuery(GET_ORIGINS);
    const { data: archetypesData } = useQuery(GET_ARCHETYPES);
    const { data: skillsData }     = useQuery(GET_SKILLS);
    const { data: equipmentData }  = useQuery(GET_EQUIPMENT);

    const origin    = originsData?.origins.find(o => o._id === form.originId);
    const archetype = archetypesData?.archetypes.find(a => a._id === form.archetypeId);

    function skillName(skillId) {
        return skillsData?.skills.find(s => s._id === skillId)?.name ?? skillId;
    }
    function itemName(itemId) {
        return equipmentData?.equipment.find(e => e._id === itemId)?.name ?? itemId;
    }

    return (
        <div className="tc-panel">
            <div className="tc-section-header">Review Your Character</div>
            <p><strong>Name:</strong> {form.name || '(unnamed)'}</p>
            <p><strong>Origin:</strong> {origin ? `${origin.culture} (${origin.race})` : form.originId || 'not selected'}</p>
            <p><strong>Archetype:</strong> {archetype?.name ?? form.archetypeId ?? 'not selected'}</p>
            <div className="tc-section-header">Traits</div>
            <ul>{Object.entries(form.traits).map(([k, v]) => <li key={k} style={{ textTransform: 'capitalize' }}>{k}: {v}</li>)}</ul>
            <div className="tc-section-header">Skills ({form.skills.reduce((s, sk) => s + sk.sv, 0)} CP spent on SVs)</div>
            <ul>{form.skills.length
                ? form.skills.map((s, i) => <li key={i}>{skillName(s.skillId)} - SV {s.sv}</li>)
                : <li>None</li>}
            </ul>
            <div className="tc-section-header">Disciplines</div>
            <ul>{form.disciplines.length
                ? form.disciplines.map((d, i) => <li key={i}>{skillName(d.skillId)} — {d.name} (Level {d.level})</li>)
                : <li>None</li>}
            </ul>
            <div className="tc-section-header">Specialties</div>
            <ul>{form.specialties.length
                ? form.specialties.map((sp, i) => <li key={i}>{skillName(sp.skillId)} — {sp.name} [{sp.discipline}] (Level {sp.level})</li>)
                : <li>None</li>}
            </ul>
            <div className="tc-section-header">Equipment</div>
            <ul>{form.equipment.length
                ? form.equipment.map((e, i) => <li key={i}>{itemName(e.itemId)} x{e.quantity}</li>)
                : <li>None</li>}
            </ul>
            {error && <p className="tc-error">Error: {error.message}</p>}
            <button onClick={onSubmit} disabled={loading || !form.name || !form.originId || !form.archetypeId}>
                {loading ? 'Saving...' : 'Save Character'}
            </button>
        </div>
    );
}