"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  Home,
  Package,
  ShoppingCart,
  TrendingUp,
  Settings,
  Users,
  LogIn,
  UserPlus,
  ChefHat,
  Database
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

const menuItems = [
  { href: "/", icon: Home, label: "Dashboard" },
  { href: "/inventory", icon: Package, label: "Inventory" },
  { href: "/waste", icon: ShoppingCart, label: "Waste Tracking" },
  { href: "/analytics", icon: TrendingUp, label: "Analytics" },
  { href: "/settings", icon: Settings, label: "Settings" },
  { href: "/users", icon: Users, label: "Users" },
]

const authItems = [
  { href: "/signin", icon: LogIn, label: "Sign In" },
  { href: "/signup", icon: UserPlus, label: "Sign Up" },
  { href: "/demo/setup", icon: Database, label: "Demo Setup" },
]

export function Sidebar() {
  const pathname = usePathname()
  const { toast } = useToast()

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">PlateGuard</h1>
            <p className="text-xs text-gray-500">Food Management System</p>
          </div>
        </div>
      </div>

      <nav className="p-4">
        <div className="mb-6">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Main Menu
          </h3>
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive
                        ? "bg-orange-50 text-orange-600 border-r-2 border-orange-600"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <Icon className="mr-3 h-4 w-4" />
                    {item.label}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Authentication
          </h3>
          <div className="space-y-1">
            {authItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive
                        ? "bg-orange-50 text-orange-600 border-r-2 border-orange-600"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <Icon className="mr-3 h-4 w-4" />
                    {item.label}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        <div className="mt-6 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Quick Test Account</span>
            <Badge variant="secondary">Demo</Badge>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Create a test account instantly to explore the dashboard
          </p>
          <Button 
            size="sm" 
            className="w-full"
            onClick={async () => {
              try {
                const response = await fetch('/api/auth/test-account')
                const data = await response.json()
                
                if (response.ok) {
                  // Show success message
                  toast({
                    title: "Test Account Created!",
                    description: "Test account created successfully! Redirecting to dashboard...",
                  })
                  
                  // Redirect to dashboard
                  window.location.href = '/'
                } else {
                  toast({
                    title: "Error",
                    description: "Failed to create test account: " + data.error,
                    variant: "destructive",
                  })
                }
              } catch (error) {
                toast({
                  title: "Error",
                  description: "Error creating test account",
                  variant: "destructive",
                })
              }
            }}
          >
            Create Test Account
          </Button>
          <div className="mt-2 text-xs text-gray-500">
            <div>Email: test@example.com</div>
            <div>Password: test123</div>
          </div>
        </div>
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>BDT Currency</span>
          <Badge variant="outline">৳ Taka</Badge>
        </div>
      </div>
    </div>
  )
}