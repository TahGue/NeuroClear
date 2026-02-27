"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { assignEvaluation } from "@/app/actions"

export function AssignEvaluationModal({ 
  assessmentId, 
  patients,
  users 
}: { 
  assessmentId: string, 
  patients: { id: string, firstName: string, lastName: string }[],
  users: { id: string, name: string | null }[]
}) {
  const [open, setOpen] = useState(false)
  const [patientId, setPatientId] = useState("")
  const [assignedTo, setAssignedTo] = useState<string>("none")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAssign = async () => {
    if (!patientId) return
    
    setIsSubmitting(true)
    const result = await assignEvaluation(
      patientId, 
      assessmentId, 
      assignedTo !== "none" ? users.find(u => u.id === assignedTo)?.name || null : null
    )
    setIsSubmitting(false)

    if (result.success) {
      setOpen(false)
      setPatientId("")
      setAssignedTo("none")
      alert("Evaluation successfully assigned to patient!")
    } else {
      alert("Failed to assign evaluation.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">Assign</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Evaluation</DialogTitle>
          <DialogDescription>
            Assign this assessment to a patient and optionally delegate to a clinician.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Patient *</label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.firstName} {p.lastName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Assign To Clinician (Optional)</label>
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger>
                <SelectValue placeholder="Leave unassigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Leave Unassigned</SelectItem>
                {users.map(u => (
                  <SelectItem key={u.id} value={u.id}>{u.name || u.id}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAssign} disabled={!patientId || isSubmitting}>
            {isSubmitting ? "Assigning..." : "Assign Assessment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
