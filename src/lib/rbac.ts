import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"

export async function requireAuthenticatedSession() {
  let session
  try {
    session = await getServerSession(authOptions)
  } catch {
    redirect("/login")
  }
  if (!session?.user) {
    redirect("/login")
  }
  return session
}

export async function requireStaffSession() {
  const session = await requireAuthenticatedSession()
  const role = session.user.role
  if (!role || role === "PATIENT") {
    redirect("/portal")
  }
  return session
}

export async function requirePatientSession() {
  const session = await requireAuthenticatedSession()
  const role = session.user.role
  const patientId = session.user.patientId

  if (role !== "PATIENT" || !patientId) {
    redirect("/login")
  }

  return { session, patientId }
}

export async function requireOwnership(patientId: string) {
  const { patientId: sessionPatientId } = await requirePatientSession()
  if (sessionPatientId !== patientId) {
    throw new Error("Forbidden: You do not have access to this resource")
  }
  return true
}

export async function requireStaffOrOwnership(patientId: string) {
  const session = await requireAuthenticatedSession()
  const role = session.user.role
  if (role === "PATIENT") {
    const sessionPatientId = session.user.patientId
    if (!sessionPatientId || sessionPatientId !== patientId) {
      throw new Error("Forbidden: You do not have access to this resource")
    }
  }
  return session
}
