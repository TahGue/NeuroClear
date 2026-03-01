import { NextRequest, NextResponse } from "next/server"
import { Locale, normalizeLocale } from "@/lib/i18n"
import { getMessages } from "@/lib/i18n-server"

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const locale = normalizeLocale(searchParams.get("locale")) as Locale

  try {
    const messages = await getMessages(locale)
    return NextResponse.json(messages)
  } catch {
    return NextResponse.json({ error: "Failed to load messages" }, { status: 500 })
  }
}
