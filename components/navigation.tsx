"use client"

import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  FileText, 
  Sparkles, 
  Image as ImageIcon, 
  FileSymlink,
  Home,
  User,
  LogOut
} from "lucide-react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import Image from "next/image"

export default function Navigation() {
  const { data: session } = useSession()
  const router = useRouter()

  const tools = [
    {
      icon: <FileText className="h-5 w-5" />,
      title: "PDF Summarizer",
      description: "AI-powered PDF summaries and chat",
      href: "/pdf-summarizer",
      color: "text-blue-600"
    },
    {
      icon: <Sparkles className="h-5 w-5" />,
      title: "Text Humanizer",
      description: "Convert AI text to human-like writing",
      href: "/text-humanizer",
      color: "text-purple-600"
    },
    {
      icon: <ImageIcon className="h-5 w-5" />,
      title: "Text Extractor",
      description: "Extract text from images and documents",
      href: "/text-extractor",
      color: "text-green-600"
    },
    {
      icon: <FileSymlink className="h-5 w-5" />,
      title: "Document Converter",
      description: "Convert between document formats",
      href: "/document-converter",
      color: "text-gray-600"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 dark:from-[#18181b] dark:to-[#23232a] dark:text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#18181b]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <Image src="/Agora.jpeg" alt="AgoraAI Logo" width={40} height={40} className="rounded-xl" />
          <span className="font-bold text-xl tracking-tight">AgoraAI</span>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Button>
          
          {session?.user && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {session.user.name || session.user.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut()}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">AI Tools</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Choose a tool to get started
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {tools.map((tool) => (
            <Card
              key={tool.href}
              className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
              onClick={() => router.push(tool.href)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`${tool.color} group-hover:scale-110 transition-transform duration-200`}>
                    {tool.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                      {tool.description}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full group-hover:bg-blue-600 group-hover:text-white transition-colors"
                    >
                      Open Tool
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-2">Need Help?</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                Each tool is designed to be intuitive and user-friendly. Simply upload your files or input your text to get started.
              </p>
              <Button
                variant="outline"
                onClick={() => router.push('/tools')}
              >
                View All Tools
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

