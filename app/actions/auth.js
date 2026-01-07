// Auth Actions Re-cache Trigger
'use server';

import { prisma } from '@/lib/db';
import { createSession, deleteSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';

export async function signup(prevState, formData) {
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');
    if (!name || !email || !password) {
        return { error: 'Please fill in all fields.' };
    }

    if (password.length < 8) {
        return { error: 'Password must be at least 8 characters long.' };
    }

    // Role Security: Never allow signup as 'admin' directly.
    // Default to 'citizen' if role is missing or invalid.
    let role = formData.get('role') || 'citizen';
    if (role === 'admin') {
        return { error: 'Admin registration is restricted. Please contact system owner.' };
    }

    // Whitelist allowed roles to prevent future injection of new roles
    const allowedRoles = ['citizen', 'collector'];
    if (!allowedRoles.includes(role)) {
        role = 'citizen';
    }

    let user;
    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return { error: 'User already exists.' };

        const hashedPassword = await bcrypt.hash(password, 10);

        const userData = {
            name,
            email,
            password: hashedPassword,
            role
        };

        if (role === 'collector') {
            userData.vehicleType = formData.get('vehicleType');
            userData.specialization = formData.get('specialization');
        }

        user = await prisma.user.create({
            data: userData,
        });

        await createSession(user.id, user.role, user.name);
    } catch (error) {
        console.error('Signup error:', error);
        return { error: error.message || 'Something went wrong.' };
    }

    if (user.role === 'admin') redirect('/admin');
    if (user.role === 'collector') redirect('/collector');
    if (user.role === 'citizen') redirect('/citizen');
    redirect('/');
}

export async function login(prevState, formData) {
    const email = formData.get('email');
    const password = formData.get('password');

    if (!email || !password) return { error: 'Please enter email and password.' };

    let user;
    try {
        user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return { error: 'Invalid credentials.' };
        }
        await createSession(user.id, user.role, user.name);
    } catch (error) {
        console.error('Login error:', error);
        return { error: 'Something went wrong.' };
    }

    if (user.role === 'admin') redirect('/admin');
    if (user.role === 'collector') redirect('/collector');
    if (user.role === 'citizen') redirect('/citizen');
    redirect('/');
}

export async function logout() {
    await deleteSession();
    redirect('/login');
}

import { getSession } from '@/lib/session';
export async function getCurrentUser() {
    return await getSession();
}
