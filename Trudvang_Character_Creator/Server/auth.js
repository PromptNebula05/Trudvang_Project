import jwt from 'jsonwebtoken';
import 'dotenv/config';

const JWT_SECRET = process.env.JWT_SECRET || 'change_me_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

export function signToken(user) {
    return jwt.sign(
        {
            sub: user._id.toString(),
            username: user.username,
            role: user.role
        },
        JWT_SECRET,
        {expiresIn: JWT_EXPIRES_IN}
    );
}

export function verifyToken(token) {
    if (!token) return null;
    try { return jwt.verify(token, JWT_SECRET); }
    catch { return null; }
}

export function extractBearerToken(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    return authHeader.slice(7);
}
