"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useI18n } from "@/lib/i18n-context"
import { assignTestToPatient } from "./actions"
import type { Patient } from "@prisma/client"

interface AssignTestClientProps {
  testSlug: string
  testName: string
  patients: Patient[]
}

export function AssignTestClient({ testSlug, testName, patients }: AssignTestClientProps) {
  const { t } = useI18n()
  const router = useRouter()
  const [patientId, setPatientId] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!patientId) {
      setError(t("tests.assign.validation.patientRequired"))
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await assignTestToPatient({
        patientId,
        testSlug,
        dueDate: dueDate || undefined,
      })

      if (result.success) {
        router.push("/tests")
        router.refresh()
      } else {
        setError(result.error || t("errors.generic"))
      }
    } catch (err) {
      setError(t("errors.generic"))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{t("tests.assign.title")}</CardTitle>
        <CardDescription>
          {t("tests.assign.description")}: <strong>{testName}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="patient">{t("tests.assign.selectPatient")}</Label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger>
                <SelectValue placeholder={t("tests.assign.selectPatient")} />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.firstName} {patient.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">{t("tests.assign.dueDate")}</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("tests.assign.assigning") : t("tests.assign.assign")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
