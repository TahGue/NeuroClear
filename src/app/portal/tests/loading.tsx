import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function PortalTestsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      <Card>
        <CardHeader className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
