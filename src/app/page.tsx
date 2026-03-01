import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Brain, ArrowRight, ShieldCheck, Activity } from "lucide-react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function LandingPage() {
  const session = await getServerSession(authOptions)
  
  // If the user is already logged in, redirect them to their respective dashboard
  if (session?.user) {
    if (session.user.role === "PATIENT") {
      redirect("/portal")
    } else {
      redirect("/dashboard")
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight">AssessMind</span>
          </div>
          <nav className="flex items-center gap-4">
            <Button asChild variant="outline">
              <Link href="/login">Sign In</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 bg-gradient-to-b from-background to-muted/50">
        <div className="max-w-3xl space-y-8">
          <Badge className="mb-4">Clinical Assessment Platform</Badge>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-foreground">
            Precision neuropsychological testing, simplified.
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            AssessMind provides clinicians with a secure, powerful platform to administer assessments, analyze results, and generate comprehensive reports.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Button asChild size="lg" className="gap-2">
              <Link href="/login">
                Access Clinical Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-24 text-left">
          <div className="p-6 bg-card rounded-xl border shadow-sm">
            <div className="h-12 w-12 bg-primary/10 flex items-center justify-center rounded-lg mb-4">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Automated Scoring</h3>
            <p className="text-muted-foreground">Instantly calculate raw and standardized scores across a wide library of clinical instruments.</p>
          </div>
          <div className="p-6 bg-card rounded-xl border shadow-sm">
            <div className="h-12 w-12 bg-primary/10 flex items-center justify-center rounded-lg mb-4">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Patient Portal</h3>
            <p className="text-muted-foreground">Secure, age-appropriate testing interfaces for patients to complete assigned instruments remotely.</p>
          </div>
          <div className="p-6 bg-card rounded-xl border shadow-sm">
            <div className="h-12 w-12 bg-primary/10 flex items-center justify-center rounded-lg mb-4">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Report Generation</h3>
            <p className="text-muted-foreground">Transform raw data into comprehensive narrative reports with visual diagnostic curves and insights.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card py-8">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} AssessMind Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80 ${className}`}>
      {children}
    </span>
  )
}
