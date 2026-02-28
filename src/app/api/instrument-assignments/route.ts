import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireStaffSession } from "@/lib/rbac"
import { logAuditAction } from "@/lib/audit"
import { randomBytes } from "crypto"

const UpsertAssignmentSchema = z.object({
  patientId: z.string().min(1),
  instrumentId: z.string().min(1),
  dueDate: z.string().datetime().nullable().optional(),
})

const DeleteAssignmentSchema = z.object({
  patientId: z.string().min(1),
  instrumentId: z.string().min(1),
})

export async function POST(req: Request) {
  let session
  try {
    session = await requireStaffSession()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let json: unknown
  try {
    json = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = UpsertAssignmentSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 })
  }

  const { patientId, instrumentId, dueDate } = parsed.data

  const instrument = await prisma.instrument.findUnique({
    where: { id: instrumentId },
    select: { audience: true, minAgeYears: true, maxAgeYears: true }
  })

  const token = instrument?.audience !== "PATIENT" ? randomBytes(32).toString("hex") : null

  const assignment = await prisma.instrumentAssignment.upsert({
    where: {
      patientId_instrumentId: {
        patientId,
        instrumentId,
      },
    },
    create: {
      patientId,
      instrumentId,
      assignedByUserId: session.user.id,
      dueDate: dueDate ? new Date(dueDate) : null,
      token,
    },
    update: {
      assignedByUserId: session.user.id,
      dueDate: dueDate ? new Date(dueDate) : null,
      status: "ASSIGNED",
      // If we are resetting it to ASSIGNED, maybe we should regenerate token if missing? Let's just keep the existing one or generate if missing.
    },
    include: { instrument: true },
  })

  // If we just updated and it doesn't have a token but should, we add it.
  if (instrument?.audience !== "PATIENT" && !assignment.token) {
    await prisma.instrumentAssignment.update({
      where: { id: assignment.id },
      data: { token: randomBytes(32).toString("hex") }
    })
  }

  const existingSession = await prisma.instrumentSession.findFirst({
    where: {
      patientId,
      instrumentId,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: { id: true, status: true },
  })

  const instrumentSession =
    existingSession ??
    (await prisma.instrumentSession.create({
      data: {
        patientId,
        instrumentId,
      },
      select: { id: true, status: true },
    }))

  return NextResponse.json({ success: true, assignment, instrumentSession })
}

export async function DELETE(req: Request) {
  try {
    await requireStaffSession()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let json: unknown
  try {
    json = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = DeleteAssignmentSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 })
  }

  const { patientId, instrumentId } = parsed.data

  await prisma.instrumentAssignment.delete({
    where: {
      patientId_instrumentId: {
        patientId,
        instrumentId,
      },
    },
  })

  return NextResponse.json({ success: true })
}
