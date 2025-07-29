"use client"

import { useState } from "react"
import { FileText, Image as ImageIcon, Sparkles, FileSymlink, Menu, X, Download, Trash, UploadCloud } from "lucide-react"
import AuthGuard from "@/components/auth/auth-guard"
import TextExtractor from "@/components/text-extractor"
import TextHumanizer from "@/components/text-humanizer"
import Image from "next/image"
import { Button } from "@/components/ui/button"
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
  const [summaryLength, setSummaryLength] = useState("medium")
  const [format, setFormat] = useState("paragraphs")
  const [history, setHistory] = useState<Array<{ id: number; label: string; date: string; snippet: string; fullText: string }>>([])
  const [result, setResult] = useState<string>("")
  const [fileName, setFileName] = useState<string>(droppedFileName || "")
  React.useEffect(() => { if (droppedFileName) setFileName(droppedFileName) }, [droppedFileName])
  React.useEffect(() => { if (autoProcess && droppedFileName) handleSummarize() }, [autoProcess, droppedFileName])
  function handleSummarize() {
    const fakeSummary = `Summary for ${fileName || "example.pdf"} [${summaryLength}, ${format}]\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`
    setResult(fakeSummary)
    setHistory(prev => [
      { id: Date.now(), label: fileName || "example.pdf", date: new Date().toLocaleString(), snippet: fakeSummary.slice(0, 100) + (fakeSummary.length > 100 ? "..." : ""), fullText: fakeSummary },
      ...prev.slice(0, 9)
    ])
  }
  function handleCopy(text: string) { navigator.clipboard.writeText(text) }
  function handleClear(id: number) { setHistory(prev => prev.filter(item => item.id !== id)) }
  function handleClearAll() { setHistory([]) }
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">PDF Summarizer</h2>
      <p className="mb-4 text-gray-600 dark:text-gray-300">Upload a PDF and get an AI-generated summary.</p>
      <AdvancedOptionsPanel>
        <div className="mb-4">
          <label className="block font-medium mb-1">Summary Length</label>
          <div className="flex gap-3">
            {['short', 'medium', 'long'].map(opt => (
              <label key={opt} className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="summaryLength"
                  value={opt}
                  checked={summaryLength === opt}
                  onChange={() => setSummaryLength(opt)}
                  className="accent-blue-600"
                />
                <span className="capitalize">{opt}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block font-medium mb-1">Format</label>
          <div className="flex gap-3">
            {['paragraphs', 'bullets'].map(opt => (
              <label key={opt} className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="format"
                  value={opt}
                  checked={format === opt}
                  onChange={() => setFormat(opt)}
                  className="accent-blue-600"
                />
                <span className="capitalize">{opt === 'bullets' ? 'Bullet points' : 'Paragraphs'}</span>
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
        <Button onClick={handleSummarize} type="button">Summarize</Button>
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

function TextHumanizerWithOptions() {
  const [tone, setTone] = useState("professional")
  const [formality, setFormality] = useState("medium")
  const [history, setHistory] = useState<Array<{ id: number; label: string; date: string; snippet: string; fullText: string }>>([])
  const [result, setResult] = useState<string>("")
  const [inputText, setInputText] = useState<string>("")
  function handleHumanize() {
    const fakeHumanized = `Humanized (${tone}, ${formality})\n${inputText}\n\nThis is a more natural, friendly version.`
    setResult(fakeHumanized)
    setHistory(prev => [
      { id: Date.now(), label: "Text Input", date: new Date().toLocaleString(), snippet: fakeHumanized.slice(0, 100) + (fakeHumanized.length > 100 ? "..." : ""), fullText: fakeHumanized },
      ...prev.slice(0, 9)
    ])
  }
  function handleCopy(text: string) { navigator.clipboard.writeText(text) }
  function handleClear(id: number) { setHistory(prev => prev.filter(item => item.id !== id)) }
  function handleClearAll() { setHistory([]) }
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Text Humanizer</h2>
      <p className="mb-4 text-gray-600 dark:text-gray-300">Paste or type AI-generated or formal text and convert it to natural, human-like writing.</p>
      <AdvancedOptionsPanel>
        <div className="mb-4">
          <label className="block font-medium mb-1">Tone</label>
          <div className="flex gap-3">
            {['professional', 'casual', 'friendly'].map(opt => (
              <label key={opt} className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="tone"
                  value={opt}
                  checked={tone === opt}
                  onChange={() => setTone(opt)}
                  className="accent-blue-600"
                />
                <span className="capitalize">{opt}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block font-medium mb-1">Formality Level</label>
          <div className="flex gap-3">
            {['low', 'medium', 'high'].map(opt => (
              <label key={opt} className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="formality"
                  value={opt}
                  checked={formality === opt}
                  onChange={() => setFormality(opt)}
                  className="accent-blue-600"
                />
                <span className="capitalize">{opt}</span>
              </label>
            ))}
          </div>
        </div>
      </AdvancedOptionsPanel>
      {/* Simulated text input */}
      <div className="mb-4">
        <textarea
          className="w-full border rounded px-2 py-1 dark:bg-[#18181b] dark:border-gray-700 min-h-[80px]"
          placeholder="Paste or type your text here..."
          value={inputText}
          onChange={e => setInputText(e.target.value)}
        />
        <Button onClick={handleHumanize} type="button" className="mt-2">Humanize</Button>
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
    component: <TextHumanizerWithOptions />,
  },
  {
    key: "converter",
    name: "Document Converter",
    icon: <FileSymlink className="h-5 w-5" />,
    component: <DocumentConverterWithOptions />,
  },
]

const toolDescriptions: Record<string, string> = {
  pdf: "Upload a PDF file and get a concise, AI-generated summary. Choose summary length and format in advanced options.",
  extractor: "Extract text from images or scanned documents. Supports PDF, PNG, JPG, and more.",
  humanizer: "Paste or type AI-generated or formal text and convert it to natural, human-like writing.",
  converter: "Convert between PDF, Word, TXT, HTML, and Markdown formats. Batch processing supported.",
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
    if (toolKey === "humanizer") return <TextHumanizerWithOptions />
    if (toolKey === "converter") return <DocumentConverterWithOptions />
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
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-20">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
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
        <div className="flex flex-1 min-h-0">
          {/* Sidebar */}
          <aside className={`fixed z-30 top-[64px] md:top-[72px] left-0 bg-white dark:bg-[#18181b] border-r border-slate-200 dark:border-slate-800 w-60 flex-col h-[calc(100vh-64px)] md:h-[calc(100vh-72px)] transition-transform duration-200 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:flex`}>
            <nav className="flex-1 flex flex-col gap-1 p-4 overflow-y-auto">
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
            <div className="mt-auto px-4 pb-4">
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
            {/* Remove Documents tab at the bottom */}
            <div className="p-4 text-xs text-gray-400 dark:text-gray-500 border-t border-slate-200 dark:border-slate-800">
              © {new Date().getFullYear()} AgoraAI
            </div>
          </aside>

          {/* Overlay for mobile sidebar */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-20 bg-black/30 md:hidden" onClick={() => setSidebarOpen(false)} aria-label="Sidebar overlay" />
          )}

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-h-0 ml-0 md:ml-60">
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
            {/* Tool workspace */}
            <main className="flex-1 flex flex-col items-stretch bg-transparent overflow-y-auto">
              <div className="flex items-start w-full h-full p-6">
                <div className="w-full max-w-3xl">
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
