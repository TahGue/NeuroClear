"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Locale } from "@/lib/i18n"

type Props = {
  locale: Locale
  label: string
  options: { value: Locale; label: string }[]
  onLocaleChange?: (locale: Locale) => Promise<void> | void
}

export function LanguageSwitcher({ locale, label, options, onLocaleChange }: Props) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  const setLocale = async (nextLocale: Locale) => {
    if (nextLocale === locale) return
    setIsSaving(true)
    try {
      if (onLocaleChange) {
        await onLocaleChange(nextLocale)
      } else {
        await fetch("/api/locale", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ locale: nextLocale }),
        })
        router.refresh()
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Button
            key={option.value}
            type="button"
            variant={locale === option.value ? "default" : "outline"}
            size="sm"
            disabled={isSaving}
            onClick={() => setLocale(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
