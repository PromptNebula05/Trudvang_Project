import { useQuery } from '@apollo/client';
import { GET_EQUIPMENT } from '../queries';

export default function Step5_Equipment({ form, update }) {
    const { loading, error, data } = useQuery(GET_EQUIPMENT);

    function toggle(itemId) {
        const exists = form.equipment.find(e => e.itemId === itemId);
        update({ equipment: exists ? form.equipment.filter(e => e.itemId !== itemId) : [...form.equipment, { itemId, quantity: 1 }] });
    }

    if (loading) return <p>Loading Equipment...</p>;
    if (error) return <p>Error loading equipment.</p>;

    const categories = [...new Set(data?.equipment.map(e => e.category))];

    return (
        <div>
            <h3>Choose Equipment</h3>
            {categories.map(cat => (
                <div key={cat}>
                    <div className="tc-section-header">{cat}</div>
                    {data.equipment.filter(e => e.category === cat).map(item => (
                        <label key={item._id}>
                            <input type="checkbox"
                                checked={!!form.equipment.find(e => e.itemId === item._id)}
                                onChange={() => toggle(item._id)} />
                            {' '}{item.name} {item.damage ? `(${item.damage})` : ''} {item.armor ? `[ARM ${item.armor}]` : ''} - {item.cost} silver
                        </label>
                    ))}
                </div>
            ))}
        </div>
    );
}