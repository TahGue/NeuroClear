"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"

type AccessibilityContextType = {
  largeText: boolean
  toggleLargeText: () => void
  reducedMotion: boolean
  toggleReducedMotion: () => void
  highContrast: boolean
  toggleHighContrast: () => void
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [largeText, setLargeText] = useState(() => {
    if (typeof window === "undefined") return false
    return localStorage.getItem("neuroclear-large-text") === "true"
  })
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === "undefined") return false
    return localStorage.getItem("neuroclear-reduced-motion") === "true"
  })
  const [highContrast, setHighContrast] = useState(() => {
    if (typeof window === "undefined") return false
    return localStorage.getItem("neuroclear-high-contrast") === "true"
  })

  useEffect(() => {
    document.documentElement.classList.toggle("text-lg", largeText)
  }, [largeText])

  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", reducedMotion)
  }, [reducedMotion])

  useEffect(() => {
    document.documentElement.classList.toggle("high-contrast", highContrast)
  }, [highContrast])

  const toggleLargeText = () => {
    const newValue = !largeText
    setLargeText(newValue)
    localStorage.setItem("neuroclear-large-text", String(newValue))
  }

  const toggleReducedMotion = () => {
    const newValue = !reducedMotion
    setReducedMotion(newValue)
    localStorage.setItem("neuroclear-reduced-motion", String(newValue))
  }

  const toggleHighContrast = () => {
    const newValue = !highContrast
    setHighContrast(newValue)
    localStorage.setItem("neuroclear-high-contrast", String(newValue))
  }

  return (
    <AccessibilityContext.Provider value={{ 
      largeText, toggleLargeText, 
      reducedMotion, toggleReducedMotion,
      highContrast, toggleHighContrast 
    }}>
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (context === undefined) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider")
  }
  return context
}
