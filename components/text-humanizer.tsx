"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, RotateCcw, Sparkles, Eye, EyeOff, Bot, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const MODEL_OPTIONS = [
  { 
    value: "semantic", 
    label: "Semantic Enhanced", 
    description: "Advanced semantic analysis with context awareness",
    color: "bg-green-100 text-green-800"
  },
  { 
    value: "regex", 
    label: "Basic Rules", 
    description: "Simple rule-based transformation",
    color: "bg-yellow-100 text-yellow-800"
  },
  { 
    value: "gemini", 
    label: "Advanced", 
    description: "Advanced text restructuring and natural language generation",
    color: "bg-purple-100 text-purple-800"
  },
]

export default function TextHumanizer() {
  // AI Detection State
  const [aiDetectionText, setAiDetectionText] = useState("")
  const [aiDetectionResult, setAiDetectionResult] = useState<any>(null)
  const [isAiDetecting, setIsAiDetecting] = useState(false)

  // Text Humanization State
  const [originalText, setOriginalText] = useState("")
  const [humanizedText, setHumanizedText] = useState("")
  const [selectedModel, setSelectedModel] = useState("semantic")
  const [isLoading, setIsLoading] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [processingTime, setProcessingTime] = useState<number | null>(null)
  const [aiDetection, setAiDetection] = useState<any>(null)
  
  const { toast } = useToast()

  // AI Detection Handler
  const handleAiDetection = async () => {
    if (!aiDetectionText.trim()) {
      toast({
        title: "No text to analyze",
        description: "Please enter some text to detect AI content.",
        variant: "destructive",
      })
      return
    }

    // Check usage limit before processing
    try {
      const usageResponse = await fetch('/api/usage?feature=text_humanizer');
      if (usageResponse.ok) {
        const usageData = await usageResponse.json();
        if (!usageData.allowed) {
          toast({
            title: "Usage limit reached",
            description: `You've reached your text humanizer limit for this month. Upgrade to Pro for more usage.`,
            variant: "destructive",
          });
          return;
        }
      }
    } catch (error) {
      console.error('Error checking usage:', error);
    }

    setIsAiDetecting(true)
    
    try {
      const response = await fetch("http://localhost:8000/text-humanizer/detect-ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: aiDetectionText,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to detect AI content")
      }

      const data = await response.json()
      setAiDetectionResult(data)

      // Increment usage after successful processing
      try {
        await fetch('/api/usage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ feature: 'text_humanizer', amount: aiDetectionText.length })
        });
      } catch (error) {
        console.error('Error incrementing usage:', error);
      }
      
      toast({
        title: "Analysis Complete! 🔍",
        description: data.is_ai_generated ? "Generated content detected" : "Natural content detected",
        variant: "default",
      })
    } catch (error) {
      console.error("Error detecting AI content:", error)
      toast({
        title: "Detection failed",
        description: "Please check if the backend server is running on port 8000.",
        variant: "destructive",
      })
    } finally {
      setIsAiDetecting(false)
    }
  }

  // Text Humanization Handler
  const handleHumanize = async () => {
    if (!originalText.trim()) {
      toast({
        title: "No text to rephrase",
        description: "Please enter some text to rephrase.",
        variant: "destructive",
      })
      return
    }

    // Check usage limit before processing
    try {
      const usageResponse = await fetch('/api/usage?feature=text_humanizer');
      if (usageResponse.ok) {
        const usageData = await usageResponse.json();
        if (!usageData.allowed) {
          toast({
            title: "Usage limit reached",
            description: `You've reached your text humanizer limit for this month. Upgrade to Pro for more usage.`,
            variant: "destructive",
          });
          return;
        }
      }
    } catch (error) {
      console.error('Error checking usage:', error);
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
          model: selectedModel,
          tone: "neutral",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to humanize text")
      }

      const data = await response.json()
      console.log('API Response:', data)
      console.log('Humanized text:', data.humanized_text)
      console.log('Original text:', originalText)
      console.log('Same text?', data.humanized_text === originalText)
      setHumanizedText(data.humanized_text)
      setShowComparison(true)
      setProcessingTime(data.processing_time || (Date.now() - startTime) / 1000)
      setAiDetection(data.ai_detection)

      // Increment usage after successful processing
      try {
        await fetch('/api/usage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ feature: 'text_humanizer', amount: originalText.length })
        });
      } catch (error) {
        console.error('Error incrementing usage:', error);
      }
      
      const modelInfo = MODEL_OPTIONS.find(m => m.value === selectedModel)
      toast({
        title: "Text rephrased! ✨",
        description: `Rephrased using ${modelInfo?.label} in ${processingTime?.toFixed(2)}s`,
        variant: "default",
      })
    } catch (error) {
      console.error("Error humanizing text:", error)
      toast({
        title: "Rephrasing failed",
        description: "Please check if the backend server is running on port 8000.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = (type: "ai" | "humanize") => {
    if (type === "ai") {
      setAiDetectionText("")
      setAiDetectionResult(null)
    } else {
    setOriginalText("")
    setHumanizedText("")
    setShowComparison(false)
    setProcessingTime(null)
      setAiDetection(null)
    }
    toast({
      title: "Cleared",
      description: "All text has been cleared.",
      variant: "default",
    })
  }

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${type} text copied to clipboard.`,
      variant: "default",
    })
  }

  const handleModelChange = (model: string) => {
    setSelectedModel(model)
    if (humanizedText) {
      setOriginalText(originalText)
      setHumanizedText("")
      setShowComparison(false)
      setProcessingTime(null)
    }
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>, type: "ai" | "humanize") => {
    if (type === "ai") {
      setAiDetectionText(e.target.value)
    } else {
    setOriginalText(e.target.value)
    }
    // Auto-resize the textarea
    const textarea = e.target
    textarea.style.height = 'auto'
    textarea.style.height = Math.max(400, textarea.scrollHeight) + 'px'
  }

  const getWordLevelHighlights = (originalText: string, humanizedText: string) => {
    if (!showComparison || !originalText || !humanizedText) return humanizedText
    const originalWords = originalText.split(/\s+/)
    const humanizedWords = humanizedText.split(/\s+/)
    const changedWords = new Map()
    for (let i = 0; i < Math.max(originalWords.length, humanizedWords.length); i++) {
      const originalWord = originalWords[i] || ''
      const humanizedWord = humanizedWords[i] || ''
      const cleanOriginal = originalWord.replace(/[^\w]/g, '').toLowerCase()
      const cleanHumanized = humanizedWord.replace(/[^\w]/g, '').toLowerCase()
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
    const tokens = humanizedText.split(/(\s+)/)
    return tokens.map((token, index) => {
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
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-xl font-semibold mb-2">
          Text Tools
        </h1>
        <p className="text-sm text-gray-600">Detect content and humanize text</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="ai-detection" className="w-full h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="ai-detection" className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            Detection
          </TabsTrigger>
          <TabsTrigger value="text-humanizer" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Humanizer
          </TabsTrigger>
        </TabsList>

        {/* AI Detection Tab */}
        <TabsContent value="ai-detection" className="flex-1 flex flex-col">
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
            {/* Input Text */}
            <Card className="flex flex-col border-2 border-gray-200">
              <CardHeader className="flex-shrink-0 pb-2">
                <CardTitle className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">Text to Analyze</span>
                  {aiDetectionText && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(aiDetectionText, "analysis")}
                      className="h-5 w-5 p-0"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-3 pt-0 min-h-0">
                <Textarea
                  value={aiDetectionText}
                  onChange={(e) => handleTextChange(e, "ai")}
                  placeholder="Paste text to analyze..."
                  className="h-full min-h-[400px] resize-none border-0 focus-visible:ring-0 text-gray-700 bg-gray-50 text-sm leading-relaxed"
                  style={{ minHeight: '400px', height: 'auto' }}
                />
              </CardContent>
            </Card>

            {/* AI Detection Results */}
            <Card className="flex flex-col border-2 border-blue-200 bg-blue-50">
              <CardHeader className="flex-shrink-0 pb-2">
                <CardTitle className="flex items-center justify-between text-sm">
                  <span className="text-blue-700">AI Detection Results</span>
                  {aiDetectionResult && (
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        aiDetectionResult.is_ai_generated 
                          ? "border-red-300 text-red-700 bg-red-100" 
                          : "border-green-300 text-green-700 bg-green-100"
                      }`}
                    >
                      {aiDetectionResult.is_ai_generated ? "🤖 AI-Generated" : "👤 Human-like"}
            </Badge>
          )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-3 pt-0 min-h-0">
                {aiDetectionResult ? (
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="font-medium mb-2">Analysis:</p>
                      <p className="text-gray-600">{aiDetectionResult.analysis}</p>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-2">Confidence Score</p>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              aiDetectionResult.confidence > 0.7 ? 'bg-red-500' : 
                              aiDetectionResult.confidence > 0.4 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${aiDetectionResult.confidence * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{(aiDetectionResult.confidence * 100).toFixed(1)}%</p>
                      </div>
                      
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-2">Individual Scores</p>
                                <div className="space-y-1 max-h-32 overflow-y-auto">
          {Object.entries(aiDetectionResult.scores).map(([key, value]) => (
            <div key={key} className="flex justify-between text-xs">
              <span className="capitalize">{key.replace('_', ' ')}:</span>
              <span className="font-medium">
                {key === 'ai_probability' || key === 'human_probability' 
                  ? `${((value as number) * 100).toFixed(1)}%`
                  : `${((value as number) * 100).toFixed(0)}%`
                }
              </span>
            </div>
          ))}
        </div>
      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <Bot className="w-6 h-6 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">AI detection results will appear here</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* AI Detection Actions */}
          <div className="mt-4 flex justify-center">
            <div className="flex gap-2">
              <Button
                onClick={handleAiDetection}
                disabled={isAiDetecting || !aiDetectionText.trim()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                size="sm"
              >
                {isAiDetecting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Analyzing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4" />
                    Detect AI
                  </div>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleClear("ai")}
                disabled={!aiDetectionText && !aiDetectionResult}
                size="sm"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Text Humanizer Tab */}
        <TabsContent value="text-humanizer" className="flex-1 flex flex-col">
      {/* Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
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
                    onClick={() => handleClear("humanize")}
                disabled={!originalText && !humanizedText}
                size="sm"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

          {/* Text Areas */}
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
                  onChange={(e) => handleTextChange(e, "humanize")}
              placeholder="Paste your AI-generated text here..."
              className="h-full min-h-[400px] resize-none border-0 focus-visible:ring-0 text-gray-700 bg-gray-50 text-sm leading-relaxed"
              style={{ minHeight: '400px', height: 'auto' }}
            />
          </CardContent>
        </Card>

            {/* Humanized Text */}
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

          {/* AI Detection Panel for Humanizer */}
          {aiDetection && (
            <Card className="mt-4 border-2 border-blue-200 bg-blue-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <span className="text-blue-700">AI Content Analysis</span>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      aiDetection.is_ai_generated 
                        ? "border-red-300 text-red-700 bg-red-100" 
                        : "border-green-300 text-green-700 bg-green-100"
                    }`}
                  >
                    {aiDetection.is_ai_generated ? "🤖 AI-Generated" : "👤 Human-like"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="text-sm text-gray-700">
                    <p className="font-medium mb-2">Analysis:</p>
                    <p className="text-gray-600">{aiDetection.analysis}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-600">Confidence Score</p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            aiDetection.confidence > 0.7 ? 'bg-red-500' : 
                            aiDetection.confidence > 0.4 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${aiDetection.confidence * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500">{(aiDetection.confidence * 100).toFixed(1)}%</p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-600">Individual Scores</p>
                              <div className="space-y-1 max-h-32 overflow-y-auto">
          {Object.entries(aiDetection.scores).map(([key, value]) => (
            <div key={key} className="flex justify-between text-xs">
              <span className="capitalize">{key.replace('_', ' ')}:</span>
              <span className="font-medium">
                {key === 'ai_probability' || key === 'human_probability' 
                  ? `${((value as number) * 100).toFixed(1)}%`
                  : `${((value as number) * 100).toFixed(0)}%`
                }
              </span>
            </div>
          ))}
        </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comparison Toggle */}
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
