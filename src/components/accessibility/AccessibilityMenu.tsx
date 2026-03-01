"use client"

import { useAccessibility } from "@/lib/accessibility"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Eye, Keyboard, Check, Monitor, Accessibility } from "lucide-react"

export function AccessibilityMenu() {
  const { largeText, toggleLargeText, reducedMotion, toggleReducedMotion } = useAccessibility()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Accessibility options">
          <Accessibility className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Accessibility className="h-5 w-5" />
            Accessibility Settings
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Monitor className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Large Text</p>
                    <p className="text-sm text-muted-foreground">Increase text size throughout</p>
                  </div>
                </div>
                <Button 
                  variant={largeText ? "default" : "outline"} 
                  size="sm"
                  onClick={toggleLargeText}
                >
                  {largeText && <Check className="h-4 w-4 mr-1" />}
                  {largeText ? "On" : "Off"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Eye className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Reduced Motion</p>
                    <p className="text-sm text-muted-foreground">Minimize animations</p>
                  </div>
                </div>
                <Button 
                  variant={reducedMotion ? "default" : "outline"} 
                  size="sm"
                  onClick={toggleReducedMotion}
                >
                  {reducedMotion && <Check className="h-4 w-4 mr-1" />}
                  {reducedMotion ? "On" : "Off"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
            <Keyboard className="h-3 w-3" />
            <span>Keyboard: Tab to navigate, Enter to select</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
