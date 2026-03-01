import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FileQuestion } from "lucide-react"

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  icon: Icon = FileQuestion,
  className = "",
}: {
  title: string
  description?: string
  actionLabel?: string
  actionHref?: string
  icon?: React.ElementType
  className?: string
}) {
  return (
    <Card className={`flex flex-col items-center justify-center p-8 text-center border-dashed ${className}`}>
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted/50 mb-4">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <CardHeader className="p-0 mb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription className="mt-1">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="p-0 mt-4">
        {actionLabel && actionHref ? (
          <Button asChild variant="outline" size="sm">
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  )
}
