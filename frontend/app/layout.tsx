import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthInitializer from "@/components/auth/AuthInitializer";
import { ThemeProvider } from "@/components/themes/Themeprovider";
import { ToastProvider } from "@/components/ToastProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CloudNotes",
  description: "Upload & Manage Notes App",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#fafaf9] dark:bg-[#090d16] text-slate-900 dark:text-slate-100 font-sans selection:bg-orange-500 selection:text-white transition-colors duration-200">
        <ThemeProvider>
          <AuthInitializer>
            {children}
            <ToastProvider />
          </AuthInitializer>
        </ThemeProvider>
      </body>
    </html>
  );
}

