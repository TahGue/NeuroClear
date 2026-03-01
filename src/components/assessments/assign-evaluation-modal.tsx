"use client"

import { useState } from "react"
import { useI18n } from "@/lib/i18n-context"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { assignEvaluation } from "@/app/actions"
import { toast } from "sonner"

export function AssignEvaluationModal({ 
  assessmentId, 
  patients,
  users,
  onSuccess
}: { 
  assessmentId: string, 
  patients: { id: string, firstName: string, lastName: string }[],
  users: { id: string, name: string | null }[],
  onSuccess?: () => void
}) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [patientId, setPatientId] = useState("")
  const [assignedTo, setAssignedTo] = useState<string>("none")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAssign = async () => {
    if (!patientId) {
      toast.error("Please select a patient")
      return
    }
    
    setIsSubmitting(true)
    const result = await assignEvaluation(
      patientId, 
      assessmentId, 
      assignedTo !== "none" ? users.find(u => u.id === assignedTo)?.name || null : null
    )
    setIsSubmitting(false)

    if (result.success) {
      toast.success("Evaluation successfully assigned to patient.")
      setOpen(false)
      setPatientId("")
      setAssignedTo("none")
      onSuccess?.()
    } else {
      toast.error("Failed to assign evaluation.")
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">{t("common.assign") || "Assign"}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("common.assign") || "Assign Evaluation"}</DialogTitle>
          <DialogDescription>
            {t("common.assignDescription") || "Assign this assessment to a patient and optionally delegate to a clinician."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("common.selectPatient") || "Select Patient *"}</label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger>
                <SelectValue placeholder={t("common.choosePatient") || "Choose a patient"} />
              </SelectTrigger>
              <SelectContent>
                {patients.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.firstName} {p.lastName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("common.assignToClinician") || "Assign To Clinician (Optional)"}</label>
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger>
                <SelectValue placeholder={t("common.leaveUnassigned") || "Leave unassigned"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t("common.leaveUnassigned") || "Leave Unassigned"}</SelectItem>
                {users.map(u => (
                  <SelectItem key={u.id} value={u.id}>{u.name || u.id}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>{t("common.cancel")}</Button>
          <Button onClick={handleAssign} disabled={isSubmitting || !patientId}>
            {isSubmitting ? t("common.submitting") : (t("common.confirm") + " " + (t("common.assign") || "Assignment"))}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
