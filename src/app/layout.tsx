 import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/auth/SessionProvider";
import { I18nProvider } from "@/lib/i18n-context";
import { getServerLocale, getMessages } from "@/lib/i18n-server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner";
import { AccessibilityProvider } from "@/lib/accessibility";

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
  const messages = await getMessages(locale);
  const session = await getServerSession(authOptions).catch(() => null);
  const isStaff = session?.user?.role && session.user.role !== "PATIENT";
  const bodyClass = `antialiased ${isStaff ? "staff-theme" : ""}`;

  const isRtl = locale === "ar";

  return (
    <html lang={locale} dir={isRtl ? "rtl" : "ltr"}>
      <body className={bodyClass}>
        <SessionProvider>
          <I18nProvider initialLocale={locale} initialMessages={messages}>
            <AccessibilityProvider>
              {children}
              <Toaster position="top-right" richColors />
            </AccessibilityProvider>
          </I18nProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
