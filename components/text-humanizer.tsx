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
  { value: "casual", label: "Casual", color: "bg-blue-100 text-blue-800", description: "Relaxed and informal" },
  { value: "friendly", label: "Friendly", color: "bg-green-100 text-green-800", description: "Warm and approachable" },
  { value: "professional", label: "Professional", color: "bg-purple-100 text-purple-800", description: "Formal and business-like" },
  { value: "enthusiastic", label: "Enthusiastic", color: "bg-orange-100 text-orange-800", description: "Energetic and excited" },
  { value: "neutral", label: "Neutral", color: "bg-gray-100 text-gray-800", description: "Balanced and moderate" },
]

const MODEL_OPTIONS = [
  { 
    value: "regex", 
    label: "Regex-based", 
    description: "Fast, rule-based transformation",
    color: "bg-yellow-100 text-yellow-800"
  },
  { 
    value: "huggingface", 
    label: "T5 AI Model", 
    description: "Advanced AI paraphrasing model",
    color: "bg-purple-100 text-purple-800"
  },
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
  const [selectedModel, setSelectedModel] = useState("regex")
  const [isLoading, setIsLoading] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [processingTime, setProcessingTime] = useState<number | null>(null)
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
    setProcessingTime(null)
    const startTime = Date.now()
    
    try {
      const response = await fetch("http://localhost:8000/text-humanizer/humanize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: originalText,
          tone: selectedTone,
          model: selectedModel,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to humanize text")
      }

      const data = await response.json()
      setHumanizedText(data.humanized_text)
      setShowComparison(true)
      setProcessingTime(data.processing_time || (Date.now() - startTime) / 1000)
      
      const modelInfo = MODEL_OPTIONS.find(m => m.value === selectedModel)
      const toneInfo = TONE_OPTIONS.find(t => t.value === selectedTone)
      
      toast({
        title: "Text humanized! ✨",
        description: `Applied ${toneInfo?.label} tone using ${modelInfo?.label} in ${processingTime?.toFixed(2)}s`,
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
    setProcessingTime(null)
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
      setProcessingTime(null)
    }
  }

  const handleModelChange = (model: string) => {
    setSelectedModel(model)
    if (humanizedText) {
      // Re-humanize with new model if we have text
      setOriginalText(originalText)
      setHumanizedText("")
      setShowComparison(false)
      setProcessingTime(null)
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

  const getWordLevelHighlights = (originalText: string, humanizedText: string) => {
    if (!showComparison || !originalText || !humanizedText) return humanizedText

    // Split both texts into words while preserving spacing and punctuation
    const originalWords = originalText.split(/\s+/)
    const humanizedWords = humanizedText.split(/\s+/)
    
    // Create a mapping of changed words with their original counterparts
    const changedWords = new Map()
    
    // Compare words and mark changes
    for (let i = 0; i < Math.max(originalWords.length, humanizedWords.length); i++) {
      const originalWord = originalWords[i] || ''
      const humanizedWord = humanizedWords[i] || ''
      
      // Clean words for comparison (remove punctuation and normalize)
      const cleanOriginal = originalWord.replace(/[^\w]/g, '').toLowerCase()
      const cleanHumanized = humanizedWord.replace(/[^\w]/g, '').toLowerCase()
      
      // Check for contractions and their expanded forms
      const contractionMap: Record<string, string> = {
        "i'm": "i am", "you're": "you are", "it's": "it is", "that's": "that is",
        "we're": "we are", "they're": "they are", "can't": "cannot", "won't": "will not",
        "don't": "do not", "doesn't": "does not", "isn't": "is not", "aren't": "are not",
        "wasn't": "was not", "weren't": "were not", "haven't": "have not", "hasn't": "has not",
        "hadn't": "had not", "wouldn't": "would not", "couldn't": "could not", "shouldn't": "should not"
      }
      
      const normalizedOriginal = contractionMap[cleanOriginal] || cleanOriginal
      const normalizedHumanized = contractionMap[cleanHumanized] || cleanHumanized
      
      if (normalizedOriginal !== normalizedHumanized && cleanHumanized) {
        changedWords.set(cleanHumanized, originalWord)
      }
    }
    
    // Split humanized text more carefully to preserve spacing
    const tokens = humanizedText.split(/(\s+)/)
    return tokens.map((token, index) => {
      // Check if this token is a word (not just whitespace)
      const cleanToken = token.replace(/[^\w]/g, '').toLowerCase()
      const isChanged = changedWords.has(cleanToken)
      const originalWord = changedWords.get(cleanToken)
      
      if (isChanged && cleanToken) {
        return (
          <span
            key={index}
            className="bg-blue-200 text-blue-900 px-1 rounded font-medium hover:bg-blue-300 transition-colors"
            title={`Changed from: "${originalWord}"`}
          >
            {token}
          </span>
        )
      }
      return <span key={index}>{token}</span>
    })
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Enhanced Header with Model Info */}
      <div className="text-center mb-4">
        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
          Text Humanizer
        </h1>
        <div className="flex items-center justify-center gap-4 text-sm">
          <Badge className={MODEL_OPTIONS.find(m => m.value === selectedModel)?.color}>
            {MODEL_OPTIONS.find(m => m.value === selectedModel)?.label}
          </Badge>
          {processingTime && (
            <Badge variant="outline" className="text-xs">
              {processingTime.toFixed(2)}s
            </Badge>
          )}
        </div>
      </div>

      {/* Enhanced Controls with Better Visibility */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Model Selection */}
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              AI Model
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Select value={selectedModel} onValueChange={handleModelChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {MODEL_OPTIONS.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{model.label}</span>
                      <span className="text-xs text-gray-500">{model.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Tone Selection */}
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              Tone Style
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Select value={selectedTone} onValueChange={handleToneChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                {TONE_OPTIONS.map((tone) => (
                  <SelectItem key={tone.value} value={tone.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{tone.label}</span>
                      <span className="text-xs text-gray-500">{tone.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex gap-2">
              <Button
                onClick={handleHumanize}
                disabled={isLoading || !originalText.trim()}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                size="sm"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
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
          </CardContent>
        </Card>
      </div>

      {/* Text Areas with Enhanced Visual Feedback */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
        {/* Original Text */}
        <Card className="flex flex-col border-2 border-gray-200">
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

        {/* Humanized Text with Enhanced Visual Feedback */}
        <Card className={`flex flex-col border-2 transition-all duration-300 ${
          showComparison 
            ? "border-orange-300 bg-gradient-to-br from-orange-50 to-yellow-50" 
            : "border-gray-200"
        }`}>
          <CardHeader className="flex-shrink-0 pb-2">
            <CardTitle className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-orange-700">Humanized Text</span>
                {showComparison && (
                  <div className="flex gap-1">
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Enhanced
                    </Badge>
                                         <Badge variant="outline" className="text-xs">
                       {TONE_OPTIONS.find(t => t.value === selectedTone)?.label}
                     </Badge>
                  </div>
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
                  {getWordLevelHighlights(originalText, humanizedText)}
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

      {/* Enhanced Comparison Toggle */}
      {humanizedText && (
        <div className="mt-4 flex items-center justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowComparison(!showComparison)}
            className="border-orange-300 text-orange-700 hover:bg-orange-100"
          >
            {showComparison ? (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                Hide Changes
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Show Changes
              </>
            )}
          </Button>
        </div>
      )}

      {/* Enhanced Tone Examples with Better Visual Impact */}
      {!originalText && !humanizedText && (
        <div className="mt-4">
          <div className="text-center mb-3">
            <h3 className="text-sm font-medium text-gray-700">Try Different Tones</h3>
            <p className="text-xs text-gray-500">Click any example to see how tones affect the text</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {TONE_OPTIONS.map((tone) => (
              <div
                key={tone.value}
                className="p-3 rounded-lg border-2 border-gray-200 bg-white hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => {
                  setSelectedTone(tone.value)
                  setOriginalText("I am going to the store to purchase some groceries. Furthermore, I will not be able to return until later.")
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={`${tone.color} text-xs`}>
                    {tone.label}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed group-hover:text-gray-800">
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
