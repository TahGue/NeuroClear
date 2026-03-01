"use client"

import { useState, useMemo, Suspense } from "react"
import { useForm, useWatch } from "react-hook-form"
import { useI18n } from "@/lib/i18n-context"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, Calculator } from "lucide-react"
import { createEvaluation } from "../../actions"
import { useRouter, useSearchParams } from "next/navigation"
import { formatPlatform } from "@/lib/utils"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

type Patient = {
  id: string
  firstName: string
  lastName: string
}

type AssessmentSubtest = {
  id: string
  assessmentId?: string
  name: string
  index?: string | null
}

type Assessment = {
  id: string
  name: string
  platform: string
  subtests: AssessmentSubtest[]
}

type EditableSubtest = AssessmentSubtest & {
  rawScore: string
  scaledScore: string
}

type Composite = {
  index: string
  fullName: string
  score: string
  percentile: string
}

const getScoreEntrySchema = (t: (key: string) => string) => z.object({
  patientId: z.string().min(1, t("scoreEntry.validation.patientRequired")),
  assessmentId: z.string().min(1, t("scoreEntry.validation.assessmentRequired")),
  adminDate: z.string().min(1, t("scoreEntry.validation.dateRequired")),
  adminBy: z.string().optional(),
})

type ScoreEntryFormData = z.infer<ReturnType<typeof getScoreEntrySchema>>

export type ScoreEntryClientProps = {
  initialPatients: Patient[]
  initialAssessments: Assessment[]
  initialAssessmentFromParams?: Assessment
}

function ScoreEntryForm({ initialPatients, initialAssessments }: ScoreEntryClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useI18n()
  
  const initialPatientIdFromParams = searchParams.get("patient") ?? ""
  const initialAssessmentIdFromParams = searchParams.get("assessmentId") ?? ""

  const initialAssessmentFromParams = initialAssessmentIdFromParams
    ? initialAssessments.find((a) => a.id === initialAssessmentIdFromParams)
    : undefined

  const form = useForm<ScoreEntryFormData>({
    resolver: zodResolver(getScoreEntrySchema(t)),
    defaultValues: {
      patientId: initialPatientIdFromParams,
      assessmentId: initialAssessmentIdFromParams,
      adminDate: new Date().toISOString().split('T')[0],
      adminBy: "",
    },
  })

  const [selectedPlatform, setSelectedPlatform] = useState(() => initialAssessmentFromParams?.platform ?? "")
  const [subtests, setSubtests] = useState<EditableSubtest[]>(() =>
    initialAssessmentFromParams
      ? initialAssessmentFromParams.subtests.map((s) => ({ ...s, rawScore: "", scaledScore: "" }))
      : []
  )
  const [composites, setComposites] = useState<Composite[]>(() => {
    if (!initialAssessmentFromParams) return []
    if (initialAssessmentFromParams.name.includes("WISC") || initialAssessmentFromParams.name.includes("WAIS")) {
      return [
        { index: "VCI", fullName: "Verbal Comprehension Index", score: "", percentile: "" },
        { index: "VSI", fullName: "Visual Spatial Index", score: "", percentile: "" },
        { index: "WMI", fullName: "Working Memory Index", score: "", percentile: "" },
        { index: "PSI", fullName: "Processing Speed Index", score: "", percentile: "" },
        { index: "FRI", fullName: "Fluid Reasoning Index", score: "", percentile: "" },
        { index: "FSIQ", fullName: "Full Scale IQ", score: "", percentile: "" },
      ]
    }
    return []
  })
  const [isSaving, setIsSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const selectedPatientId = useWatch({ control: form.control, name: "patientId" })
  const selectedAssessmentId = useWatch({ control: form.control, name: "assessmentId" })
  const adminDate = useWatch({ control: form.control, name: "adminDate" })
  const adminBy = useWatch({ control: form.control, name: "adminBy" })
  
  const selectedPatient = useMemo(
    () => initialPatients.find(p => p.id === selectedPatientId),
    [initialPatients, selectedPatientId]
  )
  
  const selectedAssessment = useMemo(
    () => initialAssessments.find(a => a.id === selectedAssessmentId),
    [initialAssessments, selectedAssessmentId]
  )

  const handleAssessmentChange = (id: string) => {
    form.setValue("assessmentId", id)
    setSubmitError(null)
    const assessment = initialAssessments.find(a => a.id === id)
    if (assessment) {
      setSelectedPlatform(assessment.platform)
      setSubtests(assessment.subtests.map((s) => ({ ...s, rawScore: "", scaledScore: "" })))
      
      if (assessment.name.includes("WISC") || assessment.name.includes("WAIS")) {
        setComposites([
          { index: "VCI", fullName: "Verbal Comprehension Index", score: "", percentile: "" },
          { index: "VSI", fullName: "Visual Spatial Index", score: "", percentile: "" },
          { index: "WMI", fullName: "Working Memory Index", score: "", percentile: "" },
          { index: "PSI", fullName: "Processing Speed Index", score: "", percentile: "" },
          { index: "FRI", fullName: "Fluid Reasoning Index", score: "", percentile: "" },
          { index: "FSIQ", fullName: "Full Scale IQ", score: "", percentile: "" },
        ])
      } else {
        setComposites([])
      }
    }
  }

  const handleSubtestChange = (index: number, field: "rawScore" | "scaledScore", value: string) => {
    setSubmitError(null)
    const updatedSubtests = [...subtests]
    updatedSubtests[index][field] = value
    setSubtests(updatedSubtests)
  }

  const handleCompositeChange = (index: number, field: "score" | "percentile", value: string) => {
    setSubmitError(null)
    const updatedComposites = [...composites]
    updatedComposites[index][field] = value
    setComposites(updatedComposites)
  }

  const calculateComposites = () => {
    const updatedComposites = composites.map(composite => {
      const relatedSubtests = subtests.filter(s => s.index === composite.index && composite.index !== "FSIQ")
      if (relatedSubtests.length > 0) {
        const validScores = relatedSubtests.filter(s => s.scaledScore !== "")
        if (validScores.length > 0) {
          const avgScaledScore = validScores.reduce((sum, s) => sum + parseInt(s.scaledScore), 0) / validScores.length
          const estScore = 100 + ((avgScaledScore - 10) * 5)
          return { ...composite, score: Math.round(estScore).toString() }
        }
      }
      return composite
    })
    setComposites(updatedComposites)
  }

  const onSubmit = async (data: ScoreEntryFormData) => {
    setIsSaving(true)
    setSubmitError(null)
    const result = await createEvaluation({
      patientId: data.patientId,
      assessmentId: data.assessmentId,
      adminDate: data.adminDate,
      adminBy: data.adminBy,
      subtests
    })

    if (result.success) {
      router.push(`/reports`)
    } else {
      setSubmitError("Failed to save evaluation.")
    }
    setIsSaving(false)
  }

  const getIndexColor = (index: string) => {
    const colors = {
      VCI: "bg-[var(--status-info)]/10 text-[var(--status-info)]",
      VSI: "bg-[var(--status-success)]/10 text-[var(--status-success)]",
      WMI: "bg-[var(--status-warning)]/10 text-[var(--status-warning)]",
      PSI: "bg-[var(--status-error)]/10 text-[var(--status-error)]",
      FRI: "bg-[var(--category-secondary)]/10 text-[var(--category-secondary)]",
      FSIQ: "bg-muted text-muted-foreground",
    }
    return colors[index as keyof typeof colors] || "bg-muted text-muted-foreground"
  }

  // Get unique indices for the current subtests
  const uniqueIndices = Array.from(new Set(subtests.map(s => s.index).filter(Boolean)))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t("scoreEntry.title")}</h1>
        <p className="text-muted-foreground">{t("scoreEntry.description")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("scoreEntry.adminDetails")}</CardTitle>
          <CardDescription>{t("scoreEntry.adminDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" id="score-entry-form">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <FormField
                  control={form.control}
                  name="patientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("scoreEntry.patient")} *</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder={t("scoreEntry.selectPatient")} />
                          </SelectTrigger>
                          <SelectContent>
                            {initialPatients.map(p => (
                              <SelectItem key={p.id} value={p.id}>{p.firstName} {p.lastName}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="assessmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("scoreEntry.assessment")} *</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={(val) => { field.onChange(val); handleAssessmentChange(val); }}>
                          <SelectTrigger>
                            <SelectValue placeholder={t("scoreEntry.selectAssessment")} />
                          </SelectTrigger>
                          <SelectContent>
                            {initialAssessments.map(a => (
                              <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div>
                  <label className="text-sm font-medium">{t("scoreEntry.platform")}</label>
                  <Input 
                    value={selectedPlatform ? formatPlatform(selectedPlatform) : ''} 
                    disabled 
                    placeholder={t("scoreEntry.autoFilled")}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="adminDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("scoreEntry.adminDate")} *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="adminBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("scoreEntry.adminBy")}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={t("scoreEntry.adminByPlaceholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {selectedAssessment && (
        <Tabs defaultValue="subtests" className="space-y-4">
          <TabsList>
            <TabsTrigger value="subtests">{t("scoreEntry.subtestTab")}</TabsTrigger>
            {composites.length > 0 && <TabsTrigger value="composites">{t("scoreEntry.compositeTab")}</TabsTrigger>}
            <TabsTrigger value="summary">{t("scoreEntry.summaryTab")}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="subtests">
            <Card>
              <CardHeader>
                <CardTitle>{t("scoreEntry.subtestTab")} - {selectedAssessment?.name}</CardTitle>
                <CardDescription>{t("scoreEntry.subtests.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {uniqueIndices.length > 0 ? (
                    uniqueIndices.map(index => (
                      <div key={index as string}>
                        <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                          <Badge className={getIndexColor(index as string)}>
                            {index as string}
                          </Badge>
                        </h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{t("scoreEntry.subtests.headers.subtest")}</TableHead>
                              <TableHead>{t("scoreEntry.subtests.headers.raw")}</TableHead>
                              <TableHead>{t("scoreEntry.subtests.headers.scaled")}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {subtests
                              .filter(subtest => subtest.index === index)
                              .map((subtest, subtestIndex) => (
                                <TableRow key={subtestIndex}>
                                  <TableCell className="font-medium">{subtest.name}</TableCell>
                                  <TableCell>
                                    <Input
                                      type="number"
                                      placeholder="0"
                                      value={subtest.rawScore}
                                      onChange={(e) => handleSubtestChange(
                                        subtests.findIndex(s => s.name === subtest.name), 
                                        "rawScore", 
                                        e.target.value
                                      )}
                                      className="w-24"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      type="number"
                                      placeholder="0"
                                      value={subtest.scaledScore}
                                      onChange={(e) => handleSubtestChange(
                                        subtests.findIndex(s => s.name === subtest.name), 
                                        "scaledScore", 
                                        e.target.value
                                      )}
                                      className="w-24"
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </div>
                    ))
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("scoreEntry.subtests.headers.subtest")}</TableHead>
                          <TableHead>{t("scoreEntry.subtests.headers.raw")}</TableHead>
                          <TableHead>{t("scoreEntry.subtests.headers.scaled")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subtests.map((subtest, subtestIndex) => (
                          <TableRow key={subtestIndex}>
                            <TableCell className="font-medium">{subtest.name}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                placeholder="0"
                                value={subtest.rawScore}
                                onChange={(e) => handleSubtestChange(subtestIndex, "rawScore", e.target.value)}
                                className="w-24"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                placeholder="0"
                                value={subtest.scaledScore}
                                onChange={(e) => handleSubtestChange(subtestIndex, "scaledScore", e.target.value)}
                                className="w-24"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {composites.length > 0 && (
            <TabsContent value="composites">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>{t("scoreEntry.composites.title")}</CardTitle>
                      <CardDescription>{t("scoreEntry.composites.description")}</CardDescription>
                    </div>
                    <Button onClick={calculateComposites}>
                      <Calculator className="h-4 w-4 mr-2" />
                      {t("scoreEntry.composites.calculate")}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("scoreEntry.composites.headers.index")}</TableHead>
                        <TableHead>{t("scoreEntry.composites.headers.fullName")}</TableHead>
                        <TableHead>{t("scoreEntry.composites.headers.score")}</TableHead>
                        <TableHead>{t("scoreEntry.composites.headers.percentile")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {composites.map((composite, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Badge className={getIndexColor(composite.index)}>
                              {composite.index}
                            </Badge>
                          </TableCell>
                          <TableCell>{composite.fullName}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              placeholder="100"
                              value={composite.score}
                              onChange={(e) => handleCompositeChange(index, "score", e.target.value)}
                              className="w-24"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              placeholder="50"
                              value={composite.percentile}
                              onChange={(e) => handleCompositeChange(index, "percentile", e.target.value)}
                              className="w-24"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          )}
          
          <TabsContent value="summary">
            <Card>
              <CardHeader>
                <CardTitle>{t("scoreEntry.summary.title")}</CardTitle>
                <CardDescription>{t("scoreEntry.summary.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="font-semibold mb-2">{t("scoreEntry.summary.detailsTitle")}</h3>
                      <div className="space-y-1 text-sm">
                        <p><strong>{t("scoreEntry.patient")}:</strong> {selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : t("scoreEntry.summary.notSelected")}</p>
                        <p><strong>{t("scoreEntry.assessment")}:</strong> {selectedAssessment ? selectedAssessment.name : t("scoreEntry.summary.notSelected")}</p>
                        <p><strong>{t("scoreEntry.platform")}:</strong> {selectedPlatform ? formatPlatform(selectedPlatform) : t("scoreEntry.summary.notSelected")}</p>
                        <p><strong>{t("scoreEntry.adminDate")}:</strong> {adminDate || t("scoreEntry.summary.notSet")}</p>
                        <p><strong>{t("scoreEntry.adminBy")}:</strong> {adminBy || t("scoreEntry.summary.notSet")}</p>
                      </div>
                    </div>
                    {composites.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">{t("scoreEntry.summary.scoreTitle")}</h3>
                        <div className="space-y-1 text-sm">
                          {composites.filter(c => c.score).map(composite => (
                            <p key={composite.index}>
                              <strong>{composite.index}:</strong> {composite.score} (p{composite.percentile || "--"})
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-4 pt-4">
                    <Button type="button" variant="outline" onClick={() => router.push('/assessments')}>
                      {t("common.cancel")}
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? t("scoreEntry.actions.saving") : t("scoreEntry.actions.save")}
                    </Button>

                    {submitError ? (
                      <p className="text-sm text-destructive self-center">{submitError}</p>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

export function ScoreEntryClient(props: ScoreEntryClientProps) {
  const { t } = useI18n()
  return (
    <Suspense fallback={<div>{t("scoreEntry.loading")}</div>}>
      <ScoreEntryForm {...props} />
    </Suspense>
  )
}
