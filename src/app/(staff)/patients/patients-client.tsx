"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Eye, Calendar, User, Users } from "lucide-react"
import { formatDate, formatAge } from "@/lib/utils"
import { EmptyState } from "@/components/ui/EmptyState"
import { useI18n } from "@/lib/i18n-context"

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

export function PatientsClient({ initialPatients }: { initialPatients: PatientData[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
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
      icon: Plus,
    },
  }), [initialPatients, t])

  const filteredPatients = initialPatients.filter(patient => {
    const matchesSearch = `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "ALL" || patient.status === statusFilter
    return matchesSearch && matchesStatus
  })

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
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {t("patients.cta")}
        </Button>
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
                  <TableHead>{t("patients.tableHeaders.name")}</TableHead>
                  <TableHead>{t("patients.tableHeaders.age")}</TableHead>
                  <TableHead>{t("patients.tableHeaders.referral")}</TableHead>
                  <TableHead>{t("patients.tableHeaders.status")}</TableHead>
                  <TableHead>{t("patients.tableHeaders.activeBatteries")}</TableHead>
                  <TableHead>{t("patients.tableHeaders.lastEvaluation")}</TableHead>
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
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/patients/${patient.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
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
