import { PrismaClient, Prisma } from "@prisma/client"

export async function main() {
  const prisma = new PrismaClient()
  const report = await prisma.report.findUnique({
    where: { id: "1" },
    include: {
      evaluation: {
        include: {
          patient: true,
          assessment: true,
          scores: {
            include: {
              subtest: true,
            },
          },
        },
      },
      diagnosticImpressions: true,
      narrativeSections: true,
      recommendations: true,
    },
  })
  
  if (report) {
    console.log(report.signatureName)
    console.log(report.signatureTitle)
    console.log(report.signedAt)
  }
}
