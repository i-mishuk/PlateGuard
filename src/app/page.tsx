"use client"

import { DashboardLayout } from "@/components/layout/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingDown, 
  TrendingUp, 
  Package, 
  AlertTriangle,
  DollarSign,
  Users,
  ShoppingCart,
  Loader2
} from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
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
  XAxis as LineXAxis,
  YAxis as LineYAxis,
  CartesianGrid as LineCartesianGrid,
  Tooltip as LineTooltip,
  ResponsiveContainer
} from "recharts"

interface DashboardData {
  summary: {
    totalInventoryItems: number
    totalInventoryValue: number
    totalWasteCost: number
    totalWasteQuantity: number
    wastePercentage: number
    lowStockItems: number
    expiringItems: number
    costSaved: number
  }
  wasteByCategory: Array<{
    category: string
    cost: number
    count: number
    percentage: number
  }>
  wasteByReason: Array<{
    reason: string
    cost: number
    count: number
    percentage: number
  }>
  monthlyTrend: Array<{
    month: string
    inventoryValue: number
    wasteCost: number
  }>
  recentWasteRecords: Array<{
    id: string
    item: { name: string; category: { name: string } }
    quantity: number
    cost: number
    date: string
    reason: string
  }>
  lowStockItems: Array<{
    id: string
    name: string
    quantity: number
    unit: string
    category: { name: string }
  }>
  expiringItems: Array<{
    id: string
    name: string
    quantity: number
    unit: string
    expiryDate: string
    category: { name: string }
  }>
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

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

export default function Dashboard() {
  const { toast } = useToast()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [period, setPeriod] = useState("month")

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/dashboard?period=${period}`)
      const data = await response.json()
      
      if (response.ok) {
        setData(data)
        setLastUpdate(new Date())
      } else {
        throw new Error('Failed to fetch dashboard data')
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
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
            <h1 className="text-3xl font-bold text-gray-900">PlateGuard Dashboard</h1>
            <p className="text-gray-600">Monitor your food management metrics and reduce waste</p>
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
            <button
              onClick={fetchDashboardData}
              className="ml-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Inventory</CardTitle>
              <Package className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.summary.totalInventoryItems}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(data.summary.totalInventoryValue)} total value
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Waste This Month</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
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
              <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.summary.expiringItems}</div>
              <p className="text-xs text-muted-foreground">
                Items expiring in 3 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cost Saved</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(data.summary.costSaved)}</div>
              <p className="text-xs text-green-600">
                Estimated savings this month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Waste by Category Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Waste by Category</CardTitle>
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

          {/* Monthly Trend Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="inventoryValue" fill="#0088FE" name="Inventory Value" />
                  <Bar dataKey="wasteCost" fill="#FF8042" name="Waste Cost" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Waste Reasons Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Waste Reasons Analysis</CardTitle>
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

        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Waste Records */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Waste Records</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.recentWasteRecords.map((record) => (
                <div key={record.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{record.item.name}</p>
                    <p className="text-sm text-gray-500">
                      {record.item.category.name} • {record.quantity} units
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="destructive">{formatCurrency(record.cost)}</Badge>
                  </div>
                </div>
              ))}
              {data.recentWasteRecords.length === 0 && (
                <p className="text-center text-gray-500 py-4">No recent waste records</p>
              )}
            </CardContent>
          </Card>

          {/* Low Stock & Expiring Items */}
          <Card>
            <CardHeader>
              <CardTitle>Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <span className="font-medium">Low Stock Items</span>
                </div>
                {data.lowStockItems.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span>{item.name}</span>
                    <Badge variant="outline">{item.quantity} {item.unit}</Badge>
                  </div>
                ))}
                {data.lowStockItems.length === 0 && (
                  <p className="text-sm text-gray-500">No low stock items</p>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Package className="h-4 w-4 text-red-500" />
                  <span className="font-medium">Expiring Soon</span>
                </div>
                {data.expiringItems.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <div>
                      <span>{item.name}</span>
                      <p className="text-gray-500">
                        Expires: {new Date(item.expiryDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline">{item.quantity} {item.unit}</Badge>
                  </div>
                ))}
                {data.expiringItems.length === 0 && (
                  <p className="text-sm text-gray-500">No items expiring soon</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center text-sm text-gray-500">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      </div>
    </DashboardLayout>
  )
}