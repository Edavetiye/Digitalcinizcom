import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Embed sayfalarının Canva gibi harici sitelere gömülebilmesi için
  // frame ayarları middleware üzerinden yönetilir.
};

export default nextConfig;
