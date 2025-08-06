import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Sharer - File Sharing Platform",
  description: "Secure, fast, and reliable file sharing for everyone",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>

        {/* Global Contact Email */}
        <div className="fixed bottom-4 right-4 z-50">
          <a
            href="mailto:adalui@gmail.com"
            className="text-gray-400 hover:text-gray-300 text-xs font-thin transition-colors duration-200"
          >
            adalui@gmail.com
          </a>
        </div>
      </body>
    </html>
  );
}
