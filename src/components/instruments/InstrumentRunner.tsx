"use client"

import { useMemo, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { saveInstrumentResponse, submitInstrumentSession } from "@/app/portal/tests/actions"

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
}: {
  sessionId: string
  instrumentName: string
  instrumentDescription: string | null
  items: Item[]
  initialResponses: Response[]
  isSubmitted: boolean
}) {
  const [index, setIndex] = useState(0)
  const [pending, startTransition] = useTransition()

  const responseMap = useMemo(() => {
    const m = new Map<string, number>()
    for (const r of initialResponses) m.set(r.itemId, r.value)
    return m
  }, [initialResponses])

  const item = items[index]
  const selected = item ? responseMap.get(item.id) : undefined

  const setAnswer = (value: number) => {
    responseMap.set(item.id, value)
    startTransition(async () => {
      await saveInstrumentResponse({ sessionId, itemId: item.id, value })
    })
  }

  const goNext = () => setIndex((i) => Math.min(items.length - 1, i + 1))
  const goPrev = () => setIndex((i) => Math.max(0, i - 1))

  const submit = () => {
    startTransition(async () => {
      await submitInstrumentSession({ sessionId })
      window.location.href = "/portal/tests"
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{instrumentName}</h1>
        {instrumentDescription ? (
          <p className="text-muted-foreground">{instrumentDescription}</p>
        ) : null}
      </div>

      {isSubmitted ? (
        <Card>
          <CardHeader>
            <CardTitle>Already submitted</CardTitle>
            <CardDescription>This instrument session has been submitted.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <a href="/portal/tests">Back to tests</a>
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
            <p className="text-base">{item.prompt}</p>

            <div className="grid gap-2">
              {item.options.map((opt) => (
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
