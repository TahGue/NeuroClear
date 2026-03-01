import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { requireStaffSession } from "@/lib/rbac"

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
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
