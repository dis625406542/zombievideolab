/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Exact dev tunnel hosts only; keep Next's cross-origin protections enabled.
  allowedDevOrigins: (process.env.DEV_ALLOWED_ORIGINS || "frontpage-rice-stem-stripes.trycloudflare.com")
    .split(",").map(host => host.trim()).filter(Boolean),
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  poweredByHeader: false,
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    }];
  },
};

export default nextConfig;
