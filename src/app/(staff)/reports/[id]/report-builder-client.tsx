"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Save, FileText, CheckCircle2, AlertCircle, Lock, Signature } from "lucide-react"
import { upsertNarrativeSection, finalizeReport } from "../actions"

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
  signature?: {
    name: string
    title: string
    date: string
  } | null
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
  const [saveStatus, setSaveStatus] = useState<Record<string, "success" | "error" | undefined>>({})
  const [isFinalized, setIsFinalized] = useState(initialReport.status === "COMPLETED")
  const [signature, setSignature] = useState(initialReport.signature || { name: "", title: "", date: "" })
  const [showSignatureForm, setShowSignatureForm] = useState(false)

  const handleSaveSection = async (sectionKey: string) => {
    setSavingSection(sectionKey)
    setSaveStatus(prev => ({ ...prev, [sectionKey]: undefined }))
    
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
        setSaveStatus(prev => ({ ...prev, [sectionKey]: undefined }))
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

  const handleFinalize = async () => {
    if (!signature.name || !signature.title) {
      setShowSignatureForm(true)
      return
    }

    const res = await finalizeReport({
      reportId: initialReport.id,
      signatureName: signature.name,
      signatureTitle: signature.title,
    })

    if (res.success) {
      setSignature(prev => ({ ...prev, date: new Date().toLocaleDateString() }))
      setIsFinalized(true)
    } else {
      alert("Failed to finalize report")
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Report Builder</h1>
          <p className="text-muted-foreground">{initialReport.patientName} • {initialReport.assessment}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportPDF}>
            <FileText className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          {!isFinalized ? (
            <Button onClick={handleFinalize} variant="default">
              <Lock className="h-4 w-4 mr-2" />
              Finalize Report
            </Button>
          ) : (
            <Badge variant="default" className="h-10 px-4">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Finalized
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="narrative" className="space-y-4">
        <TabsList>
          <TabsTrigger value="narrative">Narrative Sections</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="narrative" className="space-y-4">
          {isFinalized && (
            <Card className="border-[var(--status-warning)]/30 bg-[var(--status-warning)]/5">
              <CardContent className="py-4">
                <p className="text-sm text-[var(--status-warning)] flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  This report has been finalized and cannot be edited. Download PDF for the signed copy.
                </p>
              </CardContent>
            </Card>
          )}

          {showSignatureForm && !isFinalized && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Signature className="h-5 w-5" />
                  Electronic Signature
                </CardTitle>
                <CardDescription>
                  Enter your credentials to finalize this report. This constitutes a legal electronic signature.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name *</label>
                    <Input
                      value={signature.name}
                      onChange={(e) => setSignature(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Dr. Jane Smith"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title/Credentials *</label>
                    <Input
                      value={signature.title}
                      onChange={(e) => setSignature(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ph.D., Licensed Psychologist"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleFinalize} disabled={!signature.name || !signature.title}>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Confirm and Finalize
                  </Button>
                  <Button variant="outline" onClick={() => setShowSignatureForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {Object.keys(SECTION_TEMPLATES).map((sectionKey) => (
            <Card key={sectionKey}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg">{sectionKey}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  {saveStatus[sectionKey] === "success" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  {saveStatus[sectionKey] === "error" && <AlertCircle className="h-4 w-4 text-red-500" />}
                  <Button variant="outline" size="sm" onClick={() => applyTemplate(sectionKey)} disabled={isFinalized}>
                    Use Template
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => handleSaveSection(sectionKey)}
                    disabled={savingSection === sectionKey || isFinalized}
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
                  disabled={isFinalized}
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
            <CardContent id="report-preview-content" className="prose prose-sm max-w-none dark:prose-invert">
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

              {isFinalized && signature.name && (
                <div className="mt-12 pt-8 border-t-2 border-gray-300">
                  <div className="grid gap-8 md:grid-cols-2">
                    <div>
                      <p className="font-serif text-lg mb-8">_________________________</p>
                      <p className="font-semibold">{signature.name}</p>
                      <p className="text-sm text-muted-foreground">{signature.title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Date Signed:</p>
                      <p className="font-semibold">{signature.date}</p>
                      <p className="text-xs text-muted-foreground mt-4">
                        This document has been electronically signed and constitutes a legal record.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
