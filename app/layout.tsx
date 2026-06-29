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
    <html lang="en" className="light">
      <body className={`${inter.className} min-h-screen bg-gray-300 dark:bg-neutral-900 p-2 sm:p-6 lg:p-10 antialiased`}>
        <div className="mac-window h-[calc(100vh-1rem)] sm:h-[calc(100vh-3rem)] lg:h-[calc(100vh-5rem)] w-full max-w-[1400px] mx-auto bg-surface-1">
          <Navbar />
          <div className="flex flex-1 overflow-hidden">
            <main className="mac-content relative">
              {children}
              <Footer />
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
