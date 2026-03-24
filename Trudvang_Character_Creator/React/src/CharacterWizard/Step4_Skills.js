import { useQuery } from '@apollo/client';
import { GET_SKILLS } from '../queries.js';
import { cpBreakdown, svCost } from './cpUtils.js';

export default function Step4_Skills({ form, update }) {
    const { loading, error, data } = useQuery(GET_SKILLS);

    function setSV(skillId, newSV) {
        const sv = Math.min(10, Math.max(1, parseInt(newSV) || 1));
        const rest = form.skills.filter(s => s.skillId !== skillId);
        update({ skills: sv > 1 ? [...rest, { skillId, sv }] : rest });
    }

    if (loading) return <p>Loading Skills...</p>
    if (error) return <p>Error loading skills.</p>;

    const cp = cpBreakdown(form);

    return (
        <div>
            <h3>Buy Skills &amp; Disciplines</h3>
            <p>
                CP Budget: <strong>{cp.budget}</strong> &nbsp;|
                Traits: <strong>{cp.traits}</strong> &nbsp;|
                Skills: <strong>{cp.skills}</strong> &nbsp;|
                Disciplines: <strong>{cp.disciplines}</strong>
                {cp.specialties > 0 && <span> &nbsp;| Specialties: <strong>{cp.specialties}</strong></span>}
                &nbsp;| Remaining: <strong>{cp.remaining}</strong>
            </p>
            {data.skills.map(s => {
                const charSkill = form.skills.find(sk => sk.skillId === s._id);
                const currentSV = charSkill?.sv ?? 1;
                return (
                    <details key={s._id} className="tc-panel" style={{ marginBottom: 8 }}>
                        <summary>
                            <strong>{s.name}</strong> ({s.category}) &nbsp;
                            SV: <select value={currentSV} onChange={e => setSV(s._id, e.target.value)}>
                                {[1,2,3,4,5,6,7,8,9,10].map(v => <option key={v} value={v}>{v} (cost {svCost(v)}CPs)</option>)}
                            </select>
                        </summary>
                        <div style={{ paddingLeft: 16, marginTop: 4 }}>
                            <em>{s.description}</em>
                        </div>
                    </details>
                );
            })}
            {cp.remaining < 0 && <p className="tc-error">Over CP budget by {-cp.remaining} CPs! Reduce traits, skills, or disciplines.</p>}
        </div>
    );
}