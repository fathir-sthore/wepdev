/** @type {import('next').NextConfig} */

const r2PublicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || process.env.R2_PUBLIC_URL;
const r2Hostname = r2PublicUrl ? new URL(r2PublicUrl).hostname : null;

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" }, // legacy — safe to remove once fully migrated off Supabase Storage
      { protocol: "https", hostname: "lh3.googleusercontent.com" }, // Google OAuth avatars
      { protocol: "https", hostname: "avatars.githubusercontent.com" }, // GitHub OAuth avatars
      { protocol: "https", hostname: "cdn.discordapp.com" }, // Discord OAuth avatars
      ...(r2Hostname ? [{ protocol: "https", hostname: r2Hostname }] : []),
    ],
  },
};

export default nextConfig;
