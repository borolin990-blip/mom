/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile the in-repo TypeScript workspace packages instead of expecting
  // pre-built output. This is what keeps @mom/core framework-agnostic while
  // still being consumed directly as source.
  transpilePackages: ["@mom/core", "@mom/db", "@mom/config"],
  experimental: {
    serverActions: {
      // Allow reasonably large uploads through server actions if used.
      bodySizeLimit: "50mb",
    },
  },
};

export default nextConfig;
