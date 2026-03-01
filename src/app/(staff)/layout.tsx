import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { requireStaffSession } from "@/lib/rbac"
import { SkipToContent } from "@/components/accessibility/SkipToContent"

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireStaffSession()

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main id="main-content" tabIndex={-1} className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
