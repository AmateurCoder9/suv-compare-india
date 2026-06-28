import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SUV Compare India 2026 — Find Your Perfect SUV",
  description: "The most comprehensive, data-driven SUV comparison database for buyers in India. Compare specs, prices, features, and scores across every petrol SUV under ₹20 lakh.",
  keywords: "SUV, India, compare, Creta, Seltos, Nexon, Grand Vitara, petrol, 2026",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} flex flex-col min-h-screen bg-background text-foreground antialiased`}>
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
