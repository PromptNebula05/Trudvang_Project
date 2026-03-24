import { useQuery } from '@apollo/client';
import { GET_EQUIPMENT } from '../queries';
import { Link } from 'react-router-dom';

export default function ManageEquipment() {
    const { loading, error, data } = useQuery(GET_EQUIPMENT);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <div className="tc-page">
            <div className="admin-nav">
                <Link to="/"><button className="btn-secondary">Dashboard</button></Link>
            </div>
            <h2>Admin - Equipment</h2>
            <div className="tc-panel">
                <table>
                    <thead><tr><th>Name</th><th>Category</th><th>Damage</th><th>Armor</th><th>Cost (silver)</th></tr></thead>
                    <tbody>
                        {data.equipment.map(e => (
                            <tr key={e._id}>
                                <td>{e.name}</td>
                                <td>{e.category}</td>
                                <td>{e.damage || '-'}</td>
                                <td>{e.armor ?? '-'}</td>
                                <td>{e.cost}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}