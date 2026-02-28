import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { getNextAuthSecret } from "@/lib/nextauth-secret"

const publicPaths = ["/login", "/"]
const publicPrefixes = ["/invite"]

function clearNextAuthCookies(res: NextResponse) {
  const cookieNames = [
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
  ]

  for (const name of cookieNames) {
    res.cookies.set({
      name,
      value: "",
      maxAge: 0,
      path: "/",
    })
  }

  return res
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next()
  }

  if (publicPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next()
  }

  if (publicPrefixes.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  let token
  try {
    token = await getToken({ req, secret: getNextAuthSecret() })
  } catch {
    const url = req.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("callbackUrl", pathname)
    return clearNextAuthCookies(NextResponse.redirect(url))
  }

  if (!token) {
    const url = req.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("callbackUrl", pathname)
    return clearNextAuthCookies(NextResponse.redirect(url))
  }

  const role = (token as { role?: string } | null)?.role

  if (!role) {
    const url = req.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("callbackUrl", pathname)
    return clearNextAuthCookies(NextResponse.redirect(url))
  }

  // Patient users can only access /portal
  if (role === "PATIENT") {
    if (pathname === "/" || pathname.startsWith("/patients") || pathname.startsWith("/reports") || pathname.startsWith("/assessments") || pathname.startsWith("/score-entry")) {
      const url = req.nextUrl.clone()
      url.pathname = "/portal"
      return NextResponse.redirect(url)
    }
    if (!pathname.startsWith("/portal")) {
      const url = req.nextUrl.clone()
      url.pathname = "/portal"
      return NextResponse.redirect(url)
    }
  }

  // Non-patient users hitting /portal go back to dashboard
  if (pathname.startsWith("/portal") && role !== "PATIENT") {
    const url = req.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
}
