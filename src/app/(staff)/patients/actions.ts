"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createPatient(formData: FormData) {
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const dateOfBirth = new Date(formData.get("dateOfBirth") as string)
  const referralSource = formData.get("referralSource") as string || null

  await prisma.patient.create({
    data: {
      firstName,
      lastName,
      dateOfBirth,
      referralSource,
    },
  })

  revalidatePath("/patients")
  redirect("/patients")
}

export async function updatePatient(formData: FormData) {
  const id = formData.get("id") as string
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const dateOfBirth = new Date(formData.get("dateOfBirth") as string)
  const referralSource = formData.get("referralSource") as string || null
  const status = formData.get("status") as string

  await prisma.patient.update({
    where: { id },
    data: {
      firstName,
      lastName,
      dateOfBirth,
      referralSource,
      status: status as any,
    },
  })

  revalidatePath("/patients")
  redirect("/patients")
}

export async function deletePatient(formData: FormData) {
  const id = formData.get("id") as string

  await prisma.patient.delete({
    where: { id },
  })

  revalidatePath("/patients")
}
