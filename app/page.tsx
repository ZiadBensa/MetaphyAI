"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Sparkles, LayoutDashboard } from "lucide-react" // Added LayoutDashboard icon
import { useSession } from "next-auth/react"
import TextExtractor from "@/components/text-extractor"
import TextHumanizer from "@/components/text-humanizer"
import AuthGuard from "@/components/auth/auth-guard"
import UserMenu from "@/components/auth/user-menu"
import Link from "next/link" // Added Link

export default function Home() {
  const [activeTab, setActiveTab] = useState("extractor")
  const { data: session } = useSession()

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">AI Text Tools</h1>
                  <p className="text-sm text-gray-600">Extract and humanize text with AI</p>
                </div>
              </div>

              {/* User Menu and Dashboard Link */}
              <div className="flex items-center gap-4">
                {session?.user && (
                  <>
                    <Link
                      href="/dashboard"
                      className="hidden sm:flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <div className="hidden sm:block text-sm text-gray-600">
                      Welcome, {session.user.name?.split(" ")[0]}!
                    </div>
                  </>
                )}
                <UserMenu />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="extractor" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Text Extractor
              </TabsTrigger>
              <TabsTrigger value="humanizer" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Text Humanizer
              </TabsTrigger>
            </TabsList>

            <TabsContent value="extractor">
              <Card>
                <CardHeader>
                  <CardTitle>Extract Text from Files</CardTitle>
                  <CardDescription>Upload PDF, DOCX, or image files to extract text content</CardDescription>
                </CardHeader>
                <CardContent>
                  <TextExtractor />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="humanizer">
              <Card>
                <CardHeader>
                  <CardTitle>Humanize AI Text</CardTitle>
                  <CardDescription>Transform AI-generated text to sound more natural and human-like</CardDescription>
                </CardHeader>
                <CardContent>
                  <TextHumanizer />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>

        {/* Footer */}
        <footer className="border-t bg-white/50 mt-16">
          <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-600">
            <p>Built with React, TypeScript, and FastAPI</p>
          </div>
        </footer>
      </div>
    </AuthGuard>
  )
}
