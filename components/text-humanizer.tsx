"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Copy, RotateCcw, Sparkles, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const TONE_OPTIONS = [
  { value: "casual", label: "Casual", color: "bg-blue-100 text-blue-800" },
  { value: "friendly", label: "Friendly", color: "bg-green-100 text-green-800" },
  { value: "professional", label: "Professional", color: "bg-purple-100 text-purple-800" },
  { value: "enthusiastic", label: "Enthusiastic", color: "bg-orange-100 text-orange-800" },
  { value: "neutral", label: "Neutral", color: "bg-gray-100 text-gray-800" },
]

const TONE_EXAMPLES = {
  casual: "Hey! I'm heading to the store to grab some groceries. Won't be back until later.",
  friendly: "Hi there! I'm going to the store to pick up some groceries. I'll see you later!",
  professional: "I am going to the store to purchase some groceries. I will not be able to return until later.",
  enthusiastic: "I'm super excited to head to the store and grab some awesome groceries! Can't wait to see you later!",
  neutral: "I'm going to the store to get some groceries. I won't be back until later."
}

export default function TextHumanizer() {
  const [originalText, setOriginalText] = useState("")
  const [humanizedText, setHumanizedText] = useState("")
  const [selectedTone, setSelectedTone] = useState("casual")
  const [isLoading, setIsLoading] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const { toast } = useToast()

  const handleHumanize = async () => {
    if (!originalText.trim()) {
      toast({
        title: "No text to humanize",
        description: "Please enter some text to humanize.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("http://localhost:8000/humanize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: originalText,
          tone: selectedTone,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to humanize text")
      }

      const data = await response.json()
      setHumanizedText(data.humanized_text)
      setShowComparison(true)
      
      toast({
        title: "Text humanized! ✨",
        description: `Successfully applied ${selectedTone} tone to your text.`,
        variant: "default",
      })
    } catch (error) {
      console.error("Error humanizing text:", error)
      toast({
        title: "Humanization failed",
        description: "Please check if the backend server is running on port 8000.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setOriginalText("")
    setHumanizedText("")
    setShowComparison(false)
    toast({
      title: "Cleared",
      description: "All text has been cleared.",
      variant: "default",
    })
  }

  const handleCopy = (text: string, type: "original" | "humanized") => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${type === "original" ? "Original" : "Humanized"} text copied to clipboard.`,
      variant: "default",
    })
  }

  const handleToneChange = (tone: string) => {
    setSelectedTone(tone)
    if (humanizedText) {
      // Re-humanize with new tone if we have text
      setOriginalText(originalText)
      setHumanizedText("")
      setShowComparison(false)
    }
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setOriginalText(e.target.value)
    // Auto-resize the textarea
    const textarea = e.target
    textarea.style.height = 'auto'
    textarea.style.height = Math.max(400, textarea.scrollHeight) + 'px'
  }

  const getHighlightedText = (text: string, isHumanized: boolean) => {
    if (!text || !showComparison) return text

    // Split into sentences for better highlighting
    const sentences = text.split(/(?<=[.!?])\s+/)
    
    return sentences.map((sentence, index) => {
      // Add subtle highlighting for humanized text
      if (isHumanized) {
        return (
          <span
            key={index}
            className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-2 border-orange-200 pl-2 py-1 rounded-r-md"
          >
            {sentence}
          </span>
        )
      }
      return <span key={index}>{sentence}</span>
    })
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Minimal Header */}
      <div className="text-center mb-3">
        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Text Humanizer
        </h1>
      </div>

      {/* Compact Controls */}
      <div className="flex items-center justify-between mb-3 p-3 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center gap-3">
          <Badge className={TONE_OPTIONS.find(t => t.value === selectedTone)?.color}>
            {TONE_OPTIONS.find(t => t.value === selectedTone)?.label}
          </Badge>
          <Select value={selectedTone} onValueChange={handleToneChange}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Select tone" />
            </SelectTrigger>
            <SelectContent>
              {TONE_OPTIONS.map((tone) => (
                <SelectItem key={tone.value} value={tone.value}>
                  {tone.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleHumanize}
            disabled={isLoading || !originalText.trim()}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            size="sm"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Humanizing...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Humanize
              </div>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={handleClear}
            disabled={!originalText && !humanizedText}
            size="sm"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Massive Text Areas - Using All Available Space */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
        {/* Original Text */}
        <Card className="flex flex-col border border-gray-200">
          <CardHeader className="flex-shrink-0 pb-2">
            <CardTitle className="flex items-center justify-between text-sm">
              <span className="text-gray-700">Original Text</span>
              {originalText && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(originalText, "original")}
                  className="h-5 w-5 p-0"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-3 pt-0 min-h-0">
            <Textarea
              value={originalText}
              onChange={handleTextChange}
              placeholder="Paste your AI-generated text here..."
              className="h-full min-h-[400px] resize-none border-0 focus-visible:ring-0 text-gray-700 bg-gray-50 text-sm leading-relaxed"
              style={{ minHeight: '400px', height: 'auto' }}
            />
          </CardContent>
        </Card>

        {/* Humanized Text */}
        <Card className={`flex flex-col border transition-all duration-300 ${
          showComparison 
            ? "border-orange-300 bg-gradient-to-br from-orange-50 to-yellow-50" 
            : "border-gray-200"
        }`}>
          <CardHeader className="flex-shrink-0 pb-2">
            <CardTitle className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-orange-700">Humanized Text</span>
                {showComparison && (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Enhanced
                  </Badge>
                )}
              </div>
              {humanizedText && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(humanizedText, "humanized")}
                  className="h-5 w-5 p-0"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-3 pt-0 min-h-0">
            <div className="min-h-[400px] p-3 rounded-lg bg-white border border-orange-200 overflow-y-auto">
              {humanizedText ? (
                <div className="space-y-2 text-gray-800 leading-relaxed text-sm">
                  {getHighlightedText(humanizedText, true)}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <Sparkles className="w-6 h-6 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Humanized text will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Minimal Comparison Toggle */}
      {humanizedText && (
        <div className="mt-3 flex items-center justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowComparison(!showComparison)}
            className="border-orange-300 text-orange-700 hover:bg-orange-100"
          >
            {showComparison ? (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                Hide Highlights
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Show Highlights
              </>
            )}
          </Button>
        </div>
      )}

      {/* Compact Tone Examples - Only show when no text */}
      {!originalText && !humanizedText && (
        <div className="mt-3">
          <div className="text-center mb-2">
            <h3 className="text-sm font-medium">Tone Examples</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {TONE_OPTIONS.map((tone) => (
              <div
                key={tone.value}
                className="p-2 rounded border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedTone(tone.value)
                  setOriginalText("I am going to the store to purchase some groceries. Furthermore, I will not be able to return until later.")
                }}
              >
                <Badge className={`${tone.color} mb-1 text-xs`}>
                  {tone.label}
                </Badge>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {TONE_EXAMPLES[tone.value as keyof typeof TONE_EXAMPLES]}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
