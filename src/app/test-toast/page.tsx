"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ToastTest() {
  const { toast } = useToast()

  const testToast = () => {
    toast({
      title: "Test Toast",
      description: "This is a test toast notification",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Toast Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Click the button below to test if toast notifications are working.
            </p>
            <Button onClick={testToast} className="w-full">
              Test Toast Notification
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}