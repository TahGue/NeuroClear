"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { useI18n } from "@/lib/i18n-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { formatDateTime } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"

type Option = { label: string; value: number }

type Item = {
  id: string
  order: number
  prompt: string
  options: Option[]
}

type Response = {
  itemId: string
  value: number
}

export function InstrumentRunner({
  sessionId,
  instrumentName,
  instrumentDescription,
  items,
  initialResponses,
  isSubmitted,
  lastSavedAt,
  submittedAt,
  onSave,
  onSubmit,
  backLink = "/portal/tests",
}: {
  sessionId: string
  instrumentName: string
  instrumentDescription: string | null
  items: Item[]
  initialResponses: Response[]
  isSubmitted: boolean
  lastSavedAt?: Date
  submittedAt?: Date | null
  onSave: (itemId: string, value: number) => Promise<{ success: boolean; error?: string }>
  onSubmit: () => Promise<{ success: boolean; error?: string }>
  backLink?: string
}) {
  const { t } = useI18n()
  const [index, setIndex] = useState(0)
  const [pending, startTransition] = useTransition()

  const [responses, setResponses] = useState<Response[]>(initialResponses)

  useEffect(() => {
    setResponses(initialResponses)
  }, [initialResponses])

  const responseMap = useMemo(() => {
    const m = new Map<string, number>()
    for (const r of responses) m.set(r.itemId, r.value)
    return m
  }, [responses])

  const item = items[index]
  const selected = item ? responseMap.get(item.id) : undefined

  const setAnswer = (value: number) => {
    if (!item) return
    setResponses((prev) => {
      const next = prev.filter((r) => r.itemId !== item.id)
      next.push({ itemId: item.id, value })
      return next
    })
    startTransition(async () => {
      await onSave(item.id, value)
    })
  }

  const goNext = () => setIndex((i) => Math.min(items.length - 1, i + 1))
  const goPrev = () => setIndex((i) => Math.max(0, i - 1))

  const submit = () => {
    startTransition(async () => {
      const res = await onSubmit()
      if (res.success) {
        toast.success(t("common.success"))
        window.location.href = backLink
      } else {
        toast.error(res.error || t("portal.errors.submit"))
      }
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{instrumentName}</h1>
        {instrumentDescription ? (
          <p className="text-muted-foreground">{instrumentDescription}</p>
        ) : null}

        <div className="mt-4 space-y-2">
          <Progress value={(responses.length / items.length) * 100} className="h-2" />
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span>
              {t("portal.badges.progress")} {responses.length}/{items.length}
            </span>
            {isSubmitted && submittedAt ? (
              <span>{t("portal.badges.submitted")} {formatDateTime(submittedAt)}</span>
            ) : lastSavedAt ? (
              <span>{t("portal.badges.saved")} {formatDateTime(lastSavedAt)}</span>
            ) : null}
          </div>
        </div>
      </div>

      {isSubmitted ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("common.success")}</CardTitle>
            <CardDescription>{t("portal.home.testsCard.completedLabel")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href={backLink}>{t("portal.buttons.back")}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              Question {index + 1} of {items.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {item ? <p className="text-base">{item.prompt}</p> : null}

            <div className="grid gap-2">
              {item?.options?.map((opt) => (
                <Button
                  key={opt.value}
                  type="button"
                  variant={selected === opt.value ? "default" : "outline"}
                  onClick={() => setAnswer(opt.value)}
                  disabled={pending}
                  className="justify-start"
                >
                  {opt.label}
                </Button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button variant="outline" onClick={goPrev} disabled={index === 0 || pending}>
                Previous
              </Button>

              {index < items.length - 1 ? (
                <Button onClick={goNext} disabled={pending}>
                  Next
                </Button>
              ) : (
                <Button onClick={submit} disabled={pending}>
                  Submit
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
