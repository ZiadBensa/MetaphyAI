"use client"

import { signIn, getSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Sparkles, Chrome, AlertCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function SignIn() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if user is already signed in
    getSession().then((session) => {
      if (session) {
        router.push("/")
      }
    })

    // Show error messages for different error types
    const errorType = searchParams.get("error");
    if (errorType === "AccessDenied") {
      setError("Login cancelled. Please try again if you wish to sign in.");
    } else if (errorType === "OAuthAccountNotLinked") {
      setError("This email is already linked with another provider. Please use the correct provider to sign in.");
    } else if (errorType) {
      setError("An unknown error occurred. Please try again.");
    }
  }, [router, searchParams])

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
          <div className="mx-auto h-20 w-20 rounded-xl flex items-center justify-center mb-4 bg-white shadow">
            <Image
              src="/Agora.jpeg"
              alt="App Logo"
              width={80}
              height={80}
              className="object-contain rounded-xl"
              priority
            />
          </div>
          <CardTitle className="text-2xl">Welcome to AgoraAI</CardTitle>
          <CardDescription>
            Sign in with your Google account to access the AI tools and features.
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

          {/* Return to Home Page button */}
          <Link href="/" passHref>
            <Button
              type="button"
              variant="secondary"
              className="w-full mt-2"
            >
              Return to Home Page
            </Button>
          </Link>

          <div className="text-center text-sm text-gray-600">
            <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
          </div>
          
          {/* Admin Access Button */}
          <div className="text-center pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/admin')}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Admin Access
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
