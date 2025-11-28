"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChefHat } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SignIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Show success message
        toast({
          title: "Success!",
          description: "Sign in successful! Redirecting to dashboard...",
        })
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/')
        }, 1500)
      } else {
        setError(data.error || 'Failed to sign in')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <ChefHat className="h-12 w-12 text-green-600 mx-auto" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Sign In to PlateGuard</h1>
          <p className="text-gray-600">Enter your credentials to access the dashboard</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Sign in to your existing account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email Address</Label>
                <Input
                  id="signin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-t-transparent"></div>
                    <span className="ml-2">Signing In...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="text-center text-sm text-gray-600 mt-4">
              <p>Don't have an account?</p>
              <Link 
                href="/signup"
                className="text-blue-600 hover:underline"
              >
                Create Account
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500 mt-8">
          <p>By signing in, you agree to our</p>
          <p>Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  )
}