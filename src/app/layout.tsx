import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import AmplifyConfig from "@/components/auth/AmplifyConfig";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LesiBooking | Professional Appointment Scheduling",
  description: "Experience the next generation of booking platforms with professional elegance and cloud-sync performance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} antialiased selection:bg-blue-500/30`}>
        <Navbar />
        <AmplifyConfig>{children}</AmplifyConfig>
      </body>
    </html>
  );
}
