import { describe, it, expect } from 'vitest'
import { scoreInstrument } from '../instrument-scoring'

describe('scoreInstrument', () => {
  it('returns INCOMPLETE if more than 20% of items are missing', () => {
    const responses = Array.from({ length: 7 }).map(() => ({ value: 1 }))
    const result = scoreInstrument('phq9', responses, 10)
    
    expect(result.interpretation).toBe('INCOMPLETE (Too many missing items)')
    expect(result.details).toEqual({ slug: 'phq9', incomplete: true, missingCount: 3, totalItems: 10 })
  })

  describe('PHQ-9 Scoring', () => {
    it('scores minimal depression correctly (0-4)', () => {
      const responses = Array.from({ length: 9 }).map((_, i) => ({ value: i < 2 ? 2 : 0 }))
      const result = scoreInstrument('phq9', responses, 9)
      
      expect(result.totalScore).toBe(4)
      expect(result.interpretation).toBe('Minimal depression')
      expect(result.severity).toBe('minimal')
    })

    it('scores mild depression correctly (5-9)', () => {
      const responses = Array.from({ length: 9 }).map((_, i) => ({ value: i < 5 ? 2 : 0 }))
      const result = scoreInstrument('phq9', responses, 9)
      
      expect(result.totalScore).toBe(10)
      expect(result.interpretation).toBe('Moderate depression')
    })

    it('scores severe depression correctly (20+)', () => {
      const responses = Array.from({ length: 9 }).map(() => ({ value: 3 }))
      const result = scoreInstrument('phq9', responses, 9)
      
      expect(result.totalScore).toBe(27)
      expect(result.interpretation).toBe('Severe depression')
    })
  })

  describe('GAD-7 Scoring', () => {
    it('scores minimal anxiety correctly (0-4)', () => {
      const responses = Array.from({ length: 7 }).map((_, i) => ({ value: i < 2 ? 2 : 0 }))
      const result = scoreInstrument('gad7', responses, 7)
      
      expect(result.totalScore).toBe(4)
      expect(result.interpretation).toBe('Minimal anxiety')
      expect(result.severity).toBe('minimal')
    })

    it('scores moderate anxiety correctly (10-14)', () => {
      const responses = Array.from({ length: 7 }).map((_, i) => ({ value: i < 4 ? 3 : 0 }))
      const result = scoreInstrument('gad7', responses, 7)
      
      expect(result.totalScore).toBe(12)
      expect(result.interpretation).toBe('Moderate anxiety')
      expect(result.severity).toBe('moderate')
    })

    it('scores severe anxiety correctly (15+)', () => {
      const responses = Array.from({ length: 7 }).map(() => ({ value: 3 }))
      const result = scoreInstrument('gad7', responses, 7)
      
      expect(result.totalScore).toBe(21)
      expect(result.interpretation).toBe('Severe anxiety')
    })
  })

  describe('AUDIT Scoring', () => {
    it('scores low risk correctly (0-7)', () => {
      const responses = Array.from({ length: 10 }).map((_, i) => ({ value: i < 2 ? 1 : 0 }))
      const result = scoreInstrument('audit', responses, 10)
      
      expect(result.totalScore).toBe(2)
      expect(result.interpretation).toBe('Low risk')
    })

    it('scores medium risk correctly (8-15)', () => {
      const responses = Array.from({ length: 10 }).map((_, i) => ({ value: i < 4 ? 2 : 0 }))
      const result = scoreInstrument('audit', responses, 10)
      
      expect(result.totalScore).toBe(8)
      expect(result.interpretation).toBe('Medium risk')
    })

    it('scores high risk correctly (16-19)', () => {
      const responses = Array.from({ length: 10 }).map((_, i) => ({ value: i < 4 ? 4 : 0 }))
      const result = scoreInstrument('audit', responses, 10)
      
      expect(result.totalScore).toBe(16)
      expect(result.interpretation).toBe('High risk')
    })

    it('scores possible dependence correctly (20+)', () => {
      const responses = Array.from({ length: 10 }).map((_, i) => ({ value: i < 5 ? 4 : 0 }))
      const result = scoreInstrument('audit', responses, 10)
      
      expect(result.totalScore).toBe(20)
      expect(result.interpretation).toBe('Possible dependence')
    })
  })

  describe('PCL-5 Scoring', () => {
    it('scores below threshold correctly (<33)', () => {
      const responses = Array.from({ length: 20 }).map((_, i) => ({ value: i < 10 ? 2 : 0 }))
      const result = scoreInstrument('pcl5', responses, 20)
      
      expect(result.totalScore).toBe(20)
      expect(result.interpretation).toBe('Below threshold')
    })

    it('scores provisional PTSD correctly (>=33)', () => {
      const responses = Array.from({ length: 20 }).map((_, i) => ({ value: i < 10 ? 4 : 0 }))
      const result = scoreInstrument('pcl5', responses, 20)
      
      expect(result.totalScore).toBe(40)
      expect(result.interpretation).toBe('Provisional PTSD diagnosis')
    })
  })

  describe('ASRS Scoring', () => {
    it('scores unlikely ADHD correctly (<=8)', () => {
      const responses = Array.from({ length: 18 }).map((_, i) => ({ value: i < 4 ? 2 : 0 }))
      const result = scoreInstrument('asrs', responses, 18)
      
      expect(result.totalScore).toBe(8)
      expect(result.interpretation).toBe('Unlikely ADHD')
    })

    it('scores highly likely ADHD correctly (>8)', () => {
      const responses = Array.from({ length: 18 }).map((_, i) => ({ value: i < 5 ? 2 : 0 }))
      const result = scoreInstrument('asrs', responses, 18)
      
      expect(result.totalScore).toBe(10)
      expect(result.interpretation).toBe('Highly likely ADHD')
    })
  })

  describe('GDS-15 Scoring', () => {
    it('scores normal correctly (0-1)', () => {
      const responses = Array.from({ length: 15 }).map(() => ({ value: 0 }))
      const result = scoreInstrument('gds15', responses, 15)
      
      expect(result.totalScore).toBe(0)
      expect(result.interpretation).toBe('Normal')
    })

    it('scores suggests depression correctly (2-5)', () => {
      const responses = Array.from({ length: 15 }).map((_, i) => ({ value: i < 2 ? 1 : 0 }))
      const result = scoreInstrument('gds15', responses, 15)
      
      expect(result.totalScore).toBe(2)
      expect(result.interpretation).toBe('Suggests depression')
    })

    it('scores almost certainly depression correctly (6+)', () => {
      const responses = Array.from({ length: 15 }).map((_, i) => ({ value: i < 6 ? 1 : 0 }))
      const result = scoreInstrument('gds15', responses, 15)
      
      expect(result.totalScore).toBe(6)
      expect(result.interpretation).toBe('Almost certainly depression')
    })
  })

  describe('CRAFFT Scoring', () => {
    it('scores low risk correctly (0-1)', () => {
      const responses = Array.from({ length: 6 }).map(() => ({ value: 0 }))
      const result = scoreInstrument('crafft', responses, 6)
      
      expect(result.totalScore).toBe(0)
      expect(result.interpretation).toBe('Low risk')
    })

    it('scores high risk correctly (2+)', () => {
      const responses = Array.from({ length: 6 }).map((_, i) => ({ value: i < 2 ? 1 : 0 }))
      const result = scoreInstrument('crafft', responses, 6)
      
      expect(result.totalScore).toBe(2)
      expect(result.interpretation).toBe('High risk for substance use disorder')
    })
  })

  describe('SDQ Scoring', () => {
    it('scores close to average correctly (0-2)', () => {
      const responses = Array.from({ length: 25 }).map((_, i) => ({ value: i < 1 ? 1 : 0 }))
      const result = scoreInstrument('sdq', responses, 25)
      
      expect(result.totalScore).toBe(1)
      expect(result.interpretation).toBe('Close to average')
      expect(result.severity).toBe('minimal')
    })

    it('scores slightly raised correctly (3-4)', () => {
      const responses = Array.from({ length: 25 }).map((_, i) => ({ value: i < 2 ? 2 : 0 }))
      const result = scoreInstrument('sdq', responses, 25)
      
      expect(result.totalScore).toBe(4)
      expect(result.interpretation).toBe('Slightly raised')
      expect(result.severity).toBe('moderate')
    })

    it('scores high correctly (5-6)', () => {
      const responses = Array.from({ length: 25 }).map((_, i) => ({ value: i < 3 ? 2 : 0 }))
      const result = scoreInstrument('sdq', responses, 25)
      
      expect(result.totalScore).toBe(6)
      expect(result.interpretation).toBe('High')
      expect(result.severity).toBe('severe')
    })

    it('scores very high correctly (7+)', () => {
      const responses = Array.from({ length: 25 }).map((_, i) => ({ value: i < 4 ? 2 : 0 }))
      const result = scoreInstrument('sdq', responses, 25)
      
      expect(result.totalScore).toBe(8)
      expect(result.interpretation).toBe('Very high')
    })
  })

  describe('PHQ-A Scoring', () => {
    it('scores minimal depression correctly (0-4)', () => {
      const responses = Array.from({ length: 9 }).map((_, i) => ({ value: i < 2 ? 2 : 0 }))
      const result = scoreInstrument('phqa', responses, 9)
      
      expect(result.totalScore).toBe(4)
      expect(result.interpretation).toBe('Minimal depression')
    })

    it('scores severe depression correctly (20+)', () => {
      const responses = Array.from({ length: 9 }).map(() => ({ value: 3 }))
      const result = scoreInstrument('phqa', responses, 9)
      
      expect(result.totalScore).toBe(27)
      expect(result.interpretation).toBe('Severe depression')
    })
  })

  describe('Vanderbilt Scoring', () => {
    it('scores below threshold correctly (<=11)', () => {
      const responses = Array.from({ length: 18 }).map((_, i) => ({ value: i < 6 ? 1 : 0 }))
      const result = scoreInstrument('vanderbilt', responses, 18)
      
      expect(result.totalScore).toBe(6)
      expect(result.interpretation).toBe('Below threshold')
    })

    it('scores positive for ADHD correctly (>11)', () => {
      const responses = Array.from({ length: 18 }).map((_, i) => ({ value: i < 12 ? 1 : 0 }))
      const result = scoreInstrument('vanderbilt', responses, 18)
      
      expect(result.totalScore).toBe(12)
      expect(result.interpretation).toBe('Positive for ADHD symptoms')
    })
  })

  describe('SCARED Scoring', () => {
    it('scores normal anxiety correctly (<=24)', () => {
      const responses = Array.from({ length: 41 }).map((_, i) => ({ value: i < 10 ? 2 : 0 }))
      const result = scoreInstrument('scared', responses, 41)
      
      expect(result.totalScore).toBe(20)
      expect(result.interpretation).toBe('Normal anxiety')
    })

    it('scores significant anxiety correctly (>24)', () => {
      const responses = Array.from({ length: 41 }).map((_, i) => ({ value: i < 15 ? 2 : 0 }))
      const result = scoreInstrument('scared', responses, 41)
      
      expect(result.totalScore).toBe(30)
      expect(result.interpretation).toBe('Significant anxiety symptoms')
    })
  })

  describe('Child Emotion Masks Scoring', () => {
    it('bands LOW correctly (<=7)', () => {
      const responses = [{ value: 5 }]
      const result = scoreInstrument('child-emotion-masks', responses)
      
      expect(result.totalScore).toBe(5)
      expect(result.interpretation).toBe('LOW')
    })

    it('bands MODERATE correctly (8-15)', () => {
      const responses = [{ value: 10 }]
      const result = scoreInstrument('child-emotion-masks', responses)
      
      expect(result.totalScore).toBe(10)
      expect(result.interpretation).toBe('MODERATE')
    })

    it('bands HIGH correctly (16+)', () => {
      const responses = [{ value: 20 }]
      const result = scoreInstrument('child-emotion-masks', responses)
      
      expect(result.totalScore).toBe(20)
      expect(result.interpretation).toBe('HIGH')
    })
  })

  describe('Comprehensive IQ Scoring', () => {
    it('calculates IQ score correctly', () => {
      const responses = Array.from({ length: 20 }).map((_, i) => ({ value: i < 10 ? 1 : 0 }))
      const result = scoreInstrument('comprehensive-iq', responses, 20)
      
      expect(result.totalScore).toBe(10)
      expect(result.interpretation).toBe('Average (IQ 90-109)')
    })

    it('scores gifted correctly (15-17)', () => {
      const responses = Array.from({ length: 20 }).map((_, i) => ({ value: i < 16 ? 1 : 0 }))
      const result = scoreInstrument('comprehensive-iq', responses, 20)
      
      expect(result.totalScore).toBe(16)
      expect(result.interpretation).toBe('Gifted (IQ 120-129)')
    })

    it('scores highly gifted correctly (18+)', () => {
      const responses = Array.from({ length: 20 }).map((_, i) => ({ value: i < 19 ? 1 : 0 }))
      const result = scoreInstrument('comprehensive-iq', responses, 20)
      
      expect(result.totalScore).toBe(19)
      expect(result.interpretation).toBe('Highly Gifted (IQ 130+)')
    })
  })

  describe('Default Scoring', () => {
    it('returns Completed for unknown instruments', () => {
      const responses = [{ value: 1 }, { value: 2 }]
      const result = scoreInstrument('unknown-instrument', responses)
      
      expect(result.totalScore).toBe(3)
      expect(result.interpretation).toBe('Completed')
    })
  })
})
