"use client"

import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

const errorMessages: Record<string, string> = {
  Configuration: "There is a problem with the server configuration. Contact the administrator.",
  AccessDenied: "You do not have permission to sign in with this account.",
  Verification: "The sign-in link is no longer valid. Please try again.",
  OAuthSignin: "Error constructing the OAuth sign-in URL. Double-check your provider settings.",
  OAuthCallback: "OAuth callback failed. The provider did not return the expected information.",
  OAuthCreateAccount: "Could not create an OAuth account.  The email may already be in use.",
  OAuthAccountNotLinked: "This account is associated with a different sign-in method.  Please use the original method.",
  EmailCreateAccount: "Could not create email account.  The email may already be in use.",
  EmailSignin: "Error sending the e-mail.  Check the provider configuration.",
  CredentialsSignin: "Sign-in failed.  Check the details you provided are correct.",
  SessionRequired: "Please sign in to continue.",
  Default: "An unexpected error occurred.  Please try again later.",
  Unknown: "An unknown error occurred.  Please try again later.",
}

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  const errorCode = error || "Unknown"
  const errorMessage = errorMessages[errorCode] ?? errorMessages.Unknown

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-red-600">Authentication Error</CardTitle>
          <CardDescription>There was a problem signing you in</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>

          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link href="/auth/signin">Try Again</Link>
            </Button>

            <Button variant="outline" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
