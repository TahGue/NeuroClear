import { NextResponse } from "next/server"
import { z } from "zod"
import { normalizeLocale } from "@/lib/i18n"

const BodySchema = z.object({
  locale: z.string().min(1),
})

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = BodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }

  const locale = normalizeLocale(parsed.data.locale)

  const res = NextResponse.json({ ok: true, locale })
  res.cookies.set({
    name: "locale",
    value: locale,
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 365,
  })
  return res
}
