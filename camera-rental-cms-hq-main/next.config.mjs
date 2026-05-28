/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: [
      "bzagyowswyvmlnrpezcx.supabase.co",
      "lh3.googleusercontent.com",
    ],
  },
}

export default nextConfig
