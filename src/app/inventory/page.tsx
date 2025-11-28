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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  AlertTriangle,
  Calendar,
  Loader2,
  PackageX
} from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

interface InventoryItem {
  id: string
  name: string
  description?: string
  category: { name: string }
  categoryId?: string
  quantity: number
  unit: string
  price: number
  expiryDate?: string
  status: string
}

interface Category {
  id: string
  name: string
}

interface User {
  id: string
  email: string
  name: string
  role: string
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "AVAILABLE":
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Available</Badge>
    case "EXPIRING":
      return <Badge variant="outline" className="text-orange-600 border-orange-600">Expiring Soon</Badge>
    case "LOW_STOCK":
      return <Badge variant="outline" className="text-red-600 border-red-600">Low Stock</Badge>
    case "WASTED":
      return <Badge variant="outline" className="text-gray-600 border-gray-600">Removed</Badge>
    default:
      return <Badge variant="secondary">Unknown</Badge>
  }
}

export default function Inventory() {
  const { toast } = useToast()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string>("")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    quantity: "",
    unit: "kg",
    price: "",
    expiryDate: "",
    categoryId: ""
  })

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/inventory')
      const data = await response.json()
      setItems(data.items || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching inventory:', error)
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      const categoriesList = data.categories || []
      setCategories(categoriesList)
      console.log('Categories loaded:', categoriesList)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      const data = await response.json()
      const usersList = data.users || []
      setUsers(usersList)
      console.log('Users loaded:', usersList)
      if (usersList.length > 0) {
        setCurrentUserId(usersList[0].id) // Use first available user
        console.log('Set current user ID to:', usersList[0].id)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  useEffect(() => {
    fetchInventory()
    fetchCategories()
    fetchUsers()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.categoryId) {
      toast({
        title: "Validation Error",
        description: "Please select a category",
        variant: "destructive",
      })
      return
    }
    
    if (!currentUserId) {
      toast({
        title: "System Error",
        description: "No user available. Please refresh the page.",
        variant: "destructive",
      })
      return
    }
    
    console.log('Submitting form with data:', {
      ...formData,
      userId: currentUserId
    })
    
    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userId: currentUserId,
        }),
      })

      if (response.ok) {
        setIsAddDialogOpen(false)
        setFormData({
          name: "",
          description: "",
          quantity: "",
          unit: "kg",
          price: "",
          expiryDate: "",
          categoryId: ""
        })
        fetchInventory()
        toast({
          title: "Success!",
          description: "Item added successfully to inventory.",
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || 'Failed to add item',
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error adding item:', error)
      toast({
        title: "Network Error",
        description: "Failed to add item. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description || "",
      quantity: item.quantity.toString(),
      unit: item.unit,
      price: item.price.toString(),
      expiryDate: item.expiryDate || "",
      categoryId: item.categoryId || ""
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingItem) return
    
    try {
      const response = await fetch(`/api/inventory/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setIsEditDialogOpen(false)
        setEditingItem(null)
        setFormData({
          name: "",
          description: "",
          quantity: "",
          unit: "kg",
          price: "",
          expiryDate: "",
          categoryId: ""
        })
        fetchInventory()
        toast({
          title: "Success!",
          description: "Item updated successfully.",
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || 'Failed to update item',
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error updating item:', error)
      toast({
        title: "Network Error",
        description: "Failed to update item. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteItem = async (id: string) => {
    // Show confirmation toast with action
    const confirmationToast = toast({
      title: "Delete Item",
      description: "This action cannot be undone. The item will be permanently deleted from the system.",
      action: (
        <div className="flex gap-2">
          <button
            onClick={() => {
              // Dismiss the confirmation toast
              confirmationToast.dismiss()
              // Proceed with deletion
              performDelete(id)
            }}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
          >
            Delete Forever
          </button>
          <button
            onClick={() => confirmationToast.dismiss()}
            className="px-3 py-1 bg-gray-200 text-gray-800 rounded text-sm hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      ),
      duration: 15000, // Keep toast open for 15 seconds
    })
  }

  const performDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/inventory/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchInventory()
        toast({
          title: "Item Deleted",
          description: "The item has been permanently deleted from the system.",
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || 'Failed to delete item',
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error deleting item:', error)
      toast({
        title: "Network Error",
        description: "Failed to delete item. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleMarkAsWaste = async (id: string) => {
    // Show confirmation toast with action
    const confirmationToast = toast({
      title: "Remove from Inventory",
      description: "This item will be marked as disposed and removed from available inventory.",
      action: (
        <div className="flex gap-2">
          <button
            onClick={() => {
              // Dismiss the confirmation toast
              confirmationToast.dismiss()
              // Proceed with marking as waste
              performMarkAsWaste(id)
            }}
            className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700 transition-colors"
          >
            Remove Item
          </button>
          <button
            onClick={() => confirmationToast.dismiss()}
            className="px-3 py-1 bg-gray-200 text-gray-800 rounded text-sm hover:bg-gray-300 transition-colors"
          >
            Keep Item
          </button>
        </div>
      ),
      duration: 15000, // Keep toast open for 15 seconds
    })
  }

  const performMarkAsWaste = async (id: string) => {
    try {
      const response = await fetch(`/api/inventory/${id}/waste`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: 'OTHER',
          notes: 'Item removed from inventory'
        }),
      })

      if (response.ok) {
        fetchInventory()
        toast({
          title: "Item Removed",
          description: "The item has been successfully removed from inventory.",
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || 'Failed to remove item',
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error removing item:', error)
      toast({
        title: "Network Error",
        description: "Failed to remove item. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
            <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
            <p className="text-gray-600">Manage your food inventory and track stock levels</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Inventory Item</DialogTitle>
                <DialogDescription>
                  Add a new item to your inventory. Fill in the details below.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="name">Item Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter item name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter item description (optional)"
                    />
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
                      <Label htmlFor="unit">Unit</Label>
                      <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="liters">liters</SelectItem>
                          <SelectItem value="pieces">pieces</SelectItem>
                          <SelectItem value="boxes">boxes</SelectItem>
                          <SelectItem value="bottles">bottles</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Unit Price (BDT)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="0"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        type="date"
                        value={formData.expiryDate}
                        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="categoryId">Category *</Label>
                    <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.length === 0 ? (
                          <SelectItem value="" disabled>
                            No categories available
                          </SelectItem>
                        ) : (
                          categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {categories.length === 0 && (
                      <p className="text-sm text-red-600 mt-1">
                        Please add categories first before adding items
                      </p>
                    )}
                    {!currentUserId && (
                      <p className="text-sm text-orange-600 mt-1">
                        No user available - please refresh the page
                      </p>
                    )}
                    {/* Debug info - remove in production */}
                    {process.env.NODE_ENV === 'development' && (
                      <div className="text-xs text-gray-500 mt-2">
                        Debug: Categories: {categories.length}, User ID: {currentUserId || 'None'}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={categories.length === 0 || !currentUserId}>
                    Add Item
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Edit Item Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Inventory Item</DialogTitle>
                <DialogDescription>
                  Update the item details below.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpdateItem} className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="edit-name">Item Name</Label>
                    <Input
                      id="edit-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter item name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter item description (optional)"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-quantity">Quantity</Label>
                      <Input
                        id="edit-quantity"
                        type="number"
                        step="0.01"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        placeholder="0"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-unit">Unit</Label>
                      <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="liters">liters</SelectItem>
                          <SelectItem value="pieces">pieces</SelectItem>
                          <SelectItem value="boxes">boxes</SelectItem>
                          <SelectItem value="bottles">bottles</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-price">Unit Price (BDT)</Label>
                      <Input
                        id="edit-price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="0"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-expiryDate">Expiry Date</Label>
                      <Input
                        id="edit-expiryDate"
                        type="date"
                        value={formData.expiryDate}
                        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Update Item</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search inventory items..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline">Filter</Button>
              <Button variant="outline">Export</Button>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <Card>
          <CardHeader>
            <CardTitle>Current Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price (BDT)</TableHead>
                  <TableHead>Total Value (BDT)</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {item.quantity} {item.unit}
                        {item.status === "LOW_STOCK" && (
                          <AlertTriangle className="ml-2 h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>৳{item.price}</TableCell>
                    <TableCell>৳{item.quantity * item.price}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                        {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Quick Remove Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAsWaste(item.id)}
                          className="text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                        >
                          <PackageX className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                        
                        {/* More Actions Dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEditItem(item)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleMarkAsWaste(item.id)}>
                              <PackageX className="mr-2 h-4 w-4" />
                              Remove from Inventory
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeleteItem(item.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Permanently
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{items.length}</div>
              <p className="text-xs text-muted-foreground">Across all categories</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ৳{items.reduce((sum, item) => sum + (item.quantity * item.price), 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Current inventory value</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Items Expiring Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {items.filter(item => item.status === "EXPIRING").length}
              </div>
              <p className="text-xs text-muted-foreground">Within next 7 days</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}