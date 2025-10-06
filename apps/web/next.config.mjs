/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  /**
   * Security Headers Configuration
   *
   * Implements OWASP recommended security headers:
   * - X-Frame-Options: Prevents clickjacking attacks
   * - X-Content-Type-Options: Prevents MIME type sniffing
   * - Referrer-Policy: Controls referrer information
   * - X-DNS-Prefetch-Control: Controls DNS prefetching
   * - Permissions-Policy: Controls browser features
   *
   * @see https://nextjs.org/docs/app/api-reference/next-config-js/headers
   * @see https://owasp.org/www-project-secure-headers/
   */
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY', // Prevent embedding in iframes (clickjacking protection)
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', // Prevent MIME type sniffing
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin', // Control referrer information leakage
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on', // Enable DNS prefetching for performance
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()', // Disable unnecessary browser features
          },
        ],
      },
    ];
  },
}

export default nextConfig
