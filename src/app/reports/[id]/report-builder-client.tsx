"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Save, FileText, CheckCircle2, AlertCircle } from "lucide-react"
import { upsertNarrativeSection } from "../actions"

type ReportData = {
  id: string
  patientName: string
  assessment: string
  status: string
  narrativeSections: { section: string; content: string }[]
  scores?: {
    rawScore: number | null
    scaledScore: number | null
    subtest: { name: string }
  }[]
}

const SECTION_TEMPLATES = {
  REFERRAL: "Patient was referred by [Source] for a comprehensive psychological evaluation to assess [Reason].",
  BACKGROUND: "The patient is a [Age]-year-old [Gender] who reports a history of [Symptoms].",
  OBSERVATIONS: "During the testing session, the patient appeared [Mood/Affect] and was [Cooperation Level].",
  FINDINGS: "Cognitive testing revealed [Results]. Emotional functioning was characterized by [Results].",
  SUMMARY: "In summary, the evaluation indicates [Diagnosis/Impression]. It is recommended that [Primary Rec]."
}

export function ReportBuilderClient({ initialReport }: { initialReport: ReportData }) {
  const [sections, setSections] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {}
    for (const s of initialReport.narrativeSections) {
      map[s.section] = s.content
    }
    return map
  })
  const [savingSection, setSavingSection] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<Record<string, "success" | "error">>({})

  const handleSaveSection = async (sectionKey: string) => {
    setSavingSection(sectionKey)
    setSaveStatus(prev => ({ ...prev, [sectionKey]: undefined } as any))
    
    const content = sections[sectionKey] || ""
    
    const res = await upsertNarrativeSection({
      reportId: initialReport.id,
      section: sectionKey,
      content
    })
    
    setSavingSection(null)
    setSaveStatus(prev => ({
      ...prev,
      [sectionKey]: res.success ? "success" : "error"
    }))
    
    if (res.success) {
      setTimeout(() => {
        setSaveStatus(prev => ({ ...prev, [sectionKey]: undefined } as any))
      }, 3000)
    }
  }

  const applyTemplate = (sectionKey: string) => {
    setSections(prev => ({
      ...prev,
      [sectionKey]: (prev[sectionKey] ? prev[sectionKey] + "\n\n" : "") + SECTION_TEMPLATES[sectionKey as keyof typeof SECTION_TEMPLATES]
    }))
  }

  const handleExportPDF = async () => {
    // Dynamically import html2pdf to avoid SSR issues
    const html2pdf = (await import("html2pdf.js")).default
    const element = document.getElementById("report-preview-content")
    if (!element) return

    const opt = {
      margin: 1,
      filename: `${initialReport.patientName.replace(/\s+/g, '_')}_Report.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const }
    }

    html2pdf().set(opt).from(element).save()
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Report Builder</h1>
          <p className="text-muted-foreground">{initialReport.patientName} • {initialReport.assessment}</p>
        </div>
        <Badge variant={initialReport.status === "COMPLETED" ? "default" : "secondary"}>
          {initialReport.status.replace("_", " ")}
        </Badge>
      </div>

      <Tabs defaultValue="narrative" className="space-y-4">
        <TabsList>
          <TabsTrigger value="narrative">Narrative Sections</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="narrative" className="space-y-4">
          {Object.keys(SECTION_TEMPLATES).map((sectionKey) => (
            <Card key={sectionKey}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg">{sectionKey}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  {saveStatus[sectionKey] === "success" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  {saveStatus[sectionKey] === "error" && <AlertCircle className="h-4 w-4 text-red-500" />}
                  <Button variant="outline" size="sm" onClick={() => applyTemplate(sectionKey)}>
                    Use Template
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => handleSaveSection(sectionKey)}
                    disabled={savingSection === sectionKey}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {savingSection === sectionKey ? "Saving..." : "Save"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  className="min-h-[150px] font-mono text-sm leading-relaxed"
                  value={sections[sectionKey] || ""}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSections(prev => ({ ...prev, [sectionKey]: e.target.value }))}
                  placeholder={`Write the ${sectionKey.toLowerCase()} section here...`}
                />
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Report Preview</CardTitle>
              <CardDescription>How the final document will read.</CardDescription>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              {Object.keys(SECTION_TEMPLATES).map((sectionKey) => {
                const content = sections[sectionKey]
                if (!content) return null
                return (
                  <div key={sectionKey} className="mb-6">
                    <h3 className="text-lg font-bold border-b pb-1 mb-2">{sectionKey}</h3>
                    <p className="whitespace-pre-wrap">{content}</p>
                  </div>
                )
              })}
              {Object.values(sections).every(s => !s) && (
                <p className="text-muted-foreground italic">No narrative content written yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
