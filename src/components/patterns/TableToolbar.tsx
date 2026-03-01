"use client"

import { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Search, Plus, Filter, Download } from "lucide-react"

type TableToolbarProps = {
  title: string
  description?: string
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  onAdd?: () => void
  addLabel?: string
  onFilter?: () => void
  onExport?: () => void
  children?: ReactNode
  stats?: Array<{ label: string; value: string | number }>
}

export function TableToolbar({
  title,
  description,
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  onAdd,
  addLabel = "Add New",
  onFilter,
  onExport,
  children,
  stats,
}: TableToolbarProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl">{title}</CardTitle>
            {description && <CardDescription className="mt-1">{description}</CardDescription>}
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {onSearchChange && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            )}
            
            {onFilter && (
              <Button variant="outline" size="sm" onClick={onFilter}>
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            )}
            
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
            
            {onAdd && (
              <Button size="sm" onClick={onAdd}>
                <Plus className="h-4 w-4 mr-2" />
                {addLabel}
              </Button>
            )}
            
            {children}
          </div>
        </div>
        
        {stats && stats.length > 0 && (
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
            {stats.map((stat, index) => (
              <div key={index} className="text-center px-4 border-r last:border-0">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
      </CardHeader>
    </Card>
  )
}
