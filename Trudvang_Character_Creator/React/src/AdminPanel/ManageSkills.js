import { useMutation, useQuery } from '@apollo/client';
import { GET_SKILLS, DELETE_SKILL } from '../queries';
import { Link } from 'react-router-dom';

export default function ManageSkills() {
    const { loading, error, data, refetch } = useQuery(GET_SKILLS);
    const [deleteSkill] = useMutation(DELETE_SKILL, { onCompleted: () => refetch() });

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <div className="tc-page">
            <div className="admin-nav">
                <Link to="/"><button className="btn-secondary">Dashboard</button></Link>
            </div>
            <h2>Admin - Skills</h2>
            <div className="tc-panel">
                <table>
                    <thead><tr><th>Name</th><th>Category</th><th>Description</th><th>Actions</th></tr></thead>
                    <tbody>
                        {data.skills.map(a => (
                            <tr key={a._id}>
                                <td>{a.name}</td>
                                <td>{a.category}</td>
                                <td>{a.description}</td>
                                <td>
                                    <button className="btn-danger" onClick={() => deleteSkill({ variables: { id: a._id } })}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}