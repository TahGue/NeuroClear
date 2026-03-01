import { requirePatientSession } from "@/lib/rbac"
import { redirect } from "next/navigation"
import { PortalNav } from "@/components/portal/PortalNav"

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    await requirePatientSession()
  } catch {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PortalNav />
      <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
    </div>
  )
}