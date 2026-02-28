import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

export async function logAuditAction(
  userId: string,
  action: string,
  details?: Prisma.InputJsonValue
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        details: details !== undefined ? details : Prisma.JsonNull,
      },
    })
  } catch (error) {
    console.error("Failed to write to audit log:", error)
    // We intentionally don't throw here to avoid breaking the main user flow
    // if audit logging fails.
  }
}
