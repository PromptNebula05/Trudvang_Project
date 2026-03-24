import { useQuery } from '@apollo/client';
import { GET_SKILLS } from '../queries.js';
import { cpBreakdown, DISC_CP_COST, SPEC_CP_COST } from './cpUtils.js';

// Minimum SV required to purchase each discipline level
const DISC_SV_REQ = [0, 4, 7, 7, 10, 10];

export default function Step5_Disciplines({ form, update }) {
    const { loading, error, data } = useQuery(GET_SKILLS);

    function setDiscLevel(skillId, discName, level) {
        const rest = form.disciplines.filter(d => !(d.skillId === skillId && d.name === discName));
        update({ disciplines: level > 0 ? [...rest, { skillId, name: discName, level }] : rest });
    }

    function setSpecLevel(skillId, discName, specName, level) {
        const rest = form.specialties.filter(sp => !(sp.skillId === skillId && sp.discipline === discName && sp.name === specName));
        update({ specialties: level > 0 ? [...rest, { skillId, discipline: discName, name: specName, level }] : rest });
    }

    if (loading) return <p>Loading Skills...</p>;
    if (error) return <p>Error loading skills.</p>;

    const cp = cpBreakdown(form);

    // Only show skills the character has invested in (SV > 1) or that have disciplines worth browsing
    const relevantSkills = data.skills.filter(s => {
        const charSkill = form.skills.find(sk => sk.skillId === s._id);
        return charSkill && charSkill.sv >= DISC_SV_REQ[1] && s.disciplines?.length > 0;
    });

    return (
        <div>
            <h3>Choose Disciplines &amp; Specialties</h3>
            <p>
                CP Budget: <strong>{cp.budget}</strong> &nbsp;|
                Traits: <strong>{cp.traits}</strong> &nbsp;|
                Skills: <strong>{cp.skills}</strong> &nbsp;|
                Disciplines: <strong>{cp.disciplines}</strong> &nbsp;|
                Specialties: <strong>{cp.specialties}</strong> &nbsp;|
                Remaining: <strong>{cp.remaining}</strong>
            </p>
            <p><small>Only skills with SV ≥ 4 and available disciplines are shown. Discipline levels 1–5 cost {DISC_CP_COST.slice(1).join(' / ')} CPs. Specialty levels cost {SPEC_CP_COST.slice(1).join(' / ')} CPs.</small></p>
            {relevantSkills.length === 0 && (
                <p className="tc-error">No skills qualify yet. Go back and raise at least one skill to SV 4 or higher.</p>
            )}
            {relevantSkills.map(s => {
                const charSkill = form.skills.find(sk => sk.skillId === s._id);
                const currentSV = charSkill?.sv ?? 1;
                return (
                    <details key={s._id} className="tc-panel" style={{ marginBottom: 8 }}>
                        <summary><strong>{s.name}</strong> (SV {currentSV})</summary>
                        <div style={{ paddingLeft: 16, marginTop: 8 }}>
                            {s.disciplines.map(d => {
                                const owned = form.disciplines.find(fd => fd.skillId === s._id && fd.name === d.name);
                                const discLvl = owned?.level ?? 0;
                                const maxDiscLvl = currentSV >= 10 ? 5 : currentSV >= 7 ? 3 : 1;
                                return (
                                    <div key={d.name} style={{ marginBottom: 8 }}>
                                        <strong>{d.name}</strong>
                                        &nbsp;<small>{d.description}</small>
                                        &nbsp;—&nbsp;
                                        <label style={{ display: 'inline', textTransform: 'none', fontSize: '0.85rem' }}>Level:</label>
                                        &nbsp;
                                        <select
                                            value={discLvl}
                                            onChange={e => setDiscLevel(s._id, d.name, parseInt(e.target.value))}
                                            style={{ width: 'auto' }}
                                        >
                                            <option value={0}>None</option>
                                            {[1, 2, 3, 4, 5].map(lv => (
                                                <option key={lv} value={lv} disabled={lv > maxDiscLvl}>
                                                    L{lv} ({DISC_CP_COST[lv]} CPs){lv > maxDiscLvl ? ' — need higher SV' : ''}
                                                </option>
                                            ))}
                                        </select>
                                        {/* Specialties — only shown when discipline is owned at L1+ */}
                                        {discLvl > 0 && d.specialties?.length > 0 && (
                                            <div style={{ paddingLeft: 16, marginTop: 4 }}>
                                                <small><strong>Specialties</strong></small>
                                                {d.specialties.map(sp => {
                                                    const ownedSp = form.specialties.find(fsp =>
                                                        fsp.skillId === s._id && fsp.discipline === d.name && fsp.name === sp.name
                                                    );
                                                    const spLvl = ownedSp?.level ?? 0;
                                                    return (
                                                        <div key={sp.name} style={{ marginLeft: 8, marginTop: 2 }}>
                                                            <strong>{sp.name}</strong>
                                                            &nbsp;<small>{sp.description}</small>
                                                            &nbsp;—&nbsp;
                                                            <label style={{ display: 'inline', textTransform: 'none', fontSize: '0.85rem' }}>Level:</label>
                                                            &nbsp;
                                                            <select
                                                                value={spLvl}
                                                                onChange={e => setSpecLevel(s._id, d.name, sp.name, parseInt(e.target.value))}
                                                                style={{ width: 'auto' }}
                                                            >
                                                                <option value={0}>None</option>
                                                                {[1, 2, 3, 4, 5].map(lv => (
                                                                    <option key={lv} value={lv}>
                                                                        L{lv} ({SPEC_CP_COST[lv]} CPs)
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </details>
                );
            })}
            {cp.remaining < 0 && <p className="tc-error">Over CP budget by {-cp.remaining} CPs!</p>}
        </div>
    );
}
