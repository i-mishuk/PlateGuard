"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  Database, 
  Users, 
  Package, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Loader2,
  RefreshCw
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DemoUser {
  id: string
  name: string
  email: string
  role: string
  password: string
}

interface DemoSummary {
  usersCreated: number
  categoriesCreated: number
  inventoryItemsCreated: number
  wasteRecordsCreated: number
}

export default function DemoSetup() {
  const [isLoading, setIsLoading] = useState(false)
  const [demoUsers, setDemoUsers] = useState<DemoUser[]>([])
  const [summary, setSummary] = useState<DemoSummary | null>(null)
  const [error, setError] = useState("")
  const { toast } = useToast()

  const setupDemoData = async () => {
    setIsLoading(true)
    setError("")
    setDemoUsers([])
    setSummary(null)

    try {
      const response = await fetch('/api/demo/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const data = await response.json()

      if (response.ok) {
        setDemoUsers(data.users)
        setSummary(data.summary)
        toast({
          title: "Demo Data Created!",
          description: "Successfully created demo data with users, inventory, and waste records.",
        })
      } else {
        setError(data.error || 'Failed to create demo data')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Badge className="bg-purple-100 text-purple-800">Admin</Badge>
      case "MANAGER":
        return <Badge className="bg-blue-100 text-blue-800">Manager</Badge>
      case "USER":
        return <Badge className="bg-green-100 text-green-800">Staff</Badge>
      default:
        return <Badge variant="secondary">{role}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">PlateGuard Demo Setup</h1>
          <p className="text-gray-600">Populate your food management system with realistic demo data</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Setup Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="mr-2 h-5 w-5" />
                Demo Data Setup
              </CardTitle>
              <CardDescription>
                Click the button below to create comprehensive demo data including users, inventory items, categories, and waste records.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={setupDemoData}
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Demo Data...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Create Demo Data
                  </div>
                )}
              </Button>

              {summary && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
                      <h3 className="font-semibold text-green-800">Demo Data Created Successfully!</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center">
                        <Users className="mr-2 h-4 w-4 text-blue-600" />
                        <span className="font-medium">{summary.usersCreated} Users</span>
                      </div>
                      <div className="flex items-center">
                        <Package className="mr-2 h-4 w-4 text-green-600" />
                        <span className="font-medium">{summary.inventoryItemsCreated} Items</span>
                      </div>
                      <div className="flex items-center">
                        <TrendingUp className="mr-2 h-4 w-4 text-orange-600" />
                        <span className="font-medium">{summary.wasteRecordsCreated} Records</span>
                      </div>
                      <div className="flex items-center">
                        <Database className="mr-2 h-4 w-4 text-purple-600" />
                        <span className="font-medium">{summary.categoriesCreated} Categories</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Demo Users Card */}
          {demoUsers.length > 0 && (
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Demo User Accounts
                </CardTitle>
                <CardDescription>
                  Use these accounts to explore different user roles and permissions in the system.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {demoUsers.map((user, index) => (
                    <div key={user.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-gray-600">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold">{user.name}</h4>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                        </div>
                        {getRoleBadge(user.role)}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium">Email:</span>
                          <span className="ml-1 font-mono bg-white px-2 py-1 rounded">{user.email}</span>
                        </div>
                        <div>
                          <span className="font-medium">Password:</span>
                          <span className="ml-1 font-mono bg-yellow-100 px-2 py-1 rounded">{user.password}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Quick Access</h4>
                  <p className="text-sm text-blue-600 mb-3">
                    Click on any user card below to automatically sign in with that account
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {demoUsers.map((user) => (
                      <Button
                        key={user.id}
                        variant="outline"
                        className="w-full"
                        onClick={async () => {
                          try {
                            const response = await fetch('/api/auth/signin', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                email: user.email,
                                password: user.password
                              })
                            })

                            if (response.ok) {
                              toast({
                                title: "Signed In!",
                                description: `Successfully signed in as ${user.name}`,
                              })
                              setTimeout(() => {
                                window.location.href = '/'
                              }, 1000)
                            } else {
                              toast({
                                title: "Error",
                                description: "Failed to sign in",
                                variant: "destructive",
                              })
                            }
                          } catch (error) {
                            toast({
                              title: "Error",
                              description: "Network error occurred",
                              variant: "destructive",
                            })
                          }
                        }}
                      >
                        Sign in as {user.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-orange-500" />
              Demo Data Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">📦 Inventory Items Created:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                  <li><strong>Vegetables:</strong> Tomatoes, Onions, Potatoes, Lettuce</li>
                  <li><strong>Fruits:</strong> Apples, Bananas</li>
                  <li><strong>Dairy:</strong> Milk, Cheese, Yogurt</li>
                  <li><strong>Meat:</strong> Chicken Breast, Beef, Fish</li>
                  <li><strong>Grains:</strong> Rice, Flour, Pasta</li>
                  <li><strong>Beverages:</strong> Orange Juice, Soda</li>
                  <li><strong>Condiments:</strong> Ketchup, Mayonnaise</li>
                  <li><strong>Bakery:</strong> Bread, Croissants</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">📊 Waste Records Created:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                  <li><strong>Expired Items:</strong> Vegetables, fruits, chicken due to various reasons</li>
                  <li><strong>Damaged Items:</strong> Onions, fish due to handling issues</li>
                  <li><strong>Overstock Items:</strong> Potatoes due to overordering</li>
                  <li><strong>Preparation Waste:</strong> Milk, ingredients during food prep</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">👥 User Roles:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                  <li><strong>Admin:</strong> Full system access and configuration</li>
                  <li><strong>Manager:</strong> Inventory management and reporting</li>
                  <li><strong>Staff:</strong> Daily operations and waste tracking</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}