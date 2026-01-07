import { NextResponse } from 'next/server';
// import { updateSession } from '@/lib/session'; 
// Actually, accessing 'jose' direct in middleware is standard for Edge compatibility.
import { jwtVerify } from 'jose';

const secretKey = process.env.SESSION_SECRET;
if (!secretKey && process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET environment variable is not set in production');
}
const finalSecret = secretKey || 'fallback-secret-for-development-only-12345';
const encodedKey = new TextEncoder().encode(finalSecret);

export async function proxy(request) {
    const session = request.cookies.get('session')?.value;
    const path = request.nextUrl.pathname;

    // 1. Define protected routes and their required roles
    const protectedRoutes = {
        '/admin': 'admin',
        '/collector': 'collector',
        '/citizen': 'citizen',
    };

    // 2. Check if the current path requires protection
    const isProtectedRoute = Object.keys(protectedRoutes).some(route => path.startsWith(route));

    if (isProtectedRoute) {
        if (!session) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        try {
            // Verify JWT
            const { payload } = await jwtVerify(session, encodedKey, {
                algorithms: ['HS256'],
            });

            // Check Role
            const requiredRole = Object.entries(protectedRoutes).find(([route, role]) => path.startsWith(route))?.[1];

            if (requiredRole && payload.role !== requiredRole) {
                // Redirect to their appropriate dashboard if they try to access wrong area
                if (payload.role === 'admin') return NextResponse.redirect(new URL('/admin', request.url));
                if (payload.role === 'collector') return NextResponse.redirect(new URL('/collector', request.url));
                if (payload.role === 'citizen') return NextResponse.redirect(new URL('/citizen', request.url));

                // Fallback (e.g. if unknown role)
                return NextResponse.redirect(new URL('/login', request.url));
            }

        } catch (error) {
            console.error('Middleware session verification failed:', error);
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // 3. Logic for Root Path (/) - Allow landing page access
    if (path === '/') {
        if (session) {
            try {
                const { payload } = await jwtVerify(session, encodedKey);
                if (payload.role === 'admin') return NextResponse.redirect(new URL('/admin', request.url));
                if (payload.role === 'collector') return NextResponse.redirect(new URL('/collector', request.url));
                if (payload.role === 'citizen') return NextResponse.redirect(new URL('/citizen', request.url));
            } catch (e) {
                // Invalid session, let them stay on landing page
            }
        }
        return NextResponse.next();
    }

    // 4. Prevent authenticated users from visiting Login/Signup again
    if (path === '/login' || path === '/signup') {
        if (session) {
            try {
                const { payload } = await jwtVerify(session, encodedKey);
                if (payload.role === 'admin') return NextResponse.redirect(new URL('/admin', request.url));
                if (payload.role === 'collector') return NextResponse.redirect(new URL('/collector', request.url));
                if (payload.role === 'citizen') return NextResponse.redirect(new URL('/citizen', request.url));
            } catch (e) {
                // Session invalid, let them stay on login
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
