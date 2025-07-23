"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sparkles, UserCircle2, Mail, CalendarDays } from "lucide-react"
import AuthGuard from "@/components/auth/auth-guard"

export default function DashboardPage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!session?.user) {
    return null // AuthGuard will redirect
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
        <div className="container mx-auto px-4">
          <Card className="w-full max-w-3xl mx-auto">
            <CardHeader className="text-center">
              <div className="flex flex-col items-center justify-center mb-4">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                  <AvatarFallback className="text-4xl">{getInitials(session.user.name || "User")}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-3xl font-bold text-gray-900">{session.user.name}</CardTitle>
                <CardDescription className="text-lg text-gray-600">Your AI Tools Dashboard</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <UserCircle2 className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Internal User ID</p>
                    <p className="font-medium text-gray-800 break-all">{session.userId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <Mail className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-800">{session.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <Sparkles className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">AI Interactions</p>
                    <p className="font-medium text-gray-800">Coming Soon (History)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <CalendarDays className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="font-medium text-gray-800">
                      {session.user.email ? new Date().toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center text-gray-600 text-sm mt-8">
                <p>
                  This is your personal dashboard. More features like interaction history and settings will be added
                  here.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  )
}
