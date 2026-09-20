// Replace the retired quick tunnel supplied by the deployment environment.
// Keep localhost and other explicitly configured API origins unchanged.
const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["three"],
  env: apiBase === "https://density-reed-conclusions-ticket.trycloudflare.com"
    ? { NEXT_PUBLIC_API_URL: "https://simultaneously-interim-poster-reasoning.trycloudflare.com" }
    : {},
};

export default nextConfig;
