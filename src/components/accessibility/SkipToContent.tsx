"use client"

import { useEffect, useRef } from "react"

export function SkipToContent() {
  const skipRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab" && document.activeElement === document.body) {
        skipRef.current?.focus()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <a
      ref={skipRef}
      href="#main-content"
      className="skip-to-content"
      onClick={(e) => {
        e.preventDefault()
        const main = document.getElementById("main-content")
        if (main) {
          main.focus()
          main.scrollIntoView({ behavior: "smooth" })
        }
      }}
    >
      Skip to main content
    </a>
  )
}

export function VisuallyHidden({ children }: { children: React.ReactNode }) {
  return <span className="sr-only">{children}</span>
}

export function LiveRegion({ 
  children, 
  ariaLive = "polite" 
}: { 
  children: React.ReactNode
  ariaLive?: "polite" | "assertive" | "off"
}) {
  return (
    <div aria-live={ariaLive} aria-atomic="true" className="sr-only">
      {children}
    </div>
  )
}

export function FocusTrap({ children }: { children: React.ReactNode }) {
  return (
    <div data-focus-trap>
      {children}
    </div>
  )
}
