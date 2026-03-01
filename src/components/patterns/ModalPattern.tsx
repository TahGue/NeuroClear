"use client"

import { ReactNode } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type ModalPatternProps = {
  trigger?: ReactNode
  triggerLabel?: string
  triggerVariant?: "default" | "outline" | "secondary" | "ghost" | "destructive"
  triggerSize?: "default" | "sm" | "lg" | "icon"
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  primaryAction?: {
    label: string
    onClick: () => void
    disabled?: boolean
    loading?: boolean
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  onClose?: () => void
  size?: "sm" | "md" | "lg" | "xl"
}

const sizeClasses = {
  sm: "sm:max-w-[400px]",
  md: "sm:max-w-[500px]",
  lg: "sm:max-w-[600px]",
  xl: "sm:max-w-[800px]",
}

export function ModalPattern({
  trigger,
  triggerLabel,
  triggerVariant = "default",
  triggerSize = "default",
  title,
  description,
  children,
  footer,
  primaryAction,
  secondaryAction,
  onClose,
  size = "md",
}: ModalPatternProps) {
  return (
    <Dialog onOpenChange={(open) => !open && onClose?.()}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant={triggerVariant} size={triggerSize}>
            {triggerLabel}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className={sizeClasses[size]}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        
        <div className="py-4">{children}</div>
        
        {(footer || primaryAction || secondaryAction) && (
          <DialogFooter>
            {footer || (
              <>
                {secondaryAction && (
                  <Button
                    variant="outline"
                    onClick={secondaryAction.onClick}
                  >
                    {secondaryAction.label}
                  </Button>
                )}
                {primaryAction && (
                  <Button
                    onClick={primaryAction.onClick}
                    disabled={primaryAction.disabled || primaryAction.loading}
                  >
                    {primaryAction.loading ? "Processing..." : primaryAction.label}
                  </Button>
                )}
              </>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
