"use client"

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n-context"

export function PortalLogoutButton() {
  const { t } = useI18n()

  return (
    <Button 
      variant="outline" 
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      {t("navigation.logout")}
    </Button>
  )
}
