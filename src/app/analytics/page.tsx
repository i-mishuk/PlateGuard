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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer
} from "recharts"
import { 
  TrendingDown, 
  TrendingUp, 
  Package, 
  AlertTriangle,
  DollarSign,
  Calendar,
  Loader2,
  Trash2,
  PieChart as PieChartIcon,
  BarChart3
} from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

interface AnalyticsData {
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
  recentWasteRecords: Array<{
    id: string
    item: { name: string; category: { name: string } }
    quantity: number
    cost: number
    date: string
    reason: string
    user: { name: string }
  }>
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

const formatCurrency = (amount: number) => {
  return `৳${amount.toLocaleString()}`
}

const formatMonth = (monthString: string) => {
  const date = new Date(monthString + '-01')
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export default function Analytics() {
  const { toast } = useToast()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("month")

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/reports?period=${period}`)
      const analyticsData = await response.json()
      
      if (response.ok) {
        setData(analyticsData)
      } else {
        throw new Error('Failed to fetch analytics data')
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error)
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-gray-600">No analytics data available</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Waste Analytics</h1>
            <p className="text-gray-600">Analyze food waste patterns and identify cost-saving opportunities</p>
          </div>
          <div className="flex items-center space-x-2">
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
            <Button
              onClick={fetchAnalytics}
              variant="outline"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Waste Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(data.summary.totalWasteCost)}</div>
              <p className="text-xs text-red-600">
                {data.summary.wastePercentage.toFixed(1)}% of inventory value
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Waste Records</CardTitle>
              <Trash2 className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.summary.wasteRecordsCount}</div>
              <p className="text-xs text-muted-foreground">
                Total records tracked
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
              <Package className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.summary.totalWasteQuantity.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                Units wasted
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(data.summary.totalInventoryCost)}</div>
              <p className="text-xs text-green-600">
                Current inventory value
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Waste by Category Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChartIcon className="mr-2 h-5 w-5" />
                Waste by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.wasteByCategory.map((cat, index) => ({
                      name: cat.category,
                      value: cat.cost,
                      percentage: cat.percentage
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                  >
                    {data.wasteByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {data.wasteByCategory.slice(0, 3).map((cat, index) => (
                  <div key={cat.category} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <span>{cat.category}</span>
                    </div>
                    <span className="font-medium">{formatCurrency(cat.cost)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Waste by Reason Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
                Waste by Reason
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={data.wasteByReason.map(reason => ({
                    ...reason,
                    formattedReason: formatReason(reason.reason)
                  }))}
                  layout="horizontal"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="formattedReason" type="category" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="cost" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Trend Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingDown className="mr-2 h-5 w-5" />
              Monthly Waste Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tickFormatter={formatMonth}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    name === 'cost' ? formatCurrency(value) : value,
                    name === 'cost' ? 'Cost' : name === 'quantity' ? 'Quantity' : 'Records'
                  ]}
                  labelFormatter={(label) => formatMonth(label)}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="cost" 
                  stroke="#FF8042" 
                  strokeWidth={2}
                  name="cost"
                  dot={{ fill: '#FF8042' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="quantity" 
                  stroke="#0088FE" 
                  strokeWidth={2}
                  name="quantity"
                  dot={{ fill: '#0088FE' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Waste Records */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Waste Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentWasteRecords.slice(0, 10).map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-medium">{record.item.name}</p>
                        <p className="text-sm text-gray-500">
                          {record.item.category.name} • {record.quantity} units
                        </p>
                      </div>
                      <Badge variant="outline">
                        {formatReason(record.reason)}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-red-600">{formatCurrency(record.cost)}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(record.date).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400">
                      by {record.user.name}
                    </p>
                  </div>
                </div>
              ))}
              {data.recentWasteRecords.length === 0 && (
                <p className="text-center text-gray-500 py-4">No recent waste records</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}