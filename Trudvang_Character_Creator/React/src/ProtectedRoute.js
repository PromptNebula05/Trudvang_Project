import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext.js';

export default function ProtectedRoute({ children, requiredRole }) {
    const { currentUser } = useAuth();
    if (!currentUser) return <Navigate to="/login" replace />;
    if (requiredRole && currentUser.role !== requiredRole) return <Navigate to="/" replace />;
    return children;
}