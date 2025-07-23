import React, { useRef, useState } from "react"
import { UploadCloud, XCircle } from "lucide-react"

interface FileUploadProps {
  accept: string
  maxSizeMB: number
  onFileAccepted: (file: File) => void
  label?: string
}

export default function FileUpload({ accept, maxSizeMB, onFileAccepted, label }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true)
    else if (e.type === "dragleave") setDragActive(false)
  }

  const validateFile = (file: File) => {
    const validTypes = accept.split(",").map(t => t.trim())
    const isValidType = validTypes.some(type => file.type === type || file.name.endsWith(type.replace(".", "")))
    const isValidSize = file.size <= maxSizeMB * 1024 * 1024
    if (!isValidType) return `Invalid file type. Allowed: ${accept}`
    if (!isValidSize) return `File too large. Max size: ${maxSizeMB}MB.`
    return null
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      const validationError = validateFile(droppedFile)
      if (validationError) {
        setError(validationError)
        setFile(null)
      } else {
        setError(null)
        setFile(droppedFile)
        onFileAccepted(droppedFile)
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      const validationError = validateFile(selectedFile)
      if (validationError) {
        setError(validationError)
        setFile(null)
      } else {
        setError(null)
        setFile(selectedFile)
        onFileAccepted(selectedFile)
      }
    }
  }

  return (
    <div className="w-full">
      {label && <label className="block mb-2 font-medium text-gray-800 dark:text-white">{label}</label>}
      <div
        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${dragActive ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 dark:border-gray-700 bg-white dark:bg-[#18181b]"}`}
        tabIndex={0}
        aria-label="File upload area"
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={e => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click() }}
      >
        <UploadCloud className="h-8 w-8 text-blue-500 mb-2" aria-hidden="true" />
        <span className="text-gray-700 dark:text-gray-200 mb-1">Drag & drop or click to upload</span>
        <span className="text-xs text-gray-500 dark:text-gray-400 mb-2">Accepted: {accept} | Max: {maxSizeMB}MB</span>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleChange}
          aria-label="File input"
        />
        {file && (
          <div className="mt-2 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <span>{file.name}</span>
            <button type="button" aria-label="Remove file" onClick={e => { e.stopPropagation(); setFile(null); }}>
              <XCircle className="h-4 w-4 text-red-500 hover:text-red-700" />
            </button>
          </div>
        )}
        {error && (
          <div className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
            <XCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  )
} 