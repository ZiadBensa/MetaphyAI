"use client"

import { useState } from "react"
import { FileText, Image as ImageIcon, Sparkles, FileSymlink, Menu, X, Download, Trash, UploadCloud, Upload, Send, Loader2, Wand2 } from "lucide-react"
import AuthGuard from "@/components/auth/auth-guard"
import TextExtractor from "@/components/text-extractor"
import TextHumanizer from "@/components/text-humanizer"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { useSession } from "next-auth/react"
import UserMenu from "@/components/auth/user-menu"
import React from "react"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

// AdvancedOptionsPanel component
function AdvancedOptionsPanel({ children, label = "Advanced Options" }: { children: React.ReactNode; label?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mb-6">
      <button
        type="button"
        className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <svg className={`w-4 h-4 transition-transform ${open ? "rotate-90" : "rotate-0"}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        {label}
      </button>
      {open && (
        <div className="mt-3 p-4 bg-slate-50 dark:bg-[#23232a] rounded border border-slate-200 dark:border-slate-700">
          {children}
        </div>
      )}
    </div>
  )
}

// ResultsHistoryPanel component
function ResultsHistoryPanel({ history, onCopy, onClear, onClearAll }: {
  history: Array<{ id: number; label: string; date: string; snippet: string; fullText: string }>,
  onCopy: (text: string) => void,
  onClear: (id: number) => void,
  onClearAll: () => void
}) {
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold">History</span>
        {history.length > 0 && (
          <Button size="sm" variant="ghost" onClick={onClearAll}>Clear All</Button>
        )}
      </div>
      <div className="max-h-48 overflow-y-auto space-y-2">
        {history.length === 0 && <div className="text-gray-400 text-sm">No history yet.</div>}
        {history.map(item => (
          <div key={item.id} className="flex items-center justify-between bg-slate-50 dark:bg-[#23232a] rounded px-3 py-2 border border-slate-200 dark:border-slate-700">
            <div>
              <div className="font-medium text-sm">{item.label}</div>
              <div className="text-xs text-gray-500">{item.date}</div>
              <div className="text-xs text-gray-700 dark:text-gray-300 mt-1 truncate max-w-xs">{item.snippet}</div>
            </div>
            <div className="flex flex-col gap-1 ml-4">
              <Button size="sm" variant="outline" onClick={() => onCopy(item.fullText)}>Copy</Button>
              <Button size="sm" variant="ghost" onClick={() => onClear(item.id)}>Clear</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Placeholder components for tools not yet implemented
function PdfSummarizer({ droppedFileName, autoProcess }: { droppedFileName?: string, autoProcess?: boolean }) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [pdfText, setPdfText] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; content: string; timestamp: Date }>>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast ? useToast() : { toast: () => {} };

  React.useEffect(() => { 
    if (droppedFileName) {
      // Handle dropped file if needed
      console.log('Dropped file:', droppedFileName);
    }
  }, [droppedFileName]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        toast({
          title: "Invalid file type",
          description: "Please select a PDF file.",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const response = await fetch("/api/pdf-summarizer/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || `Upload failed with status ${response.status}`);
      }

      const data = await response.json();
      setPdfText(data.text);
      
      toast({
        title: "PDF uploaded successfully",
        description: `Extracted ${data.text.length} characters from the PDF.`,
      });

      // Add initial system message
      setChatMessages([
        {
          role: "assistant",
          content: `I've analyzed your PDF document. The document contains ${data.text.length} characters. You can now ask me questions about the content, request summaries, or discuss any specific aspects of the document.`,
          timestamp: new Date(),
        },
      ]);

    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !pdfText) return;

    const userMessage = {
      role: "user" as const,
      content: currentMessage,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setCurrentMessage("");
    setIsSending(true);

    try {
      const response = await fetch("/api/pdf-summarizer/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...chatMessages, userMessage],
          pdf_context: pdfText,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      
      const assistantMessage = {
        role: "assistant" as const,
        content: data.response,
        timestamp: new Date(),
      };

      setChatMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">PDF Chat</h2>
      <p className="mb-4 text-gray-600 dark:text-gray-300">Upload a PDF and chat with AI about its content</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload PDF
          </h3>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
              id="pdf-upload"
            />
            <label
              htmlFor="pdf-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <FileText className="h-12 w-12 text-gray-400 mb-4" />
              <span className="text-sm text-gray-600">
                {file ? file.name : "Click to select a PDF file"}
              </span>
            </label>
          </div>

          {file && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{file.name}</Badge>
              <span className="text-sm text-gray-500">
                ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
          )}

          {isUploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-gray-600">Uploading and processing PDF...</p>
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload & Process
              </>
            )}
          </Button>
        </div>

        {/* Chat Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Chat with PDF</h3>
          
          {/* Chat Messages */}
          <div className="h-64 max-h-64 overflow-y-auto space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
            {chatMessages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Upload a PDF to start chatting about its content</p>
              </div>
            ) : (
              chatMessages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
            {isSending && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="flex gap-2">
            <Textarea
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question about the PDF content..."
              className="flex-1"
              rows={2}
              disabled={!pdfText || isSending}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!currentMessage.trim() || !pdfText || isSending}
              className="px-4"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
function TextExtractorWithOptions({ droppedFileName, autoProcess }: { droppedFileName?: string, autoProcess?: boolean }) {
  const [language, setLanguage] = useState("en")
  const [outputFormat, setOutputFormat] = useState("text")
  const [history, setHistory] = useState<Array<{ id: number; label: string; date: string; snippet: string; fullText: string }>>([])
  const [result, setResult] = useState<string>("")
  const [fileName, setFileName] = useState<string>(droppedFileName || "")
  React.useEffect(() => { if (droppedFileName) setFileName(droppedFileName) }, [droppedFileName])
  React.useEffect(() => { if (autoProcess && droppedFileName) handleExtract() }, [autoProcess, droppedFileName])
  function handleExtract() {
    const fakeText = `Extracted text for ${fileName || "example.pdf"} in ${language.toUpperCase()} (${outputFormat.toUpperCase()})\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`;
    setResult(fakeText)
    setHistory(prev => [
      { id: Date.now(), label: fileName || "example.pdf", date: new Date().toLocaleString(), snippet: fakeText.slice(0, 100) + (fakeText.length > 100 ? "..." : ""), fullText: fakeText },
      ...prev.slice(0, 9)
    ])
  }
  function handleCopy(text: string) { navigator.clipboard.writeText(text) }
  function handleClear(id: number) { setHistory(prev => prev.filter(item => item.id !== id)) }
  function handleClearAll() { setHistory([]) }
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Text Extractor</h2>
      <p className="mb-4 text-gray-600 dark:text-gray-300">Extract text from images or scanned documents.</p>
      <AdvancedOptionsPanel>
        <div className="mb-4">
          <label className="block font-medium mb-1">Language</label>
          <select
            className="border rounded px-2 py-1 dark:bg-[#18181b] dark:border-gray-700"
            value={language}
            onChange={e => setLanguage(e.target.value)}
          >
            <option value="en">English</option>
            <option value="fr">French</option>
            <option value="es">Spanish</option>
            <option value="de">German</option>
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Output Format</label>
          <div className="flex gap-3">
            {['text', 'pdf', 'docx'].map(opt => (
              <label key={opt} className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="outputFormat"
                  value={opt}
                  checked={outputFormat === opt}
                  onChange={() => setOutputFormat(opt)}
                  className="accent-blue-600"
                />
                <span className="capitalize">{opt.toUpperCase()}</span>
              </label>
            ))}
          </div>
        </div>
      </AdvancedOptionsPanel>
      {/* Simulated file input */}
      <div className="mb-4 flex gap-2 items-center">
        <input
          type="text"
          placeholder="File name (simulate upload)"
          value={fileName}
          onChange={e => setFileName(e.target.value)}
          className="border rounded px-2 py-1 dark:bg-[#18181b] dark:border-gray-700"
        />
        <Button onClick={handleExtract} type="button">Extract</Button>
      </div>
      {/* Main result */}
      {result && (
        <div className="mb-6 p-4 bg-slate-50 dark:bg-[#23232a] rounded border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold">Result</span>
            <Button size="sm" variant="outline" onClick={() => handleCopy(result)}>Copy</Button>
          </div>
          <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{result}</div>
        </div>
      )}
      <ResultsHistoryPanel history={history} onCopy={handleCopy} onClear={handleClear} onClearAll={handleClearAll} />
    </div>
  )
}



function DocumentConverterWithOptions() {
  const [fromFormat, setFromFormat] = useState("pdf")
  const [toFormat, setToFormat] = useState("docx")
  const [batch, setBatch] = useState(false)
  const [history, setHistory] = useState<Array<{ id: number; label: string; date: string; snippet: string; fullText: string }>>([])
  const [result, setResult] = useState<string>("")
  const [fileName, setFileName] = useState<string>("")
  function handleConvert() {
    const fakeResult = `Converted ${fileName || "example.pdf"} from ${fromFormat.toUpperCase()} to ${toFormat.toUpperCase()}${batch ? " (batch)" : ""}.\nDownload link: /fake/path/${fileName || "example"}.${toFormat}`
    setResult(fakeResult)
    setHistory(prev => [
      { id: Date.now(), label: fileName || "example.pdf", date: new Date().toLocaleString(), snippet: fakeResult.slice(0, 100) + (fakeResult.length > 100 ? "..." : ""), fullText: fakeResult },
      ...prev.slice(0, 9)
    ])
  }
  function handleCopy(text: string) { navigator.clipboard.writeText(text) }
  function handleClear(id: number) { setHistory(prev => prev.filter(item => item.id !== id)) }
  function handleClearAll() { setHistory([]) }
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Document Converter</h2>
      <p className="mb-4 text-gray-600 dark:text-gray-300">Convert between PDF, Word, TXT, HTML, and Markdown formats.</p>
      <AdvancedOptionsPanel>
        <div className="mb-4">
          <label className="block font-medium mb-1">Convert From</label>
          <select
            className="border rounded px-2 py-1 dark:bg-[#18181b] dark:border-gray-700"
            value={fromFormat}
            onChange={e => setFromFormat(e.target.value)}
          >
            <option value="pdf">PDF</option>
            <option value="docx">Word (DOCX)</option>
            <option value="txt">TXT</option>
            <option value="html">HTML</option>
            <option value="md">Markdown</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">Convert To</label>
          <select
            className="border rounded px-2 py-1 dark:bg-[#18181b] dark:border-gray-700"
            value={toFormat}
            onChange={e => setToFormat(e.target.value)}
          >
            <option value="pdf">PDF</option>
            <option value="docx">Word (DOCX)</option>
            <option value="txt">TXT</option>
            <option value="html">HTML</option>
            <option value="md">Markdown</option>
          </select>
        </div>
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={batch}
              onChange={e => setBatch(e.target.checked)}
              className="accent-blue-600"
            />
            <span>Enable batch processing</span>
          </label>
        </div>
      </AdvancedOptionsPanel>
      {/* Simulated file input */}
      <div className="mb-4 flex gap-2 items-center">
        <input
          type="text"
          placeholder="File name (simulate upload)"
          value={fileName}
          onChange={e => setFileName(e.target.value)}
          className="border rounded px-2 py-1 dark:bg-[#18181b] dark:border-gray-700"
        />
        <Button onClick={handleConvert} type="button">Convert</Button>
      </div>
      {/* Main result */}
      {result && (
        <div className="mb-6 p-4 bg-slate-50 dark:bg-[#23232a] rounded border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold">Result</span>
            <Button size="sm" variant="outline" onClick={() => handleCopy(result)}>Copy</Button>
          </div>
          <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{result}</div>
        </div>
      )}
      <ResultsHistoryPanel history={history} onCopy={handleCopy} onClear={handleClear} onClearAll={handleClearAll} />
    </div>
  )
}

// Image Generator component following the same pattern as PDF chat
function ImageGenerator({ droppedFileName, autoProcess }: { droppedFileName?: string, autoProcess?: boolean }) {
  const [prompt, setPrompt] = useState<string>("");
  const [negativePrompt, setNegativePrompt] = useState<string>("");
  const [selectedStyle, setSelectedStyle] = useState<string>("realistic");
  const [selectedModel, setSelectedModel] = useState<string>("local-stable-diffusion");
  const [aspectRatio, setAspectRatio] = useState<string>("1:1");
  const [numImages, setNumImages] = useState<number>(1);
  const [guidanceScale, setGuidanceScale] = useState<number>(7.5);
  const [inferenceSteps, setInferenceSteps] = useState<number>(20);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<Array<{ id: string; url: string; prompt: string; model: string; timestamp: Date }>>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [apiStatus, setApiStatus] = useState<any>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const { toast } = useToast ? useToast() : { toast: () => {} };

  React.useEffect(() => { 
    if (droppedFileName) {
      // Handle dropped file if needed
      console.log('Dropped file:', droppedFileName);
    }
  }, [droppedFileName]);

  const checkApiStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const response = await fetch("http://localhost:8000/image-generator/health");
      const data = await response.json();
      setApiStatus(data);
      
      if (data.status === "healthy") {
        toast({
          title: "Local Model Status: Healthy",
          description: "Your local Stable Diffusion model is ready for generation.",
        });
      } else if (data.status === "not_loaded") {
        toast({
          title: "Model Not Loaded",
          description: "Local model is still loading. Please wait a moment.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Model Status: Error",
          description: "Local model encountered an error. Please restart the backend.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Status Check Failed",
        description: "Failed to check local model status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "No prompt entered",
        description: "Please enter a prompt for image generation.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
              const requestBody = {
          prompt: prompt.trim(),
          negative_prompt: negativePrompt.trim(),
          style: selectedStyle,
          aspect_ratio: aspectRatio,
          model: selectedModel,
          num_images: numImages,
          guidance_scale: guidanceScale,
          num_inference_steps: inferenceSteps,
        };
        
        console.log("Sending request to backend:", JSON.stringify(requestBody, null, 2));

              const response = await fetch("http://localhost:8000/image-generator/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("Backend error response:", JSON.stringify(errorData, null, 2));
        
        // Handle validation errors more specifically
        if (response.status === 422 && errorData.detail) {
          const validationErrors = Array.isArray(errorData.detail) ? errorData.detail : [errorData.detail];
          const errorMessages = validationErrors.map((err: any) => 
            `${err.loc?.join('.') || 'field'}: ${err.msg || err.message || 'validation error'}`
          ).join(', ');
          throw new Error(`Validation error: ${errorMessages}`);
        }
        
        throw new Error(errorData.error || errorData.detail || `Generation failed with status ${response.status}`);
      }

      const data = await response.json();
      
      // Check if the response contains an error
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Check if images array exists
      if (!data.images || !Array.isArray(data.images)) {
        throw new Error('Invalid response format: no images array');
      }
      
      // Add generated images to the list
      const newImages = data.images.map((image: any, index: number) => ({
        id: `img-${Date.now()}-${index}`,
        url: image.image_url,
        prompt: image.prompt,
        model: image.model,
        timestamp: new Date(),
      }));
      
      setGeneratedImages(prev => [...newImages, ...prev]);

      toast({
        title: "Images generated successfully",
        description: `Generated ${data.total_images} image(s) in ${data.processing_time.toFixed(1)}s`,
      });

    } catch (error: any) {
      console.error("Generation error:", error);
      
      // Handle specific error cases
      let errorMessage = error.message || "Failed to generate images. Please try again.";
      let errorTitle = "Generation failed";
      
      if (error.message && error.message.includes("Model not loaded")) {
        errorTitle = "Model Not Ready";
        errorMessage = "Local model is still loading. Please wait a moment and try again.";
      } else if (error.message && error.message.includes("memory")) {
        errorTitle = "Memory Issue";
        errorMessage = "Not enough memory to generate images. Try reducing image size or inference steps.";
      } else if (error.message && error.message.includes("timeout")) {
        errorTitle = "Generation Timeout";
        errorMessage = "Image generation took too long. Try reducing inference steps or image size.";
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Downloaded!",
        description: "Image saved to your downloads folder",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download image",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg">🎨</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold">AI Image Generator</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Create stunning images with AI using local Stable Diffusion (CPU-based)
            </p>
          </div>
        </div>
        
        {/* API Status Check */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={checkApiStatus}
            disabled={isCheckingStatus}
          >
            {isCheckingStatus ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                          <span className="mr-2">🔍</span>
          Check Model Status
              </>
            )}
          </Button>
          
          {apiStatus && (
            <div className={`px-2 py-1 rounded text-xs font-medium ${
              apiStatus.status === "healthy" 
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : apiStatus.status === "not_loaded"
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            }`}>
              {apiStatus.status === "healthy" ? "✅ Model Ready" : 
               apiStatus.status === "not_loaded" ? "⏳ Loading" :
               "❌ Error"}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 gap-6 min-h-0">
        {/* Left Panel - Generation Controls */}
        <div className="w-1/2 space-y-6">
          {/* Local Model Status Warning */}
          {apiStatus && apiStatus.status === "not_loaded" && (
            <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
              <CardHeader>
                <CardTitle className="text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                  <span>⏳</span>
                  Model Loading
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                  The local Stable Diffusion model is still loading. This may take a few minutes on first startup.
                </p>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  <li>• <strong>First Time:</strong> Model downloads ~4GB on first run</li>
                  <li>• <strong>Loading:</strong> Model loads into memory (2-3 minutes)</li>
                  <li>• <strong>CPU Generation:</strong> Images will be generated locally</li>
                </ul>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={checkApiStatus}
                  >
                    Check Status
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Generation Settings</CardTitle>
              <CardDescription>Configure your image generation parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Prompt Input */}
              <div className="space-y-2">
                <Label htmlFor="prompt">Prompt</Label>
                <Textarea
                  id="prompt"
                  placeholder="Describe the image you want to generate..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                {selectedStyle === "custom" && (
                  <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <p>💡 <strong>Custom style</strong> - Optimized for logos, icons, and clean designs</p>
                    <p>🎯 <strong>Perfect for:</strong> Company logos, app icons, simple graphics, technical diagrams</p>
                    <p>📝 <strong>Example:</strong> "simple gear icon, minimal design, flat style, white background"</p>
                    <p>💪 <strong>Tips:</strong> Be specific about colors, style, and background. Use terms like "minimal", "clean", "professional"</p>
                  </div>
                )}
              </div>

              {/* Negative Prompt */}
              <div className="space-y-2">
                <Label htmlFor="negative-prompt">Negative Prompt (Optional)</Label>
                <Textarea
                  id="negative-prompt"
                  placeholder="What to avoid in the image..."
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  rows={2}
                  className="resize-none"
                />
                {selectedStyle === "custom" && (
                  <p className="text-xs text-gray-500">
                    💡 For logos: Try "text, words, letters, complex background, noise, blurry, low quality"
                  </p>
                )}
              </div>

              {/* Style Selection */}
              <div className="space-y-2">
                <Label>Style (Current: {selectedStyle})</Label>
                <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realistic">Realistic</SelectItem>
                    <SelectItem value="artistic">Artistic</SelectItem>
                    <SelectItem value="abstract">Abstract</SelectItem>
                    <SelectItem value="cartoon">Cartoon</SelectItem>
                    <SelectItem value="anime">Anime</SelectItem>
                    <SelectItem value="photographic">Photographic</SelectItem>
                    <SelectItem value="painting">Painting</SelectItem>
                    <SelectItem value="digital_art">Digital Art</SelectItem>
                    <SelectItem value="sketch">Sketch</SelectItem>
                    <SelectItem value="watercolor">Watercolor</SelectItem>
                    <SelectItem value="custom">Custom (Logo & Icon Optimized)</SelectItem>
                  </SelectContent>
                </Select>
                {selectedStyle === "custom" && (
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    💡 Custom style is optimized for logos, icons, and clean designs. It adds minimal style enhancement to preserve the original design intent.
                  </p>
                )}
              </div>

              {/* Model Selection */}
              <div className="space-y-2">
                <Label>Model</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local-stable-diffusion">Local Stable Diffusion (CPU)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  💻 Running locally on your CPU - no external API needed
                </p>
              </div>

              {/* Basic Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Aspect Ratio</Label>
                  <Select value={aspectRatio} onValueChange={setAspectRatio}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1:1">Square (1:1)</SelectItem>
                      <SelectItem value="16:9">Landscape (16:9)</SelectItem>
                      <SelectItem value="9:16">Portrait (9:16)</SelectItem>
                      <SelectItem value="4:3">Wide (4:3)</SelectItem>
                      <SelectItem value="21:9">Ultrawide (21:9)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Number of Images</Label>
                  <Select value={numImages.toString()} onValueChange={(value) => setNumImages(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Image</SelectItem>
                      <SelectItem value="2">2 Images</SelectItem>
                      <SelectItem value="3">3 Images</SelectItem>
                      <SelectItem value="4">4 Images</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Advanced Settings Toggle */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full"
              >
                {showAdvanced ? "Hide" : "Show"} Advanced Settings
              </Button>

              {/* Advanced Settings */}
              {showAdvanced && (
                <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="space-y-2">
                    <Label>Guidance Scale: {guidanceScale}</Label>
                    <Slider
                      value={[guidanceScale]}
                      onValueChange={(value) => setGuidanceScale(value[0])}
                      max={20}
                      min={1}
                      step={0.5}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500">
                      Controls how closely the image follows the prompt (1-20)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Inference Steps: {inferenceSteps}</Label>
                    <Slider
                      value={[inferenceSteps]}
                      onValueChange={(value) => setInferenceSteps(value[0])}
                      max={100}
                      min={10}
                      step={5}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500">
                      More steps = higher quality but slower generation (10-100). CPU generation takes 2-5 minutes.
                    </p>
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim() || (apiStatus && apiStatus.status === "not_loaded")}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : apiStatus && apiStatus.status === "not_loaded" ? (
                  <>
                    <span className="mr-2">⏳</span>
                    Model Loading
                  </>
                ) : (
                  <>
                    <span className="mr-2">🎨</span>
                    Generate Images
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Generated Images */}
        <div className="w-1/2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generated Images</CardTitle>
              <CardDescription>Your AI-generated images will appear here</CardDescription>
            </CardHeader>
            <CardContent>
              {generatedImages.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <span className="text-4xl mb-4 block">🎨</span>
                  <p>No images generated yet</p>
                  <p className="text-sm">Enter a prompt and click generate to create your first image</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {generatedImages.map((image) => (
                    <div key={image.id} className="space-y-2">
                      <div className="relative group">
                        <img
                          src={image.url}
                          alt={`Generated image: ${image.prompt}`}
                          className="w-full h-48 object-cover rounded-lg border"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleDownload(image.url, image.prompt)}
                              className="bg-white text-black hover:bg-gray-100"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        <p className="truncate">{image.prompt}</p>
                        <p>Model: {image.model.split('/').pop()}</p>
                        <p>Generated: {image.timestamp.toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

const tools = [
  {
    key: "pdf",
    name: "PDF Summarizer",
    icon: <FileText className="h-5 w-5" />,
    component: <PdfSummarizer />,
  },
  {
    key: "extractor",
    name: "Text Extractor",
    icon: <ImageIcon className="h-5 w-5" />,
    component: <TextExtractorWithOptions />,
  },
  {
    key: "humanizer",
    name: "Text Humanizer",
    icon: <Sparkles className="h-5 w-5" />,
    component: <TextHumanizer />,
  },
  {
    key: "converter",
    name: "Document Converter",
    icon: <FileSymlink className="h-5 w-5" />,
    component: <DocumentConverterWithOptions />,
  },
  {
    key: "generator",
    name: "Image Generator",
    icon: <Wand2 className="h-5 w-5" />,
    component: <ImageGenerator />,
  },
]

const toolDescriptions: Record<string, string> = {
  pdf: "Upload a PDF and chat with AI about its content. Ask questions, get summaries, and explore the document interactively.",
  extractor: "Extract text from images or scanned documents. Supports PDF, PNG, JPG, and more.",
  humanizer: "Paste or type AI-generated or formal text and convert it to natural, human-like writing.",
  converter: "Convert between PDF, Word, TXT, HTML, and Markdown formats. Batch processing supported.",
          generator: "Create stunning images with AI using Hugging Face's Stable Diffusion models. Multiple styles and models available.",
}

export default function Home() {
  const [selected, setSelected] = useState("pdf")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { data: session } = useSession()
  const [draggedTool, setDraggedTool] = useState<string | null>(null)
  const [droppedFile, setDroppedFile] = useState<{ tool: string; fileName: string; file?: File } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [ariaMessage, setAriaMessage] = useState("")
  const { toast } = useToast ? useToast() : { toast: () => {} }
  const selectedTool = tools.find(t => t.key === selected)
  const [documentsOpen, setDocumentsOpen] = useState(false)
  const [isPanelVisible, setIsPanelVisible] = useState(false)
  const [docFilter, setDocFilter] = useState('all')
  const fileTypes = [
    { key: 'all', label: 'All' },
    { key: 'image', label: 'Images' },
    { key: 'pdf', label: 'PDFs' },
    { key: 'doc', label: 'Docs' },
    { key: 'presentation', label: 'Presentations' },
    { key: 'text', label: 'Text' },
  ]
  function getTypeKey(type: string) {
    if (type.startsWith('image/')) return 'image'
    if (type === 'application/pdf') return 'pdf'
    if (type === 'text/plain') return 'text'
    if (type.includes('presentation')) return 'presentation'
    if (type.includes('wordprocessingml')) return 'doc'
    return 'other'
  }
  const [galleryFilesState, setGalleryFilesState] = useState<any[]>([])

  // Fetch files from Google Drive AgoraAI folder when opening the panel
  async function fetchDocuments() {
    const res = await fetch('/api/drive-list')
    if (res.ok) {
      const data = await res.json()
      setGalleryFilesState((data.files || []).map((file: any) => ({
        id: file.id,
        name: file.name,
        type: file.mimeType,
        typeLabel: getTypeKey(file.mimeType).charAt(0).toUpperCase() + getTypeKey(file.mimeType).slice(1),
        thumbnail: file.mimeType.startsWith('image/') ? file.webContentLink || '/placeholder-logo.png' : '/placeholder-logo.png',
        driveFileId: file.id,
        webViewLink: file.webViewLink,
        webContentLink: file.webContentLink,
        createdAt: file.createdTime,
        updatedAt: file.modifiedTime,
      })))
    }
  }

  function openDocumentsPanel() {
    fetchDocuments()
    setDocumentsOpen(true)
    setIsPanelVisible(true)
  }
  // Close panel
  function closeDocumentsPanel() {
    setDocumentsOpen(false)
    setTimeout(() => setIsPanelVisible(false), 300)
  }

  function addFileToGallery(file: File, base64: string) {
    setGalleryFilesState(prev => [
      {
        id: Date.now(),
        name: file.name,
        type: file.type,
        typeLabel: getTypeKey(file.type).charAt(0).toUpperCase() + getTypeKey(file.type).slice(1),
        thumbnail: file.type.startsWith('image/') ? base64 : '/placeholder-logo.png',
        base64,
      },
      ...prev,
    ])
  }
  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = ev => {
        addFileToGallery(file, ev.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }
  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = ev => {
        addFileToGallery(file, ev.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }
  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
  }

  // File type support per tool
  const toolFileTypes: Record<string, string[]> = {
    pdf: ["application/pdf"],
    extractor: ["application/pdf", "image/png", "image/jpeg", "image/jpg"],
  }

  // Drag-and-drop handlers for sidebar
  function handleSidebarDragOver(toolKey: string, e: React.DragEvent) {
    e.preventDefault()
    setDraggedTool(toolKey)
    setAriaMessage(`Drop to use ${tools.find(t => t.key === toolKey)?.name}`)
  }
  function handleSidebarDragLeave(toolKey: string, e: React.DragEvent) {
    e.preventDefault()
    setDraggedTool(null)
    setAriaMessage("")
  }
  function handleSidebarDrop(toolKey: string, e: React.DragEvent) {
    e.preventDefault()
    setDraggedTool(null)
    setIsDragging(false)
    setAriaMessage("")
    const file = e.dataTransfer.files[0]
    if (file) {
      // Validate file type
      const validTypes = toolFileTypes[toolKey]
      if (validTypes && !validTypes.includes(file.type)) {
        if (toast) toast({ title: "Unsupported file type", description: `This tool does not support ${file.type || file.name.split('.').pop()}` })
        return
      }
      setSelected(toolKey)
      setDroppedFile({ tool: toolKey, fileName: file.name, file })
    }
  }

  // Pass dropped file name to tool components via props
  function getToolComponent(toolKey: string) {
    if (toolKey === "pdf") return <PdfSummarizer droppedFileName={droppedFile?.tool === "pdf" ? droppedFile.fileName : undefined} autoProcess={!!droppedFile?.file && droppedFile.tool === "pdf"} />
    if (toolKey === "extractor") return <TextExtractorWithOptions droppedFileName={droppedFile?.tool === "extractor" ? droppedFile.fileName : undefined} autoProcess={!!droppedFile?.file && droppedFile.tool === "extractor"} />
    if (toolKey === "humanizer") return <TextHumanizer />
    if (toolKey === "converter") return <DocumentConverterWithOptions />
    if (toolKey === "generator") return <ImageGenerator droppedFileName={droppedFile?.tool === "generator" ? droppedFile.fileName : undefined} autoProcess={!!droppedFile?.file && droppedFile.tool === "generator"} />
    return null
  }

  // Exporting state
  const [exportingId, setExportingId] = useState<number | null>(null)
  async function handleExport(file: any) {
    setExportingId(file.id)
    try {
      // Check for duplicate file name in Drive
      const driveListRes = await fetch('/api/drive-list')
      if (driveListRes.ok) {
        const driveListData = await driveListRes.json()
        const duplicate = (driveListData.files || []).find((f: any) => f.name === file.name)
        if (duplicate) {
          toast({
            title: "Duplicate file name",
            description: `A file named '${file.name}' already exists in your AgoraAI Drive folder. Please rename your file or delete the existing one first.`,
            variant: "destructive",
          })
          setExportingId(null)
          return
        }
      }
      const base64 = file.base64 || btoa("Dummy file content for " + file.name)
      const res = await fetch("/api/drive-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: base64, fileName: file.name, mimeType: file.type })
      })
      const data = await res.json()
      if (data.success) {
        // Save document metadata to backend (optional, can be removed if not syncing DB)
        // await fetch('/api/documents', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     fileName: file.name,
        //     mimeType: file.type,
        //     driveFileId: data.file.id,
        //     webViewLink: data.file.webViewLink,
        //     webContentLink: data.file.webContentLink,
        //   })
        // })
        // Refetch documents
        await fetchDocuments()
        toast({
          title: "Exported to Google Drive!",
          description: `View in Drive: ${data.file.webViewLink || data.file.id}`,
          variant: "success",
          duration: 5000,
        })
      } else {
        toast({
          title: "Export failed",
          description: data.error || "Unknown error",
          variant: "destructive",
        })
      }
    } catch (err: any) {
      toast({
        title: "Export failed",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setExportingId(null)
    }
  }

  // Add state for delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [fileToDelete, setFileToDelete] = useState<any>(null)

  // Update handleDelete to work with dialog
  async function confirmDelete() {
    if (!fileToDelete?.driveFileId) return
    try {
      const res = await fetch('/api/drive-delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId: fileToDelete.driveFileId })
      })
      const data = await res.json()
      if (data.success) {
        toast({
          title: 'File deleted',
          description: `${fileToDelete.name} was removed from your AgoraAI Drive folder.`,
          variant: 'success',
        })
        await fetchDocuments()
      } else {
        toast({
          title: 'Delete failed',
          description: data.error || 'Unknown error',
          variant: 'destructive',
        })
      }
    } catch (err: any) {
      toast({
        title: 'Delete failed',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setDeleteDialogOpen(false)
      setFileToDelete(null)
    }
  }

  // Filtered files for gallery
  const filteredFiles = docFilter === 'all' ? galleryFilesState : galleryFilesState.filter(f => getTypeKey(f.type) === docFilter)

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#18181b] dark:to-[#23232a] dark:text-white">
        {/* Global drag overlay */}
        {/* (Global drag overlay removed as requested) */}
        {/* ARIA live region for accessibility */}
        <div aria-live="polite" className="sr-only">{ariaMessage}</div>
        {/* Top Bar/Header */}
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-20 h-16">
          <div className="flex items-center justify-between h-full px-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">AgoraAI</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">Extract, humanize, and process documents with AI</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {session?.user && (
                <div className="hidden sm:block text-sm text-gray-600 dark:text-gray-300">
                  Welcome, {session.user.name?.split(" ")[0]}!
                </div>
              )}
              <UserMenu />
            </div>
          </div>
        </header>

        {/* Main Layout: Sidebar + Main Content */}
        <div className="flex flex-1 h-[calc(100vh-64px)]">
          {/* Fixed Sidebar */}
          <aside className={`fixed z-30 top-16 left-0 bg-white dark:bg-[#18181b] border-r border-slate-200 dark:border-slate-800 w-60 h-[calc(100vh-64px)] transition-transform duration-200 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 flex flex-col`}>
            <nav className="flex flex-col gap-1 p-4 flex-1">
              {tools.map(tool => (
                <button
                  key={tool.key}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg text-left font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${selected === tool.key ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300" : "hover:bg-slate-100 dark:hover:bg-[#23232a] text-gray-700 dark:text-gray-200"} ${draggedTool === tool.key ? "ring-2 ring-blue-400" : ""}`}
                  onClick={() => { setSelected(tool.key); setSidebarOpen(false) }}
                  aria-current={selected === tool.key ? "page" : undefined}
                  onDragOver={e => handleSidebarDragOver(tool.key, e)}
                  onDragLeave={e => handleSidebarDragLeave(tool.key, e)}
                  onDrop={e => handleSidebarDrop(tool.key, e)}
                  onDragEnter={e => handleSidebarDragOver(tool.key, e)}
                  tabIndex={0}
                >
                  {tool.icon}
                  {tool.name}
                </button>
              ))}
            </nav>
            {/* Documents panel toggle button at the bottom */}
            <div className="px-4 pb-4">
              <button
                onClick={() => {
                  if (!isPanelVisible) openDocumentsPanel()
                  else closeDocumentsPanel()
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-left font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-slate-100 dark:hover:bg-[#23232a] text-gray-700 dark:text-gray-200 w-full ${documentsOpen ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' : ''}`}
              >
                <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 7v10M17 7v10M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" /></svg>
                Documents
              </button>
            </div>
            {/* Copyright */}
            <div className="p-4 text-xs text-gray-400 dark:text-gray-500 border-t border-slate-200 dark:border-slate-800">
              © {new Date().getFullYear()} AgoraAI
            </div>
          </aside>

          {/* Overlay for mobile sidebar */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-20 bg-black/30 md:hidden" onClick={() => setSidebarOpen(false)} aria-label="Sidebar overlay" />
          )}

          {/* Main Content Area - Fixed Height with Internal Scrolling */}
          <div className="flex-1 flex flex-col ml-0 md:ml-60 h-full">
            {/* Top bar for mobile to open sidebar */}
            <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#18181b]/80 sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <Image src="/Agora.jpeg" alt="AgoraAI Logo" width={28} height={28} className="rounded-xl" />
                <span className="font-bold text-lg tracking-tight">AgoraAI</span>
              </div>
              <button onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
                <Menu className="h-6 w-6" />
              </button>
            </div>
            
            {/* Tool workspace - Fixed height with internal scrolling */}
            <main className="flex-1 flex flex-col bg-transparent h-full overflow-hidden">
              <div className="flex items-start w-full h-full p-6 overflow-y-auto">
                <div className="w-full">
                  {/* Info bar */}
                  <div className="flex items-center gap-2 mb-6 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-md text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 flex-shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25v3.75m0 0v.008m0-.008a.75.75 0 01.75.75h-.008a.75.75 0 01-.75-.75zm.75-7.5a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>
                    <span>{toolDescriptions[selected]}</span>
                  </div>
                  {getToolComponent(selected)}
                </div>
              </div>
            </main>
          </div>
        </div>
        {/* Document Gallery Section as a panel */}
        {isPanelVisible && (
          <>
            {/* Overlay */}
            <div className="fixed inset-0 z-30 bg-black/30" onClick={closeDocumentsPanel} />
            <aside className={`fixed right-0 top-0 h-full w-full max-w-xl z-40 bg-white dark:bg-[#18181b] shadow-lg border-l border-slate-200 dark:border-slate-700 transition-transform duration-300 overflow-y-auto ${documentsOpen ? 'animate-slide-in' : 'animate-slide-out'}`}>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-2xl font-bold flex-1">Your Documents</h2>
                  <button onClick={closeDocumentsPanel} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl font-bold focus:outline-none">&times;</button>
                </div>
                {/* Upload area */}
                <div
                  className="mb-6 p-4 border-2 border-dashed border-blue-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/10 transition"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  <input type="file" id="file-upload" className="hidden" onChange={handleFileInput} />
                  <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                    <UploadCloud className="h-8 w-8 text-blue-500 mb-2" />
                    <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">Click or drag a file here to upload</span>
                  </label>
                </div>
                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6">
                  {fileTypes.map(ft => (
                    <button
                      key={ft.key}
                      onClick={() => setDocFilter(ft.key)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${docFilter === ft.key ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' : 'hover:bg-slate-100 dark:hover:bg-[#23232a] text-gray-700 dark:text-gray-200'}`}
                    >
                      {ft.label}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {filteredFiles.length === 0 && <div className="col-span-full text-center text-gray-400 py-12">No documents found.</div>}
                  {(docFilter === 'all' ? galleryFilesState : galleryFilesState.filter(f => getTypeKey(f.type) === docFilter)).map(file => (
                    <div
                      key={file.id}
                      className="relative bg-white dark:bg-[#18181b] rounded-lg shadow p-3 flex flex-col items-center cursor-pointer hover:shadow-lg transition group"
                      draggable
                      onDragStart={e => { e.dataTransfer.setData('text/plain', file.id.toString()) }}
                    >
                      {/* Preview: image for images, icon for others */}
                      {file.type.startsWith('image/') ? (
                        <img src={file.thumbnail} alt={file.name} className="w-32 h-20 object-cover rounded mb-2" />
                      ) : (
                        <div className="w-32 h-20 flex items-center justify-center bg-slate-100 dark:bg-[#23232a] rounded mb-2">
                          <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 7v10M17 7v10M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" /></svg>
                        </div>
                      )}
                      <div className="font-medium truncate w-full text-center" title={file.name}>{file.name}</div>
                      <div className="text-xs text-gray-500 mb-2">{file.typeLabel}</div>
                      <div className="flex flex-row gap-2 mt-auto w-full justify-center">
                        <a
                          title="Download"
                          className="p-2 rounded hover:bg-blue-100 dark:hover:bg-blue-900/40 transition"
                          href={file.webContentLink || file.webViewLink || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          onClick={e => { if (!file.webContentLink && !file.webViewLink) { e.preventDefault(); toast({ title: 'No download link available', variant: 'destructive' }) } }}
                        >
                          <Download className="h-5 w-5 text-blue-500" />
                        </a>
                        <button
                          title="Delete"
                          className="p-2 rounded hover:bg-red-100 dark:hover:bg-red-900/40 transition"
                          onClick={() => { setFileToDelete(file); setDeleteDialogOpen(true); }}
                        >
                          <Trash className="h-5 w-5 text-red-500" />
                        </button>
                        <button title="Export to Google Drive" className="p-2 rounded hover:bg-green-100 dark:hover:bg-green-900/40 transition" onClick={() => handleExport(file)} disabled={exportingId === file.id}>
                          {exportingId === file.id ? (
                            <span className="animate-spin"><UploadCloud className="h-5 w-5 text-green-500" /></span>
                          ) : (
                            <UploadCloud className="h-5 w-5 text-green-500" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </>
        )}
      </div>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this file?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold">{fileToDelete?.name}</span> from your AgoraAI Drive folder? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AuthGuard>
  )
}
