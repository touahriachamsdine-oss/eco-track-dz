'use server';
// Refreshing actions...
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

// --- Citizen Actions ---

export async function submitReport(formData) {
    const session = await getSession();
    if (!session || session.role !== 'citizen') return { error: 'Unauthorized. Only citizens can submit reports.' };

    const type = formData.get('type');
    const description = formData.get('description');
    const location = formData.get('location');

    const imageUrl = formData.get('imageUrl');

    if (description?.length > 1000) return { error: 'Description too long.' };
    if (location?.length > 200) return { error: 'Location too long.' };

    try {
        await prisma.report.create({
            data: {
                type: type.slice(0, 50),
                description,
                location,
                imageUrl,
                userId: session.userId,
            }
        });

        // Reward points for reporting
        await prisma.user.update({
            where: { id: session.userId },
            data: { points: { increment: 50 } }
        });

        // Create notification for user
        await prisma.notification.create({
            data: {
                userId: session.userId,
                title: 'Report Submitted',
                message: `Your ${type} report has been successfully filed in ${location}.`,
                type: 'success'
            }
        });

        revalidatePath('/citizen');
        return { success: true };
    } catch (error) {
        console.error('Report error:', error);
        return { error: 'Failed to submit report' };
    }
}

export async function getCitizenStats() {
    const session = await getSession();
    if (!session) return null;

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { points: true }
    });

    const reports = await prisma.report.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: 'desc' },
        take: 5
    });

    return { points: user?.points || 0, reports };
}

export async function getFullUserData() {
    const session = await getSession();
    if (!session) return null;

    return await prisma.user.findUnique({
        where: { id: session.userId },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            points: true,
            vehicleType: true,
            specialization: true
        }
    });
}

export async function getUserPickups() {
    const session = await getSession();
    if (!session) return [];

    // For a citizen, "pickups" are basically the active tasks/deployments in the system
    // In a real app, we would filter by their specific zone/address.
    // For now, we'll return the general mission schedule.
    return await prisma.task.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' }
    });
}

export async function getRewards() {
    return await prisma.reward.findMany();
}

export async function getRedemptions() {
    const session = await getSession();
    if (!session) return [];

    return await prisma.redemption.findMany({
        where: { userId: session.userId },
        include: { reward: true },
        orderBy: { createdAt: 'desc' }
    });
}

export async function redeemReward(rewardId) {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    try {
        const [user, reward] = await Promise.all([
            prisma.user.findUnique({ where: { id: session.userId } }),
            prisma.reward.findUnique({ where: { id: rewardId } })
        ]);

        if (!user || !reward) return { error: 'Invalid user or reward' };
        if (user.points < reward.pointsCost) return { error: 'Insufficient points' };

        // Transaction: Deduct points and create redemption
        await prisma.$transaction([
            prisma.user.update({
                where: { id: session.userId },
                data: { points: { decrement: reward.pointsCost } }
            }),
            prisma.redemption.create({
                data: {
                    userId: session.userId,
                    rewardId: rewardId,
                }
            }),
            prisma.notification.create({
                data: {
                    userId: session.userId,
                    title: 'Reward Redeemed!',
                    message: `You successfully redeemed "${reward.title}" for ${reward.pointsCost} points.`,
                    type: 'success'
                }
            })
        ]);

        revalidatePath('/citizen');
        return { success: true };
    } catch (error) {
        console.error('Redeem error:', error);
        return { error: 'Failed to redeem reward' };
    }
}

export async function awardPoints(amount, reason) {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    try {
        await prisma.user.update({
            where: { id: session.userId },
            data: { points: { increment: amount } }
        });

        await prisma.notification.create({
            data: {
                userId: session.userId,
                title: 'Points Earned!',
                message: `You earned ${amount} points for ${reason}.`,
                type: 'success'
            }
        });

        revalidatePath('/citizen');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to award points' };
    }
}

// --- Collector Actions ---

export async function getCollectorTasks() {
    const session = await getSession();
    if (!session || session.role !== 'collector') return [];

    return await prisma.task.findMany({
        where: {
            OR: [
                { collectorId: session.userId },
                { collectorId: null }
            ]
        },
        orderBy: { createdAt: 'desc' }
    });
}

export async function updateTaskStatus(taskId, status) {
    const session = await getSession();
    if (!session || session.role !== 'collector') return { error: 'Unauthorized' };

    try {
        await prisma.task.update({
            where: {
                id: taskId,
                OR: [
                    { collectorId: session.userId },
                    { collectorId: null }
                ]
            },
            data: {
                status,
                collectorId: session.userId
            }
        });
        // If completed, notify the citizen (this is a simplified logic, in real life we'd find the associated citizen)
        const task = await prisma.task.findUnique({ where: { id: taskId } });

        revalidatePath('/collector');
        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to update task' };
    }
}

// --- Admin Actions ---

// --- Admin Actions ---

export async function getAdminStats() {
    const session = await getSession();
    if (!session || session.role !== 'admin') return null;

    const [totalUsers, totalReports, totalBins, pendingTasks, fleetMembers] = await Promise.all([
        prisma.user.count(),
        prisma.report.count(),
        prisma.bin.count(),
        prisma.task.count({ where: { status: 'pending' } }),
        prisma.user.count({ where: { role: 'collector' } })
    ]);

    return { totalUsers, totalReports, totalBins, pendingTasks, fleetMembers };
}

export async function getBins() {
    const session = await getSession();
    if (!session || (session.role !== 'admin' && session.role !== 'collector')) return [];
    return await prisma.bin.findMany();
}

export async function getAllTasks() {
    const session = await getSession();
    if (!session || (session.role !== 'admin' && session.role !== 'collector')) return [];

    return await prisma.task.findMany({
        include: { collector: { select: { name: true } } },
        orderBy: { createdAt: 'desc' }
    });
}

export async function getCollectors() {
    const session = await getSession();
    if (!session || session.role !== 'admin') return [];
    return await prisma.user.findMany({
        where: { role: 'collector' },
        select: { id: true, name: true, email: true, points: true }
    });
}

export async function getAllReports() {
    const session = await getSession();
    if (!session || session.role !== 'admin') return [];
    return await prisma.report.findMany({
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' }
    });
}

export async function updateReportStatus(reportId, status) {
    const session = await getSession();
    if (!session || session.role !== 'admin') return { error: 'Unauthorized' };

    try {
        await prisma.report.update({
            where: { id: reportId },
            data: { status }
        });
        // Notify the user
        const report = await prisma.report.findUnique({ where: { id: reportId } });
        if (report) {
            await prisma.notification.create({
                data: {
                    userId: report.userId,
                    title: 'Report Update',
                    message: `The status of your report #${report.id.slice(-6).toUpperCase()} has been updated to ${status}.`,
                    type: status === 'resolved' ? 'success' : 'info'
                }
            });
        }

        revalidatePath('/admin');
        revalidatePath('/citizen');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to update report status' };
    }
}

export async function createGlobalTask(data) {
    const session = await getSession();
    if (!session || session.role !== 'admin') return { error: 'Unauthorized' };

    try {
        await prisma.task.create({
            data: {
                address: data.address,
                type: data.type,
                status: 'pending',
                bins: parseInt(data.bins) || 1,
                time: data.time || '08:00 - 10:00',
                collectorId: data.collectorId || null
            }
        });
        revalidatePath('/admin');
        revalidatePath('/collector');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to create global deployment' };
    }
}

export async function updateBinStatus(binId, data) {
    const session = await getSession();
    if (!session || session.role !== 'admin') return { error: 'Unauthorized' };

    try {
        await prisma.bin.update({
            where: { id: binId },
            data: {
                fillLevel: parseInt(data.fillLevel),
                status: data.status
            }
        });
        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to update bin intelligence' };
    }
}

export async function updateWasteGuideItem(id, data) {
    const session = await getSession();
    if (!session || session.role !== 'admin') return { error: 'Unauthorized' };

    try {
        await prisma.wasteGuide.upsert({
            where: { id: id || 'new' },
            update: {
                name: data.name,
                category: data.category,
                instructions: data.instructions
            },
            create: {
                name: data.name,
                category: data.category,
                instructions: data.instructions
            }
        });
        revalidatePath('/admin');
        revalidatePath('/citizen');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to sync waste guide' };
    }
}

// --- Shared Actions ---

export async function searchWasteGuide(query) {
    if (!query) return [];
    return await prisma.wasteGuide.findMany({
        where: {
            OR: [
                { name: { contains: query } },
                { instructions: { contains: query } }
            ]
        },
        take: 5
    });
}

export async function getWasteGuide() {
    return await prisma.wasteGuide.findMany({
        take: 20
    });
}

export async function getNotifications() {
    const session = await getSession();
    if (!session) return [];

    return await prisma.notification.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: 'desc' },
        take: 10
    });
}

export async function markNotificationAsRead(notificationId) {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    try {
        await prisma.notification.update({
            where: { id: notificationId, userId: session.userId },
            data: { read: true }
        });
        revalidatePath('/citizen');
        revalidatePath('/collector');
        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to update notification' };
    }
}

export async function createNotification(userId, title, message, type = 'info') {
    try {
        await prisma.notification.create({
            data: { userId, title, message, type }
        });
        return { success: true };
    } catch (error) {
        return { error: 'Failed to create notification' };
    }
}

export async function reportCollectorIssue(taskId, type, description) {
    const session = await getSession();
    if (!session || session.role !== 'collector') return { error: 'Unauthorized' };

    try {
        await prisma.report.create({
            data: {
                type: `COLLECTOR_ISSUE: ${type}`,
                description: `Task ID: ${taskId} - ${description}`,
                status: 'pending',
                userId: session.userId,
            }
        });
        return { success: true };
    } catch (error) {
        return { error: 'Failed to report issue' };
    }
}

export async function getMessages() {
    const session = await getSession();
    if (!session) return [];

    return await prisma.message.findMany({
        where: {
            OR: [
                { senderId: session.userId },
                { receiverId: session.userId }
            ]
        },
        include: {
            sender: { select: { name: true } }
        },
        orderBy: { createdAt: 'asc' }
    });
}

export async function sendMessage(content, receiverId) {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    try {
        await prisma.message.create({
            data: {
                content,
                senderId: session.userId,
                receiverId: receiverId || 'admin' // Default to admin for now
            }
        });
        return { success: true };
    } catch (error) {
        return { error: 'Failed to send message' };
    }
}
