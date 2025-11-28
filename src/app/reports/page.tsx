"use client"

import { DashboardLayout } from "@/components/layout/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  TrendingDown, 
  TrendingUp, 
  Download, 
  Calendar,
  DollarSign,
  Package,
  AlertTriangle,
  Loader2
} from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

interface WasteRecord {
  id: string
  item: {
    name: string
    category: {
      name: string
    }
  }
  user: {
    name: string
  }
  quantity: number
  reason: string
  cost: number
  date: string
}

interface ReportData {
  summary: {
    totalWasteCost: number
    totalWasteQuantity: number
    wastePercentage: number
    totalInventoryCost: number
    wasteRecordsCount: number
  }
  wasteByCategory: Array<{
    category: string
    cost: number
    quantity: number
    count: number
    percentage: number
  }>
  wasteByReason: Array<{
    reason: string
    cost: number
    quantity: number
    count: number
    percentage: number
  }>
  monthlyTrend: Array<{
    month: string
    cost: number
    quantity: number
    count: number
  }>
  recentWasteRecords: WasteRecord[]
}

export default function Reports() {
  const { toast } = useToast()
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("month")

  const fetchReports = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/reports?period=${period}`)
      const data = await response.json()
      
      if (response.ok) {
        setReportData(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to load reports data",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
      toast({
        title: "Network Error",
        description: "Failed to load reports data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [period])

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'EXPIRED': return 'bg-red-500'
      case 'OVERSTOCK': return 'bg-orange-500'
      case 'DAMAGED': return 'bg-yellow-500'
      case 'PREPARATION': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const formatReason = (reason: string) => {
    switch (reason) {
      case 'EXPIRED': return 'Expired'
      case 'OVERSTOCK': return 'Overstock'
      case 'DAMAGED': return 'Damaged'
      case 'PREPARATION': return 'Preparation'
      case 'OTHER': return 'Other'
      default: return reason
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  if (!reportData) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-gray-600">No data available</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Waste Reports</h1>
            <p className="text-gray-600">Analyze food waste patterns and trends</p>
          </div>
          <div className="flex space-x-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Waste (BDT)</CardTitle>
              <DollarSign className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">৳{reportData.summary.totalWasteCost.toLocaleString()}</div>
              <p className="text-xs text-gray-600">
                {reportData.summary.wasteRecordsCount} items
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Waste Percentage</CardTitle>
              <Package className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.summary.wastePercentage.toFixed(1)}%</div>
              <p className="text-xs text-gray-600">
                Of total inventory value
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Items Wasted</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.summary.wasteRecordsCount}</div>
              <p className="text-xs text-gray-600">
                Total items removed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.summary.totalWasteQuantity.toFixed(1)}</div>
              <p className="text-xs text-gray-600">
                Units wasted
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Waste Records */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Waste Records</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Cost (BDT)</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.recentWasteRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{record.item.name}</TableCell>
                    <TableCell>{record.item.category.name}</TableCell>
                    <TableCell>{record.quantity}</TableCell>
                    <TableCell>৳{record.cost.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {formatReason(record.reason)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {reportData.recentWasteRecords.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                      No waste records found for this period
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Waste by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Waste by Category</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {reportData.wasteByCategory.map((category) => (
                <div key={category.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{category.category}</span>
                    <span className="text-sm text-gray-600">
                      ৳{category.cost.toLocaleString()} ({category.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              {reportData.wasteByCategory.length === 0 && (
                <p className="text-center text-gray-500 py-4">No category data available</p>
              )}
            </CardContent>
          </Card>

          {/* Waste Reasons */}
          <Card>
            <CardHeader>
              <CardTitle>Waste Reasons</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {reportData.wasteByReason.map((reason) => (
                <div key={reason.reason} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getReasonColor(reason.reason)}`}></div>
                    <span className="text-sm font-medium">{formatReason(reason.reason)}</span>
                  </div>
                  <Badge variant={reason.percentage > 30 ? "destructive" : "secondary"}>
                    {reason.percentage}%
                  </Badge>
                </div>
              ))}
              {reportData.wasteByReason.length === 0 && (
                <p className="text-center text-gray-500 py-4">No reason data available</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}