"use client"

import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

type InstrumentOption = {
  id: string
  name: string
  description: string | null
}

const AssignSchema = z.object({
  instrumentId: z.string().min(1, "Please select a test"),
  dueDate: z.string().optional(),
})

type AssignFormData = z.infer<typeof AssignSchema>

export function AssignInstrumentModal({
  patientId,
  instruments,
}: {
  patientId: string
  instruments: InstrumentOption[]
}) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<AssignFormData>({
    resolver: zodResolver(AssignSchema),
    defaultValues: {
      instrumentId: "",
      dueDate: "",
    },
  })

  const instrumentId = form.watch("instrumentId")
  const selectedInstrument = useMemo(
    () => instruments.find((i) => i.id === instrumentId),
    [instrumentId, instruments]
  )

  const onSubmit = async (data: AssignFormData) => {
    setIsSubmitting(true)
    setSubmitError(null)

    let finalDueDate = null
    if (data.dueDate) {
      const dateObj = new Date(data.dueDate)
      dateObj.setUTCHours(23, 59, 59, 999)
      finalDueDate = dateObj.toISOString()
    }

    try {
      const res = await fetch("/api/instrument-assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          instrumentId: data.instrumentId,
          dueDate: finalDueDate,
        }),
      })

      if (!res.ok) {
        setSubmitError("Failed to assign test.")
        return
      }

      setOpen(false)
      form.reset()
      window.location.reload()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) {
          form.reset()
          setSubmitError(null)
        }
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Assign Portal Test
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Assign Portal Test</DialogTitle>
          <DialogDescription>Assign a patient-facing screener to this patient.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="instrumentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Test *</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a test" />
                      </SelectTrigger>
                      <SelectContent>
                        {instruments.map((inst) => (
                          <SelectItem key={inst.id} value={inst.id}>
                            {inst.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                  {selectedInstrument?.description ? (
                    <p className="text-xs text-muted-foreground">{selectedInstrument.description}</p>
                  ) : null}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due date (optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Assigning..." : "Assign"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
