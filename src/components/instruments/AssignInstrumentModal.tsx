"use client"

import { useMemo, useState } from "react"
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

type InstrumentOption = {
  id: string
  name: string
  description: string | null
}

export function AssignInstrumentModal({
  patientId,
  instruments,
}: {
  patientId: string
  instruments: InstrumentOption[]
}) {
  const [open, setOpen] = useState(false)
  const [instrumentId, setInstrumentId] = useState<string>("")
  const [dueDate, setDueDate] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedInstrument = useMemo(
    () => instruments.find((i) => i.id === instrumentId),
    [instrumentId, instruments]
  )

  const handleAssign = async () => {
    if (!instrumentId) return

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/instrument-assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          instrumentId,
          dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        }),
      })

      if (!res.ok) {
        alert("Failed to assign test.")
        return
      }

      setOpen(false)
      setInstrumentId("")
      setDueDate("")
      window.location.reload()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Test *</label>
            <Select value={instrumentId} onValueChange={setInstrumentId}>
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
            {selectedInstrument?.description ? (
              <p className="text-xs text-muted-foreground">{selectedInstrument.description}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Due date (optional)</label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={!instrumentId || isSubmitting}>
            {isSubmitting ? "Assigning..." : "Assign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
