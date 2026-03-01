import { cookies, headers } from "next/headers"

import type { Locale, Messages } from "@/lib/i18n"
import { normalizeLocale } from "@/lib/i18n"

// We only honor Arabic when a user explicitly sets their locale cookie.
// For header-based detection, fall back to English to avoid unintended Arabic UI.
function normalizeLocaleFromHeader(input: string | null | undefined): Locale {
  const val = (input ?? "").toLowerCase()
  if (val.startsWith("fr")) return "fr"
  if (val.startsWith("sv")) return "sv"
  return "en"
}

function getNestedValue(obj: unknown, key: string): string {
  const keys = key.split(".")
  let value: unknown = obj

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = (value as Record<string, unknown>)[k]
    } else {
      return key
    }
  }

  return typeof value === "string" ? value : key
}

export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get("locale")?.value
  if (cookieLocale) return normalizeLocale(cookieLocale)

  const headerStore = await headers()
  const accept = headerStore.get("accept-language")
  return normalizeLocaleFromHeader(accept)
}

export async function getMessages(locale: Locale): Promise<Messages> {
  switch (locale) {
    case "fr":
      return (await import("@/messages/fr.json")).default
    case "ar":
      return (await import("@/messages/ar.json")).default
    case "sv":
      return (await import("@/messages/sv.json")).default
    case "en":
    default:
      return (await import("@/messages/en.json")).default
  }
}

export async function getT(locale: Locale) {
  const messages = await getMessages(locale)
  return (key: string) => getNestedValue(messages, key)
}
