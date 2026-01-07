// Server restart trigger: 2026-01-07 11:31
/** @type {import('next').NextConfig} */
const nextConfig = {
    serverExternalPackages: ['@prisma/client'],
    experimental: {
        serverActions: {
            bodySizeLimit: '10mb',
        },
    },
};

export default nextConfig;
