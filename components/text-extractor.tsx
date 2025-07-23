"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { FileText, AlertCircle, CheckCircle2 } from "lucide-react"
import FileUpload from "@/components/file-upload"

interface ExtractResponse {
  text: string
  filename: string
}

export default function TextExtractor() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [extractedText, setExtractedText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file)
    setExtractedText("")
    setError("")
    setSuccess(false)
  }, [])

  const handleExtract = async () => {
    if (!selectedFile) {
      setError("Please select a file first")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess(false)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      // Replace with your actual FastAPI backend URL
      const response = await fetch("http://localhost:8000/extract/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ExtractResponse = await response.json()
      setExtractedText(data.text)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to extract text")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setSelectedFile(null)
    setExtractedText("")
    setError("")
    setSuccess(false)
  }

  return (
    <div className="space-y-6">
      {/* File Upload Section */}
      <div className="space-y-4">
        <FileUpload
          onFileSelect={handleFileSelect}
          selectedFile={selectedFile}
          acceptedTypes={[".pdf", ".docx", ".png", ".jpg", ".jpeg"]}
          maxSize={10} // 10MB
        />

        <div className="flex gap-3">
          <Button onClick={handleExtract} disabled={!selectedFile || isLoading} className="flex-1">
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Extracting...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Extract Text
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
          <p className="text-sm text-gray-600 text-center">Processing your file...</p>
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
          <AlertDescription className="text-green-800">Text extracted successfully!</AlertDescription>
        </Alert>
      )}

      {/* Extracted Text Display */}
      {extractedText && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Extracted Text</label>
            <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(extractedText)}>
              Copy Text
            </Button>
          </div>
          <Textarea
            value={extractedText}
            readOnly
            className="min-h-[200px] font-mono text-sm"
            placeholder="Extracted text will appear here..."
          />
        </div>
      )}
    </div>
  )
}
