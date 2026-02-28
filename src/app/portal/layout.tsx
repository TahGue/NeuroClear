import { requirePatientSession } from "@/lib/rbac"
import { redirect } from "next/navigation"

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let session
  try {
    session = await requirePatientSession()
  } catch {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Patient-specific wrapping, separate from staff dashboard */}
      {children}
    </div>
  )
}