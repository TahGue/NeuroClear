import { describe, it, expect } from 'vitest'
import { formatAge, formatDate } from './utils'

describe('Utility Functions', () => {
  describe('formatAge', () => {
    it('calculates exact age correctly', () => {
      // Create a mock current date
      const today = new Date()
      
      // Calculate a date exactly 10 years ago
      const tenYearsAgo = new Date(today.getFullYear() - 10, today.getMonth(), today.getDate())
      expect(formatAge(tenYearsAgo)).toBe(10)
      
      // Calculate a date almost 10 years ago (so they are still 9)
      const almostTenYearsAgo = new Date(today.getFullYear() - 10, today.getMonth(), today.getDate() + 1)
      expect(formatAge(almostTenYearsAgo)).toBe(9)
    })
  })

  describe('formatDate', () => {
    it('formats string dates correctly', () => {
      const dateStr = '2024-01-15T12:00:00Z'
      const formatted = formatDate(dateStr)
      expect(formatted).toMatch(/Jan 15, 2024/i)
    })

    it('formats Date objects correctly', () => {
      const dateObj = new Date('2024-01-15T12:00:00Z')
      const formatted = formatDate(dateObj)
      expect(formatted).toMatch(/Jan 15, 2024/i)
    })
  })
})
