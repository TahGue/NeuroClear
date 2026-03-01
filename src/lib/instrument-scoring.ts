import type { Prisma } from "@prisma/client"

type Response = { value: number }

export type SeverityLevel = "minimal" | "mild" | "moderate" | "severe" | "none"

export type ScoreResult = {
  totalScore: number
  interpretation: string
  severity?: SeverityLevel
  percentile?: number
  normReference?: string
  details?: Prisma.InputJsonValue
  subscales?: Record<string, { score: number; interpretation: string }>
}

type NormsTable = {
  ageRanges?: Array<{ min: number; max: number }>
  percentiles: Array<{ score: number; percentile: number }>
  reference: string
}

const NORMS: Record<string, NormsTable> = {
  phq9: {
    percentiles: [
      { score: 0, percentile: 15 },
      { score: 5, percentile: 50 },
      { score: 10, percentile: 80 },
      { score: 15, percentile: 90 },
      { score: 20, percentile: 97 },
    ],
    reference: "Kroenke K et al. J Gen Intern Med. 2001;16:606-613",
  },
  gad7: {
    percentiles: [
      { score: 0, percentile: 20 },
      { score: 5, percentile: 55 },
      { score: 10, percentile: 85 },
      { score: 15, percentile: 95 },
    ],
    reference: "Spitzer RL et al. Arch Gen Psychiatry. 2006;63:1092-1097",
  },
  audit: {
    percentiles: [
      { score: 0, percentile: 25 },
      { score: 8, percentile: 60 },
      { score: 16, percentile: 85 },
      { score: 20, percentile: 95 },
    ],
    reference: "Saunders JB et al. Addiction. 1993;88:349-362",
  },
  scared: {
    percentiles: [
      { score: 0, percentile: 30 },
      { score: 15, percentile: 60 },
      { score: 25, percentile: 85 },
      { score: 30, percentile: 95 },
    ],
    reference: "Birmaher B et al. J Am Acad Child Adolesc Psychiatry. 1997;36:545-553",
  },
  sdq: {
    percentiles: [
      { score: 0, percentile: 50 },
      { score: 3, percentile: 80 },
      { score: 5, percentile: 90 },
      { score: 7, percentile: 97 },
    ],
    reference: "Goodman R. J Child Psychol Psychiatry. 1997;38:581-586",
  },
  pcl5: {
    percentiles: [
      { score: 0, percentile: 20 },
      { score: 20, percentile: 55 },
      { score: 33, percentile: 75 },
      { score: 50, percentile: 90 },
    ],
    reference: "Weathers FW et al. PTSD Checklist for DSM-5 (PCL-5). 2013",
  },
  vanderbilt: {
    percentiles: [
      { score: 0, percentile: 25 },
      { score: 12, percentile: 60 },
      { score: 24, percentile: 85 },
      { score: 36, percentile: 95 },
    ],
    reference: "Wolraich ML et al. Pediatrics. 2003;113:e745-e760",
  },
}

function interpolatePercentile(score: number, norms: NormsTable): number {
  const { percentiles } = norms
  if (score <= percentiles[0].score) return percentiles[0].percentile
  if (score >= percentiles[percentiles.length - 1].score) return 99

  for (let i = 0; i < percentiles.length - 1; i++) {
    const lower = percentiles[i]
    const upper = percentiles[i + 1]
    if (score >= lower.score && score <= upper.score) {
      const ratio = (score - lower.score) / (upper.score - lower.score)
      return Math.round(lower.percentile + ratio * (upper.percentile - lower.percentile))
    }
  }
  return 50
}

function getSeverityFromBands(score: number, bands: Array<{ max: number; severity: SeverityLevel }>): SeverityLevel {
  for (const band of bands) {
    if (score <= band.max) return band.severity
  }
  return "severe"
}

function bandByThresholds(
  total: number,
  thresholds: Array<{ max: number; label: string }>,
  fallback: string
) {
  for (const t of thresholds) {
    if (total <= t.max) return t.label
  }
  return fallback
}

export function scoreInstrument(slug: string, responses: Response[], totalItems?: number): ScoreResult {
  const totalScore = responses.reduce<number>((sum, r) => sum + r.value, 0)

  // Missing item policy: If more than 20% of items are missing, mark as INCOMPLETE
  if (totalItems !== undefined && totalItems > 0) {
    const missingCount = totalItems - responses.length
    const missingPercentage = missingCount / totalItems
    
    if (missingPercentage > 0.2) {
      return {
        totalScore,
        interpretation: "INCOMPLETE (Too many missing items)",
        details: { slug, incomplete: true, missingCount, totalItems }
      }
    }
  }

  switch (slug) {
    case "crafft": {
      const interpretation = bandByThresholds(
        totalScore,
        [
          { max: 1, label: "Low risk" },
        ],
        "High risk for substance use disorder"
      )
      return { totalScore, interpretation, details: { slug, maxScore: 6 } }
    }
    case "ysr": {
      const interpretation = bandByThresholds(
        totalScore,
        [
          { max: 2, label: "Normal range" },
          { max: 5, label: "Borderline clinical" },
        ],
        "Clinical range"
      )
      return { totalScore, interpretation, details: { slug, maxScore: 8 } }
    }
    case "cog-screen": {
      const interpretation = bandByThresholds(
        totalScore,
        [
          { max: 1, label: "Further evaluation recommended" },
        ],
        "Normal cognition"
      )
      return { totalScore, interpretation, details: { slug, maxScore: 3 } }
    }
    case "pcl5": {
      const interpretation = bandByThresholds(
        totalScore,
        [
          { max: 32, label: "Below threshold" },
        ],
        "Provisional PTSD diagnosis"
      )
      return {
        totalScore,
        interpretation,
        severity: totalScore >= 33 ? "moderate" : "minimal",
        percentile: interpolatePercentile(totalScore, NORMS.pcl5),
        normReference: NORMS.pcl5.reference,
        details: { slug, maxScore: 80, threshold: 33 },
      }
    }
    case "vanderbilt": {
      const interpretation = bandByThresholds(
        totalScore,
        [
          { max: 11, label: "Below threshold" },
        ],
        "Positive for ADHD symptoms"
      )
      return {
        totalScore,
        interpretation,
        severity: totalScore > 11 ? "moderate" : "minimal",
        percentile: interpolatePercentile(totalScore, NORMS.vanderbilt),
        normReference: NORMS.vanderbilt.reference,
        details: { slug },
      }
    }
    case "scared": {
      const interpretation = bandByThresholds(
        totalScore,
        [
          { max: 24, label: "Normal anxiety" },
        ],
        "Significant anxiety symptoms"
      )
      return {
        totalScore,
        interpretation,
        severity: totalScore > 24 ? "moderate" : "minimal",
        percentile: interpolatePercentile(totalScore, NORMS.scared),
        normReference: NORMS.scared.reference,
        details: { slug },
      }
    }
    case "sdq": {
      const interpretation = bandByThresholds(
        totalScore,
        [
          { max: 2, label: "Close to average" },
          { max: 4, label: "Slightly raised" },
          { max: 6, label: "High" },
        ],
        "Very high"
      )
      return {
        totalScore,
        interpretation,
        severity: totalScore >= 6 ? "severe" : totalScore >= 4 ? "moderate" : totalScore >= 2 ? "mild" : "minimal",
        percentile: interpolatePercentile(totalScore, NORMS.sdq),
        normReference: NORMS.sdq.reference,
        details: { slug, maxScore: 6 },
      }
    }
    case "phqa": {
      const interpretation = bandByThresholds(
        totalScore,
        [
          { max: 4, label: "Minimal depression" },
          { max: 9, label: "Mild depression" },
          { max: 14, label: "Moderate depression" },
          { max: 19, label: "Moderately severe depression" },
        ],
        "Severe depression"
      )
      return { totalScore, interpretation, details: { slug, maxScore: 27 } }
    }
    case "audit": {
      const interpretation = bandByThresholds(
        totalScore,
        [
          { max: 7, label: "Low risk" },
          { max: 15, label: "Medium risk" },
          { max: 19, label: "High risk" },
        ],
        "Possible dependence"
      )
      return {
        totalScore,
        interpretation,
        severity: totalScore >= 16 ? "severe" : totalScore >= 8 ? "moderate" : "minimal",
        percentile: interpolatePercentile(totalScore, NORMS.audit),
        normReference: NORMS.audit.reference,
        details: { slug },
      }
    }
    case "phq9": {
      const interpretation = bandByThresholds(
        totalScore,
        [
          { max: 4, label: "Minimal depression" },
          { max: 9, label: "Mild depression" },
          { max: 14, label: "Moderate depression" },
          { max: 19, label: "Moderately severe depression" },
        ],
        "Severe depression"
      )
      const severityBands = [
        { max: 4, severity: "minimal" as const },
        { max: 9, severity: "mild" as const },
        { max: 14, severity: "moderate" as const },
        { max: 19, severity: "moderate" as const },
      ]
      return {
        totalScore,
        interpretation,
        severity: getSeverityFromBands(totalScore, severityBands),
        percentile: interpolatePercentile(totalScore, NORMS.phq9),
        normReference: NORMS.phq9.reference,
        details: { slug, maxScore: 27 },
      }
    }
    case "gad7": {
      const interpretation = bandByThresholds(
        totalScore,
        [
          { max: 4, label: "Minimal anxiety" },
          { max: 9, label: "Mild anxiety" },
          { max: 14, label: "Moderate anxiety" },
        ],
        "Severe anxiety"
      )
      const severityBands = [
        { max: 4, severity: "minimal" as const },
        { max: 9, severity: "mild" as const },
        { max: 14, severity: "moderate" as const },
      ]
      return {
        totalScore,
        interpretation,
        severity: getSeverityFromBands(totalScore, severityBands),
        percentile: interpolatePercentile(totalScore, NORMS.gad7),
        normReference: NORMS.gad7.reference,
        details: { slug },
      }
    }
    case "audit": {
      const interpretation = bandByThresholds(
        totalScore,
        [
          { max: 7, label: "Low risk" },
          { max: 15, label: "Medium risk" },
          { max: 19, label: "High risk" },
        ],
        "Possible dependence"
      )
      const severityBands = [
        { max: 7, severity: "minimal" as const },
        { max: 15, severity: "mild" as const },
        { max: 19, severity: "moderate" as const },
      ]
      return {
        totalScore,
        interpretation,
        severity: getSeverityFromBands(totalScore, severityBands),
        percentile: interpolatePercentile(totalScore, NORMS.audit),
        normReference: NORMS.audit.reference,
        details: { slug },
      }
    }
    case "asrs": {
      const interpretation = bandByThresholds(
        totalScore,
        [
          { max: 8, label: "Unlikely ADHD" },
        ],
        "Highly likely ADHD"
      )
      return { totalScore, interpretation, details: { slug, maxScore: 12 } }
    }
    case "gds15": {
      const interpretation = bandByThresholds(
        totalScore,
        [
          { max: 1, label: "Normal" },
          { max: 2, label: "Suggests depression" },
        ],
        "Almost certainly depression"
      )
      return { totalScore, interpretation, details: { slug, maxScore: 3 } }
    }
    case "child-emotion-masks": {
      const interpretation = bandByThresholds(
        totalScore,
        [
          { max: 7, label: "LOW" },
          { max: 15, label: "MODERATE" },
        ],
        "HIGH"
      )
      return { totalScore, interpretation, details: { slug, band: interpretation } }
    }
    case "child-pattern-weaving": {
      const interpretation = bandByThresholds(
        totalScore,
        [
          { max: 1, label: "Needs support" },
          { max: 3, label: "On track" },
        ],
        "On track"
      )
      return { totalScore, interpretation, details: { slug, maxScore: 3 } }
    }
    case "child-story-seeds": {
      const interpretation = bandByThresholds(
        totalScore,
        [
          { max: 1, label: "Needs support" },
          { max: 3, label: "On track" },
        ],
        "On track"
      )
      return { totalScore, interpretation, details: { slug, maxScore: 3 } }
    }
    case "child-breath-bell": {
      const interpretation = bandByThresholds(
        totalScore,
        [
          { max: 3, label: "Developing" },
          { max: 7, label: "Steady" },
        ],
        "Steady"
      )
      return { totalScore, interpretation, details: { slug, maxScore: 7 } }
    }
    case "teen-uncertainty-compass": {
      const interpretation = bandByThresholds(totalScore, [{ max: 1, label: "Rigid" }, { max: 2, label: "Flexible" }], "Highly Flexible")
      return { totalScore, interpretation, details: { slug } }
    }
    case "teen-social-harmony": {
      const interpretation = bandByThresholds(totalScore, [{ max: 0, label: "Direct/Literal" }], "Context-Aware")
      return { totalScore, interpretation, details: { slug, maxScore: 2 } }
    }
    case "teen-rhythm-meter": {
      const interpretation = bandByThresholds(totalScore, [{ max: 1, label: "Developing" }], "Strong")
      return { totalScore, interpretation, details: { slug, maxScore: 2 } }
    }
    case "teen-ethics-motion": {
      return { totalScore, interpretation: "Completed (Qualitative)", details: { slug } }
    }
    case "adult-debate-evidence": {
      const interpretation = bandByThresholds(totalScore, [{ max: 1, label: "Developing" }], "Strong Evaluator")
      return { totalScore, interpretation, details: { slug, maxScore: 2 } }
    }
    case "adult-cognitive-marketplace": {
      const interpretation = bandByThresholds(totalScore, [{ max: 2, label: "Needs constraint focus" }], "Highly Efficient")
      return { totalScore, interpretation, details: { slug, maxScore: 4 } }
    }
    case "adult-temperament-balance": {
      const interpretation = bandByThresholds(totalScore, [{ max: 2, label: "Reactive" }], "Regulated")
      return { totalScore, interpretation, details: { slug, maxScore: 4 } }
    }
    case "adult-values-compass": {
      return { totalScore, interpretation: "Values Clarified", details: { slug } }
    }
    case "senior-processing-kind": {
      const interpretation = bandByThresholds(totalScore, [{ max: 1, label: "Review recommended" }], "Intact")
      return { totalScore, interpretation, details: { slug, maxScore: 2 } }
    }
    case "senior-wisdom-ambiguity": {
      const interpretation = bandByThresholds(totalScore, [{ max: 1, label: "Concrete interpretation" }], "Abstract/Contextual interpretation")
      return { totalScore, interpretation, details: { slug, maxScore: 2 } }
    }
    case "senior-gentle-attention": {
      const interpretation = bandByThresholds(totalScore, [{ max: 0, label: "Review recommended" }], "Intact")
      return { totalScore, interpretation, details: { slug, maxScore: 1 } }
    }
    case "senior-life-chapters": {
      return { totalScore, interpretation: "Narrative Recorded", details: { slug } }
    }
    default:
      return { totalScore, interpretation: "Completed", details: { slug } }
  }
}
