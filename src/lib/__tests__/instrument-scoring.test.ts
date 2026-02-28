import { describe, it, expect } from "vitest"
import { scoreInstrument } from "../instrument-scoring"

describe("Instrument Scoring Engine", () => {
  describe("AUDIT", () => {
    it("scores Low risk correctly", () => {
      const result = scoreInstrument("audit", [{ value: 2 }, { value: 3 }, { value: 1 }])
      expect(result.totalScore).toBe(6)
      expect(result.interpretation).toBe("Low risk")
    })

    it("scores High risk correctly", () => {
      const result = scoreInstrument("audit", [{ value: 4 }, { value: 4 }, { value: 4 }, { value: 4 }, { value: 2 }])
      expect(result.totalScore).toBe(18)
      expect(result.interpretation).toBe("High risk")
    })
  })

  describe("PHQ-9", () => {
    it("scores Minimal depression correctly", () => {
      const result = scoreInstrument("phq9", [{ value: 1 }, { value: 0 }, { value: 2 }])
      expect(result.totalScore).toBe(3)
      expect(result.interpretation).toBe("Minimal depression")
    })

    it("scores Severe depression correctly", () => {
      const result = scoreInstrument("phq9", [{ value: 3 }, { value: 3 }, { value: 3 }, { value: 3 }, { value: 3 }, { value: 3 }, { value: 3 }])
      expect(result.totalScore).toBe(21)
      expect(result.interpretation).toBe("Severe depression")
    })
  })

  describe("GAD-7", () => {
    it("scores Mild anxiety correctly", () => {
      const result = scoreInstrument("gad7", [{ value: 2 }, { value: 2 }, { value: 1 }])
      expect(result.totalScore).toBe(5)
      expect(result.interpretation).toBe("Mild anxiety")
    })
  })

  describe("ASRS", () => {
    it("scores Unlikely ADHD correctly", () => {
      const result = scoreInstrument("asrs", [{ value: 2 }, { value: 2 }, { value: 1 }])
      expect(result.totalScore).toBe(5)
      expect(result.interpretation).toBe("Unlikely ADHD")
    })

    it("scores Highly likely ADHD correctly", () => {
      const result = scoreInstrument("asrs", [{ value: 4 }, { value: 3 }, { value: 4 }])
      expect(result.totalScore).toBe(11)
      expect(result.interpretation).toBe("Highly likely ADHD")
    })
  })

  describe("GDS-15", () => {
    it("scores Normal correctly", () => {
      const result = scoreInstrument("gds15", [{ value: 1 }, { value: 0 }, { value: 0 }])
      expect(result.totalScore).toBe(1)
      expect(result.interpretation).toBe("Normal")
    })

    it("scores Almost certainly depression correctly", () => {
      const result = scoreInstrument("gds15", [{ value: 1 }, { value: 1 }, { value: 1 }])
      expect(result.totalScore).toBe(3)
      expect(result.interpretation).toBe("Almost certainly depression")
    })
  })

  describe("SDQ", () => {
    it("scores Close to average correctly", () => {
      const result = scoreInstrument("sdq", [{ value: 0 }, { value: 1 }, { value: 0 }])
      expect(result.totalScore).toBe(1)
      expect(result.interpretation).toBe("Close to average")
    })

    it("scores Very high correctly", () => {
      const result = scoreInstrument("sdq", [{ value: 2 }, { value: 2 }, { value: 2 }])
      expect(result.totalScore).toBe(6)
      expect(result.interpretation).toBe("High")
    })
  })

  describe("PHQ-A", () => {
    it("scores Minimal depression correctly", () => {
      const result = scoreInstrument("phqa", [{ value: 1 }, { value: 0 }, { value: 2 }])
      expect(result.totalScore).toBe(3)
      expect(result.interpretation).toBe("Minimal depression")
    })
  })

  describe("Unknown Instrument", () => {
    it("returns Completed fallback for unknown slugs", () => {
      const result = scoreInstrument("unknown-test-123", [{ value: 5 }])
      expect(result.totalScore).toBe(5)
      expect(result.interpretation).toBe("Completed")
    })
  })
})
