import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dijital Davetiye",
  description: "Canva davetiyeleri için gömülebilir RSVP sistemi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
