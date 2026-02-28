import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireStaffSession } from "@/lib/rbac"
import { logAuditAction } from "@/lib/audit"

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireStaffSession()
    
    // Only ADMIN can delete patients
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
    }

    const { id } = await params

    const patient = await prisma.patient.findUnique({
      where: { id }
    })

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    // Prisma relation onDelete rules usually handle cascades, but we manually delete related
    // objects to be safe and ensure everything is wiped.
    
    await prisma.$transaction(async (tx) => {
      // 1. Delete user account associated with patient if exists
      await tx.user.delete({ where: { patientId: id } }).catch(() => {})

      // 2. Delete all instrument responses, results, sessions, assignments
      const sessions = await tx.instrumentSession.findMany({ where: { patientId: id }, select: { id: true } })
      const sessionIds = sessions.map(s => s.id)
      
      await tx.instrumentResponse.deleteMany({ where: { sessionId: { in: sessionIds } } })
      await tx.instrumentResult.deleteMany({ where: { sessionId: { in: sessionIds } } })
      await tx.instrumentSession.deleteMany({ where: { patientId: id } })
      await tx.instrumentAssignment.deleteMany({ where: { patientId: id } })

      // 3. Delete evaluations, scores, reports, diagnostic impressions, narrative sections, recommendations
      const evaluations = await tx.evaluation.findMany({ where: { patientId: id }, select: { id: true } })
      const evalIds = evaluations.map(e => e.id)
      
      const reports = await tx.report.findMany({ where: { evaluationId: { in: evalIds } }, select: { id: true } })
      const reportIds = reports.map(r => r.id)

      await tx.diagnosticImpression.deleteMany({ where: { reportId: { in: reportIds } } })
      await tx.narrativeSection.deleteMany({ where: { reportId: { in: reportIds } } })
      await tx.recommendation.deleteMany({ where: { reportId: { in: reportIds } } })
      await tx.report.deleteMany({ where: { evaluationId: { in: evalIds } } })
      
      await tx.score.deleteMany({ where: { evaluationId: { in: evalIds } } })
      await tx.evaluationAssessment.deleteMany({ where: { evaluationId: { in: evalIds } } })
      await tx.evaluation.deleteMany({ where: { patientId: id } })

      // 4. Finally delete the patient
      await tx.patient.delete({ where: { id } })
    })

    await logAuditAction(session.user.id, "DELETED_PATIENT", {
      patientId: id,
      patientName: `${patient.firstName} ${patient.lastName}`
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete patient:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
