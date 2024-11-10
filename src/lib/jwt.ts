import jwt from 'jsonwebtoken';

export const decodeJwt = (token: string): (string | jwt.JwtPayload | null) => {
    try {
        const decoded = jwt.decode(token);
        return decoded;
    } catch (e) {
        console.error('Failed to decode token:', e);
        return null;
    }
}

export const validateJwt = (token: string, secret: string): (string | jwt.JwtPayload | null) => {
    try {
        const valid = jwt.verify(token, secret)
        return valid
    } catch (e) {
        console.error('Invalid token: ', e)
        return null
    }
}
