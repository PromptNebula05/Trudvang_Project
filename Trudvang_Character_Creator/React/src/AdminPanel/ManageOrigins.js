
import { useQuery } from '@apollo/client';
import { GET_ORIGINS } from '../queries';
import { Link } from 'react-router-dom';

export default function ManageOrigins() {
    const { loading, error, data } = useQuery(GET_ORIGINS);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <div className="tc-page">
            <div className="admin-nav">
                <Link to="/"><button className="btn-secondary">Dashboard</button></Link>
            </div>
            <h2>Admin - Origins</h2>
            <div className="tc-panel">
                <table>
                    <thead><tr><th>Culture</th><th>Race</th><th>Body Points</th><th>Max Movement (m/round)</th></tr></thead>
                    <tbody>
                        {data.origins.map(o => (
                            <tr key={o._id}>
                                <td>{o.culture}</td>
                                <td>{o.race}</td>
                                <td>{o.bodyPoints}</td>
                                <td>{o.maxMovement}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}