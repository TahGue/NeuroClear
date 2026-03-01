"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { Locale, locales, defaultLocale, Messages } from "@/lib/i18n"

type I18nContextType = {
  locale: Locale
  messages: Messages
  t: (key: string) => string
  setLocale: (locale: Locale) => Promise<void>
  isLoading: boolean
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ 
  children, 
  initialLocale,
  initialMessages 
}: { 
  children: ReactNode
  initialLocale: Locale
  initialMessages: Messages 
}) {
  const router = useRouter()
  const [locale, setLocaleState] = useState<Locale>(initialLocale)
  const [messages, setMessages] = useState<Messages>(initialMessages)
  const [isLoading, setIsLoading] = useState(false)

  const setLocale = async (newLocale: Locale) => {
    if (newLocale === locale) return
    
    setIsLoading(true)
    try {
      // Persist locale preference
      await fetch("/api/locale", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ locale: newLocale }),
      })

      // Load new messages
      const res = await fetch(`/api/messages?locale=${newLocale}`)
      if (res.ok) {
        const newMessages = await res.json()
        setMessages(newMessages)
        setLocaleState(newLocale)
        document.documentElement.lang = newLocale
        router.refresh()
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Translation function with nested key support (e.g., "auth.login.title")
  const t = (key: string): string => {
    const keys = key.split(".")
    let value: unknown = messages
    
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = (value as Record<string, unknown>)[k]
      } else {
        return key // Return key as fallback
      }
    }
    
    return typeof value === "string" ? value : key
  }

  return (
    <I18nContext.Provider value={{ locale, messages, t, setLocale, isLoading }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider")
  }
  return context
}

// Utility hook for localized formatting
export function useLocaleFormat() {
  const { locale } = useI18n()

  const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
    const d = typeof date === "string" ? new Date(date) : date
    return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      ...options,
    }).format(d)
  }

  const formatRelativeTime = (date: Date | string): string => {
    const d = typeof date === "string" ? new Date(date) : date
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return locale === "fr" ? "Aujourd'hui" : "Today"
    if (diffInDays === 1) return locale === "fr" ? "Hier" : "Yesterday"
    if (diffInDays < 7) return `${diffInDays} ${locale === "fr" ? "jours" : "days"} ago`
    return formatDate(d)
  }

  return { formatDate, formatRelativeTime }
}
