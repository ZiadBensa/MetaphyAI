"use client"

import { signIn, getSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Sparkles, Chrome, AlertCircle } from "lucide-react"

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    // Check if user is already signed in
    getSession().then((session) => {
      if (session) {
        router.push("/")
      }
    })
  }, [router])

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      setError("")

      const result = await signIn("google", {
        callbackUrl: "/",
        redirect: false,
      })

      if (result?.error) {
        setError("Failed to sign in with Google. Please try again.")
      } else if (result?.url) {
        router.push(result.url)
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl">Welcome to AI Text Tools</CardTitle>
          <CardDescription>
            Sign in with your Google account to access text extraction and humanization features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button onClick={handleGoogleSignIn} disabled={isLoading} className="w-full" size="lg">
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Signing in...
              </>
            ) : (
              <>
                <Chrome className="h-5 w-5 mr-2" />
                Continue with Google
              </>
            )}
          </Button>

          <div className="text-center text-sm text-gray-600">
            <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
