"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"

type Props = {
  locale: "en" | "fr"
  label: string
  enLabel: string
  frLabel: string
}

export function LanguageSwitcher({ locale, label, enLabel, frLabel }: Props) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  const setLocale = async (nextLocale: "en" | "fr") => {
    if (nextLocale === locale) return
    setIsSaving(true)
    try {
      await fetch("/api/locale", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ locale: nextLocale }),
      })
    } finally {
      setIsSaving(false)
      router.refresh()
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <Button type="button" variant={locale === "en" ? "default" : "outline"} size="sm" disabled={isSaving} onClick={() => setLocale("en")}>
        {enLabel}
      </Button>
      <Button type="button" variant={locale === "fr" ? "default" : "outline"} size="sm" disabled={isSaving} onClick={() => setLocale("fr")}>
        {frLabel}
      </Button>
    </div>
  )
}
