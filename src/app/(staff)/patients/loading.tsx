import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function PatientsLoading() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
              <div className="space-y-2 w-1/3">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
