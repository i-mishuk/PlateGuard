"use client"

import { DashboardLayout } from "@/components/layout/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  Settings, 
  Bell, 
  Shield, 
  Database,
  Globe,
  Save,
  RotateCcw
} from "lucide-react"

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Configure your food waste management system</p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2 h-5 w-5" />
                  General Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="restaurant-name">Restaurant Name</Label>
                    <Input id="restaurant-name" defaultValue="FoodWaste Management" />
                  </div>
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select defaultValue="BDT">
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BDT">Bangladeshi Taka (BDT)</SelectItem>
                        <SelectItem value="USD">US Dollar (USD)</SelectItem>
                        <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea 
                    id="address" 
                    placeholder="Enter restaurant address"
                    defaultValue="123 Main Street, Dhaka, Bangladesh"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" defaultValue="+880 1234-567890" />
                </div>

                <div>
                  <Label htmlFor="email">Contact Email</Label>
                  <Input id="email" defaultValue="contact@restaurant.com" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Business Hours</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="opening-time">Opening Time</Label>
                    <Input id="opening-time" type="time" defaultValue="09:00" />
                  </div>
                  <div>
                    <Label htmlFor="closing-time">Closing Time</Label>
                    <Input id="closing-time" type="time" defaultValue="22:00" />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="weekend" />
                  <Label htmlFor="weekend">Open on weekends</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="mr-2 h-5 w-5" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="expiry-alerts">Expiry Alerts</Label>
                      <p className="text-sm text-gray-500">Get notified when items are about to expire</p>
                    </div>
                    <Switch id="expiry-alerts" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="low-stock">Low Stock Alerts</Label>
                      <p className="text-sm text-gray-500">Alert when inventory items run low</p>
                    </div>
                    <Switch id="low-stock" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="waste-reports">Weekly Waste Reports</Label>
                      <p className="text-sm text-gray-500">Receive weekly summary of waste analytics</p>
                    </div>
                    <Switch id="waste-reports" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="system-updates">System Updates</Label>
                      <p className="text-sm text-gray-500">Get notified about system maintenance and updates</p>
                    </div>
                    <Switch id="system-updates" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="alert-days">Alert Before Expiry (Days)</Label>
                  <Input id="alert-days" type="number" defaultValue="3" min="1" max="30" />
                </div>

                <div>
                  <Label htmlFor="low-stock-threshold">Low Stock Threshold</Label>
                  <Input id="low-stock-threshold" type="number" defaultValue="10" min="1" max="100" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                      <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                    </div>
                    <Switch id="two-factor" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="session-timeout">Session Timeout</Label>
                      <p className="text-sm text-gray-500">Automatically log out after inactivity</p>
                    </div>
                    <Switch id="session-timeout" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="audit-logging">Audit Logging</Label>
                      <p className="text-sm text-gray-500">Log all user activities for security review</p>
                    </div>
                    <Switch id="audit-logging" defaultChecked />
                  </div>
                </div>

                <div>
                  <Label htmlFor="session-duration">Session Duration (Minutes)</Label>
                  <Input id="session-duration" type="number" defaultValue="30" min="5" max="480" />
                </div>

                <div className="pt-4">
                  <h4 className="font-medium mb-2">Password Policy</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="password-length" defaultChecked />
                      <Label htmlFor="password-length">Minimum 8 characters</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="password-complex" defaultChecked />
                      <Label htmlFor="password-complex">Require special characters</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="password-expiry" />
                      <Label htmlFor="password-expiry">Password expiry (90 days)</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System */}
          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="mr-2 h-5 w-5" />
                  System Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Database Information</Label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span>Database Type:</span>
                        <Badge>SQLite</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Version:</span>
                        <span>3.x</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Backup:</span>
                        <span>2024-12-10 02:00 AM</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>System Status</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <span className="text-sm">API Service</span>
                      <Badge className="bg-green-100 text-green-800">Running</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <span className="text-sm">Database</span>
                      <Badge className="bg-green-100 text-green-800">Connected</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <span className="text-sm">Storage</span>
                      <Badge className="bg-green-100 text-green-800">85% Free</Badge>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Restart System
                  </Button>
                  <Button variant="outline">
                    <Database className="mr-2 h-4 w-4" />
                    Backup Database
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="mr-2 h-5 w-5" />
                  Localization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="bn">বাংলা (Bengali)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue="dhaka">
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dhaka">Asia/Dhaka (GMT+6)</SelectItem>
                      <SelectItem value="utc">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="date-format">Date Format</Label>
                  <Select defaultValue="dd-mm-yyyy">
                    <SelectTrigger>
                      <SelectValue placeholder="Select date format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dd-mm-yyyy">DD-MM-YYYY</SelectItem>
                      <SelectItem value="mm-dd-yyyy">MM-DD-YYYY</SelectItem>
                      <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}