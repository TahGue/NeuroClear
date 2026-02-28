import { describe, it, expect } from "vitest"
import { scoreInstrument } from "../../src/lib/instrument-scoring"

describe("instrument-scoring", () => {
  it("scores PHQ-9 correctly into severity bands", () => {
    // 0 score
    expect(scoreInstrument("phq9", [{ value: 0 }, { value: 0 }]).interpretation).toBe("Minimal depression")
    // 5 score
    expect(scoreInstrument("phq9", [{ value: 3 }, { value: 2 }]).interpretation).toBe("Mild depression")
    // 10 score
    expect(scoreInstrument("phq9", [{ value: 3 }, { value: 3 }, { value: 4 }]).interpretation).toBe("Moderate depression")
    // 15 score
    expect(scoreInstrument("phq9", [{ value: 3 }, { value: 3 }, { value: 3 }, { value: 3 }, { value: 3 }]).interpretation).toBe("Moderately severe depression")
    // 20 score
    expect(scoreInstrument("phq9", Array(7).fill({ value: 3 })).interpretation).toBe("Severe depression")
  })

  it("scores GAD-7 correctly into severity bands", () => {
    expect(scoreInstrument("gad7", [{ value: 0 }]).interpretation).toBe("Minimal anxiety")
    expect(scoreInstrument("gad7", [{ value: 3 }, { value: 2 }]).interpretation).toBe("Mild anxiety")
    expect(scoreInstrument("gad7", [{ value: 3 }, { value: 3 }, { value: 4 }]).interpretation).toBe("Moderate anxiety")
    expect(scoreInstrument("gad7", Array(5).fill({ value: 3 })).interpretation).toBe("Severe anxiety")
  })

  it("scores Child Pattern Weaving correctly", () => {
    // 1 correct
    expect(scoreInstrument("child-pattern-weaving", [{ value: 1 }]).interpretation).toBe("Needs support")
    // 3 correct
    expect(scoreInstrument("child-pattern-weaving", [{ value: 1 }, { value: 1 }, { value: 1 }]).interpretation).toBe("On track")
  })

  it("returns a generic completion state for unknown instruments", () => {
    const result = scoreInstrument("unknown-slug", [{ value: 1 }])
    expect(result.totalScore).toBe(1)
    expect(result.interpretation).toBe("Completed")
  })
})
