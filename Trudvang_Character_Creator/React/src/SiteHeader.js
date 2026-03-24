import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext.js';

export default function SiteHeader() {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Don't show the header on the login page
    if (!currentUser || location.pathname === '/login') return null;

    return (
        <header className="App-header">
            <span className="App-header-title" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                Trudvang Chronicles
            </span>
            <nav className="App-header-nav">
                <button className="btn-secondary" onClick={() => navigate('/')}>Dashboard</button>
                {currentUser.role === 'admin' && (
                    <button className="btn-secondary" onClick={() => navigate('/admin')}>Admin Panel</button>
                )}
                <button className="btn-secondary" onClick={logout}>Log Out</button>
            </nav>
        </header>
    );
}
