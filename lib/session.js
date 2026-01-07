import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secretKey = process.env.SESSION_SECRET;

const getEncodedKey = () => {
    if (!secretKey) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('SESSION_SECRET is required in production!');
        }
    }
    return new TextEncoder().encode(secretKey || 'fallback-secret-for-development-only-12345');
};

export async function createSession(userId, role, name) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const session = await new SignJWT({ userId, role, name })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(getEncodedKey());

    (await cookies()).set('session', session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires: expiresAt,
        sameSite: 'lax',
        path: '/',
    });
}

export async function getSession() {
    const session = (await cookies()).get('session')?.value;
    if (!session) return null;

    try {
        const { payload } = await jwtVerify(session, getEncodedKey(), {
            algorithms: ['HS256'],
        });
        return payload;
    } catch (error) {
        console.error('Failed to verify session');
        return null;
    }
}

export async function deleteSession() {
    (await cookies()).delete('session');
}
