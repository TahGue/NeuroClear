import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto bg-muted w-12 h-12 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">Page not found</CardTitle>
          <CardDescription>
            The page you are looking for doesn&apos;t exist or has been moved.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Link href="/" className="text-sm font-medium text-primary hover:underline">
            Return to Home
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
