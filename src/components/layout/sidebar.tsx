"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useI18n } from "@/lib/i18n-context"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  ClipboardList, 
  BookOpen,
  Brain,
  Activity,
  ClipboardCheck
} from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()
  const { t } = useI18n()

  const navigation = [
    { name: t("navigation.dashboard"), href: "/dashboard", icon: LayoutDashboard },
    { name: t("navigation.patients"), href: "/patients", icon: Users },
    { name: t("navigation.scoreEntry"), href: "/score-entry", icon: ClipboardList },
    { name: t("navigation.reports"), href: "/reports", icon: FileText },
    { name: t("navigation.assessmentLibrary"), href: "/assessments", icon: BookOpen },
  ]

  return (
    <div className="flex h-full w-64 flex-col bg-card border-r">
      <div className="flex h-16 items-center px-6 border-b">
        <div className="flex items-center space-x-3">
          <Brain className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-lg font-semibold text-foreground">{t("common.appName")}</h1>
            <p className="text-xs text-muted-foreground">{t("sidebar.tagline")}</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>
      
      <div className="border-t p-4">
        <div className="flex items-center space-x-3">
          <Activity className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">{t("sidebar.systemStatusLabel")}</p>
            <p className="text-xs text-muted-foreground">{t("sidebar.systemStatusValue")}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
