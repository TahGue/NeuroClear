"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, ClipboardList } from "lucide-react"
import { PortalLogoutButton } from "@/components/auth/PortalLogoutButton"
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher"
import { useI18n } from "@/lib/i18n-context"
import { AccessibilityMenu } from "@/components/accessibility/AccessibilityMenu"
import { locales } from "@/lib/i18n"

const navItems = [
  { labelKey: "navigation.home", href: "/portal", icon: LayoutDashboard },
  { labelKey: "navigation.myTests", href: "/portal/tests", icon: ClipboardList },
]

export function PortalNav() {
  const pathname = usePathname()
  const { locale, t, setLocale } = useI18n()
  const languageOptions = locales.map((loc) => ({
    value: loc,
    label: t(`language.options.${loc}`),
  }))

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/portal" className="text-sm font-semibold">
            {t("common.appName")}
          </Link>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/")
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {t(item.labelKey)}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <AccessibilityMenu />
          <LanguageSwitcher
            locale={locale}
            label={t("language.label")}
            options={languageOptions}
            onLocaleChange={setLocale}
          />
          <PortalLogoutButton />
        </div>
      </div>
    </header>
  )
}
