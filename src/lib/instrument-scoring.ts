import type { Prisma } from "@prisma/client"

type Response = { value: number }

export type ScoreResult = {
  totalScore: number
  interpretation: string
  details?: Prisma.InputJsonValue
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

export function scoreInstrument(slug: string, responses: Response[]): ScoreResult {
  const totalScore = responses.reduce<number>((sum, r) => sum + r.value, 0)

  switch (slug) {
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
      return { totalScore, interpretation, details: { slug } }
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
      return { totalScore, interpretation, details: { slug } }
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
      return { totalScore, interpretation, details: { slug } }
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
