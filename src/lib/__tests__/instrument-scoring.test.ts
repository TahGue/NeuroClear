import { describe, it, expect } from 'vitest'
import { scoreInstrument } from '../instrument-scoring'

describe('scoreInstrument', () => {
  it('returns INCOMPLETE if more than 20% of items are missing', () => {
    // 10 items total, 7 answered -> 30% missing -> INCOMPLETE
    const responses = Array.from({ length: 7 }).map(() => ({ value: 1 }))
    const result = scoreInstrument('phq9', responses, 10)
    
    expect(result.interpretation).toBe('INCOMPLETE (Too many missing items)')
    expect(result.details).toEqual({ slug: 'phq9', incomplete: true, missingCount: 3, totalItems: 10 })
  })

  describe('PHQ-9 Scoring', () => {
    it('scores minimal depression correctly (0-4)', () => {
      const responses = [{ value: 1 }, { value: 2 }, { value: 1 }] // Total 4
      const result = scoreInstrument('phq9', responses, 9)
      
      expect(result.totalScore).toBe(4)
      expect(result.interpretation).toBe('Minimal depress      expect(result.inter.severity).toBe('minimal')
    })

    it('scores severe depression correctly (20+)', () => {
      const responses = Array.from({ length: 9 }).map(() => ({ value: 3 })) // Total 27
      const result = scoreInstrument('phq9', responses, 9)
      
      expect(result.totalScore).toBe(27)
      expect(result.interpretation).toBe('Severe depression')
      expect(result.severity).toBe('severe')
    })
  })

  describe('GAD-7 Scoring', () => {
    it('scores moderate anxiety correctly (10-14)', () => {
      const responses = [{ value: 3 }, { value: 3 }, { value: 3 }, { value: 3 }] // Total 12
      const result = scoreInstrument('gad7', responses, 7)
      
      expect(result.totalScore).toBe(12)
      expect(result.interpretation).toBe('Moderate anxiety')
      expect(result.severity).toBe('moderate')
    })
  })

  describe('Child Emotion Masks Scoring', () => {
    it('bands interpretation correctly', () => {
      const responses = [{ value: 8 }] // Total 8 -> MODERATE (7-15)
      const result = scoreInstrument('child-emotion-masks', responses)
      
      expect(result.totalScore).toBe(8)
      expect(result.interpretation).toBe('MODERATE')
    })
  })
})
