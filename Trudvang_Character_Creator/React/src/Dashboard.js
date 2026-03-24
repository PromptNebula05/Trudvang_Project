import { useQuery } from '@apollo/client';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext.js';
import { MY_CHARACTERS } from './queries.js';

export default function Dashboard() {
    const { currentUser } = useAuth();
    const { loading, error, data } = useQuery(MY_CHARACTERS);
    const navigate = useNavigate();

    return (
        <div className="tc-page">
            <h1>Welcome, {currentUser?.username}</h1>
            <div className="tc-action-bar">
                <button onClick={() => navigate('/create')}>+ New Character</button>
            </div>
            <h2>Your Characters</h2>
            {loading && <p className="loader">Loading...</p>}
            {error && <p className="tc-error">Error: {error.message}</p>}
            <ul>
                {data?.myCharacters.map(c => (
                    <li key={c._id}>
                        <Link to={`/character/${c._id}`}>{c.name}</Link>
                        &nbsp;- {c.archetype?.name} / {c.origin?.culture} ({c.origin?.race})
                    </li>
                ))}
            </ul>
        </div>
    );
}