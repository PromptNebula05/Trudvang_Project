import { useQuery } from '@apollo/client';
import { GET_ARCHETYPES } from '../queries';

export default function Step2_Archetype({ form, update }) {
    const { loading, error, data } = useQuery(GET_ARCHETYPES);
    if (loading) return <p>Loading Archetypes...</p>;
    if (error) return <p>Error loading Archetypes.</p>;

    return (
        <div>
            <h3>Select Your Archetype</h3>
            {data.archetypes.map(a => (
                <div key={a._id}
                    className="tc-panel"
                    style={{ cursor: 'pointer', borderColor: form.archetypeId === a._id ? 'var(--tc-rust)' : undefined, borderWidth: form.archetypeId === a._id ? 2 : undefined }}
                    onClick={() => update({ archetypeId: a._id, skills: [], disciplines: [] })}>
                    <strong>{a.name}</strong> - Core Skills: {a.coreSkillNames?.join(', ')}
                    <p>{a.description}</p>
                </div>
            ))}
        </div>
    );
}