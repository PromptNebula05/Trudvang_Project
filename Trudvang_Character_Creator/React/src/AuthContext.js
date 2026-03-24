import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

/**
 * Decode a JWT and return the payload, or null if invalid/expired.
 */
function decodeAndValidateToken(token) {
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // exp is in seconds; Date.now() is in milliseconds
        if (payload.exp && payload.exp * 1000 < Date.now()) {
            return null; // token is expired
        }
        return payload;
    } catch {
        return null;
    }
}

/**
 * Wrap the application in <AuthProvider> to make auth state available everywhere.
 */
export function AuthProvider({ children }) {

    // On page refresh, attempt to restore the session from localStorage
    // but only if the stored token is still valid and not expired.
    const [currentUser, setCurrentUser] = useState(() => {
        const token = localStorage.getItem('authToken');
        const username = localStorage.getItem('authUsername');
        const role = localStorage.getItem('authRole');
        if (token && username && role) {
            const payload = decodeAndValidateToken(token);
            if (payload) {
                return { username, role };
            }
            // Token is invalid or expired — clear stale data
            localStorage.removeItem('authToken');
            localStorage.removeItem('authUsername');
            localStorage.removeItem('authRole');
        }
        return null;
    });

    function login(userInfo) {
        // userInfo = { username, role } (token is already in localStorage from Login.js)
        localStorage.setItem('authUsername', userInfo.username);
        localStorage.setItem('authRole', userInfo.role);
        setCurrentUser(userInfo);
    }

    function logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUsername');
        localStorage.removeItem('authRole');
        setCurrentUser(null);
    }

    return (
        <AuthContext.Provider value={{ currentUser, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Hook for consuming auth context in any functional component.
 * 
 * Example: 
 *  const { currentUser, logout } = useAuth();
 */
export function useAuth() {
    return useContext(AuthContext);
}
