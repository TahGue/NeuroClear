"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createPatient, updatePatient, deletePatient } from "@/app/(staff)/patients/actions"
import { useI18n } from "@/lib/i18n-context"
import { Pencil, Trash2, UserPlus } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type Patient = {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: Date
  referralSource: string | null
  status: string
}

export function AddPatientDialog() {
  const [open, setOpen] = useState(false)
  const { t } = useI18n()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)}>
        <UserPlus className="h-4 w-4 mr-2" />
        {t("patients.cta")}
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("patients.dialogs.add.title")}</DialogTitle>
          <DialogDescription>{t("patients.dialogs.add.description")}</DialogDescription>
        </DialogHeader>
        <form action={createPatient} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">{t("patients.dialogs.fields.firstName")}</Label>
              <Input id="firstName" name="firstName" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">{t("patients.dialogs.fields.lastName")}</Label>
              <Input id="lastName" name="lastName" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">{t("patients.dialogs.fields.dateOfBirth")}</Label>
            <Input id="dateOfBirth" name="dateOfBirth" type="date" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="referralSource">{t("patients.dialogs.fields.referralSource")}</Label>
            <Input id="referralSource" name="referralSource" placeholder={t("patients.dialogs.fields.referralPlaceholder")} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t("patients.dialogs.actions.cancel")}
            </Button>
            <Button type="submit">{t("patients.dialogs.actions.create")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function EditPatientDialog({ patient }: { patient: Patient }) {
  const [open, setOpen] = useState(false)
  const { t } = useI18n()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <Pencil className="h-4 w-4" />
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("patients.dialogs.edit.title")}</DialogTitle>
          <DialogDescription>{t("patients.dialogs.edit.description")}</DialogDescription>
        </DialogHeader>
        <form action={updatePatient} className="space-y-4">
          <input type="hidden" name="id" value={patient.id} />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-firstName">{t("patients.dialogs.fields.firstName")}</Label>
              <Input id="edit-firstName" name="firstName" defaultValue={patient.firstName} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-lastName">{t("patients.dialogs.fields.lastName")}</Label>
              <Input id="edit-lastName" name="lastName" defaultValue={patient.lastName} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-dateOfBirth">{t("patients.dialogs.fields.dateOfBirth")}</Label>
            <Input
              id="edit-dateOfBirth"
              name="dateOfBirth"
              type="date"
              defaultValue={new Date(patient.dateOfBirth).toISOString().split("T")[0]}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-referralSource">{t("patients.dialogs.fields.referralSource")}</Label>
            <Input
              id="edit-referralSource"
              name="referralSource"
              defaultValue={patient.referralSource || ""}
              placeholder={t("patients.dialogs.fields.referralPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-status">{t("patients.dialogs.fields.status")}</Label>
            <Select name="status" defaultValue={patient.status}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">{t("patients.status.ACTIVE")}</SelectItem>
                <SelectItem value="INACTIVE">{t("patients.status.INACTIVE")}</SelectItem>
                <SelectItem value="DISCHARGED">{t("patients.status.DISCHARGED")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t("patients.dialogs.actions.cancel")}
            </Button>
            <Button type="submit">{t("patients.dialogs.actions.save")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function DeletePatientDialog({ patient }: { patient: Patient }) {
  const [open, setOpen] = useState(false)
  const { t } = useI18n()

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)} className="text-destructive hover:text-destructive">
        <Trash2 className="h-4 w-4" />
      </Button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("patients.dialogs.delete.title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("patients.dialogs.delete.description").replace("{name}", `${patient.firstName} ${patient.lastName}`)}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form action={deletePatient}>
          <input type="hidden" name="id" value={patient.id} />
          <AlertDialogFooter>
            <AlertDialogCancel>{t("patients.dialogs.actions.cancel")}</AlertDialogCancel>
            <AlertDialogAction type="submit" className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t("patients.dialogs.actions.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
      </AlertDialog>
  )
}
