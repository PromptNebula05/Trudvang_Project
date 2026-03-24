import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_CHARACTER } from './queries.js';

export default function CharacterSheet() {
    const { id } = useParams();
    const { loading, error, data } = useQuery(GET_CHARACTER, { variables: { id } });

    if (loading) return <p>Loading character...</p>;
    if (error) return <p>Error: {error.message}</p>;

    const c = data.character;
    return (
        <div className="tc-page">
            <Link to="/">Back to Dashboard</Link>
            <h1>{c.name}</h1>
            <div className="tc-panel">
                <p><strong>Archetype:</strong> {c.archetype?.name} &nbsp; <strong>Origin:</strong> {c.origin?.culture} ({c.origin?.race})</p>
                <p><strong>Creation/Adventure Points:</strong> {c.creationPoints} &nbsp; <strong>Age:</strong> {c.age}</p>
            </div>

            <div className="tc-section-header">Traits</div>
            <div className="tc-panel">
                <div className="char-sheet-grid">
                    {Object.entries(c.traits)
                        .filter(([k]) => k !== '__typename')
                        .map(([k, v]) => (
                            <div key={k} className="char-trait-row">
                                <span className="char-trait-label">{k}</span>
                                <span className="char-trait-value">{v}</span>
                            </div>
                        ))}
                </div>
            </div>

            <div className="tc-section-header">Skills</div>
            <div className="tc-panel">
                <ul>{c.skills.map((s, i) => <li key={i}>{s.skill?.name} — SV {s.sv}</li>)}</ul>
            </div>

            <div className="tc-section-header">Disciplines</div>
            <div className="tc-panel">
                <ul>{c.disciplines.length
                    ? c.disciplines.map((d, i) => <li key={i}>{d.name} (Level {d.level})</li>)
                    : <li>None</li>}
                </ul>
            </div>

            <div className="tc-section-header">Specialties</div>
            <div className="tc-panel">
                <ul>{c.specialties.length
                    ? c.specialties.map((sp, i) => <li key={i}>{sp.name} [{sp.discipline}] (Level {sp.level})</li>)
                    : <li>None</li>}
                </ul>
            </div>

            <div className="tc-section-header">Equipment</div>
            <div className="tc-panel">
                <ul>{c.equipment.map((e, i) => <li key={i}>{e.item?.name} x{e.quantity}</li>)}</ul>
            </div>
        </div>
    );
}