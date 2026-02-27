import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireStaffSession } from "@/lib/rbac"

const UpsertAssignmentSchema = z.object({
  patientId: z.string().min(1),
  instrumentId: z.string().min(1),
  dueDate: z.string().datetime().nullable().optional(),
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
    },
    update: {
      assignedByUserId: session.user.id,
      dueDate: dueDate ? new Date(dueDate) : null,
      status: "ASSIGNED",
    },
    include: { instrument: true },
  })

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
