import { useMutation, useQuery } from '@apollo/client';
import { GET_ARCHETYPES, DELETE_ARCHETYPE } from '../queries';
import { Link } from 'react-router-dom';

export default function ManageArchetypes() {
    const { loading, error, data, refetch } = useQuery(GET_ARCHETYPES);
    const [deleteArchetype] = useMutation(DELETE_ARCHETYPE, { onCompleted: () => refetch() });

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <div className="tc-page">
            <div className="admin-nav">
                <Link to="/"><button className="btn-secondary">Dashboard</button></Link>
            </div>
            <h2>Admin - Archetypes</h2>
            <div className="tc-panel">
                <table>
                    <thead><tr><th>Name</th><th>Core Skills</th><th>Actions</th></tr></thead>
                    <tbody>
                        {data.archetypes.map(a => (
                            <tr key={a._id}>
                                <td>{a.name}</td>
                                <td>{a.coreSkillNames?.join(', ')}</td>
                                <td>
                                    <button className="btn-danger" onClick={() => deleteArchetype({ variables: { id: a._id } })}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}