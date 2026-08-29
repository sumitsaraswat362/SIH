import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/store";
import AIHelpBot from "@/components/AIHelpBot";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Annapurna | AI-Powered Direct Farmer-to-Buyer Marketplace",
  description:
    "Autonomous AI marketplace that eliminates intermediaries between farmers and wholesale buyers. Powered by Multi-Agent AI Negotiation, FSSAI Legal Compliance, and Multilingual Voice — increasing farmer earnings by up to 40% while reducing consumer prices. Built for SIH26033.",
};

import { AuthProvider } from "@/lib/auth";
import ThemeToggle from "@/components/ThemeToggle";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var t = localStorage.getItem('theme');
                if (t === 'dark') {
                  document.documentElement.classList.add('dark');
                }
              } catch(e) {}
            })();
          `
        }} />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased min-h-screen`}
        style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
      >
        <AuthProvider>
          <AppProvider>
            {children}
            <AIHelpBot />
            <ThemeToggle />
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

