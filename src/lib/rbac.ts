import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function requireAuthenticatedSession() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error("Unauthorized")
  }
  return session
}

export async function requireStaffSession() {
  const session = await requireAuthenticatedSession()
  const role = session.user.role
  if (!role || role === "PATIENT") {
    throw new Error("Unauthorized")
  }
  return session
}

export async function requirePatientSession() {
  const session = await requireAuthenticatedSession()
  const role = session.user.role
  const patientId = session.user.patientId

  if (role !== "PATIENT" || !patientId) {
    throw new Error("Unauthorized")
  }

  return { session, patientId }
}
