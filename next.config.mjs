/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@react-pdf/renderer'],
  images: {
    remotePatterns: [
      // Supabase Storage — add project URL in Phase C3
    ],
  },
}

export default nextConfig
