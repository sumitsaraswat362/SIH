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
  title: "Annapurna | Direct Farm-to-Fork Marketplace — SIH 26033",
  description:
    "India's first AI-powered digital marketplace connecting farmers and FPOs directly with consumers and bulk buyers. Eliminates middlemen, provides logistics support, uses AI for demand forecasting and route optimization. PSID 26033 — Ministry of Consumer Affairs, Food & Public Distribution.",
  keywords: ["farmer marketplace", "FPO", "direct farm", "SIH 26033", "agriculture", "AI demand forecasting", "eliminate middlemen", "mandi prices", "MSP"],
  openGraph: {
    title: "Annapurna — Direct Farm-to-Fork Marketplace",
    description: "Eliminating intermediaries. Better prices for farmers. Lower prices for consumers.",
    type: "website",
  },
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

