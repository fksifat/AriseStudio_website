import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "AriseStudio | Intelligent Business Automation, ERP, CRM & Enterprise IT Support",
  description: "AriseStudio provides top-tier e-commerce automation, enterprise ERP/CRM development, workflow optimization, and 24/7 IT support solutions. Empowering global businesses to scale seamlessly.",
  keywords: [
    "AriseStudio",
    "business automation",
    "e-commerce automation",
    "custom ERP",
    "custom CRM",
    "IT support",
    "workflow automation",
    "software development Bangladesh",
    "enterprise solutions"
  ],
  authors: [{ name: "AriseStudio Team" }],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="min-h-screen flex flex-col bg-[#080c14] text-slate-100 antialiased selection:bg-emerald-500/25 selection:text-emerald-300">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
