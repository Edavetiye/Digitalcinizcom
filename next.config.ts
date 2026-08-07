import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // Arka plan görseli yüklemeleri için server action gövde limiti.
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },
  async headers() {
    return [
      {
        // Embed sayfaları Canva gibi harici sitelere gömülebilmelidir.
        // frame-ancestors * -> her yerden iframe ile gömülebilir.
        source: "/embed/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors *;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
