"use client"

import type React from "react"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4" />
            <p className="text-gray-600">Loading...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Sparkles className="h-8 w-8 text-blue-600 mb-4" />
            <p className="text-gray-600">Redirecting to sign in...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
