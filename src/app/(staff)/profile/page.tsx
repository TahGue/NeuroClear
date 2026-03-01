import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Shield, Calendar, Key, Save } from "lucide-react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getServerLocale, getT } from "@/lib/i18n-server"

export const dynamic = "force-dynamic"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  const locale = await getServerLocale()
  const t = await getT(locale)

  if (!session?.user?.email) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      patient: true,
      _count: {
        select: {
          instrumentAssignments: true,
          auditLogs: true,
        },
      },
    },
  })

  if (!user) {
    return null
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t("profile.title")}</h1>
        <p className="text-muted-foreground">{t("profile.description")}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t("profile.sections.personalInfo")}
            </CardTitle>
            <CardDescription>{t("profile.sections.personalInfoDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">{t("profile.fields.name")}</Label>
                <Input id="name" defaultValue={user.name || ""} placeholder={t("profile.fields.namePlaceholder")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("profile.fields.email")}</Label>
                <Input id="email" defaultValue={user.email} disabled />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("profile.fields.role")}</Label>
                <div className="flex items-center gap-2">
                  <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                    <Shield className="h-3 w-3 mr-1" />
                    {t(`profile.roles.${user.role}`)}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("profile.fields.memberSince")}</Label>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(user.createdAt).toLocaleDateString(locale, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>
            <Separator />
            <Button>
              <Save className="h-4 w-4 mr-2" />
              {t("profile.actions.saveChanges")}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("profile.sections.stats")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{t("profile.stats.assignments")}</span>
                <span className="font-bold">{user._count.instrumentAssignments}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{t("profile.stats.auditLogs")}</span>
                <span className="font-bold">{user._count.auditLogs}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Key className="h-5 w-5" />
                {t("profile.sections.security")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                {t("profile.actions.changePassword")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
