"use client"

import { Bell, Search, User } from "lucide-react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AccessibilityMenu } from "@/components/accessibility/AccessibilityMenu"
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher"
import { useI18n } from "@/lib/i18n-context"
import { locales } from "@/lib/i18n"

export function Header() {
  const { locale, t, setLocale } = useI18n()
  const languageOptions = locales.map((loc) => ({
    value: loc,
    label: t(`language.options.${loc}`),
  }))

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center space-x-4 flex-1">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("header.searchPlaceholder")}
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <AccessibilityMenu />
        <LanguageSwitcher
          locale={locale}
          label={t("language.label")}
          options={languageOptions}
          onLocaleChange={setLocale}
        />
        
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
            3
          </Badge>
        </Button>
        
        <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/login" })}>
          {t("navigation.logout")}
        </Button>

        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}
