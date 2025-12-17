/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.ctfassets.net',
      },
    ],
    // Required for static export
    unoptimized: true,
  },
  // Enable React Compiler for automatic memoization (Next.js 16)
  reactCompiler: true,
}

export default nextConfig
