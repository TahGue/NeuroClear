import { cookies, headers } from "next/headers"

export const locales = ["en", "fr"] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = "en"

export function normalizeLocale(input: string | null | undefined): Locale {
  const val = (input ?? "").toLowerCase()
  if (val.startsWith("fr")) return "fr"
  return "en"
}

export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get("locale")?.value
  if (cookieLocale) return normalizeLocale(cookieLocale)

  const headerStore = await headers()
  const accept = headerStore.get("accept-language")
  return normalizeLocale(accept)
}

export type Messages = Record<string, string>

export async function getMessages(locale: Locale): Promise<Messages> {
  switch (locale) {
    case "fr":
      return (await import("@/messages/fr.json")).default
    case "en":
    default:
      return (await import("@/messages/en.json")).default
  }
}

export async function getT(locale: Locale) {
  const messages = await getMessages(locale)
  return (key: string) => messages[key] ?? key
}
