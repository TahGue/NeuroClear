import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/auth/SessionProvider";
import { getServerLocale } from "@/lib/i18n";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NeuroClear Assessment Platform",
  description: "Comprehensive psychological assessment platform for clinical professionals",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getServerLocale();
  const session = await getServerSession(authOptions).catch(() => null);
  const isStaff = session?.user?.role && session.user.role !== "PATIENT";
  const bodyClass = `antialiased ${geistSans.variable} ${geistMono.variable} ${isStaff ? "staff-theme" : ""}`;

  return (
    <html lang={locale}>
      <body className={bodyClass}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
