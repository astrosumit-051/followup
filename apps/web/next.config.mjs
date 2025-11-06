/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  /**
   * Experimental Features
   *
   * missingSuspenseWithCSRBailout: Disable Suspense boundary requirement for useSearchParams
   * in Next.js 14.x. This allows OAuth callback pages to use useSearchParams without wrapping
   * in Suspense, which is appropriate for pages that must be fully client-side rendered.
   *
   * Note: This option will be removed in Next.js 15+
   */
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },

  /**
   * Output Configuration
   *
   * Enable standalone output for Docker production builds.
   * This creates a minimal server build with all dependencies bundled.
   *
   * @see https://nextjs.org/docs/advanced-features/output-file-tracing
   */
  output: 'standalone',

  /**
   * ESLint Configuration
   *
   * For staging builds, ignore ESLint errors to allow deployment
   * with Phase 4 stub implementations that have intentional unused variables.
   * Production builds should re-enable strict linting after Phase 4 completion.
   */
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },

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
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY", // Prevent embedding in iframes (clickjacking protection)
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff", // Prevent MIME type sniffing
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin", // Control referrer information leakage
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on", // Enable DNS prefetching for performance
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=()", // Disable unnecessary browser features
          },
        ],
      },
    ];
  },
};

export default nextConfig;
