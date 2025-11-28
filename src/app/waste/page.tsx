"use client"

import { DashboardLayout } from "@/components/layout/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Trash2, 
  Search, 
  AlertTriangle,
  Calendar,
  Loader2,
  TrendingDown,
  PackageX,
  Filter
} from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

interface WasteRecord {
  id: string
  quantity: number
  reason: string
  cost: number
  date: string
  notes?: string
  item: {
    id: string
    name: string
    category: { name: string }
  }
  user: {
    id: string
    name: string
    email: string
  }
}

interface InventoryItem {
  id: string
  name: string
  quantity: number
  unit: string
  price: number
  category: { name: string }
}

const getReasonBadge = (reason: string) => {
  switch (reason) {
    case "EXPIRED":
      return <Badge variant="destructive">Expired</Badge>
    case "DAMAGED":
      return <Badge variant="outline" className="text-orange-600 border-orange-600">Damaged</Badge>
    case "OVERSTOCK":
      return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Overstock</Badge>
    case "PREPARATION":
      return <Badge variant="outline" className="text-blue-600 border-blue-600">Preparation</Badge>
    case "OTHER":
      return <Badge variant="secondary">Other</Badge>
    default:
      return <Badge variant="secondary">{reason}</Badge>
  }
}

const formatCurrency = (amount: number) => {
  return `৳${amount.toLocaleString()}`
}

export default function WasteTracking() {
  const { toast } = useToast()
  const [wasteRecords, setWasteRecords] = useState<WasteRecord[]>([])
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<string>("")
  const [currentUserId, setCurrentUserId] = useState<string>("")
  const [formData, setFormData] = useState({
    quantity: "",
    reason: "",
    cost: "",
    notes: ""
  })

  const fetchWasteRecords = async () => {
    try {
      const response = await fetch('/api/waste')
      const data = await response.json()
      setWasteRecords(data.wasteRecords || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching waste records:', error)
      setLoading(false)
    }
  }

  const fetchInventoryItems = async () => {
    try {
      const response = await fetch('/api/inventory')
      const data = await response.json()
      const items = data.items || []
      // Only show items that have available quantity
      const availableItems = items.filter((item: InventoryItem) => item.quantity > 0)
      setInventoryItems(availableItems)
      
      if (availableItems.length > 0 && !selectedItem) {
        setSelectedItem(availableItems[0].id)
        setFormData(prev => ({
          ...prev,
          cost: availableItems[0].price.toString()
        }))
      }
    } catch (error) {
      console.error('Error fetching inventory items:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      const data = await response.json()
      const usersList = data.users || []
      if (usersList.length > 0) {
        setCurrentUserId(usersList[0].id)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  useEffect(() => {
    fetchWasteRecords()
    fetchInventoryItems()
    fetchUsers()
  }, [])

  const handleItemChange = (itemId: string) => {
    setSelectedItem(itemId)
    const item = inventoryItems.find(i => i.id === itemId)
    if (item) {
      setFormData(prev => ({
        ...prev,
        cost: item.price.toString()
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedItem || !currentUserId) {
      toast({
        title: "Validation Error",
        description: "Please select an item and ensure a user is available",
        variant: "destructive",
      })
      return
    }
    
    const selectedItemData = inventoryItems.find(item => item.id === selectedItem)
    if (!selectedItemData) {
      toast({
        title: "Error",
        description: "Selected item not found",
        variant: "destructive",
      })
      return
    }

    const quantity = parseFloat(formData.quantity)
    if (quantity > selectedItemData.quantity) {
      toast({
        title: "Validation Error",
        description: `Cannot waste more than available quantity (${selectedItemData.quantity} ${selectedItemData.unit})`,
        variant: "destructive",
      })
      return
    }
    
    try {
      const response = await fetch('/api/waste', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId: selectedItem,
          userId: currentUserId,
          quantity: formData.quantity,
          reason: formData.reason,
          cost: formData.cost,
          notes: formData.notes
        }),
      })

      if (response.ok) {
        setIsAddDialogOpen(false)
        setFormData({
          quantity: "",
          reason: "",
          cost: "",
          notes: ""
        })
        fetchWasteRecords()
        fetchInventoryItems() // Refresh inventory to update quantities
        toast({
          title: "Success!",
          description: "Waste record created successfully.",
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || 'Failed to create waste record',
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error creating waste record:', error)
      toast({
        title: "Network Error",
        description: "Failed to create waste record. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredRecords = wasteRecords.filter(record =>
    record.item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.item.category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.reason.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalWasteCost = wasteRecords.reduce((sum, record) => sum + record.cost, 0)
  const totalWasteQuantity = wasteRecords.reduce((sum, record) => sum + record.quantity, 0)

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Waste Tracking</h1>
            <p className="text-gray-600">Track and analyze food waste to reduce costs</p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PackageX className="mr-2 h-4 w-4" />
            Record Waste
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Waste Records</CardTitle>
              <PackageX className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{wasteRecords.length}</div>
              <p className="text-xs text-muted-foreground">
                Records tracked
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Waste Cost</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalWasteCost)}</div>
              <p className="text-xs text-red-600">
                Total loss value
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalWasteQuantity.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                Units wasted
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Items</CardTitle>
              <Filter className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inventoryItems.length}</div>
              <p className="text-xs text-green-600">
                Items available for waste tracking
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Add Waste Dialog */}
        {isAddDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Record Waste</h2>
              <p className="text-gray-600 mb-6">
                Record an item as waste to track disposal and analyze patterns.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="item">Select Item</Label>
                  <Select value={selectedItem} onValueChange={handleItemChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an item" />
                    </SelectTrigger>
                    <SelectContent>
                      {inventoryItems.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} ({item.quantity} {item.unit} available)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      step="0.01"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      placeholder="0"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="reason">Reason</Label>
                    <Select value={formData.reason} onValueChange={(value) => setFormData({ ...formData, reason: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EXPIRED">Expired</SelectItem>
                        <SelectItem value="DAMAGED">Damaged</SelectItem>
                        <SelectItem value="OVERSTOCK">Overstock</SelectItem>
                        <SelectItem value="PREPARATION">Preparation</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="cost">Cost (BDT)</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    placeholder="0"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Add any additional notes..."
                  />
                </div>
                <div className="flex space-x-3">
                  <Button type="submit" className="flex-1">
                    Record Waste
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsAddDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Waste Records</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by item name, category, or reason..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Recorded By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.item.name}</TableCell>
                    <TableCell>{record.item.category.name}</TableCell>
                    <TableCell>{record.quantity}</TableCell>
                    <TableCell>{getReasonBadge(record.reason)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(record.cost)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                        {new Date(record.date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{record.user.name}</div>
                        <div className="text-gray-500">{record.user.email}</div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredRecords.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center">
                        <PackageX className="h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-500">No waste records found</p>
                        <p className="text-sm text-gray-400">
                          {searchTerm ? "Try adjusting your search" : "Start recording waste to see data here"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}