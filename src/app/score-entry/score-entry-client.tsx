"use client"

import { useState, Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, Calculator } from "lucide-react"
import { createEvaluation } from "../actions"
import { useRouter, useSearchParams } from "next/navigation"
import { formatPlatform } from "@/lib/utils"

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

function ScoreEntryForm({
  initialPatients,
  initialAssessments,
}: {
  initialPatients: Patient[]
  initialAssessments: Assessment[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const initialPatientIdFromParams = searchParams.get("patient") ?? ""
  const initialAssessmentIdFromParams = searchParams.get("assessmentId") ?? ""

  const initialAssessmentFromParams = initialAssessmentIdFromParams
    ? initialAssessments.find((a) => a.id === initialAssessmentIdFromParams)
    : undefined

  const [selectedAssessmentId, setSelectedAssessmentId] = useState(() => initialAssessmentIdFromParams)
  const [selectedPatientId, setSelectedPatientId] = useState(() => initialPatientIdFromParams)
  const [selectedPlatform, setSelectedPlatform] = useState(() => initialAssessmentFromParams?.platform ?? "")
  const [adminDate, setAdminDate] = useState("")
  const [adminBy, setAdminBy] = useState("")
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

  const selectedPatient = initialPatients.find(p => p.id === selectedPatientId)
  const selectedAssessment = initialAssessments.find(a => a.id === selectedAssessmentId)

  const handleAssessmentChange = (id: string) => {
    setSelectedAssessmentId(id)
    const assessment = initialAssessments.find(a => a.id === id)
    if (assessment) {
      setSelectedPlatform(assessment.platform)
      setSubtests(assessment.subtests.map((s) => ({ ...s, rawScore: "", scaledScore: "" })))
      
      // Initialize basic composites (hardcoded for now, ideally derived from assessment type)
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
    const updatedSubtests = [...subtests]
    updatedSubtests[index][field] = value
    setSubtests(updatedSubtests)
  }

  const handleCompositeChange = (index: number, field: "score" | "percentile", value: string) => {
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
          // Very rough mock calculation: standard score mean 100, SD 15 based on scaled scores mean 10, SD 3
          const estScore = 100 + ((avgScaledScore - 10) * 5)
          return { ...composite, score: Math.round(estScore).toString() }
        }
      }
      return composite
    })
    setComposites(updatedComposites)
  }

  const handleSave = async () => {
    if (!selectedPatientId || !selectedAssessmentId || !adminDate) {
      alert("Please fill in required administration details (Patient, Assessment, Date)")
      return
    }

    setIsSaving(true)
    const result = await createEvaluation({
      patientId: selectedPatientId,
      assessmentId: selectedAssessmentId,
      adminDate,
      adminBy,
      subtests
    })

    if (result.success) {
      alert("Evaluation saved successfully!")
      router.push(`/reports`)
    } else {
      alert("Failed to save evaluation")
    }
    setIsSaving(false)
  }

  const getIndexColor = (index: string) => {
    const colors = {
      VCI: "bg-blue-100 text-blue-800",
      VSI: "bg-green-100 text-green-800",
      WMI: "bg-yellow-100 text-yellow-800",
      PSI: "bg-red-100 text-red-800",
      FRI: "bg-purple-100 text-purple-800",
      FSIQ: "bg-gray-100 text-gray-800",
    }
    return colors[index as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  // Get unique indices for the current subtests
  const uniqueIndices = Array.from(new Set(subtests.map(s => s.index).filter(Boolean)))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Score Entry</h1>
        <p className="text-muted-foreground">Enter raw and scaled scores for assessments</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Administration Details</CardTitle>
          <CardDescription>Enter evaluation information and select assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="text-sm font-medium">Patient</label>
              <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {initialPatients.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.firstName} {p.lastName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Assessment</label>
              <Select value={selectedAssessmentId} onValueChange={handleAssessmentChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select assessment" />
                </SelectTrigger>
                <SelectContent>
                  {initialAssessments.map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Platform</label>
              <Input 
                value={selectedPlatform ? formatPlatform(selectedPlatform) : ''} 
                disabled 
                placeholder="Auto-filled from assessment"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Administration Date</label>
              <Input 
                type="date" 
                value={adminDate}
                onChange={(e) => setAdminDate(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 mt-4">
            <div>
              <label className="text-sm font-medium">Administered By</label>
              <Input 
                placeholder="Enter clinician name"
                value={adminBy}
                onChange={(e) => setAdminBy(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedAssessment && (
        <Tabs defaultValue="subtests" className="space-y-4">
          <TabsList>
            <TabsTrigger value="subtests">Subtest Scores</TabsTrigger>
            {composites.length > 0 && <TabsTrigger value="composites">Composite Scores</TabsTrigger>}
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>
          
          <TabsContent value="subtests">
            <Card>
              <CardHeader>
                <CardTitle>Subtest Scores - {selectedAssessment.name}</CardTitle>
                <CardDescription>Enter raw scores and scaled scores</CardDescription>
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
                              <TableHead>Subtest</TableHead>
                              <TableHead>Raw Score</TableHead>
                              <TableHead>Scaled Score</TableHead>
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
                          <TableHead>Subtest</TableHead>
                          <TableHead>Raw Score</TableHead>
                          <TableHead>Scaled Score</TableHead>
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
                      <CardTitle>Composite Scores</CardTitle>
                      <CardDescription>Index scores and percentiles</CardDescription>
                    </div>
                    <Button onClick={calculateComposites}>
                      <Calculator className="h-4 w-4 mr-2" />
                      Calculate from Subtests
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Index</TableHead>
                        <TableHead>Full Name</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Percentile</TableHead>
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
                <CardTitle>Evaluation Summary</CardTitle>
                <CardDescription>Review and save the complete evaluation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="font-semibold mb-2">Administration Details</h3>
                      <div className="space-y-1 text-sm">
                        <p><strong>Patient:</strong> {selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : "Not selected"}</p>
                        <p><strong>Assessment:</strong> {selectedAssessment ? selectedAssessment.name : "Not selected"}</p>
                        <p><strong>Platform:</strong> {selectedPlatform ? formatPlatform(selectedPlatform) : "Not selected"}</p>
                        <p><strong>Date:</strong> {adminDate || "Not set"}</p>
                        <p><strong>Administered By:</strong> {adminBy || "Not set"}</p>
                      </div>
                    </div>
                    {composites.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Score Summary</h3>
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
                    <Button onClick={handleSave} disabled={isSaving}>
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? "Saving..." : "Save Evaluation"}
                    </Button>
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

export function ScoreEntryClient({
  initialPatients,
  initialAssessments,
}: {
  initialPatients: Patient[]
  initialAssessments: Assessment[]
}) {
  return (
    <Suspense fallback={<div>Loading form...</div>}>
      <ScoreEntryForm initialPatients={initialPatients} initialAssessments={initialAssessments} />
    </Suspense>
  )
}
