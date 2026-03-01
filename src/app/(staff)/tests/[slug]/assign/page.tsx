import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { getServerLocale, getT } from "@/lib/i18n-server"
import { AssignTestClient } from "./assign-client"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function AssignTestPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const locale = await getServerLocale()
  const t = await getT(locale)

  const instrument = await prisma.instrument.findFirst({
    where: { slug, locale: "en" },
  })

  if (!instrument) {
    notFound()
  }

  const patients = await prisma.patient.findMany({
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/tests/${slug}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{t("tests.assign.title")}</h1>
          <p className="text-muted-foreground">
            {t("tests.assign.description")}: <strong>{instrument.name}</strong>
          </p>
        </div>
      </div>

      <AssignTestClient
        testSlug={slug}
        testName={instrument.name}
        patients={patients}
      />
    </div>
  )
}
