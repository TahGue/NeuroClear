export const locales = ["en", "fr", "ar", "sv"] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = "en"

export function normalizeLocale(input: string | null | undefined): Locale {
  const val = (input ?? "").toLowerCase()
  if (val.startsWith("fr")) return "fr"
  if (val.startsWith("ar")) return "ar"
  if (val.startsWith("sv")) return "sv"
  return "en"
}

export type Messages = Record<string, unknown>
