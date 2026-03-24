import { useQuery } from '@apollo/client';
import { GET_ORIGINS } from '../queries.js';

export default function Step1_Origin({ form, update }) {
    const { loading, error, data } = useQuery(GET_ORIGINS);
    if (loading) return <p>Loading Origins...</p>;
    if (error) return <p>Error loading Origins.</p>;

    return (
        <div>
            <h3>Select Your Origin</h3>
            <div>
                <label>Character Name: </label>
                <input value={form.name} onChange={e => update({ name: e.target.value })} required />
            </div>
            {data.origins.map(o => (
                <div key={o._id}
                    className="tc-panel"
                    style={{ cursor: 'pointer', borderColor: form.originId === o._id ? 'var(--tc-rust)' : undefined, borderWidth: form.originId === o._id ? 2 : undefined }}
                    onClick={() => update({ originId: o._id })}>
                    <strong>{o.culture}</strong> <em>({o.race})</em>
                    <p>{o.description}</p>
                    <small>
                        Body Points: <strong>{o.bodyPoints}</strong>
                        &nbsp;|&nbsp;
                        Max Movement: <strong>{o.maxMovement} m/round</strong>
                    </small>
                </div>
            ))}
        </div>
    );
}