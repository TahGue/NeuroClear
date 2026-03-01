"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Eye, Calendar, User, Users, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { formatDate, formatAge } from "@/lib/utils"
import { EmptyState } from "@/components/ui/EmptyState"
import { useI18n } from "@/lib/i18n-context"
import { AddPatientDialog, EditPatientDialog, DeletePatientDialog } from "@/components/patients/patient-dialogs"

type PatientData = {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: Date
  referralSource: string | null
  status: string
  activeTestBatteries: string[]
  lastEvaluation: Date | null
}

type SortField = "name" | "age" | "status" | "lastEvaluation"
type SortDirection = "asc" | "desc"

export function PatientsClient({ initialPatients }: { initialPatients: PatientData[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const { t } = useI18n()

  const stats = useMemo(() => ({
    total: {
      title: t("patients.stats.total.title"),
      description: t("patients.stats.total.description"),
      value: initialPatients.length,
      icon: User,
    },
    active: {
      title: t("patients.stats.active.title"),
      description: t("patients.stats.active.description"),
      value: initialPatients.filter(p => p.status === "ACTIVE").length,
      icon: Calendar,
    },
    pending: {
      title: t("patients.stats.pending.title"),
      description: t("patients.stats.pending.description"),
      value: initialPatients.filter(p => p.activeTestBatteries.length > 0).length,
      icon: Eye,
    },
    new: {
      title: t("patients.stats.new.title"),
      description: t("patients.stats.new.description"),
      value: 2,
      icon: Search,
    },
  }), [initialPatients, t])

  const filteredPatients = useMemo(() => {
    let filtered = initialPatients.filter(patient => {
      const matchesSearch = `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           patient.id.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "ALL" || patient.status === statusFilter
      return matchesSearch && matchesStatus
    })

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case "name":
          comparison = `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`)
          break
        case "age":
          comparison = new Date(a.dateOfBirth).getTime() - new Date(b.dateOfBirth).getTime()
          break
        case "status":
          comparison = a.status.localeCompare(b.status)
          break
        case "lastEvaluation":
          const aDate = a.lastEvaluation ? new Date(a.lastEvaluation).getTime() : 0
          const bDate = b.lastEvaluation ? new Date(b.lastEvaluation).getTime() : 0
          comparison = aDate - bDate
          break
      }
      return sortDirection === "asc" ? comparison : -comparison
    })

    return filtered
  }, [initialPatients, searchTerm, statusFilter, sortField, sortDirection])

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />
    return sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "default"
      case "INACTIVE": return "secondary"
      case "DISCHARGED": return "outline"
      default: return "outline"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("patients.title")}</h1>
          <p className="text-muted-foreground">{t("patients.description")}</p>
        </div>
        <AddPatientDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {Object.values(stats).map((stat, index) => (
          <Card key={stat.title + index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{t("patients.roster.title")}</CardTitle>
              <CardDescription>{t("patients.roster.description")}</CardDescription>
            </div>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t("patients.roster.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background text-sm"
              >
                <option value="ALL">{t("patients.roster.statusFilter.all")}</option>
                <option value="ACTIVE">{t("patients.roster.statusFilter.active")}</option>
                <option value="INACTIVE">{t("patients.roster.statusFilter.inactive")}</option>
                <option value="DISCHARGED">{t("patients.roster.statusFilter.discharged")}</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredPatients.length === 0 ? (
            <EmptyState
              icon={Users}
              title={t("patients.empty.title")}
              description={t("patients.empty.description")}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("patients.tableHeaders.id")}</TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => toggleSort("name")} className="flex items-center gap-1">
                      {t("patients.tableHeaders.name")}
                      {getSortIcon("name")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => toggleSort("age")} className="flex items-center gap-1">
                      {t("patients.tableHeaders.age")}
                      {getSortIcon("age")}
                    </Button>
                  </TableHead>
                  <TableHead>{t("patients.tableHeaders.referral")}</TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => toggleSort("status")} className="flex items-center gap-1">
                      {t("patients.tableHeaders.status")}
                      {getSortIcon("status")}
                    </Button>
                  </TableHead>
                  <TableHead>{t("patients.tableHeaders.activeBatteries")}</TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => toggleSort("lastEvaluation")} className="flex items-center gap-1">
                      {t("patients.tableHeaders.lastEvaluation")}
                      {getSortIcon("lastEvaluation")}
                    </Button>
                  </TableHead>
                  <TableHead>{t("patients.tableHeaders.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.id.substring(0, 8)}...</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{patient.firstName} {patient.lastName}</div>
                        <div className="text-sm text-muted-foreground">{t("patients.table.dobLabel")}: {formatDate(patient.dateOfBirth)}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {`${formatAge(patient.dateOfBirth)} ${t("patients.table.ageSuffix")}`}
                    </TableCell>
                    <TableCell>{patient.referralSource || t("patients.table.referralUnknown")}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(patient.status)}>
                        {t(`patients.status.${patient.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {patient.activeTestBatteries.length > 0 ? (
                          patient.activeTestBatteries.map((battery) => (
                            <Badge key={battery} variant="outline" className="text-xs">
                              {battery}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-sm">{t("patients.table.noActiveBatteries")}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{patient.lastEvaluation ? formatDate(patient.lastEvaluation) : t("patients.table.lastEvaluationUnknown")}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/patients/${patient.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <EditPatientDialog patient={patient} />
                        <DeletePatientDialog patient={patient} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
