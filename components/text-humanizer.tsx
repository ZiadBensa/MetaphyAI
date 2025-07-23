"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Sparkles, Copy, AlertCircle, CheckCircle2 } from "lucide-react"

interface HumanizeResponse {
  humanized_text: string
  tone: string
}

const TONE_OPTIONS = [
  { value: "neutral", label: "Neutral", description: "Balanced and professional" },
  { value: "casual", label: "Casual", description: "Relaxed and conversational" },
  { value: "friendly", label: "Friendly", description: "Warm and approachable" },
  { value: "professional", label: "Professional", description: "Formal and business-like" },
  { value: "enthusiastic", label: "Enthusiastic", description: "Energetic and positive" },
]

export default function TextHumanizer() {
  const [inputText, setInputText] = useState("")
  const [selectedTone, setSelectedTone] = useState("")
  const [humanizedText, setHumanizedText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleHumanize = async () => {
    if (!inputText.trim()) {
      setError("Please enter some text to humanize")
      return
    }

    if (!selectedTone) {
      setError("Please select a tone")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess(false)

    try {
      // Replace with your actual FastAPI backend URL
      const response = await fetch("http://localhost:8000/humanize/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: inputText,
          tone: selectedTone,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: HumanizeResponse = await response.json()
      setHumanizedText(data.humanized_text)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to humanize text")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setInputText("")
    setHumanizedText("")
    setSelectedTone("")
    setError("")
    setSuccess(false)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">AI-Generated Text</label>
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your AI-generated text here..."
            className="min-h-[150px]"
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500">{inputText.length} characters</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Select Tone</label>
          <Select value={selectedTone} onValueChange={setSelectedTone} disabled={isLoading}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a tone for humanization" />
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
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleHumanize}
            disabled={!inputText.trim() || !selectedTone || isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Humanizing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Humanize Text
              </>
            )}
          </Button>

          <Button variant="outline" onClick={handleClear} disabled={isLoading}>
            Clear
          </Button>
        </div>
      </div>

      {/* Loading Progress */}
      {isLoading && (
        <div className="space-y-2">
          <Progress value={undefined} className="w-full" />
          <p className="text-sm text-gray-600 text-center">Humanizing your text...</p>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Text humanized successfully with {selectedTone} tone!
          </AlertDescription>
        </Alert>
      )}

      {/* Humanized Text Display */}
      {humanizedText && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Humanized Text</label>
            <Button variant="outline" size="sm" onClick={() => copyToClipboard(humanizedText)}>
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </Button>
          </div>
          <Textarea
            value={humanizedText}
            readOnly
            className="min-h-[150px] bg-green-50 border-green-200"
            placeholder="Humanized text will appear here..."
          />
        </div>
      )}
    </div>
  )
}
