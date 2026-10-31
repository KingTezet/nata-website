import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Izinkan buka dev server dari HP di jaringan lokal (hanya berlaku saat `npm run dev`).
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "*.local"],
};

export default nextConfig;
