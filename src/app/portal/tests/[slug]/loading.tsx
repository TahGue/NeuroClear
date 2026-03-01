import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function InstrumentRunLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 border rounded-lg">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
